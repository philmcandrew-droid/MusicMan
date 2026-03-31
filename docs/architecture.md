# MusicMan Architecture

## Frontend
- Single-page React app with route-per-feature.
- Browser APIs for mic input and recording.
- Music theory tools rendered client-side for low latency.

## Backend
- FastAPI REST endpoints for structured data and guidance services.
- SQLite for idea persistence.
- Rule-based AI coach service (free/local baseline).

## Future local AI upgrades
- Optional Ollama integration for local LLM songwriting coach.
- Optional local Whisper service for audio transcription.
