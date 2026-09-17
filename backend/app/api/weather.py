from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from backend.app.models.schemas import WeatherResponse

router = APIRouter()

@router.get("/weather", response_model=WeatherResponse)
async def get_weather(
    latitude: float = Query(..., ge=-90, le=90, description="Latitude"),
    longitude: float = Query(..., ge=-180, le=180, description="Longitude"),
    location_name: Optional[str] = Query("Farm Location", description="User location name"),
):
    from backend.app.services.weather_service import fetch_agricultural_weather
    return await fetch_agricultural_weather(latitude, longitude, location_name)
