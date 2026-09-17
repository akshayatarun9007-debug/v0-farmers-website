from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from backend.app.models.schemas import RouteResponse

router = APIRouter()

@router.get("/routes", response_model=RouteResponse)
async def calculate_route(
    origin_lat: float = Query(..., ge=-90, le=90),
    origin_lon: float = Query(..., ge=-180, le=180),
    dest_lat: float = Query(..., ge=-90, le=90),
    dest_lon: float = Query(..., ge=-180, le=180),
    origin_name: Optional[str] = Query("Origin Farm"),
    destination_name: Optional[str] = Query("Destination Market"),
    crop_type: Optional[str] = Query(None),
    quantity_quintals: Optional[float] = Query(None, ge=0),
):
    from backend.app.services.route_service import calculate_farm_to_market_route
    return await calculate_farm_to_market_route(
        origin_lat=origin_lat,
        origin_lon=origin_lon,
        dest_lat=dest_lat,
        dest_lon=dest_lon,
        origin_name=origin_name,
        destination_name=destination_name,
        crop_type=crop_type,
        quantity_quintals=quantity_quintals,
    )
