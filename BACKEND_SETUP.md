# Voyage Weaver — Full local setup

This version connects the existing frontend to a FastAPI + SQLite backend for:

- Account registration and sign-in
- JWT session authentication
- Persistent sessions in the browser
- Creating and saving trips from the AI Trip Planner
- Loading only the signed-in user's trips in My Trips
- Opening saved trips by ID
- Backend ownership protection for trips

## 1. Start the backend

Open Command Prompt in the project folder:

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Keep this terminal running.

Check:

- Health: http://127.0.0.1:8000/api/health
- API docs: http://127.0.0.1:8000/docs

## 2. Start the frontend

Open a second terminal in the project root:

```cmd
npm install
npm run dev
```

Open the local URL printed by Vite, normally:

http://localhost:5173

## 3. Test the complete flow

1. Click **Sign in** in the navbar.
2. Switch to **Create account** and register.
3. Go to **Plan Trip**.
4. Complete the planner steps.
5. Click **Generate my journey**.
6. The trip is saved to SQLite through the FastAPI backend.
7. Open **My Trips** and confirm it appears.
8. Refresh the page and confirm the trip persists.
9. Sign out and verify the trip list is protected.

## Important

For local testing, the backend uses `backend/voyage.db` (created automatically). Before deploying, change `SECRET_KEY` and use a production database such as PostgreSQL.
