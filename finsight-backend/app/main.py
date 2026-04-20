import asyncio
import io
import json
import os
import random
import uuid
from contextlib import asynccontextmanager
from datetime import datetime

import httpx
import pandas as pd
from app.database.database import db
from app.models.models import (DashboardSummary, FeedbackEntry, StatusResponse,
                               UploadResponse)
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup application resources."""
    try:
        # Import models and initialize database objects before serving requests.
        _ = (UploadResponse, StatusResponse, FeedbackEntry, DashboardSummary)
        await db.connect()
        await db.create_tables()
        await load_cache_from_db()
        print(f"✅ Cache loaded: {len(feedbacks)} feedbacks, {len(uploads)} uploads")
    except Exception as e:
        print(f"⚠️ Running without DB persistence: {e}")

    yield

    await db.close()


app = FastAPI(title="FinSight AI Backend", lifespan=lifespan)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'deepseek-r1:1.5b')
 
# In-memory storage
feedbacks = []
uploads = []
resolved_alert_ids = set()


async def get_risk_alert_status_map():
    """Return persisted status by feedback id."""
    if not db.pool:
        return {feedback_id: "resolved" for feedback_id in resolved_alert_ids}

    try:
        rows = await db.fetch("SELECT feedback_id, status FROM risk_alert_states")
        return {str(row["feedback_id"]): row["status"] for row in rows}
    except Exception as e:
        # Auto-heal if schema wasn't created yet in an existing DB.
        if "risk_alert_states" in str(e):
            await db.create_tables()
            rows = await db.fetch("SELECT feedback_id, status FROM risk_alert_states")
            return {str(row["feedback_id"]): row["status"] for row in rows}
        return {}


async def persist_risk_alert_status(alert_id, status):
    """Persist risk alert state in database, with in-memory fallback."""
    if not db.pool:
        if status == "resolved":
            resolved_alert_ids.add(alert_id)
        else:
            resolved_alert_ids.discard(alert_id)
        return

    try:
        feedback_exists = await db.fetchval(
            "SELECT EXISTS(SELECT 1 FROM feedback_entries WHERE id = $1::uuid)",
            alert_id,
        )
        if not feedback_exists:
            raise HTTPException(404, "Risk alert not found")

        await db.execute(
            """
            INSERT INTO risk_alert_states (feedback_id, status, updated_at, resolved_at)
            VALUES (
                $1::uuid,
                $2::varchar,
                CURRENT_TIMESTAMP,
                CASE WHEN $2::varchar = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END
            )
            ON CONFLICT (feedback_id)
            DO UPDATE SET
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP,
                resolved_at = CASE
                    WHEN EXCLUDED.status = 'resolved' THEN CURRENT_TIMESTAMP
                    ELSE NULL
                END
            """,
            alert_id,
            status,
        )
    except HTTPException:
        raise
    except Exception as e:
        error_text = str(e)
        if "risk_alert_states" in error_text:
            await db.create_tables()
            await db.execute(
                """
                INSERT INTO risk_alert_states (feedback_id, status, updated_at, resolved_at)
                VALUES (
                    $1::uuid,
                    $2::varchar,
                    CURRENT_TIMESTAMP,
                    CASE WHEN $2::varchar = 'resolved' THEN CURRENT_TIMESTAMP ELSE NULL END
                )
                ON CONFLICT (feedback_id)
                DO UPDATE SET
                    status = EXCLUDED.status,
                    updated_at = CURRENT_TIMESTAMP,
                    resolved_at = CASE
                        WHEN EXCLUDED.status = 'resolved' THEN CURRENT_TIMESTAMP
                        ELSE NULL
                    END
                """,
                alert_id,
                status,
            )
            return
        raise HTTPException(500, f"Unable to update risk alert status: {error_text}")


async def load_cache_from_db():
    """Load feedback and upload cache from database on startup."""
    if not db.pool:
        return

    upload_rows = await db.fetch(
        """
        SELECT id, filename, total_rows, status, uploaded_at
        FROM upload_sessions
        ORDER BY uploaded_at DESC
        LIMIT 100
        """
    )

    feedback_rows = await db.fetch(
        """
        SELECT
            fe.id,
            fe.original_text,
            fe.created_at,
            ar.issue_category,
            ar.sentiment,
            ar.priority,
            ar.confidence
        FROM feedback_entries fe
        LEFT JOIN analysis_results ar ON ar.feedback_id = fe.id
        ORDER BY fe.created_at ASC
        """
    )

    uploads.clear()
    for row in reversed(upload_rows):
        uploads.append(
            {
                "id": str(row["id"]),
                "filename": row["filename"],
                "total_rows": row["total_rows"] or 0,
                "status": row["status"] or "completed",
                "uploaded_at": (row["uploaded_at"] or datetime.now()).isoformat(),
            }
        )

    feedbacks.clear()
    for row in feedback_rows:
        feedbacks.append(
            {
                "id": str(row["id"]),
                "text": row["original_text"],
                "category": row["issue_category"] or "General Inquiry",
                "sentiment": row["sentiment"] or "Neutral",
                "priority": row["priority"] or "Low",
                "timestamp": (row["created_at"] or datetime.now()).isoformat(),
                "confidence": float(row["confidence"] or 0.7),
            }
        )


def format_time_ago(timestamp_str):
    """Convert ISO timestamp to compact relative time string."""
    try:
        event_time = datetime.fromisoformat(timestamp_str)
    except Exception:
        return "just now"

    delta = datetime.now() - event_time
    seconds = int(delta.total_seconds())

    if seconds < 60:
        return "just now"
    if seconds < 3600:
        return f"{seconds // 60} min ago"
    if seconds < 86400:
        return f"{seconds // 3600} hour ago" if seconds < 7200 else f"{seconds // 3600} hours ago"
    days = seconds // 86400
    return f"{days} day ago" if days == 1 else f"{days} days ago"


async def persist_feedback_record(text, analysis, upload_session_id=None):
    """Persist feedback and analysis in DB; return created feedback payload."""
    feedback_id = str(uuid.uuid4())

    if db.pool:
        await db.execute(
            """
            INSERT INTO feedback_entries (id, upload_session_id, original_text, source_channel)
            VALUES ($1::uuid, $2::uuid, $3, $4)
            """,
            feedback_id,
            upload_session_id,
            text,
            "upload",
        )

        await db.execute(
            """
            INSERT INTO analysis_results (feedback_id, issue_category, confidence, sentiment, priority)
            VALUES ($1::uuid, $2, $3, $4, $5)
            """,
            feedback_id,
            analysis["category"],
            float(analysis.get("confidence", 0.7)),
            analysis["sentiment"],
            analysis["priority"],
        )

    created_at = datetime.now().isoformat()
    return {
        "id": feedback_id,
        "text": text,
        "category": analysis["category"],
        "sentiment": analysis["sentiment"],
        "priority": analysis["priority"],
        "timestamp": created_at,
        "confidence": float(analysis.get("confidence", 0.7)),
    }


@app.get("/")
async def root():
    """Root endpoint"""
    # Check if Ollama is running
    ollama_status = "unknown"
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                ollama_status = "connected"
    except:
        ollama_status = "disconnected"
    
    return {
        "name": "FinSight AI",
        "status": "running",
        "ollama": ollama_status,
        "model": OLLAMA_MODEL,
        "total_feedbacks": len(feedbacks),
        "message": "Backend is ready"
    }

@app.get("/api/ollama/status")
async def check_ollama():
    """Check Ollama connection status"""
    try:
        async with httpx.AsyncClient(timeout=2.0) as client:
            response = await client.get(f"{OLLAMA_URL}/api/tags")
            if response.status_code == 200:
                models = response.json()
                return {
                    "status": "connected",
                    "models": models,
                    "current_model": OLLAMA_MODEL,
                    "message": "✅ Ollama is running"
                }
    except Exception as e:
        return {
            "status": "disconnected",
            "error": str(e),
            "message": "Ollama not running. Run: ollama serve"
        }

async def analyze_with_ollama(text):
    """Send feedback to Ollama for AI analysis - FIXED VERSION"""
    
    # Simplified prompt to get clean JSON
    prompt = f"""Analyze this customer feedback and return ONLY a JSON object.

