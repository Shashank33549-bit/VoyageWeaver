import json
from typing import Any
import httpx
from fastapi import HTTPException
from ..core.config import settings

SYSTEM_PROMPT = """You are Voyage Weaver, an expert travel itinerary planner. Return ONLY valid JSON with this schema: {
  \"trip_overview\": string,
  \"estimated_total_cost\": number|null,
  \"currency\": string,
  \"budget_breakdown\": {\"accommodation\": number, \"transport\": number, \"food\": number, \"activities\": number, \"other\": number},
  \"days\": [{\"day\": number, \"title\": string, \"summary\": string, \"activities\": [{\"time\": string, \"activity\": string, \"location\": string, \"estimated_cost\": number|null, \"notes\": string}]}],
  \"travel_tips\": [string]
}. Use realistic but clearly estimated costs. Do not claim live availability, bookings, visa approval, or guaranteed prices."""

def _parse_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        text = text.rsplit("```", 1)[0].strip()
    try:
        data = json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"AI returned invalid JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise ValueError("AI response was not a JSON object")
    return data

def _prompt(payload: dict[str, Any]) -> str:
    return "Create a personalized itinerary from this trip request:\n" + json.dumps(payload, ensure_ascii=False)

async def _groq(payload: dict[str, Any]) -> tuple[dict, str]:
    if not settings.groq_api_key:
        raise RuntimeError("Groq key not configured")
    body = {"model": settings.groq_model, "messages": [{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":_prompt(payload)}], "temperature":0.4, "response_format":{"type":"json_object"}}
    async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
        r = await client.post("https://api.groq.com/openai/v1/chat/completions", headers={"Authorization":f"Bearer {settings.groq_api_key}"}, json=body)
        r.raise_for_status()
        data = r.json()
    return _parse_json(data["choices"][0]["message"]["content"]), settings.groq_model

async def _openai(payload: dict[str, Any]) -> tuple[dict, str]:
    if not settings.openai_api_key:
        raise RuntimeError("OpenAI key not configured")
    body = {"model": settings.openai_model, "messages": [{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":_prompt(payload)}], "temperature":0.4, "response_format":{"type":"json_object"}}
    async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
        r = await client.post("https://api.openai.com/v1/chat/completions", headers={"Authorization":f"Bearer {settings.openai_api_key}"}, json=body)
        r.raise_for_status()
        data = r.json()
    return _parse_json(data["choices"][0]["message"]["content"]), settings.openai_model

async def _ollama(payload: dict[str, Any]) -> tuple[dict, str]:
    body = {"model": settings.ollama_model, "messages": [{"role":"system","content":SYSTEM_PROMPT},{"role":"user","content":_prompt(payload)}], "stream":False, "format":"json"}
    async with httpx.AsyncClient(timeout=settings.ai_timeout_seconds) as client:
        r = await client.post(f"{settings.ollama_base_url.rstrip('/')}/api/chat", json=body)
        r.raise_for_status()
        data = r.json()
    return _parse_json(data["message"]["content"]), settings.ollama_model

async def generate_itinerary(payload: dict[str, Any]) -> tuple[str, str, dict]:
    errors = []
    # Cloud-first: Groq, then OpenAI. Local/self-hosted Ollama is final optional fallback.
    for name, fn in (("groq", _groq), ("openai", _openai), ("ollama", _ollama)):
        try:
            itinerary, model = await fn(payload)
            return name, model, itinerary
        except Exception as exc:
            errors.append(f"{name}: {str(exc)[:180]}")
    raise HTTPException(status_code=503, detail={"message":"No AI provider is currently available", "providers": errors})
