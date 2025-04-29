import os
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

from .db import (
    create_document,
    delete_images_by_document,
    get_images_by_document,
    insert_image,
    update_image_caption,
    get_all_images_with_docs
)
from .          import extractor, captioner

# Paths inside backend/
BASE_DIR   = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
IMAGES_DIR = BASE_DIR / "images"
UPLOAD_DIR.mkdir(exist_ok=True)
IMAGES_DIR.mkdir(exist_ok=True)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)
app.mount("/images/static", StaticFiles(directory=str(IMAGES_DIR)), name="static")

def _bg_caption_and_update(image_id, image_path):
    try:
        cap = captioner.generate_caption(image_path)
    except Exception:
        cap = "Unavailable"
    update_image_caption(image_id, cap, "model")

@app.post("/upload")
async def upload(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...)
):
    document_ids = []
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        if ext not in [".pdf", ".docx", ".pptx", ".xlsx"]:
            raise HTTPException(415, f"Unsupported type: {file.filename}")
        data = await file.read()
        if len(data) > 50 * 1024 * 1024:
            raise HTTPException(413, f"File too large: {file.filename}")

        # 1) Save raw file
        path = UPLOAD_DIR / file.filename
        with open(path, "wb") as f:
            f.write(data)

        # 2) Doc record & cleanup
        doc_id = create_document(file.filename)
        delete_images_by_document(doc_id)

        # 3) Extract images
        try:
            if ext == ".pdf":
                extractor.extract_from_pdf(str(path), doc_id, str(IMAGES_DIR))
            elif ext == ".docx":
                extractor.extract_from_docx(str(path), doc_id, str(IMAGES_DIR))
            elif ext == ".pptx":
                extractor.extract_from_pptx(str(path), doc_id, str(IMAGES_DIR))
            else:
                extractor.extract_from_xlsx(str(path), doc_id, str(IMAGES_DIR))
        except Exception as e:
            raise HTTPException(500, f"Extraction failed for {file.filename}: {e}")

        # 4) Schedule background captioning
        imgs = get_images_by_document(doc_id)
        if not imgs:
            pid = insert_image(doc_id, "", None)
            update_image_caption(pid, "⚠️ No images found", "system")
        else:
            for img in imgs:
                skey = img["storage_key"]
                if not skey:
                    continue
                full_path = IMAGES_DIR / skey
                background_tasks.add_task(_bg_caption_and_update, img["_id"], str(full_path))

        document_ids.append(str(doc_id))

    return JSONResponse({"document_ids": document_ids})

@app.get("/images")
def list_images():
    docs = get_all_images_with_docs()
    return [
        {
          "id":               str(i["_id"]),
          "document_id":      str(i["document_id"]),
          "url":              f"/images/static/{i['storage_key']}",
          "caption":          i["caption"],
          "caption_source":   i["caption_source"],
          "document_filename":i["doc"]["filename"],
          "page_or_slide":    i["page_or_slide"]
        }
        for i in docs
    ]
