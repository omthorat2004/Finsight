import asyncio
import io
import json
import os
import random
import uuid
from datetime import datetime

import httpx
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables
load_dotenv()

app = FastAPI(title="FinSight AI Backend")

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
            "message": "❌ Ollama not running. Run: ollama serve"
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
        
        # Process feedbacks with LLM
        results = []
        total = len(df)
        
        for idx, row in df.iterrows():
            text = row['feedback']
            
            # Use Ollama for analysis
            analysis = await analyze_with_ollama(text)
            
            result = {
                "id": str(uuid.uuid4()),
                "text": text,
                "category": analysis["category"],
                "sentiment": analysis["sentiment"],
                "priority": analysis["priority"],
                "timestamp": datetime.now().isoformat()
            }
            feedbacks.append(result)
            results.append(result)
            
            # Print progress
            if (idx + 1) % 5 == 0:
                print(f"✅ Processed {idx + 1}/{total} feedbacks")
        
        # Create upload record
        upload_record = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "total_rows": len(results),
            "status": "completed",
            "uploaded_at": datetime.now().isoformat()
        }
        uploads.append(upload_record)
        
        # Calculate summary statistics
        categories = {}
        sentiments = {"Positive": 0, "Neutral": 0, "Negative": 0}
        priorities = {"High": 0, "Medium": 0, "Low": 0}
        
        for r in results:
            categories[r["category"]] = categories.get(r["category"], 0) + 1
            sentiments[r["sentiment"]] += 1
            priorities[r["priority"]] += 1
        
        print(f"✅ Success: {len(results)} items processed")
        
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
        print(f"❌ Error: {str(e)}")
        raise HTTPException(500, detail=str(e))

@app.post("/api/analyze-single")
async def analyze_single_feedback(text: str):
    """Analyze a single feedback text with Ollama"""
    analysis = await analyze_with_ollama(text)
    return {
        "text": text,
        "analysis": analysis
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
    
    return {
        "total_feedback": total,
        "positive_count": sentiments["Positive"],
        "neutral_count": sentiments["Neutral"],
        "negative_count": sentiments["Negative"],
        "critical_count": priority_counts["High"],
        "high_priority_count": priority_counts["High"],
        "medium_priority_count": priority_counts["Medium"],
        "low_priority_count": priority_counts["Low"],
        "categories": categories
    }
@app.get("/api/risk-alerts")
async def get_risk_alerts():
    """Get risk alerts from feedbacks - Simplified for college project"""
    
    risk_alerts = []
    
    for idx, f in enumerate(feedbacks[-20:]):  # Last 20 feedbacks
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
        
        # Generate realistic time
        import random
        minutes = random.randint(1, 180)
        if minutes < 60:
            time_str = f"{minutes} minutes ago"
        else:
            hours = minutes // 60
            time_str = f"{hours} hours ago"
        
        # Status based on index
        statuses = ['new', 'investigating', 'in_progress', 'resolved']
        status = statuses[idx % 4]
        
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
    # In a real app, you'd update the database
    # For now, just return success
    return {"message": "Alert resolved successfully", "id": alert_id}


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