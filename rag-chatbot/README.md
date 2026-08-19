# 🤖 BusLink RAG Chatbot Microservice

Production-Ready Retrieval-Augmented Generation (RAG) FAQ Chatbot for the **BusLink** Intercity Bus Booking Platform.

## 🏗️ Architecture Stack
`React UI` → `Spring Boot Gateway` → `FastAPI RAG Microservice` → `ChromaDB Vector Store` → `Groq (Llama 3.1 8B Instruct)`

- **LLM**: Groq `llama-3.1-8b-instant`
- **Embeddings**: `BAAI/bge-small-en-v1.5`
- **Vector DB**: ChromaDB (`buslink_faqs` persistent collection)
- **Framework**: FastAPI + PyPDF + Pydantic v2

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
cd BusLinkRAG
pip install -r requirements.txt
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `GROQ_API_KEY` is configured in `.env`.

### 3. Place PDFs in Knowledge Base
Place all official PDF documents inside the `knowledge_base/` folder:
- `BusLink_Cancellation_and_Refund_Policy.pdf`
- `BusLink_Customer_FAQ_Handbook.pdf`
- `Operator_Handbook_BusLink.pdf`
- `Passenger_Travel_Policy_BusLink.pdf`
- `Privacy_Policy_BusLink.pdf`

### 4. Run Service
```bash
python run.py
```
The microservice will automatically scan `knowledge_base/`, build vector embeddings on first run, and start listening on `http://localhost:8000`.

### 5. Access Interactive API Docs
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints
- `POST /chat`: RAG FAQ query with conversation history & citation output.
- `POST /ingest`: Triggers incremental PDF scanning & chunking.
- `GET /health`: Health status of ChromaDB and Groq API.
- `GET /stats`: Vector collection statistics.
