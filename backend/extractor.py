import os
import io
import zipfile
import fitz  # PyMuPDF
from PIL import Image
from uuid import uuid4
from datetime import datetime
from docx import Document as DocxDocument
from pptx import Presentation
from bson import ObjectId
from backend.db import insert_image

def _make_storage_path(images_dir: str, ext: str = ".png") -> str:
    """
    Create a date‐partitioned path under images_dir and return the relative storage key.
    """
    today = datetime.utcnow().strftime("%Y/%m/%d")
    folder = os.path.join(images_dir, today)
    os.makedirs(folder, exist_ok=True)
    filename = f"{uuid4().hex}{ext}"
    # relative path for DB
    storage_key = os.path.join(today, filename).replace("\\", "/")
    return folder, storage_key

def _save_and_record(img_bytes: bytes, doc_id: ObjectId, page: int, images_dir: str):
    folder, storage_key = _make_storage_path(images_dir)
    out_path = os.path.join(folder, os.path.basename(storage_key))
    with open(out_path, "wb") as f:
        f.write(img_bytes)
    insert_image(doc_id, storage_key, page)

def extract_from_pdf(path: str, doc_id: ObjectId, images_dir: str):
    pdf = fitz.open(path)
    for p in range(len(pdf)):
        page = pdf[p]
        for img_index, img in enumerate(page.get_images(full=True)):
            xref = img[0]
            base = pdf.extract_image(xref)
            _save_and_record(base["image"], doc_id, p+1, images_dir)

def extract_from_docx(path: str, doc_id: ObjectId, images_dir: str):
    doc = DocxDocument(path)
    for rel in doc.part._rels.values():
        if "image" in rel.target_ref:
            blob = rel.target_part.blob
            _save_and_record(blob, doc_id, None, images_dir)

def extract_from_pptx(path: str, doc_id: ObjectId, images_dir: str):
    prs = Presentation(path)
    for s_idx, slide in enumerate(prs.slides):
        for shape in slide.shapes:
            if hasattr(shape, "image"):
                blob = shape.image.blob
                _save_and_record(blob, doc_id, s_idx+1, images_dir)

def extract_from_xlsx(path: str, doc_id: ObjectId, images_dir: str):
    with zipfile.ZipFile(path, 'r') as zf:
        for name in zf.namelist():
            if name.startswith('xl/media/') and name.lower().endswith(('.png','.jpg','.jpeg','.gif','bmp')):
                data = zf.read(name)
                _save_and_record(data, doc_id, None, images_dir)
