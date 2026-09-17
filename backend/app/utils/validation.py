"""
Input Validation and Sanity Checks for Agricultural and Weather Features
"""
from typing import Dict, Any, List, Tuple


def validate_soil_parameters(n: float, p: float, k: float, ph: float) -> Tuple[bool, List[str]]:
    """Validates soil N-P-K and pH against realistic agricultural boundaries."""
    errors = []
    if n < 0 or n > 300:
        errors.append(f"Nitrogen value ({n}) is out of realistic agricultural range (0 - 300 kg/ha).")
    if p < 0 or p > 200:
        errors.append(f"Phosphorus value ({p}) is out of realistic agricultural range (0 - 200 kg/ha).")
    if k < 0 or k > 350:
        errors.append(f"Potassium value ({k}) is out of realistic agricultural range (0 - 350 kg/ha).")
    if ph < 3.0 or ph > 11.0:
        errors.append(f"Soil pH ({ph}) is outside arable agricultural limits (3.0 - 11.0).")
    
    return len(errors) == 0, errors


def validate_weather_parameters(temp: float, humidity: float, rainfall: float) -> Tuple[bool, List[str]]:
    """Validates meteorological inputs."""
    errors = []
    if temp < -15 or temp > 55:
        errors.append(f"Temperature ({temp}°C) is outside realistic terrestrial growing conditions (-15°C to 55°C).")
    if humidity < 0 or humidity > 100:
        errors.append(f"Relative humidity ({humidity}%) must be between 0% and 100%.")
    if rainfall < 0 or rainfall > 6000:
        errors.append(f"Rainfall ({rainfall} mm) must be non-negative and realistic (<= 6000 mm).")
    
    return len(errors) == 0, errors


def validate_crop_yield_inputs(area: float, crop: str, season: str) -> Tuple[bool, List[str]]:
    """Validates crop yield prediction inputs."""
    errors = []
    if area <= 0:
        errors.append("Cultivated area must be strictly positive (greater than 0 hectares).")
    if not crop or len(crop.strip()) == 0:
        errors.append("Crop name must be provided.")
    if not season or len(season.strip()) == 0:
        errors.append("Cropping season must be provided.")
    
    return len(errors) == 0, errors
