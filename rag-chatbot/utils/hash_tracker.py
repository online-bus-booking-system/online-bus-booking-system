import os
import json
import hashlib
from typing import Dict
from .logger import logger

HASH_FILE = r"e:\CDAC\Cdac Project\BusLinkRAG\chroma_db\.pdf_hashes.json"

def calculate_file_hash(filepath: str) -> str:
    """
    Computes SHA256 checksum for a PDF file to detect changes.
    """
    sha256 = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(8192):
            sha256.update(chunk)
    return sha256.hexdigest()

def load_stored_hashes() -> Dict[str, str]:
    """
    Loads saved PDF checksums from disk.
    """
    if os.path.exists(HASH_FILE):
        try:
            with open(HASH_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load hash manifest: {e}")
    return {}

def save_hashes(hashes: Dict[str, str]) -> None:
    """
    Saves PDF checksum manifest to disk.
    """
    os.makedirs(os.path.dirname(HASH_FILE), exist_ok=True)
    with open(HASH_FILE, "w", encoding="utf-8") as f:
        json.dump(hashes, f, indent=2)
