# MusicMan

MusicMan is a musician assistant web app with:
- Guitar tuner (microphone pitch detection)
- Guitar and piano chord libraries
- Song structure builder with guidance
- Audio and text idea capture
- Circle of 5ths explainer
- Interactive piano chord builder
- Free/local AI coach endpoint

## Stack
- Frontend: React + TypeScript + Vite
- Backend: FastAPI + SQLModel + SQLite

## Run locally
1. Frontend:
   - `cd frontend`
   - `npm install`
   - `npm run dev`
2. Backend:
   - `cd backend`
   - `python -m venv .venv`
   - `.venv\\Scripts\\activate`
   - `pip install -r requirements.txt`
   - `uvicorn app.main:app --reload`
