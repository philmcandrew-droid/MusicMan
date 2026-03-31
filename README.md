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

## Android app (Capacitor)
The Android project lives in `frontend/android` and wraps the same MusicMan UI in a native app shell.

1. Prepare Android build:
   - `cd frontend`
   - `npm install`
   - `npm run mobile:sync`
2. Open Android Studio:
   - `npm run mobile:open`
3. In Android Studio:
   - Let Gradle sync complete
   - Select an emulator/device
   - Click Run to launch the app
4. Build APK:
   - Android Studio -> Build -> Build Bundle(s) / APK(s) -> Build APK(s)

Notes:
- Microphone-based features (tuner and audio recording) require runtime mic permission on device.
- After web UI changes, run `npm run mobile:sync` again before rebuilding Android.
