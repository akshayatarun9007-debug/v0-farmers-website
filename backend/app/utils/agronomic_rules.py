"""
ICAR & Government of India Agronomic Knowledge Base
Authoritative agronomic suitability parameters for major Indian crops.
Used to validate and cross-check machine learning predictions.
"""

from typing import Dict, Any, List, Optional

INDIAN_CROPS_AGRONOMY: Dict[str, Dict[str, Any]] = {
    "rice": {
        "name": "Rice (Paddy)",
        "seasons": ["Kharif", "Autumn", "Summer"],
        "temp_min": 20.0,
        "temp_max": 38.0,
        "rainfall_min": 1000.0,
        "rainfall_max": 3000.0,
        "ph_min": 5.0,
        "ph_max": 7.5,
        "soils": ["Clayey", "Clayey Loam", "Alluvial", "Deltaic"],
        "major_states": ["West Bengal", "Uttar Pradesh", "Punjab", "Andhra Pradesh", "Tamil Nadu", "Odisha", "Bihar", "Chhattisgarh"],
        "water_requirement": "High (Standing water during tillering)",
        "notes": "Requires high humidity, abundant sunshine, and assured irrigation or high monsoon rainfall.",
    },
    "wheat": {
        "name": "Wheat",
        "seasons": ["Rabi", "Winter"],
        "temp_min": 10.0,
        "temp_max": 25.0,
        "rainfall_min": 50.0,
        "rainfall_max": 100.0,
        "ph_min": 6.0,
        "ph_max": 7.5,
        "soils": ["Alluvial", "Well-drained Loam", "Clay Loam"],
        "major_states": ["Uttar Pradesh", "Punjab", "Haryana", "Madhya Pradesh", "Rajasthan", "Bihar", "Gujarat"],
        "water_requirement": "Moderate (4-6 critical irrigations)",
        "notes": "Cool winter growing season followed by bright warm sunshine during ripening.",
    },
    "maize": {
        "name": "Maize (Corn)",
        "seasons": ["Kharif", "Rabi", "Summer"],
        "temp_min": 18.0,
        "temp_max": 35.0,
        "rainfall_min": 500.0,
        "rainfall_max": 1000.0,
        "ph_min": 5.5,
        "ph_max": 7.5,
        "soils": ["Well-drained Alluvial", "Red Loam", "Deep Black"],
        "major_states": ["Karnataka", "Madhya Pradesh", "Maharashtra", "Tamil Nadu", "Rajasthan", "Telangana", "Bihar"],
        "water_requirement": "Moderate (Cannot tolerate waterlogging)",
        "notes": "Highly sensitive to water stagnation, requires good field drainage.",
    },
    "chickpea": {
        "name": "Chickpea (Gram)",
        "seasons": ["Rabi", "Winter"],
        "temp_min": 10.0,
        "temp_max": 28.0,
        "rainfall_min": 60.0,
        "rainfall_max": 90.0,
        "ph_min": 6.0,
        "ph_max": 8.0,
        "soils": ["Heavy Black", "Clay Loam", "Light Alluvial"],
        "major_states": ["Madhya Pradesh", "Maharashtra", "Rajasthan", "Uttar Pradesh", "Karnataka"],
        "water_requirement": "Low (Drought tolerant)",
        "notes": "Fixes atmospheric nitrogen. Frost during flowering causes flower abortion.",
    },
    "kidneybeans": {
        "name": "Kidney Beans (Rajma)",
        "seasons": ["Kharif", "Rabi"],
        "temp_min": 15.0,
        "temp_max": 25.0,
        "rainfall_min": 60.0,
        "rainfall_max": 150.0,
        "ph_min": 5.5,
        "ph_max": 6.8,
        "soils": ["Rich Loam", "Well-drained Silt Loam"],
        "major_states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Maharashtra"],
        "water_requirement": "Moderate",
        "notes": "Sensitive to waterlogging and severe heat waves.",
    },
    "pigeonpeas": {
        "name": "Pigeonpeas (Arhar / Tur)",
        "seasons": ["Kharif", "Whole Year"],
        "temp_min": 18.0,
        "temp_max": 38.0,
        "rainfall_min": 600.0,
        "rainfall_max": 1000.0,
        "ph_min": 5.5,
        "ph_max": 7.5,
        "soils": ["Deep Black", "Alluvial", "Red Loam"],
        "major_states": ["Maharashtra", "Madhya Pradesh", "Karnataka", "Uttar Pradesh", "Gujarat"],
        "water_requirement": "Low-to-moderate (Deep taproot system)",
        "notes": "Excellent pulse for rainfed dryland farming and crop rotation.",
    },
    "mothbeans": {
        "name": "Moth Beans",
        "seasons": ["Kharif"],
        "temp_min": 24.0,
        "temp_max": 40.0,
        "rainfall_min": 200.0,
        "rainfall_max": 500.0,
        "ph_min": 5.5,
        "ph_max": 8.5,
        "soils": ["Sandy Loam", "Arid Sandy", "Light Soil"],
        "major_states": ["Rajasthan", "Gujarat", "Haryana"],
        "water_requirement": "Very Low (Extremely drought-hardy)",
        "notes": "Key arid legume suited for low rainfall regions of Thar desert.",
    },
    "mungbean": {
        "name": "Mung Bean (Green Gram)",
        "seasons": ["Kharif", "Summer", "Zaid"],
        "temp_min": 25.0,
        "temp_max": 35.0,
        "rainfall_min": 600.0,
        "rainfall_max": 900.0,
        "ph_min": 6.2,
        "ph_max": 7.2,
        "soils": ["Well-drained Loamy Soil", "Alluvial"],
        "major_states": ["Rajasthan", "Madhya Pradesh", "Maharashtra", "Karnataka", "Bihar"],
        "water_requirement": "Low to Moderate",
        "notes": "Short duration (60-70 days) catch crop improving soil fertility.",
    },
    "blackgram": {
        "name": "Black Gram (Urad)",
        "seasons": ["Kharif", "Rabi", "Summer"],
        "temp_min": 25.0,
        "temp_max": 35.0,
        "rainfall_min": 600.0,
        "rainfall_max": 1000.0,
        "ph_min": 6.5,
        "ph_max": 7.8,
        "soils": ["Heavy Black Soil", "Loam"],
        "major_states": ["Madhya Pradesh", "Uttar Pradesh", "Andhra Pradesh", "Maharashtra", "Tamil Nadu"],
        "water_requirement": "Moderate",
        "notes": "Needs warm humid climate during vegetative stage.",
    },
    "lentil": {
        "name": "Lentil (Masoor)",
        "seasons": ["Rabi", "Winter"],
        "temp_min": 12.0,
        "temp_max": 25.0,
        "rainfall_min": 400.0,
        "rainfall_max": 600.0,
        "ph_min": 6.0,
        "ph_max": 7.5,
        "soils": ["Alluvial", "Clay Loam", "Black Soil"],
        "major_states": ["Madhya Pradesh", "Uttar Pradesh", "Bihar", "West Bengal", "Rajasthan"],
        "water_requirement": "Low",
        "notes": "Grown as rainfed or with minimal protective irrigation.",
    },
    "pomegranate": {
        "name": "Pomegranate",
        "seasons": ["Whole Year"],
        "temp_min": 15.0,
        "temp_max": 38.0,
        "rainfall_min": 500.0,
        "rainfall_max": 1200.0,
        "ph_min": 6.5,
        "ph_max": 8.0,
        "soils": ["Deep Loamy", "Sandy Loam", "Black Soil"],
        "major_states": ["Maharashtra", "Gujarat", "Karnataka", "Andhra Pradesh", "Rajasthan"],
        "water_requirement": "Drip irrigation ideal",
        "notes": "High commercial value fruit suited for semi-arid tropics.",
    },
    "banana": {
        "name": "Banana",
        "seasons": ["Whole Year"],
        "temp_min": 18.0,
        "temp_max": 38.0,
        "rainfall_min": 1000.0,
        "rainfall_max": 2500.0,
        "ph_min": 6.0,
        "ph_max": 7.5,
        "soils": ["Rich Alluvial", "Well-drained Volcanic/Clay Loam"],
        "major_states": ["Tamil Nadu", "Maharashtra", "Gujarat", "Andhra Pradesh", "Karnataka", "Kerala"],
        "water_requirement": "High (Constant soil moisture)",
        "notes": "High potassium feeder. Heavy consumer of water and mulch.",
    },
    "mango": {
        "name": "Mango",
        "seasons": ["Whole Year"],
        "temp_min": 20.0,
        "temp_max": 40.0,
        "rainfall_min": 750.0,
        "rainfall_max": 2500.0,
        "ph_min": 5.5,
        "ph_max": 7.5,
        "soils": ["Deep Well-drained Alluvial", "Red Sandy Loam"],
        "major_states": ["Uttar Pradesh", "Andhra Pradesh", "Bihar", "Karnataka", "Gujarat", "Maharashtra"],
        "water_requirement": "Moderate",
        "notes": "Dry spell during flowering is essential for fruit set; rains during flowering cause blossom blight.",
    },
    "grapes": {
        "name": "Grapes",
        "seasons": ["Whole Year"],
        "temp_min": 15.0,
        "temp_max": 35.0,
        "rainfall_min": 500.0,
        "rainfall_max": 900.0,
        "ph_min": 6.5,
        "ph_max": 8.0,
        "soils": ["Sandy Loam", "Gravelly Loam", "Well-drained Black"],
        "major_states": ["Maharashtra", "Karnataka", "Tamil Nadu", "Andhra Pradesh"],
        "water_requirement": "Controlled Drip",
        "notes": "High export value horticulture. Needs dry warm weather during berry ripening.",
    },
    "watermelon": {
        "name": "Watermelon",
        "seasons": ["Summer", "Zaid"],
        "temp_min": 24.0,
        "temp_max": 35.0,
        "rainfall_min": 400.0,
        "rainfall_max": 600.0,
        "ph_min": 6.0,
        "ph_max": 7.0,
        "soils": ["Sandy Riverbed", "Sandy Loam"],
        "major_states": ["Uttar Pradesh", "Karnataka", "Andhra Pradesh", "Madhya Pradesh", "Maharashtra"],
        "water_requirement": "Moderate",
        "notes": "Prefers warm sunny days with dry atmosphere for sweetness.",
    },
    "muskmelon": {
        "name": "Muskmelon",
        "seasons": ["Summer", "Zaid"],
        "temp_min": 24.0,
        "temp_max": 35.0,
        "rainfall_min": 400.0,
        "rainfall_max": 600.0,
        "ph_min": 6.0,
        "ph_max": 7.0,
        "soils": ["Sandy Riverbed", "Sandy Loam"],
        "major_states": ["Punjab", "Uttar Pradesh", "Haryana", "Rajasthan", "Madhya Pradesh"],
        "water_requirement": "Moderate",
        "notes": "Requires high sunshine and warm temperatures for sugar accumulation.",
    },
    "apple": {
        "name": "Apple",
        "seasons": ["Winter", "Whole Year"],
        "temp_min": -5.0,
        "temp_max": 24.0,
        "rainfall_min": 1000.0,
        "rainfall_max": 1250.0,
        "ph_min": 5.5,
        "ph_max": 6.5,
        "soils": ["Well-drained Loam", "Gravelly Mountain Soil"],
        "major_states": ["Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand"],
        "water_requirement": "Moderate",
        "notes": "Requires 800-1100 chilling hours (< 7°C) during winter dormancy.",
    },
    "orange": {
        "name": "Orange (Citrus)",
        "seasons": ["Whole Year"],
        "temp_min": 13.0,
        "temp_max": 35.0,
        "rainfall_min": 750.0,
        "rainfall_max": 1500.0,
        "ph_min": 6.0,
        "ph_max": 7.5,
        "soils": ["Well-drained Sandy Loam", "Deep Clay Loam"],
        "major_states": ["Maharashtra (Nagpur)", "Madhya Pradesh", "Assam", "Punjab", "Rajasthan"],
        "water_requirement": "Moderate to High",
        "notes": "Subtropical tree sensitive to water stagnation and saline soils.",
    },
    "papaya": {
        "name": "Papaya",
        "seasons": ["Whole Year"],
        "temp_min": 21.0,
        "temp_max": 35.0,
        "rainfall_min": 1000.0,
        "rainfall_max": 2000.0,
        "ph_min": 6.0,
        "ph_max": 7.0,
        "soils": ["Rich Sandy Loam", "Alluvial"],
        "major_states": ["Gujarat", "Andhra Pradesh", "Karnataka", "Madhya Pradesh", "Maharashtra", "West Bengal"],
        "water_requirement": "Moderate (Extremely sensitive to water stagnation / root rot)",
        "notes": "Fast growing fruit, fruit bearing begins in 9-10 months.",
    },
    "coconut": {
        "name": "Coconut",
        "seasons": ["Whole Year"],
        "temp_min": 22.0,
        "temp_max": 34.0,
        "rainfall_min": 1300.0,
        "rainfall_max": 2500.0,
        "ph_min": 5.2,
        "ph_max": 8.0,
        "soils": ["Coastal Sandy", "Alluvial", "Red Sandy Loam", "Laterite"],
        "major_states": ["Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Odisha", "Goa"],
        "water_requirement": "High",
        "notes": "Coastal tropical palm requiring warm humid climate with well-distributed rainfall.",
    },
    "cotton": {
        "name": "Cotton",
        "seasons": ["Kharif"],
        "temp_min": 21.0,
        "temp_max": 35.0,
        "rainfall_min": 500.0,
        "rainfall_max": 1000.0,
        "ph_min": 6.0,
        "ph_max": 8.0,
        "soils": ["Deep Black (Regur)", "Alluvial", "Red Sandy Loam"],
        "major_states": ["Gujarat", "Maharashtra", "Telangana", "Andhra Pradesh", "Rajasthan", "Haryana", "Punjab"],
        "water_requirement": "Moderate (Cannot withstand water stagnation)",
        "notes": "Requires minimum 210 frost-free days and warm sunny weather during boll opening.",
    },
    "jute": {
        "name": "Jute (Golden Fibre)",
        "seasons": ["Kharif"],
        "temp_min": 24.0,
        "temp_max": 37.0,
        "rainfall_min": 1200.0,
        "rainfall_max": 2000.0,
        "ph_min": 6.0,
        "ph_max": 7.4,
        "soils": ["New Alluvial (Khadar)", "Clay Loam"],
        "major_states": ["West Bengal", "Bihar", "Assam", "Odisha", "Meghalaya"],
        "water_requirement": "High (Needs clean running water for retting)",
        "notes": "Tropical humid fibre crop requiring high temperatures and plentiful monsoon rain.",
    },
    "coffee": {
        "name": "Coffee",
        "seasons": ["Whole Year"],
        "temp_min": 15.0,
        "temp_max": 28.0,
        "rainfall_min": 1500.0,
        "rainfall_max": 2500.0,
        "ph_min": 5.5,
        "ph_max": 6.5,
        "soils": ["Laterite", "Red Loam with Humus", "Volcanic"],
        "major_states": ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh"],
        "water_requirement": "High (Blossom showers crucial in March/April)",
        "notes": "Shade-loving plantation crop grown at altitudes of 600m-1600m.",
    },
}


