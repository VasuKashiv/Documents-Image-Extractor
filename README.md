# 📄 → 🖼️ Document Image Gallery

A demo application that lets you upload batches of documents (PDF, DOCX, PPTX, XLSX), automatically extracts every embedded image, generates concise AI-driven captions for each image in the background, stores metadata in MongoDB, and displays everything in a responsive, live-updating React gallery with fullscreen previews.

---

## 🚀 Tech Stack

**Backend**  
- **Language & Framework**: Python 3 + [FastAPI](https://fastapi.tiangolo.com/)  
- **Document Parsing**: PyMuPDF (PDF), python-docx, python-pptx, zipfile+PIL (Excel)  
- **AI Captioning**: HuggingFace Transformers • `Salesforce/instructblip-flan-t5-xl`  
- **Storage**: MongoDB for metadata • Local filesystem (uploads/, images/) for binaries  
- **Background Processing**: FastAPI `BackgroundTasks`

**Frontend**  
- **Framework**: React  
- **Data Fetching**: @tanstack/react-query  
- **File Upload**: react-dropzone + Axios  
- **UI Library**: Material-UI + Framer Motion  
- **Gallery Layout**: react-masonry-css + react-image-lightbox  


## 📁 Repository Structure
```text
project-root/
├── backend/
│   ├── captioner.py
│   ├── db.py
│   ├── extractor.py
│   ├── main.py
│   ├── requirements.txt
│   ├── .env
│   └── (uploads/ images/) ← auto-created at runtime
└── doc-image-ui/
    ├── public/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   ├── hooks/
    │   └── App.js
    ├── .env.local
    └── package.json
```
---


## ⚙️ Backend Setup

1. **Create & activate virtual environment**  
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate        # macOS/Linux
   venv\Scripts\activate.bat       # Windows (cmd)
2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
3. **Configure environment variables:**
   Create or edit backend/.env.example:
   ```ini
   MONGODB_URI=mongodb://localhost:27017
   HF_API_TOKEN=hf_your_huggingface_token
   ```
4. **Run the API server**
   ```bash
   uvicorn main:app --reload
   ```
   The backend will be available at http://localhost:8000.
---
## ⚙️ Frontend Setup

1. **Install dependencies**
   ```bash
   cd ../doc-image-ui
   npm install
   ```
3. **Configure environment variables:**
   Create doc-image-ui/.env.local:
   ```ini
   REACT_APP_API_URL=http://localhost:8000
   ```
4. **Start the React App**
   ```bash
   npm start
   ```
   The frontend will open in the browser at http://localhost:3000.



