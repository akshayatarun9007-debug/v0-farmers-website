import os
import math
import httpx
from typing import Dict, Any, List, Optional

from backend.app.models.schemas import RouteResponse, RouteWaypoint

OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")


def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points on the Earth surface."""
    R = 6371.0  # Earth radius in kilometers
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


async def calculate_farm_to_market_route(
    origin_lat: float,
    origin_lon: float,
    dest_lat: float,
    dest_lon: float,
    origin_name: Optional[str] = "Origin Farm",
    destination_name: Optional[str] = "Destination Market",
    crop_type: Optional[str] = None,
    quantity_quintals: Optional[float] = None,
) -> RouteResponse:
    # Query OSRM routing service
    # Format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson&steps=true
    url = f"{OSRM_BASE_URL}/route/v1/driving/{origin_lon},{origin_lat};{dest_lon},{dest_lat}?overview=full&geometries=geojson&steps=true"

    distance_km = 0.0
    duration_minutes = 0.0
    waypoints: List[RouteWaypoint] = []
    coordinates: List[List[float]] = []
    routing_engine = "OpenStreetMap OSRM Routing Engine"

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            resp = await client.get(url, headers={"User-Agent": "FarmFlow-Agriculture/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    route = data["routes"][0]
                    distance_km = round(route["distance"] / 1000.0, 2)
                    duration_minutes = round(route["duration"] / 60.0, 1)

                    # Extract GeoJSON coordinates [[lon, lat], ...]
                    geom = route.get("geometry", {})
                    coordinates = geom.get("coordinates", [])

                    # Extract step-by-step navigation maneuvers
                    legs = route.get("legs", [])
                    if legs:
                        for step in legs[0].get("steps", [])[:8]:
                            maneuver = step.get("maneuver", {})
                            instr = step.get("name", "")
                            m_type = maneuver.get("type", "turn")
                            modifier = maneuver.get("modifier", "")
                            instr_text = f"{m_type.capitalize()} {modifier} onto {instr}" if instr else f"{m_type.capitalize()} {modifier}"
                            waypoints.append(
                                RouteWaypoint(
                                    instruction=instr_text.strip(),
                                    distance_meters=round(step.get("distance", 0.0), 1),
                                    duration_seconds=round(step.get("duration", 0.0), 1),
                                )
                            )
            else:
                raise Exception(f"OSRM returned status {resp.status_code}")
    except Exception as e:
        print(f"[!] OSRM live query fallback: {e}. Calculating geographical road network estimate.")
        # Fallback to geodesic Haversine distance with standard Indian rural road tortuosity factor (1.30x)
        straight_km = haversine_distance_km(origin_lat, origin_lon, dest_lat, dest_lon)
        distance_km = round(straight_km * 1.30, 2)
        # Average rural Indian agricultural transport speed: 38 km/h
        duration_minutes = round((distance_km / 38.0) * 60.0, 1)
        coordinates = [[origin_lon, origin_lat], [dest_lon, dest_lat]]
        waypoints = [
            RouteWaypoint(instruction=f"Depart from {origin_name}", distance_meters=0.0, duration_seconds=0.0),
            RouteWaypoint(instruction="Follow state highway towards APMC Mandi", distance_meters=round(distance_km * 1000, 0), duration_seconds=round(duration_minutes * 60, 0)),
            RouteWaypoint(instruction=f"Arrive at {destination_name}", distance_meters=0.0, duration_seconds=0.0),
        ]
        routing_engine = "Geodesic Highway Road Network (Offline Fallback)"

    # Format duration string
    hours = int(duration_minutes // 60)
    mins = int(duration_minutes % 60)
    duration_formatted = f"{hours}h {mins}m" if hours > 0 else f"{mins} min"

    # Agricultural transport economics:
    # Typical Indian light agricultural transport (e.g. Tata 407, Bolero Pik-Up) consumes ~8.5 km/litre
    fuel_litres = round(distance_km / 8.5, 1)
    # Average Indian commercial diesel price: ~₹92 / litre + ₹150 base handling
    transport_cost_inr = round((fuel_litres * 92.0) + (distance_km * 4.0), 0)

    return RouteResponse(
        success=True,
        origin_name=origin_name,
        destination_name=destination_name,
        distance_km=distance_km,
        duration_minutes=duration_minutes,
        duration_formatted=duration_formatted,
        estimated_fuel_litres=fuel_litres,
        estimated_transport_cost_inr=transport_cost_inr,
        waypoints=waypoints,
        coordinates=coordinates,
        routing_engine=routing_engine,
    )
