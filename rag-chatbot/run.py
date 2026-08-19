import uvicorn
from config.settings import settings

if __name__ == "__main__":
    print(f"Starting BusLink RAG Chatbot Service on http://{settings.HOST}:{settings.PORT} ...")
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
