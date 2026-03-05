# models.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class UploadResponse(BaseModel):
    message: str
    filename: str
    session_id: str
    status: str

class StatusResponse(BaseModel):
    id: uuid.UUID
    filename: str
    total_rows: int
    processed_rows: int
    status: str
    uploaded_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]

class FeedbackEntry(BaseModel):
    id: uuid.UUID
    text: str
    category: str
    sentiment: str
    priority: str
    created_at: datetime

class DashboardSummary(BaseModel):
    total_feedback: int
    positive_count: int
    neutral_count: int
    negative_count: int
    critical_count: int
    categories: dict