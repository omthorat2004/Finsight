# database.py
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.pool = None
        
    async def connect(self):
        """Create database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                host=os.getenv('DB_HOST', 'localhost'),
                port=os.getenv('DB_PORT', '5432'),
                database=os.getenv('DB_NAME', 'finsight_db'),
                user=os.getenv('DB_USER', 'postgres'),
                password=os.getenv('DB_PASSWORD', 'postgres'),
                min_size=5,
                max_size=20
            )
            print("✅ Connected to PostgreSQL database")
            
            # Create tables if they don't exist
            await self.create_tables()
            
        except Exception as e:
            print(f"❌ Database connection failed: {e}")
            raise
    
    async def create_tables(self):
        """Create necessary tables"""
        async with self.pool.acquire() as conn:
            # Upload sessions table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS upload_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    filename VARCHAR(255) NOT NULL,
                    file_size INTEGER,
                    total_rows INTEGER DEFAULT 0,
                    processed_rows INTEGER DEFAULT 0,
                    status VARCHAR(20) DEFAULT 'pending',
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP,
                    error_message TEXT
                )
            """)
            
            # Feedback entries table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS feedback_entries (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    upload_session_id UUID REFERENCES upload_sessions(id) ON DELETE CASCADE,
                    original_text TEXT NOT NULL,
                    customer_id VARCHAR(100),
                    source_channel VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Analysis results table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS analysis_results (
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
                )
            """)
            
            print("✅ Database tables created/verified")
    
    async def close(self):
        """Close database connection"""
        if self.pool:
            await self.pool.close()
            print("✅ Database connection closed")
    
    async def execute(self, query, *args):
        """Execute a query"""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
    
    async def fetch(self, query, *args):
        """Fetch multiple rows"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)
    
    async def fetchrow(self, query, *args):
        """Fetch a single row"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)
    
    async def fetchval(self, query, *args):
        """Fetch a single value"""
        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

# Create global database instance
db = Database()