# Voyage Weaver AI Setup

The AI call is made from the FastAPI backend only. Never put provider API keys in `VITE_*` variables or frontend code.

## Provider order
1. Groq cloud API
2. OpenAI cloud API
3. Optional Ollama local/self-hosted fallback

Set at least one cloud key in `backend/.env` for deployed users. Ollama is optional and is mainly useful for local development or when you operate your own inference server.

## Start backend
```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```
Edit `.env`, then:
```cmd
uvicorn app.main:app --reload --port 8000
```

## API
`POST /api/ai/itinerary` requires a Bearer token.

The frontend helper is `src/services/api.ts` as `aiApi.generateItinerary(token, data)`.
