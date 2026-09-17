from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


# ==========================================
# 1. CROP RECOMMENDATION SCHEMAS
# ==========================================
class CropRecommendationRequest(BaseModel):
    state: Optional[str] = Field(default=None, description="Indian state name")
    district: Optional[str] = Field(default=None, description="District name")
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    season: Optional[str] = Field(default="Kharif", description="Kharif, Rabi, or Zaid/Summer")
    soil_type: Optional[str] = Field(default=None, description="e.g. Alluvial, Black, Red, Clay")
    nitrogen: float = Field(..., ge=0, le=300, description="Soil Nitrogen (N) content in kg/ha")
    phosphorus: float = Field(..., ge=0, le=200, description="Soil Phosphorus (P) content in kg/ha")
    potassium: float = Field(..., ge=0, le=300, description="Soil Potassium (K) content in kg/ha")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value (0-14)")
    temperature: Optional[float] = Field(default=None, ge=-10, le=60, description="Mean temperature in Celsius")
    humidity: Optional[float] = Field(default=None, ge=0, le=100, description="Relative humidity %")
    rainfall: Optional[float] = Field(default=None, ge=0, le=5000, description="Annual / seasonal rainfall in mm")
    irrigation: Optional[str] = Field(default="Available", description="Irrigation availability")
    farm_area: Optional[float] = Field(default=1.0, gt=0, description="Farm area in hectares")


class CropSuitabilityItem(BaseModel):
    crop: str
    suitability_score: float = Field(..., description="Model probability percentage 0-100")
    confidence: float
    reasons: List[str]
    agronomic_notes: str
    season_fit: bool
    soil_fit: bool
    temperature_fit: bool
    rainfall_fit: bool
    warnings: List[str] = []


class CropRecommendationResponse(BaseModel):
    success: bool = True
    top_crop: str
    recommendations: List[CropSuitabilityItem]
    input_summary: Dict[str, Any]
    model_version: str
    agronomic_safety_status: str


# ==========================================
# 2. CROP YIELD PREDICTION SCHEMAS
# ==========================================
class YieldPredictionRequest(BaseModel):
    state: str = Field(..., min_length=2, description="Indian state name")
    district: Optional[str] = Field(default=None, description="District name")
    crop: str = Field(..., min_length=2, description="Target crop name")
    season: str = Field(..., description="Kharif, Rabi, Summer, Autumn, Winter, Whole Year")
    cultivated_area: float = Field(..., gt=0, description="Cultivated area in hectares")
    rainfall: Optional[float] = Field(default=None, ge=0, description="Annual/seasonal rainfall in mm")
    temperature: Optional[float] = Field(default=None, ge=-10, le=60, description="Mean temperature in Celsius")
    humidity: Optional[float] = Field(default=None, ge=0, le=100)
    nitrogen: Optional[float] = Field(default=None, ge=0)
    phosphorus: Optional[float] = Field(default=None, ge=0)
    potassium: Optional[float] = Field(default=None, ge=0)
    year: Optional[int] = Field(default=2024, ge=1990, le=2030)


class YieldPredictionResponse(BaseModel):
    success: bool = True
    crop: str
    predicted_yield_per_hectare: float
    predicted_total_production: float
    unit: str = "tonnes/hectare"
    production_unit: str = "tonnes"
    confidence_interval: Optional[Dict[str, Any]] = None
    historical_benchmark: Optional[Dict[str, Any]] = None
    model_version: str
    input_summary: Dict[str, Any]


# ==========================================
# 3. CROP DISEASE SCHEMAS
# ==========================================
class DiseaseRiskRequest(BaseModel):
    crop: str = Field(..., min_length=2)
    temperature: float = Field(..., ge=-10, le=60)
    humidity: float = Field(..., ge=0, le=100)
    rainfall: float = Field(..., ge=0)
    season: Optional[str] = "Kharif"
    symptoms: List[str] = Field(default_factory=list, description="Observed leaf/plant symptoms")


class DiseaseAlternative(BaseModel):
    disease: str
    probability: float
    severity: str
    symptoms_match: List[str]


