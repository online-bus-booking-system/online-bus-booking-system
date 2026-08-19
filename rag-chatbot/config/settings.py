import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application Settings loaded from environment variables or .env file.
    """
    load_dotenv()
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    
    CHROMA_DB_PATH: str = r"e:\CDAC\Cdac Project\BusLinkRAG\chroma_db"
    COLLECTION_NAME: str = "buslink_faqs"
    KNOWLEDGE_BASE_DIR: str = r"e:\CDAC\Cdac Project\BusLinkRAG\knowledge_base"
    
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 150
    TOP_K: int = 5
    SIMILARITY_THRESHOLD: float = 0.35
    MAX_HISTORY_TURNS: int = 5
    
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
