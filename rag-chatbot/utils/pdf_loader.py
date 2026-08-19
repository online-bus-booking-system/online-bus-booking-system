import os
import re
import pypdf
from typing import List, Dict, Any
from .logger import logger

def extract_section_title(text: str) -> str:
    """
    Heuristically extracts the first heading or section title from a chunk text.
    """
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    for line in lines:
        if re.match(r"^(Section\s+\d+|SECTION\s+\d+|\d+\.\s+|Q\d+[:\.]|[A-Z0-9\s–\:\-]{4,50}$)", line, re.IGNORECASE):
            return line[:60]
    return lines[0][:50] if lines else "General Provisions"

def load_and_chunk_pdf(filepath: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict[str, Any]]:
    """
    Reads a PDF file, extracts page text, and splits into recursive chunks with metadata.
    """
    filename = os.path.basename(filepath)
    chunks = []
    
    try:
        reader = pypdf.PdfReader(filepath)
        for page_idx, page in enumerate(reader.pages):
            page_num = page_idx + 1
            text = page.extract_text() or ""
            text = text.replace("\r\n", "\n").strip()
            if not text:
                continue
            
            # Recursive character splitting logic
            start = 0
            text_len = len(text)
            chunk_seq = 1
            
            while start < text_len:
                end = min(start + chunk_size, text_len)
                chunk_text = text[start:end].strip()
                
                if chunk_text:
                    section = extract_section_title(chunk_text)
                    chunk_id = f"{filename}_p{page_num}_c{chunk_seq}"
                    
                    chunks.append({
                        "id": chunk_id,
                        "text": chunk_text,
                        "metadata": {
                            "document": filename,
                            "page": page_num,
                            "section": section,
                            "chunk_id": chunk_id,
                            "source": filepath
                        }
                    })
                    chunk_seq += 1
                
                start += (chunk_size - overlap)
                
        logger.info(f"Parsed '{filename}': {len(chunks)} chunks across {len(reader.pages)} pages.")
    except Exception as e:
        logger.error(f"Error processing PDF '{filepath}': {e}")
        
    return chunks

def scan_knowledge_base_pdfs(directory: str) -> List[str]:
    """
    Recursively scans the directory for PDF files.
    """
    pdf_files = []
    if os.path.exists(directory):
        for root, _, files in os.walk(directory):
            for file in files:
                if file.lower().endswith(".pdf"):
                    pdf_files.append(os.path.join(root, file))
    return sorted(pdf_files)