Feedback: "{text}"

Return this exact format with single values:
{{
    "category": "one specific category",
    "sentiment": "one specific sentiment",
    "priority": "one specific priority"
}}

Valid categories: Transaction Failure, KYC Issue, App Crash, Fraud Alert, UI Problem, Positive Feedback, General Inquiry
Valid sentiments: Positive, Neutral, Negative
Valid priorities: High, Medium, Low

Choose ONLY ONE value from each list. Do not include the options in your response.
Return ONLY the JSON object, no other text."""

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": OLLAMA_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,
                        "num_predict": 100
                    }
                }
            )
            
            if response.status_code == 200:
                result = response.json()
                llm_output = result.get("response", "").strip()
                print(f"🤖 LLM Response: {llm_output[:100]}...")
                
                # Clean the response - remove markdown if present
                cleaned = llm_output.replace('```json', '').replace('```', '').strip()
                
                # Extract JSON
                start = cleaned.find('{')
                end = cleaned.rfind('}') + 1
                
                if start != -1 and end > start:
                    json_str = cleaned[start:end]
                    
                    # Parse JSON
                    analysis = json.loads(json_str)
                    
                    # Get values with defaults
                    category = analysis.get("category", "General Inquiry")
                    sentiment = analysis.get("sentiment", "Neutral")
                    priority = analysis.get("priority", "Low")
                    
                    # Validate and clean values
                    valid_categories = ["Transaction Failure", "KYC Issue", "App Crash", "Fraud Alert", "UI Problem", "Positive Feedback", "General Inquiry"]
                    valid_sentiments = ["Positive", "Neutral", "Negative"]
                    valid_priorities = ["High", "Medium", "Low"]
                    
                    # Ensure values are valid
                    if category not in valid_categories:
                        category = "General Inquiry"
                    if sentiment not in valid_sentiments:
                        sentiment = "Neutral"
                    if priority not in valid_priorities:
                        priority = "Low"
                    
                    return {
                        "category": category,
                        "sentiment": sentiment,
                        "priority": priority,
                        "confidence": 0.85,
                        "explanation": "AI analysis complete"
                    }
                    
    except json.JSONDecodeError as e:
        print(f"❌ JSON parse error: {e}")
    except Exception as e:
        print(f"❌ Ollama error: {e}")
    
    # Fallback to rule-based analysis
    return analyze_fallback(text)

def analyze_fallback(text):
    """Fallback rule-based analysis when Ollama is not available"""
    text_lower = text.lower()
    
    # Category detection
    if any(word in text_lower for word in ['fail', 'error', 'declin', 'transaction']):
        category = "Transaction Failure"
    elif any(word in text_lower for word in ['crash', 'freeze', 'bug']):
        category = "App Crash"
    elif any(word in text_lower for word in ['fraud', 'hack', 'unauthorized', 'stolen']):
        category = "Fraud Alert"
    elif any(word in text_lower for word in ['kyc', 'verify', 'document']):
        category = "KYC Issue"
    elif any(word in text_lower for word in ['ui', 'interface', 'design']):
        category = "UI Problem"
    elif any(word in text_lower for word in ['love', 'great', 'awesome', 'good']):
        category = "Positive Feedback"
    else:
        category = "General Inquiry"
    
    # Sentiment detection
    if any(word in text_lower for word in ['love', 'great', 'awesome', 'good', 'best']):
        sentiment = "Positive"
    elif any(word in text_lower for word in ['hate', 'bad', 'worst', 'terrible', 'fail', 'error', 'crash', 'fraud']):
        sentiment = "Negative"
    else:
        sentiment = "Neutral"
    
    # Priority detection
    if any(word in text_lower for word in ['fraud', 'hack', 'stolen', 'unauthorized']):
        priority = "High"
    elif any(word in text_lower for word in ['fail', 'error', 'crash', 'money', 'payment']):
        priority = "Medium"
    else:
        priority = "Low"
    
    return {
        "category": category,
        "sentiment": sentiment,
        "priority": priority,
        "confidence": 0.7,
        "explanation": "Rule-based analysis (Ollama not used)"
    }

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    """Upload and analyze CSV file - LLM guesses all fields"""
    
    print(f"📁 Received file: {file.filename}")

    if not file.filename.endswith('.csv'):
        raise HTTPException(400, "Only CSV files allowed")
    
    upload_session_id = None

    try:
        # Read file content
        content = await file.read()
        print(f"📊 File size: {len(content)} bytes")
            
        # Try different encodings
        encodings = ['utf-8', 'utf-8-sig', 'latin-1', 'cp1252']
        decoded_content = None
        
        for encoding in encodings:
            try:
                decoded_content = content.decode(encoding)
                print(f"✅ Successfully decoded with {encoding}")
                break
            except:
                continue
        
        if decoded_content is None:
            raise HTTPException(400, "Unable to decode file - unsupported encoding")
        
        # Parse CSV with robust options
        try:
            df = pd.read_csv(io.StringIO(decoded_content))
        except Exception as e:
            print(f"⚠️ Default parser failed: {e}, trying with more options...")
            df = pd.read_csv(
                io.StringIO(decoded_content),
                engine='python',
                skipinitialspace=True,
                on_bad_lines='skip'
            )
        
        print(f"📈 CSV columns: {df.columns.tolist()}")
        
        # Convert column names to lowercase
        df.columns = df.columns.str.lower().str.strip()
        
        # Check for feedback column
        if 'feedback' not in df.columns:
            possible_columns = ['text', 'comment', 'review', 'message', 'description']
            found = False
            for col in possible_columns:
                if col in df.columns:
                    df.rename(columns={col: 'feedback'}, inplace=True)
                    print(f"✅ Renamed column '{col}' to 'feedback'")
                    found = True
                    break
            
            if not found:
                raise HTTPException(400, f"CSV must have 'feedback' column. Found: {df.columns.tolist()}")
        
        # Clean feedback data
        df['feedback'] = df['feedback'].astype(str).str.strip().str.strip('"').str.strip("'")
        df = df[df['feedback'].str.len() > 3]
        df = df[~df['feedback'].str.contains('^\\s*$', na=False)]
        
        if len(df) == 0:
            raise HTTPException(400, "No valid feedback entries found in CSV")

        # Persist upload session first so rows can reference it.
        upload_session_id = str(uuid.uuid4())
        if db.pool:
            await db.execute(
                """
                INSERT INTO upload_sessions (id, filename, file_size, total_rows, processed_rows, status)
                VALUES ($1::uuid, $2, $3, $4, $5, $6)
                """,
                upload_session_id,
                file.filename,
                len(content),
                len(df),
                0,
                "processing",
            )
        
        # Process feedbacks with LLM
        results = []
        total = len(df)
        
        for idx, row in df.iterrows():
            text = row['feedback']
            
            # Use Ollama for analysis
            analysis = await analyze_with_ollama(text)
            
            result = await persist_feedback_record(text, analysis, upload_session_id)
            feedbacks.append(result)
            results.append(result)
            
            # Print progress
            if (idx + 1) % 5 == 0:
                print(f"✅ Processed {idx + 1}/{total} feedbacks")
        
        # Create upload record
        upload_record = {
            "id": upload_session_id or str(uuid.uuid4()),
            "filename": file.filename,
            "total_rows": len(results),
            "status": "completed",
            "uploaded_at": datetime.now().isoformat()
        }
        uploads.append(upload_record)

        if db.pool and upload_session_id:
            await db.execute(
                """
                UPDATE upload_sessions
                SET processed_rows = $2,
                    status = 'completed',
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = $1::uuid
                """,
                upload_session_id,
                len(results),
            )
        
        # Calculate summary statistics
        categories = {}
        sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
        priorities = {"High": 0, "Medium": 0, "Low": 0}
        
        for r in results:
            categories[r["category"]] = categories.get(r["category"], 0) + 1
            sentiments[r["sentiment"]] += 1
            priorities[r["priority"]] += 1
        
        print(f"Success: {len(results)} items processed")
        
        return {
            "message": "File processed successfully with AI",
            "filename": file.filename,
            "total_processed": len(results),
            "upload_id": upload_record["id"],
            "summary": {
                "categories": categories,
                "sentiments": sentiments,
                "priorities": priorities
            },
            "results": results[:5]
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(400, "CSV file is empty")
    except Exception as e:
        if db.pool and upload_session_id:
            await db.execute(
                """
                UPDATE upload_sessions
                SET status = 'failed',
                    error_message = $2,
                    completed_at = CURRENT_TIMESTAMP
                WHERE id = $1::uuid
                """,
                upload_session_id,
                str(e),
            )
        print(f"❌ Error: {str(e)}")
        raise HTTPException(500, detail=str(e))

@app.post("/api/analyze-single")
async def analyze_single_feedback(text: str):
    """Analyze a single feedback text with Ollama"""
    analysis = await analyze_with_ollama(text)
    result = await persist_feedback_record(text, analysis)
    feedbacks.append(result)
    return {
        "text": text,
        "analysis": analysis,
        "saved": True,
        "feedback_id": result["id"]
    }

@app.get("/api/recent-uploads")
async def get_recent_uploads():
    """Get recent uploads"""
    return {"uploads": uploads[-5:] if uploads else []}

@app.get("/api/feedbacks")
async def get_feedbacks(limit: int = 20):
    """Get all feedbacks"""
    return {
        "total": len(feedbacks),
        "feedbacks": feedbacks[-limit:]
    }

@app.get("/api/dashboard")
async def get_dashboard():
    """Get dashboard statistics"""
    total = len(feedbacks)
    
    if total == 0:
        return {
            "total_feedback": 0,
            "positive_count": 0,
            "neutral_count": 0,
            "negative_count": 0,
            "critical_count": 0,
            "high_priority_count": 0,
            "medium_priority_count": 0,
            "low_priority_count": 0,
            "categories": {}
        }
    
    # Calculate stats
    sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
    categories = {}
    priority_counts = {"High": 0, "Medium": 0, "Low": 0}
    
    for f in feedbacks:
        sentiments[f["sentiment"]] += 1
        categories[f["category"]] = categories.get(f["category"], 0) + 1
        priority_counts[f["priority"]] += 1
    
    top_categories = sorted(categories.items(), key=lambda item: item[1], reverse=True)[:6]
    category_data = [{"name": name, "count": count} for name, count in top_categories]
    recent_feedbacks = sorted(feedbacks, key=lambda x: x.get("timestamp", ""), reverse=True)[:5]
    recent_serialized = [
        {
            "id": item["id"],
            "text": item["text"],
            "category": item["category"],
            "sentiment": item["sentiment"],
            "priority": item["priority"],
            "time": format_time_ago(item.get("timestamp", "")),
        }
        for item in recent_feedbacks
    ]

    return {
        "total_feedback": total,
        "total": total,
        "positive_count": sentiments["Positive"],
        "positive": sentiments["Positive"],
        "neutral_count": sentiments["Neutral"],
        "neutral": sentiments["Neutral"],
        "negative_count": sentiments["Negative"],
        "negative": sentiments["Negative"],
        "critical_count": priority_counts["High"],
        "critical": priority_counts["High"],
        "high_priority_count": priority_counts["High"],
        "high": priority_counts["High"],
        "medium_priority_count": priority_counts["Medium"],
        "medium": priority_counts["Medium"],
        "low_priority_count": priority_counts["Low"],
        "low": priority_counts["Low"],
        "categories": categories,
        "category_data": category_data,
        "recent_feedbacks": recent_serialized,
    }


@app.get("/api/dashboard/recent-feedback")
async def get_dashboard_recent_feedback(limit: int = 5):
    """Get latest feedback cards formatted for dashboard UI."""
    recent_feedbacks = sorted(feedbacks, key=lambda x: x.get("timestamp", ""), reverse=True)[:limit]
    return {
        "feedbacks": [
            {
                "id": item["id"],
                "text": item["text"],
                "category": item["category"],
                "sentiment": item["sentiment"],
                "priority": item["priority"],
                "time": format_time_ago(item.get("timestamp", "")),
            }
            for item in recent_feedbacks
        ]
    }


@app.get("/api/dashboard/top-issues")
async def get_dashboard_top_issues(limit: int = 6):
    """Get top issue categories with counts for dashboard bars."""
    categories = {}
    for item in feedbacks:
        categories[item["category"]] = categories.get(item["category"], 0) + 1

    top_categories = sorted(categories.items(), key=lambda item: item[1], reverse=True)[:limit]
    return {
        "issues": [{"name": name, "count": count} for name, count in top_categories]
    }
    
    
@app.get("/api/risk-alerts")
async def get_risk_alerts():
    """Get risk alerts from feedbacks - Simplified for college project"""
    
    status_map = await get_risk_alert_status_map()
    risk_alerts = []
    
    for idx, f in enumerate(feedbacks):  
        text_lower = f["text"].lower()
        
        # Simple risk detection
        severity = "Medium"
        alert_type = "General"
        
        if any(word in text_lower for word in ['fraud', 'hack', 'unauthorized', 'stolen']):
            severity = "Critical"
            alert_type = "Fraud"
        elif any(word in text_lower for word in ['security', 'password', 'access']):
            severity = "High"
            alert_type = "Security"
        elif f["priority"] == "High":
            severity = "High"
            alert_type = "Priority"
        elif any(word in text_lower for word in ['crash', 'fail', 'error']):
            severity = "Medium"
            alert_type = "Issue"
        else:
            continue  # Skip if not a risk
        
        # Use real feedback timestamp for consistent alert time display.
        time_str = format_time_ago(f.get("timestamp", ""))

        # Persisted status overrides defaults.
        default_status = "investigating" if severity == "Critical" else "new"
        status = status_map.get(f["id"], default_status)
        
        risk_alerts.append({
            "id": f["id"],
            "type": alert_type,
            "severity": severity,
            "message": f"{alert_type} Alert detected",
            "feedback": f["text"],
            "time": time_str,
            "status": status,
            "category": f["category"],
            "action": "Investigate" if severity == "Critical" else "Review"
        })
    
    # Sort by severity
    risk_alerts.sort(key=lambda x: (
        0 if x["severity"] == "Critical" else 
        1 if x["severity"] == "High" else 2
    ))
    
    return {
        "total": len(risk_alerts),
        "alerts": risk_alerts
    }

@app.post("/api/risk-alerts/{alert_id}/resolve")
async def resolve_risk_alert(alert_id: str):
    """Mark a risk alert as resolved"""
    await persist_risk_alert_status(alert_id, "resolved")
    return {"message": "Alert resolved successfully", "id": alert_id, "status": "resolved"}

# ============= ANALYTICS ENDPOINTS =============
# Add these after your existing code, before the Reports endpoints

from datetime import timedelta


@app.get("/api/analytics/summary")
async def get_analytics_summary(date_range: str = "7"):
    """Get analytics summary with real data"""
    
    # Calculate date range
    end_date = datetime.now()
    days = int(date_range)
    start_date = end_date - timedelta(days=days)
    
    # Filter feedbacks by date range
    filtered_feedbacks = []
    for f in feedbacks:
        try:
            fb_date = datetime.fromisoformat(f["timestamp"])
            if fb_date >= start_date:
                filtered_feedbacks.append(f)
        except:
            filtered_feedbacks.append(f)
    
    total = len(filtered_feedbacks)
    
    if total == 0:
        return {
            "total_volume": 0,
            "avg_sentiment": 0,
            "critical_issues": 0,
            "resolution_rate": 0,
            "volume_change": 0,
            "sentiment_change": 0,
            "critical_change": 0,
            "resolution_change": 0
        }
    
    # Calculate statistics
    sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
    high_priority = 0
    
    for f in filtered_feedbacks:
        sentiments[f["sentiment"]] += 1
        if f["priority"] == "High":
            high_priority += 1
    
    # Calculate average sentiment (Positive=1, Neutral=0.5, Negative=0)
    avg_sentiment = (sentiments["Positive"] * 1 + sentiments["Neutral"] * 0.5 + sentiments["Negative"] * 0) / total
    
    # Calculate resolution rate (assume resolved if not high priority)
    resolved = total - high_priority
    resolution_rate = (resolved / total) * 100
    
    # Calculate previous period for changes
    previous_start = start_date - timedelta(days=days)
    previous_feedbacks = []
    for f in feedbacks:
        try:
            fb_date = datetime.fromisoformat(f["timestamp"])
            if previous_start <= fb_date < start_date:
                previous_feedbacks.append(f)
        except:
            pass
    
    prev_total = len(previous_feedbacks)
    prev_high = sum(1 for f in previous_feedbacks if f["priority"] == "High")
    prev_sentiment = 0
    if prev_total > 0:
        prev_sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
        for f in previous_feedbacks:
            prev_sentiments[f["sentiment"]] += 1
        prev_sentiment = (prev_sentiments["Positive"] * 1 + prev_sentiments["Neutral"] * 0.5) / prev_total
    
    # Calculate changes
    volume_change = ((total - prev_total) / prev_total * 100) if prev_total > 0 else 0
    sentiment_change = (avg_sentiment - prev_sentiment) * 100 if prev_total > 0 else 0
    critical_change = ((high_priority - prev_high) / prev_high * 100) if prev_high > 0 else 0
    
    return {
        "total_volume": total,
        "avg_sentiment": round(avg_sentiment, 2),
        "critical_issues": high_priority,
        "resolution_rate": round(resolution_rate, 1),
        "volume_change": round(volume_change, 1),
        "sentiment_change": round(sentiment_change, 1),
        "critical_change": round(critical_change, 1),
        "resolution_change": round(resolution_rate - 75, 1)
    }

@app.get("/api/analytics/trends")
async def get_analytics_trends(date_range: str = "7"):
    """Get daily trends for the chart"""
    
    days = int(date_range)
    trends = []
    
    for i in range(days):
        date = datetime.now() - timedelta(days=days-1-i)
        date_str = date.strftime("%Y-%m-%d")
        
        # Get feedbacks for this day
        day_feedbacks = []
        for f in feedbacks:
            try:
                fb_date = datetime.fromisoformat(f["timestamp"])
                if fb_date.date() == date.date():
                    day_feedbacks.append(f)
            except:
                pass
        
        total = len(day_feedbacks)
        positive = sum(1 for f in day_feedbacks if f["sentiment"] == "Positive")
        negative = sum(1 for f in day_feedbacks if f["sentiment"] == "Negative")
        neutral = total - positive - negative
        
        trends.append({
            "date": date_str,
            "total": total,
            "positive": positive,
            "negative": negative,
            "neutral": neutral
        })
    
    return trends

@app.get("/api/analytics/categories")
async def get_analytics_categories():
    """Get category breakdown with trends"""
    
    # Count categories for current period (last 30 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
    current_categories = {}
    for f in feedbacks:
        try:
            fb_date = datetime.fromisoformat(f["timestamp"])
            if fb_date >= start_date:
                current_categories[f["category"]] = current_categories.get(f["category"], 0) + 1
        except:
            current_categories[f["category"]] = current_categories.get(f["category"], 0) + 1
    
    # Count categories for previous period
    previous_start = start_date - timedelta(days=30)
    previous_categories = {}
    for f in feedbacks:
        try:
            fb_date = datetime.fromisoformat(f["timestamp"])
            if previous_start <= fb_date < start_date:
                previous_categories[f["category"]] = previous_categories.get(f["category"], 0) + 1
        except:
            pass
    
    # Build response with changes
    category_list = []
    for cat, count in sorted(current_categories.items(), key=lambda x: x[1], reverse=True):
        prev_count = previous_categories.get(cat, 0)
        if prev_count > 0:
            change = ((count - prev_count) / prev_count * 100)
        else:
            change = 0 if count == 0 else 100
        
        change_symbol = "+" if change >= 0 else ""
        category_list.append({
            "name": cat,
            "count": count,
            "change": f"{change_symbol}{round(change, 1)}%"
        })
    
    return category_list

@app.get("/api/analytics/peak-times")
async def get_peak_times():
    """Get feedback distribution by time of day"""
    
    # Analyze actual timestamps from feedbacks
    morning = 0
    afternoon = 0
    evening = 0
    night = 0
    
    for f in feedbacks:
        try:
            fb_time = datetime.fromisoformat(f["timestamp"])
            hour = fb_time.hour
            
            if 6 <= hour < 12:
                morning += 1
            elif 12 <= hour < 18:
                afternoon += 1
            elif 18 <= hour < 24:
                evening += 1
            else:
                night += 1
        except:
            pass
    
    total = morning + afternoon + evening + night
    if total > 0:
        return {
            "morning": round((morning / total) * 100),
            "afternoon": round((afternoon / total) * 100),
            "evening": round((evening / total) * 100),
            "night": round((night / total) * 100)
        }
    
    # Fallback to default distribution
    return {
        "morning": 35,
        "afternoon": 42,
        "evening": 18,
        "night": 5
    }

@app.get("/api/analytics/channels")
async def get_channel_distribution():
    """Get feedback distribution by channel"""
    
    # Count channels from feedbacks (default to 'unknown' if not set)
    channels = {}
    for f in feedbacks:
        channel = f.get("source_channel", "unknown")
        channels[channel] = channels.get(channel, 0) + 1
    
    total = len(feedbacks)
    if total > 0:
        return {
            "mobile": round((channels.get("app", 0) + channels.get("mobile", 0)) / total * 100),
            "web": round((channels.get("web", 0) + channels.get("website", 0)) / total * 100),
            "email": round(channels.get("email", 0) / total * 100),
            "chat": round(channels.get("chat", 0) / total * 100)
        }
    
    # Fallback to default distribution
    return {
        "mobile": 58,
        "web": 24,
        "email": 12,
        "chat": 6
    }

@app.get("/api/analytics/export")
async def export_analytics(date_range: str = "7", format: str = "csv"):
    """Export analytics data as CSV"""
    
    # Get trends data
    trends = await get_analytics_trends(date_range)
    categories = await get_analytics_categories()
    
    if format == "csv":
        output = io.StringIO()
        
        # Write trends
        output.write("Date,Total,Positive,Negative,Neutral\n")
        for trend in trends:
            output.write(f"{trend['date']},{trend['total']},{trend['positive']},{trend['negative']},{trend['neutral']}\n")
        
        output.write("\nCategory,Count,Change\n")
        for cat in categories:
            output.write(f"{cat['name']},{cat['count']},{cat['change']}\n")
        
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=analytics_export_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
        return response
    
    return {
        "trends": trends,
        "categories": categories
    }
# ============= REPORTS ENDPOINTS =============
# Add these after your Analytics endpoints

import io


@app.get("/api/reports/recent")
async def get_recent_reports():
    """Get list of recently generated reports"""
    
    # Calculate actual counts from your feedbacks
    total_feedbacks = len(feedbacks)
    high_priority_count = sum(1 for f in feedbacks if f["priority"] == "High")
    
    return {
        "reports": [
            {
                "id": "executive",
                "name": "Executive Summary",
                "description": "High-level overview for management",
                "lastGenerated": datetime.now().strftime("%Y-%m-%d"),
                "total_feedbacks": total_feedbacks
            },
            {
                "id": "detailed",
                "name": "Detailed Analysis",
                "description": "Complete feedback analysis with trends",
                "lastGenerated": datetime.now().strftime("%Y-%m-%d"),
                "total_feedbacks": total_feedbacks
            },
            {
                "id": "risk",
                "name": "Risk Assessment",
                "description": "Security and fraud risk report",
                "lastGenerated": datetime.now().strftime("%Y-%m-%d"),
                "total_feedbacks": high_priority_count
            },
            {
                "id": "category",
                "name": "Category Breakdown",
                "description": "Issue category distribution analysis",
                "lastGenerated": datetime.now().strftime("%Y-%m-%d"),
                "total_feedbacks": total_feedbacks
            }
        ]
    }

@app.get("/api/reports/scheduled")
async def get_scheduled_reports():
    """Get scheduled reports list"""
    
    # Return demo scheduled reports
    return {
        "scheduled_reports": [
            {
                "name": "Weekly Executive Summary",
                "frequency": "Every Monday",
                "recipients": "management@company.com",
                "nextRun": (datetime.now() + timedelta(days=7 - datetime.now().weekday())).strftime("%Y-%m-%d"),
                "active": True
            },
            {
                "name": "Daily Risk Alerts",
                "frequency": "Daily at 9 AM",
                "recipients": "security@company.com",
                "nextRun": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                "active": True
            }
        ]
    }

@app.get("/api/reports/download/{report_type}")
async def download_report(report_type: str, date_range: str = "week", format: str = "json"):
    """Download report in specified format"""
    
    # Calculate date range
    end_date = datetime.now()
    if date_range == "day":
        start_date = end_date - timedelta(days=1)
    elif date_range == "week":
        start_date = end_date - timedelta(days=7)
    elif date_range == "month":
        start_date = end_date - timedelta(days=30)
    elif date_range == "quarter":
        start_date = end_date - timedelta(days=90)
    else:
        start_date = end_date - timedelta(days=365)
    
    # Filter feedbacks by date range
    filtered_feedbacks = []
    for f in feedbacks:
        try:
            fb_date = datetime.fromisoformat(f["timestamp"])
            if fb_date >= start_date:
                filtered_feedbacks.append(f)
        except:
            filtered_feedbacks.append(f)
    
    total = len(filtered_feedbacks)
    
    if report_type == "executive":
        # Calculate statistics
        sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
        categories = {}
        priorities = {"High": 0, "Medium": 0, "Low": 0}
        
        for f in filtered_feedbacks:
            sentiments[f["sentiment"]] += 1
            categories[f["category"]] = categories.get(f["category"], 0) + 1
            priorities[f["priority"]] += 1
        
        positive_pct = round((sentiments["Positive"] / total) * 100, 1) if total > 0 else 0
        negative_pct = round((sentiments["Negative"] / total) * 100, 1) if total > 0 else 0
        neutral_pct = round((sentiments["Neutral"] / total) * 100, 1) if total > 0 else 0
        
        top_issues = sorted(categories.items(), key=lambda x: x[1], reverse=True)[:3]
        
        report_data = {
            "report_type": "Executive Summary",
            "date_range": date_range,
            "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            "total_feedback": total,
            "sentiment": {
                "positive": sentiments["Positive"],
                "positive_percentage": positive_pct,
                "neutral": sentiments["Neutral"],
                "neutral_percentage": neutral_pct,
                "negative": sentiments["Negative"],
                "negative_percentage": negative_pct
            },
            "priorities": priorities,
            "top_issues": [{"category": cat, "count": count} for cat, count in top_issues],
            "categories": categories,
            "generated_at": datetime.now().isoformat()
        }
        
    elif report_type == "detailed":
        # Calculate detailed statistics
        sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
        categories = {}
        priorities = {"High": 0, "Medium": 0, "Low": 0}
        
        for f in filtered_feedbacks:
            sentiments[f["sentiment"]] += 1
            categories[f["category"]] = categories.get(f["category"], 0) + 1
            priorities[f["priority"]] += 1
        
        report_data = {
            "report_type": "Detailed Analysis",
            "date_range": date_range,
            "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            "total_feedback": total,
            "sentiment_distribution": {
                "positive": sentiments["Positive"],
                "neutral": sentiments["Neutral"],
                "negative": sentiments["Negative"]
            },
            "priority_distribution": priorities,
            "category_distribution": categories,
            "generated_at": datetime.now().isoformat()
        }
        
    elif report_type == "risk":
        # Calculate risk statistics
        high_priority = [f for f in filtered_feedbacks if f["priority"] == "High"]
        
        report_data = {
            "report_type": "Risk Assessment",
            "date_range": date_range,
            "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            "risk_level": "High" if len(high_priority) > 10 else "Medium" if len(high_priority) > 5 else "Low",
            "total_risks": len(high_priority),
            "risk_breakdown": {
                "high_priority_issues": len(high_priority),
                "fraud_alerts": 0,
                "security_concerns": 0
            },
            "generated_at": datetime.now().isoformat()
        }
        
    elif report_type == "category":
        # Calculate category breakdown
        categories = {}
        for f in filtered_feedbacks:
            categories[f["category"]] = categories.get(f["category"], 0) + 1
        
        category_breakdown = []
        for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
            category_breakdown.append({
                "category": cat,
                "count": count,
                "percentage": round((count / total) * 100, 1) if total > 0 else 0
            })
        
        report_data = {
            "report_type": "Category Breakdown",
            "date_range": date_range,
            "period": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}",
            "total_feedback": total,
            "category_breakdown": category_breakdown,
            "generated_at": datetime.now().isoformat()
        }
    else:
        raise HTTPException(400, "Invalid report type")
    
    if format == "json":
        return report_data
    elif format == "csv":
        output = io.StringIO()
        
        if report_type == "executive":
            output.write("Metric,Value\n")
            output.write(f"Total Feedback,{total}\n")
            output.write(f"Positive,{sentiments['Positive']}\n")
            output.write(f"Neutral,{sentiments['Neutral']}\n")
            output.write(f"Negative,{sentiments['Negative']}\n")
        elif report_type == "category":
            output.write("Category,Count,Percentage\n")
            for cat in category_breakdown:
                output.write(f"{cat['category']},{cat['count']},{cat['percentage']}%\n")
        
        response = StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={report_type}_report.csv"}
        )
        return response
    
    return report_data

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("🚀 FinSight AI Backend")
    print("=" * 50)
    print(f"🤖 Model: {OLLAMA_MODEL}")
    print(f"📊 Total feedbacks: {len(feedbacks)}")
    print("🌐 http://localhost:8000")
    print("📚 http://localhost:8000/docs")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)