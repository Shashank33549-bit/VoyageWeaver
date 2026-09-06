from pydantic import BaseModel, Field

class ItineraryRequest(BaseModel):
    origin: str | None = None
    destination: str = Field(min_length=1)
    start_date: str | None = None
    end_date: str | None = None
    travelers: int = Field(default=1, ge=1, le=20)
    budget: float | None = Field(default=None, ge=0)
    currency: str = "USD"
    travel_style: str | None = None
    interests: list[str] = Field(default_factory=list)
    preferences: str | None = None
    trip_id: int | None = None

class ItineraryResponse(BaseModel):
    provider: str
    model: str
    itinerary: dict
