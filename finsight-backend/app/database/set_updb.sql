-- setup_db.sql
-- Run this to create the database

-- Connect to default database
\c postgres;

-- Drop database if exists (for clean setup)
DROP DATABASE IF EXISTS finsight;

-- Create new database
CREATE DATABASE finsight;

-- Connect to new database
\c finsight;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE upload_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    total_rows INTEGER DEFAULT 0,
    processed_rows INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE TABLE feedback_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_session_id UUID REFERENCES upload_sessions(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    customer_id VARCHAR(100),
    source_channel VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID REFERENCES feedback_entries(id) ON DELETE CASCADE UNIQUE,
    issue_category VARCHAR(50),
    confidence DECIMAL(3,2),
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(3,2),
    priority VARCHAR(20),
    business_impact VARCHAR(50),
    has_fraud BOOLEAN DEFAULT FALSE,
    has_security BOOLEAN DEFAULT FALSE,
    requires_action BOOLEAN DEFAULT FALSE,
    amount_mentioned DECIMAL(10,2),
    transaction_type VARCHAR(50),
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_feedback_upload_session ON feedback_entries(upload_session_id);
CREATE INDEX idx_analysis_category ON analysis_results(issue_category);
CREATE INDEX idx_analysis_sentiment ON analysis_results(sentiment);
CREATE INDEX idx_analysis_priority ON analysis_results(priority);

-- Show success message
\dt
SELECT 'Database setup complete!' as message;