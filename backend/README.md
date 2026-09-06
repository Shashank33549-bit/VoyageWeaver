# Voyage Weaver Backend

FastAPI backend with JWT authentication and persistent trip CRUD.

## Run locally

```bash
cd backend
python -m venv .venv
.venv\\Scripts\\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open API docs at `http://127.0.0.1:8000/docs`.

The default database is SQLite (`voyage.db`) for easy local testing. For production, set `DATABASE_URL` to PostgreSQL.
