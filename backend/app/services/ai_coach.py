from __future__ import annotations

import json
import logging
import os
from collections.abc import AsyncGenerator
from typing import TYPE_CHECKING

import httpx

from app.services.theory_engine import get_song_section_advice

if TYPE_CHECKING:
    from app.schemas import ChatMessage

log = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are MusicMan Coach, an expert music and songwriting assistant. "
    "You help musicians with chord progressions, song structure, melody writing, "
    "harmony, rhythm, music theory, arrangement, lyrics, and production tips. "
    "Keep answers practical, encouraging, and concise (1-3 paragraphs). "
    "When appropriate, reference common patterns from pop, rock, jazz, R&B, folk, "
    "and classical traditions. If a user shares chords, a key, or a genre, "
    "tailor your advice specifically. Use plain language, but include music "
    "terminology when it clarifies. Format chord symbols like Cmaj7, Dm, G7, etc."
)

_http_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=httpx.Timeout(120.0, connect=10.0))
    return _http_client


def _build_openai_messages(
    history: list[ChatMessage], prompt: str
) -> list[dict]:
    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in history:
        role = "user" if msg.role == "user" else "assistant"
        messages.append({"role": role, "content": msg.text})
    messages.append({"role": "user", "content": prompt})
    return messages


# ---------------------------------------------------------------------------
# Provider configs
# ---------------------------------------------------------------------------

PROVIDERS: list[dict] = [
    {
        "name": "OpenRouter",
        "env_key": "OPENROUTER_API_KEY",
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "model": "meta-llama/llama-3.3-70b-instruct:free",
    },
    {
        "name": "Groq",
        "env_key": "GROQ_API_KEY",
        "url": "https://api.groq.com/openai/v1/chat/completions",
        "model": "llama-3.3-70b-versatile",
    },
]


def _get_active_provider() -> dict | None:
    for p in PROVIDERS:
        key = os.getenv(p["env_key"], "").strip()
        if key:
            return {**p, "api_key": key}
    return None


# ---------------------------------------------------------------------------
# Streaming entry point (SSE)
# ---------------------------------------------------------------------------

async def stream_coach_response(
    prompt: str, history: list[ChatMessage] | None = None
) -> AsyncGenerator[str, None]:
    """Yield SSE-formatted chunks: data: {"token": "..."} or data: {"done": true}."""
    provider = _get_active_provider()
    if provider is None:
        text = _rule_based_response(prompt)
        yield f"data: {json.dumps({'token': text})}\n\n"
        yield f"data: {json.dumps({'done': True, 'llm_active': False})}\n\n"
        return

    try:
        client = _get_client()
        messages = _build_openai_messages(history or [], prompt)
        async with client.stream(
            "POST",
            provider["url"],
            headers={"Authorization": f"Bearer {provider['api_key']}"},
            json={
                "model": provider["model"],
                "messages": messages,
                "temperature": 0.7,
                "stream": True,
            },
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:]
                if payload.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                    delta = chunk["choices"][0].get("delta", {})
                    token = delta.get("content")
                    if token:
                        yield f"data: {json.dumps({'token': token})}\n\n"
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue

        yield f"data: {json.dumps({'done': True, 'llm_active': True})}\n\n"

    except Exception:
        log.exception("Streaming %s call failed, sending rule-based fallback", provider["name"])
        text = _rule_based_response(prompt)
        yield f"data: {json.dumps({'token': text})}\n\n"
        yield f"data: {json.dumps({'done': True, 'llm_active': False})}\n\n"


# ---------------------------------------------------------------------------
# Non-streaming entry point (kept for compatibility)
# ---------------------------------------------------------------------------

async def generate_coach_response(
    prompt: str, history: list[ChatMessage] | None = None
) -> tuple[str, bool]:
    provider = _get_active_provider()
    if provider is None:
        return _rule_based_response(prompt), False

    try:
        client = _get_client()
        messages = _build_openai_messages(history or [], prompt)
        resp = await client.post(
            provider["url"],
            headers={"Authorization": f"Bearer {provider['api_key']}"},
            json={
                "model": provider["model"],
                "messages": messages,
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        text = resp.json()["choices"][0]["message"]["content"]
        return text, True
    except Exception:
        log.exception("%s call failed, falling back to rule-based coach", provider["name"])
        return _rule_based_response(prompt), False


# ---------------------------------------------------------------------------
# Rule-based fallback
# ---------------------------------------------------------------------------

def _rule_based_response(prompt: str) -> str:
    lowered = prompt.lower()
    if "pre-chorus" in lowered:
        return (
            "Try a pre-chorus that climbs in melody and reduces lyrical density. "
            "Keep chords moving every bar to build momentum into your chorus."
        )
    if "chorus" in lowered:
        return (
            "Center your chorus on a singable melodic shape and repeat a strong title phrase. "
            "Contrast with verse by lifting rhythm, register, or harmonic brightness."
        )
    if "bridge" in lowered:
        return (
            "Use your bridge for contrast: introduce a new chord center or rhythmic pattern, "
            "then return to the final chorus with greater impact."
        )
    if "verse" in lowered:
        return f"Verse focus: {get_song_section_advice('verse')}"

    return (
        "Start with a clear hook, support it with a focused verse story, and create lift before chorus. "
        "If you share key/chords, I can suggest a stronger progression."
    )
