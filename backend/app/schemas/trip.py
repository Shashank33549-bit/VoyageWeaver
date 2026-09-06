from pydantic import BaseModel, Field


class TripBase(BaseModel):
    trip_name: str = Field(min_length=1, max_length=255)
    origin: str | None = None
    destination: str = Field(min_length=1, max_length=255)
    start_date: str | None = None
    end_date: str | None = None
    travelers: int = Field(default=1, ge=1, le=50)
    budget: int | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=12)
    travel_style: str | None = None
    notes: str | None = None


class TripCreate(TripBase):
    pass


class TripUpdate(BaseModel):
    trip_name: str | None = None
    origin: str | None = None
    destination: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    travelers: int | None = Field(default=None, ge=1, le=50)
    budget: int | None = Field(default=None, ge=0)
    currency: str | None = None
    travel_style: str | None = None
    notes: str | None = None


class TripResponse(TripBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}
