# # captioner.py

# import os
# from huggingface_hub import InferenceClient
# from dotenv import load_dotenv

# load_dotenv()

# HF_TOKEN = os.getenv("HF_API_TOKEN")
# MODEL_ID = "Salesforce/blip-image-captioning-large"
# # MODEL_ID="Salesforce/instructblip-flan-t5-xl"
# # Initialize the InferenceClient once
# client = InferenceClient(
#     provider="hf-inference",
#     api_key=HF_TOKEN,                
# )

# def generate_caption(image_path: str) -> str:
#     """
#     Uses Hugging Face's InferenceClient.image_to_text,
#     which accepts raw image bytes or a file path.
#     Returns the 'generated_text' field.
#     """
#     try:
#         output = client.image_to_text(image_path,model=MODEL_ID)
#         print(f"Generated caption for {image_path}: {output}")
#         return (output[0] if isinstance(output, list) else output).get("generated_text")
#     except Exception as e:
#         # Log the error with more details
#         print(f"Error generating caption for {image_path}: {e}")
#         if "Non-conversational image-text-to-text task is not supported" in str(e):
#             return "Task not supported by the model"
#         return "Error generating caption"


# # captioner.py (local mode)


import os
import traceback
from dotenv import load_dotenv
from PIL import Image
import torch
from transformers import (
    InstructBlipProcessor,
    InstructBlipForConditionalGeneration
)
from pathlib import Path

# ensure we load from backend/.env
BASE_DIR = Path(__file__).parent
load_dotenv(BASE_DIR / ".env")

# 2) Pick device (CUDA if available)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")
# 3) Load processor & model from Salesforce/instructblip-flan-t5-xl
processor = InstructBlipProcessor.from_pretrained(
    "Salesforce/instructblip-flan-t5-xl", 
    use_fast=True
)
model = InstructBlipForConditionalGeneration.from_pretrained(
    "Salesforce/instructblip-flan-t5-xl",torch_dtype=torch.float16 if device.type == "cuda" else torch.float32
).to(device)
model.eval()

# 3) Prompt & rules for generation
PROMPT = """
You are an expert image captioning assistant. Follow these rules exactly when describing the image:

1. **Length**: Output **2-3 sentences** (roughly 50-60 words).  
2. **Content**:  
   - Identify the **main subject(s)** (people, objects, animals).  
   - Mention two or three **key attributes** (color, size, posture).  
   - Describe any obvious **action** or **activity**.  
   - Summarize the **scene context** (environment, location, mood).  
3. **Style**:  
   - Write in **natural language**, not bullet points.  
   - Use **proper grammar** and **punctuation**.  
   - Avoid vague words like “nice” or “thing.”  
4. **Clarity**:  
   - Do **not** include modeling details or meta-comments.  
5. **Focus**:  
   - Only describe what's clearly visible—do not infer beyond the image.  

Describe the image below:
""".strip()

def generate_caption(image_path: str) -> str:
    try:
        img = Image.open(image_path).convert("RGB")
        inputs = processor(images=img, text=PROMPT, return_tensors="pt").to(device)

        outputs = model.generate(
            **inputs,
            max_new_tokens=150,
            num_beams=5,
            length_penalty=1.2,
            no_repeat_ngram_size=2,
            early_stopping=True
        )
        caption = processor.batch_decode(outputs, skip_special_tokens=True)[0].strip()
        torch.cuda.empty_cache()
        return caption or "Unavailable"
    except Exception as e:
        # Print full traceback to your FastAPI console
        print(f"❌ Error generating caption for {image_path}:\n{traceback.format_exc()}")
        return "Unavailable"
