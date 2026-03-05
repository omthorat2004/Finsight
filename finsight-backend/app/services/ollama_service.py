# ollama_service.py
import httpx
import json
import asyncio
import time
import os

class OllamaService:
    def __init__(self):
        self.base_url = os.getenv('OLLAMA_URL', 'http://localhost:11434')
        self.model = os.getenv('OLLAMA_MODEL', 'deepseek-r1:7b')
        self.timeout = 30
        
    async def analyze_feedback(self, feedback_text):
        """Analyze feedback using Ollama"""
        start_time = time.time()
        
        prompt = f"""Analyze this customer feedback and return ONLY a JSON object.

Feedback: "{feedback_text}"

Return this exact format:
{{
    "issue_category": "Transaction Failure | KYC Issue | Refund Delay | App Crash | UI Problem | Feature Request | Fraud Alert | Account Blocked | General Inquiry",
    "confidence": 0.0,
    "sentiment": "Positive | Neutral | Negative",
    "sentiment_score": 0.0,
    "priority": "Critical | High | Medium | Low",
    "business_impact": "Revenue | Security | Compliance | User Experience | None",
    "risk_flags": {{
        "fraud": false,
        "security": false,
        "requires_action": false
    }},
    "amount": null,
    "transaction_type": "Payment | Refund | Deposit | Withdrawal | Unknown"
}}

Return ONLY the JSON, no other text."""

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": 0.1,
                            "num_predict": 300
                        }
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    llm_output = result.get("response", "")
                    
                    # Extract JSON
                    analysis = self._parse_json(llm_output)
                    analysis['processing_time_ms'] = int((time.time() - start_time) * 1000)
                    
                    return analysis
                else:
                    return self._get_fallback()
                    
        except Exception as e:
            print(f"Ollama error: {e}")
            return self._get_fallback()
    
    def _parse_json(self, text):
        """Extract JSON from response"""
        try:
            start = text.find('{')
            end = text.rfind('}') + 1
            if start != -1 and end > start:
                return json.loads(text[start:end])
        except:
            pass
        return self._get_fallback()
    
    def _get_fallback(self):
        """Return fallback analysis"""
        return {
            "issue_category": "General Inquiry",
            "confidence": 0.5,
            "sentiment": "Neutral",
            "sentiment_score": 0.5,
            "priority": "Low",
            "business_impact": "None",
            "risk_flags": {
                "fraud": False,
                "security": False,
                "requires_action": False
            },
            "amount": None,
            "transaction_type": "Unknown",
            "processing_time_ms": 0
        }

ollama = OllamaService()