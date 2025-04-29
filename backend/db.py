import os
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from pathlib import Path

# ensure we load from backend/.env
BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URI)
db = client["doc_image_demo"]
documents_col = db["documents"]
images_col    = db["images"]

def create_document(filename: str) -> ObjectId:
    existing = documents_col.find_one({"filename": filename})
    if existing:
        return existing["_id"]
    doc = {
        "filename": filename,
        "uploaded_at": datetime.utcnow()
    }
    return documents_col.insert_one(doc).inserted_id

def insert_image(document_id: ObjectId,
                 storage_key: str,
                 page_or_slide: int) -> ObjectId:
    img = {
        "document_id": document_id,
        "storage_key": storage_key,        # e.g. "2025/04/28/uuid.png"
        "page_or_slide": page_or_slide,
        "caption": None,
        "caption_source": None,
        "created_at": datetime.utcnow()
    }
    return images_col.insert_one(img).inserted_id

def delete_images_by_document(document_id: ObjectId):
    # Remove metadata; delete files themselves via cleanup script if desired
    images_col.delete_many({"document_id": document_id})

def update_image_caption(image_id: ObjectId,
                         caption: str,
                         caption_source: str):
    images_col.update_one(
        {"_id": image_id},
        {"$set": {"caption": caption, "caption_source": caption_source}}
    )

def get_images_by_document(document_id: ObjectId):
    return list(images_col.find({"document_id": document_id}))

def get_all_images_with_docs():
    pipeline = [
        {
            "$lookup": {
                "from": "documents",
                "localField": "document_id",
                "foreignField": "_id",
                "as": "doc"
            }
        },
        {"$unwind": "$doc"}
    ]
    return list(images_col.aggregate(pipeline))
