from fastapi import APIRouter

from app.schemas import CoachRequest, CoachResponse
from app.services.ai_coach import generate_free_local_coach_response

router = APIRouter()


@router.post("/coach", response_model=CoachResponse)
def coach(request: CoachRequest):
    return CoachResponse(response=generate_free_local_coach_response(request.prompt))
