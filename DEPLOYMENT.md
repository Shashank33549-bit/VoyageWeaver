# Voyage Weaver Deployment Guide

## Repository
Commit this project without `.env`, `backend/.env`, databases, or API keys. The `.gitignore` is configured for that.

## Groq API key
Create `backend/.env` from `backend/.env.example` and set:

```env
GROQ_API_KEY=your_actual_groq_key
```

Never put `GROQ_API_KEY` in a frontend `.env` variable beginning with `VITE_` and never commit it to GitHub.

## Local run

Backend:

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
npm install
copy .env.example .env
npm run dev
```

## Production environment variables

### Backend
- `DATABASE_URL` — production PostgreSQL URL recommended.
- `JWT_SECRET` — long random secret.
- `CORS_ORIGINS` — comma-separated deployed frontend URLs.
- `GROQ_API_KEY` — set only on backend host.
- Optional: `OPENAI_API_KEY`, Ollama settings.

### Frontend
Set at build time:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN/api
```

## Deployment architecture
Deploy the React/Vite frontend and FastAPI backend separately.

1. Deploy backend with Docker or a Python host.
2. Configure backend secrets in the host dashboard.
3. Use PostgreSQL in production instead of local SQLite.
4. Deploy frontend with `VITE_API_URL` pointing to the backend.
5. Update `CORS_ORIGINS` with the frontend domain.
6. Test login, trip creation, AI generation, and refresh persistence.
