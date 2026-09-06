from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, Trip
from ..security import get_current_user
from ..schemas.ai import ItineraryRequest, ItineraryResponse
from ..services.ai_service import generate_itinerary

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/itinerary", response_model=ItineraryResponse)
async def create_itinerary(payload: ItineraryRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if payload.trip_id is not None:
        trip = db.query(Trip).filter(Trip.id == payload.trip_id, Trip.user_id == user.id).first()
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found")
    provider, model, itinerary = await generate_itinerary(payload.model_dump(exclude_none=True))
    return {"provider": provider, "model": model, "itinerary": itinerary}
