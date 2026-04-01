from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.schemas import CoachRequest, CoachResponse
from app.services.ai_coach import generate_coach_response, stream_coach_response

router = APIRouter()


@router.post("/coach", response_model=CoachResponse)
async def coach(request: CoachRequest):
    text, llm_active = await generate_coach_response(request.prompt, request.history)
    return CoachResponse(response=text, llm_active=llm_active)


@router.post("/coach/stream")
async def coach_stream(request: CoachRequest):
    return StreamingResponse(
        stream_coach_response(request.prompt, request.history),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
