from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from groq import AsyncGroq 
import json
import PyPDF2
import io
import uuid

import os
from pathlib import Path
from dotenv import load_dotenv

# Configuração do caminho do arquivo .env local
base_dir = Path(__file__).resolve().parent
env_path = base_dir / ".env"
load_dotenv(dotenv_path=env_path)

print("--- DEBUG DE AMBIENTE ---")
print(f"Buscando .env em: {env_path}")
print(f"O arquivo .env existe lá? {env_path.exists()}")
print(f"Chave carregada: {os.getenv('GROQ_API_KEY')}")
print("-------------------------")

app = FastAPI(title="Trinn.IA API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

conversations: dict = {}
pdf_contexts: dict = {}

# Puxa do .env local OU das variáveis de ambiente da nuvem (Render)
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key)

SYSTEM_PROMPT = """Você é um assistente de IA altamente capaz. Seja prestativo, conciso e amigável.
Quando o usuário enviar um PDF, você terá acesso ao conteúdo e poderá responder perguntas sobre ele.
Sempre responda no mesmo idioma que o usuário escrever."""

class ChatRequest(BaseModel):
    session_id: str
    message: str
    pdf_context: Optional[str] = None

class NewSessionResponse(BaseModel):
    session_id: str

@app.get("/")
def root():
    return {"status": "Trinn.IA API running"}

@app.post("/session/new", response_model=NewSessionResponse)
def new_session():
    session_id = str(uuid.uuid4())
    conversations[session_id] = []
    return {"session_id": session_id}

@app.get("/session/{session_id}/history")
def get_history(session_id: str):
    if session_id not in conversations:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"messages": conversations[session_id]}

@app.delete("/session/{session_id}/clear")
def clear_history(session_id: str):
    conversations[session_id] = []
    pdf_contexts.pop(session_id, None)
    return {"status": "cleared"}

@app.post("/upload/pdf")
async def upload_pdf(session_id: str, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Apenas arquivos PDF são suportados")

    contents = await file.read()
    reader = PyPDF2.PdfReader(io.BytesIO(contents))

    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"

    text = text[:12000]
    pdf_contexts[session_id] = {
        "filename": file.filename,
        "content": text,
        "pages": len(reader.pages)
    }

    return {
        "status": "uploaded",
        "filename": file.filename,
        "pages": len(reader.pages),
        "chars_extracted": len(text)
    }

@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    if request.session_id not in conversations:
        conversations[request.session_id] = []

    history = conversations[request.session_id]

    system = SYSTEM_PROMPT
    if request.session_id in pdf_contexts:
        ctx = pdf_contexts[request.session_id]
        system += f"\n\n--- PDF: {ctx['filename']} ({ctx['pages']} páginas) ---\n{ctx['content']}\n--- FIM PDF ---"

    # Monta o payload de mensagens temporário (incluindo a mensagem atual)
    messages = [{"role": "system", "content": system}] + \
               [{"role": m["role"], "content": m["content"]} for m in history] + \
               [{"role": "user", "content": request.message}]

    async def generate():
        full_response = ""
        try:
            # 3. USAR AWAIT NA CRIAÇÃO DO STREAM ASSÍNCRONO
            stream = await client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                stream=True,
                max_tokens=2048,
                temperature=0.7,
            )
            
            # 4. USAR "ASYNC FOR" PARA INTERAR NOS CHUNKS ASSÍNCRONOS
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    full_response += delta
                    yield f"data: {json.dumps({'token': delta})}\n\n"

            # Se tudo deu certo, salva a conversa no histórico global
            history.append({"role": "user", "content": request.message})
            history.append({"role": "assistant", "content": full_response})
            yield f"data: {json.dumps({'done': True})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")

@app.post("/tts")
async def text_to_speech(data: dict):
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Nenhum texto fornecido")
    return {"text": text}