class DiseaseRiskResponse(BaseModel):
    success: bool = True
    crop: str
    risk_level: str  # Low, Moderate, High, Severe
    risk_score: float  # 0 to 100
    possible_diseases: List[DiseaseAlternative]
    reasons: List[str]
    preventative_measures: List[str]
    disclaimer: str = "Risk estimation based on agro-climatic conditions and reported symptoms. Not a confirmed laboratory diagnosis."
    recommended_action: str


class DiseasePredictionResponse(BaseModel):
    success: bool = True
    crop: str
    predicted_condition: str
    confidence: float
    is_healthy: bool
    top_predictions: List[Dict[str, Any]]
    explanation: str
    recommended_next_action: str
    disclaimer: str = "Image-based AI diagnostic indicator. Field inspection and agricultural extension officer verification recommended."
    model_version: str


# ==========================================
# 4. WEATHER SCHEMAS
# ==========================================
class WeatherHourlyItem(BaseModel):
    time: str
    temperature: float
    humidity: float
    condition: str
    rain_probability: float


class WeatherDailyItem(BaseModel):
    date: str
    day: str
    temp_max: float
    temp_min: float
    humidity: float
    condition: str
    rainfall_mm: float


class AgriculturalAdvisory(BaseModel):
    category: str  # Irrigation, Spraying, Harvesting, Pest Risk
    status: str    # Normal, Advisory, Warning
    message: str


CurrentWeather = Dict[str, Any]


class WeatherResponse(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = "Farm Coordinates"
    current: Dict[str, Any]
    daily_forecast: List[WeatherDailyItem]
    hourly_forecast: List[WeatherHourlyItem]
    agricultural_advisories: List[AgriculturalAdvisory]
    source: str = "NASA POWER Agro-Climatology & Open-Meteo"


# ==========================================
# 5. TRANSPORT ROUTE SCHEMAS
# ==========================================
class RouteRequest(BaseModel):
    origin_latitude: float = Field(..., ge=-90, le=90)
    origin_longitude: float = Field(..., ge=-180, le=180)
    destination_latitude: float = Field(..., ge=-90, le=90)
    destination_longitude: float = Field(..., ge=-180, le=180)
    origin_name: Optional[str] = "Farm"
    destination_name: Optional[str] = "Target Mandi"
    crop_type: Optional[str] = None
    quantity_quintals: Optional[float] = None


class RouteWaypoint(BaseModel):
    instruction: str
    distance_meters: float
    duration_seconds: float


class RouteResponse(BaseModel):
    success: bool = True
    origin_name: str
    destination_name: str
    distance_km: float
    duration_minutes: float
    duration_formatted: str
    estimated_fuel_litres: float
    estimated_transport_cost_inr: float
    waypoints: List[RouteWaypoint] = []
    coordinates: List[List[float]] = []  # [[lon, lat], ...]
    routing_engine: str = "OpenStreetMap OSRM"


# ==========================================
# 6. GOVERNMENT SCHEME SCHEMAS
# ==========================================
class SchemeResponse(BaseModel):
    id: int
    name: str
    description: str
    eligibility: str
    benefits: str
    level: str
    category: str
    official_source: str
    application_url: Optional[str]
    last_verified: str


# ==========================================
# 7. PREDICTION HISTORY SCHEMAS
# ==========================================
class PredictionHistoryItem(BaseModel):
    id: int
    prediction_type: str
    created_at: str
    model_version: Optional[str]
    summary: str
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]


class PredictionHistoryResponse(BaseModel):
    total: int
    predictions: List[PredictionHistoryItem]


# ==========================================
# 8. MODEL INFO SCHEMAS
# ==========================================
class ModelCardInfo(BaseModel):
    model_name: str
    algorithm: str
    version: str
    trained_on: str
    dataset: str
    metrics: Dict[str, Any]
    features: Optional[List[str]] = None
    feature_names: Optional[List[str]] = None
    preprocessing: Optional[str] = "StandardScaler / Category Encoding"
    limitations: Optional[str] = None


class ModelInfoResponse(BaseModel):
    crop_recommendation: ModelCardInfo
    yield_prediction: ModelCardInfo
    disease_detection: ModelCardInfo
