from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Trip, User
from ..schemas.trip import TripCreate, TripResponse, TripUpdate
from ..security import get_current_user

router = APIRouter(prefix="/trips", tags=["trips"])


@router.get("", response_model=list[TripResponse])
def list_trips(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Trip).filter(Trip.user_id == user.id).order_by(Trip.id.desc()).all()


@router.post("", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = Trip(user_id=user.id, **payload.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


def get_owned_trip(trip_id: int, user_id: int, db: Session) -> Trip:
    trip = db.query(Trip).filter(Trip.id == trip_id, Trip.user_id == user_id).first()
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_owned_trip(trip_id, user.id, db)


@router.patch("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: int, payload: TripUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = get_owned_trip(trip_id, user.id, db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(trip, key, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_trip(trip_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    trip = get_owned_trip(trip_id, user.id, db)
    db.delete(trip)
    db.commit()
