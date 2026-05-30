# Trinn.IA — Chatbot

Chatbot com IA usando Groq (LLaMA 3), tema dark, memória de conversa, upload de PDF e voz.

## Rodar localmente

### Backend
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
Abra `backend/main.py` e cole sua chave Groq em `GROQ_API_KEY`.

### Frontend
```
cd frontend
npm install
npm run dev
```
Acesse: http://localhost:5173

## Deploy Railway

1. Suba no GitHub
2. Crie projeto no Railway com o repo
3. Backend: Root Directory = `backend`, Start Command = `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Adicione variável `GROQ_API_KEY` nas Settings
