# MusicMan Architecture

## Frontend
- Single-page React app with route-per-feature.
- Browser APIs for mic input and recording.
- Music theory tools rendered client-side for low latency.

## Backend
- FastAPI REST endpoints for structured data and guidance services.
- SQLite for idea persistence.
- Rule-based AI coach service (free/local baseline).

## AI Coach
- Primary: Google Gemini 2.0 Flash (free tier, 1 500 req/day) via `google-generativeai`.
- Music-focused system prompt with multi-turn conversation history.
- Automatic fallback to built-in rule-based coach when no API key is set or the service is unavailable.
- API key configured via `GEMINI_API_KEY` in `backend/.env`.

## Future AI upgrades
- Optional Ollama integration for fully-local LLM songwriting coach.
- Optional local Whisper service for audio transcription.
