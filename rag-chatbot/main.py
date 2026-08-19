import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from utils.logger import logger
from services.ingestion_service import run_incremental_ingestion
from vectorstore.chroma_manager import chroma_manager

from api.chat_router import router as chat_router
from api.ingest_router import router as ingest_router
from api.health_router import router as health_router
from api.stats_router import router as stats_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup & Shutdown lifecycle listener.
    Automatically checks and ingests knowledge_base PDFs on startup if empty.
    """
    logger.info("Initializing BusLink RAG Chatbot Microservice...")
    try:
        count = chroma_manager.collection.count()
        if count == 0:
            logger.info("ChromaDB collection is empty. Triggering automatic initial PDF ingestion...")
            run_incremental_ingestion(force=True)
        else:
            logger.info(f"Existing ChromaDB index detected with {count} chunks. Performing incremental check...")
            run_incremental_ingestion(force=False)
    except Exception as e:
        logger.error(f"Error during startup ingestion check: {e}")
        
    yield
    logger.info("Shutting down BusLink RAG Microservice.")

app = FastAPI(
    title="BusLink FAQ RAG Chatbot API",
    description="Production-Ready Retrieval-Augmented Generation (RAG) Microservice powered by ChromaDB, BAAI/bge-small-en-v1.5 embeddings, and Groq Llama 3.1 8B Instruct.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Enable CORS for Spring Boot & React Client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(chat_router)
app.include_router(ingest_router)
app.include_router(health_router)
app.include_router(stats_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