def evaluate_agronomic_safety(
    crop_name: str,
    temperature: Optional[float],
    humidity: Optional[float],
    rainfall: Optional[float],
    ph: Optional[float],
    season: Optional[str],
    state: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Cross-checks ML crop predictions against ICAR agronomic thresholds.
    Returns:
      - season_fit: bool
      - temperature_fit: bool
      - rainfall_fit: bool
      - warnings: List[str]
      - agronomic_notes: str
    """
    key = crop_name.lower().replace(" ", "").replace("(", "").replace(")", "").replace("-", "")
    # Fallback map for common name variations
    mapping = {
        "paddy": "rice",
        "corn": "maize",
        "gram": "chickpea",
        "chana": "chickpea",
        "tur": "pigeonpeas",
        "arhar": "pigeonpeas",
        "urad": "blackgram",
        "moong": "mungbean",
        "masoor": "lentil",
        "rajma": "kidneybeans",
    }
    crop_key = mapping.get(key, key)
    agronomy = INDIAN_CROPS_AGRONOMY.get(crop_key)

    if not agronomy:
        # Default neutral check if crop not explicitly in catalog
        return {
            "season_fit": True,
            "temperature_fit": True,
            "rainfall_fit": True,
            "warnings": [],
            "agronomic_notes": f"General agronomic guidelines apply for {crop_name}.",
        }

    warnings: List[str] = []
    season_fit = True
    temp_fit = True
    rain_fit = True

    # Check season
    if season and season != "Whole Year":
        allowed_seasons = [s.lower() for s in agronomy["seasons"]]
        if "whole year" not in allowed_seasons and season.lower() not in allowed_seasons:
            season_fit = False
            warnings.append(
                f"Season Mismatch: {agronomy['name']} is traditionally grown in {', '.join(agronomy['seasons'])}, but your selected season is {season}."
            )

    # Check temperature
    if temperature is not None:
        if temperature < agronomy["temp_min"]:
            temp_fit = False
            warnings.append(
                f"Temperature Alert: {temperature}°C is below optimal minimum ({agronomy['temp_min']}°C) for {agronomy['name']}. Germination or growth may be stunted."
            )
        elif temperature > agronomy["temp_max"]:
            temp_fit = False
            warnings.append(
                f"Temperature Alert: {temperature}°C exceeds optimal maximum ({agronomy['temp_max']}°C) for {agronomy['name']}. Heat stress risk."
            )

    # Check rainfall
    if rainfall is not None:
        if rainfall < (agronomy["rainfall_min"] * 0.4):
            rain_fit = False
            warnings.append(
                f"Water Deficit Alert: Rainfall ({rainfall:.0f} mm) is significantly lower than recommended range ({agronomy['rainfall_min']}-{agronomy['rainfall_max']} mm). Supplemental irrigation is mandatory."
            )
        elif rainfall > (agronomy["rainfall_max"] * 1.6):
            rain_fit = False
            warnings.append(
                f"Excess Water Warning: Rainfall ({rainfall:.0f} mm) exceeds optimal limits. Ensure raised beds and robust drainage to prevent waterlogging."
            )

    # Check pH
    if ph is not None:
        if ph < agronomy["ph_min"]:
            warnings.append(
                f"Soil Acidity Warning: Soil pH {ph:.1f} is acidic for {agronomy['name']} (optimum: {agronomy['ph_min']}-{agronomy['ph_max']}). Consider agricultural lime application."
            )
        elif ph > agronomy["ph_max"]:
            warnings.append(
                f"Soil Alkalinity Warning: Soil pH {ph:.1f} is alkaline for {agronomy['name']} (optimum: {agronomy['ph_min']}-{agronomy['ph_max']}). Consider gypsum or organic matter amendment."
            )

    # Check state suitability
    if state:
        known_states = [s.lower() for s in agronomy.get("major_states", [])]
        if known_states and state.lower() not in known_states:
            # Informational note, not a hard warning
            pass

    return {
        "season_fit": season_fit,
        "temperature_fit": temp_fit,
        "rainfall_fit": rain_fit,
        "soil_fit": True,
        "warnings": warnings,
        "agronomic_notes": agronomy["notes"],
    }
