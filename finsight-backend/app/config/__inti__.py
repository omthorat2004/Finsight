# src/backend/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Database
    DB_HOST = os.getenv('DB_HOST', 'localhost')
    DB_PORT = os.getenv('DB_PORT', '5432')
    DB_NAME = os.getenv('DB_NAME', 'finsight_db')
    DB_USER = os.getenv('DB_USER', 'postgres')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
    DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Ollama
    OLLAMA_URL = os.getenv('OLLAMA_URL', 'http://localhost:11434')
    OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'deepseek-r1:7b')
    
    # File Upload
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    UPLOAD_DIR = 'uploads'
    ALLOWED_EXTENSIONS = {'csv'}
    
    # Processing
    BATCH_SIZE = 10  # Process 10 at a time
    MAX_CONCURRENT = 3  # Max concurrent requests to Ollama

config = Config()

# Create upload directory if not exists
os.makedirs(config.UPLOAD_DIR, exist_ok=True)