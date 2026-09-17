/**
 * FarmFlow API Client
 * Connects Next.js Frontend to Python FastAPI Backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface CropRecommendationPayload {
  state?: string;
  district?: string;
  season?: string;
  soil_type?: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
  irrigation?: string;
  farm_area?: number;
}

export interface CropSuitabilityItem {
  crop: string;
  suitability_score: number;
  confidence: number;
  reasons: string[];
  agronomic_notes: string;
  season_fit: boolean;
  soil_fit: boolean;
  temperature_fit: boolean;
  rainfall_fit: boolean;
  warnings: string[];
}

export interface CropRecommendationResponse {
  success: boolean;
  top_crop: string;
  recommendations: CropSuitabilityItem[];
  input_summary: Record<string, any>;
  model_version: string;
  agronomic_safety_status: string;
}

export interface YieldPredictionPayload {
  state: string;
  district?: string;
  crop: string;
  season: string;
  cultivated_area: number;
  rainfall?: number;
  temperature?: number;
  year?: number;
}

export interface YieldPredictionResponse {
  success: boolean;
  crop: string;
  predicted_yield_per_hectare: number;
  predicted_total_production: number;
  unit: string;
  production_unit: string;
  confidence_interval?: {
    confidence_level: number;
    lower_bound: number;
    upper_bound: number;
    unit: string;
  };
  historical_benchmark?: {
    historical_mean_yield: number;
    historical_min_yield: number;
    historical_max_yield: number;
    difference_from_mean_percent: number;
    sample_count: number;
  };
  model_version: string;
  input_summary: Record<string, any>;
}

export interface DiseaseRiskPayload {
  crop: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  season?: string;
  symptoms: string[];
}

export interface DiseaseAlternative {
  disease: string;
  probability: number;
  severity: string;
  symptoms_match: string[];
}

export interface DiseaseRiskResponse {
  success: boolean;
  crop: string;
  risk_level: string;
  risk_score: number;
  possible_diseases: DiseaseAlternative[];
  reasons: string[];
  preventative_measures: string[];
  recommended_action: string;
  disclaimer: string;
}

export interface DiseasePredictionResponse {
  success: boolean;
  crop: string;
  predicted_condition: string;
  confidence: number;
  is_healthy: boolean;
  top_predictions: Array<{
    class_name: string;
    crop: string;
    condition: string;
    probability: number;
  }>;
  explanation: string;
  recommended_next_action: string;
  disclaimer: string;
  model_version: string;
}

export interface WeatherData {
  latitude: float;
  longitude: float;
  location_name: string;
  current: {
    temperature: number;
    apparent_temperature: number;
    humidity: number;
    wind_speed_kmh: number;
    pressure_hpa: number;
    condition: string;
    precipitation_mm: number;
  };
  daily_forecast: Array<{
    date: string;
    day: string;
    temp_max: number;
    temp_min: number;
    humidity: number;
    condition: string;
    rainfall_mm: number;
  }>;
  hourly_forecast: Array<{
    time: string;
    temperature: number;
    humidity: number;
    condition: string;
    rain_probability: number;
  }>;
  agricultural_advisories: Array<{
    category: string;
    status: string;
    message: string;
  }>;
  source: string;
}

export interface GovernmentScheme {
  id: number;
  name: string;
  description: string;
  eligibility: string;
  benefits: string;
  level: string;
  category: string;
  official_source: string;
  application_url?: string;
  last_verified: string;
}

export interface RouteResponse {
  success: boolean;
  origin_name: string;
  destination_name: string;
  distance_km: number;
  duration_minutes: number;
  duration_formatted: string;
  estimated_fuel_litres: number;
  estimated_transport_cost_inr: number;
  waypoints: Array<{
    instruction: string;
    distance_meters: number;
    duration_seconds: number;
  }>;
  coordinates: number[][];
  routing_engine: string;
}

export interface PredictionHistoryItem {
  id: number;
  prediction_type: string;
  created_at: string;
  model_version?: string;
  summary: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
}

export interface ModelInfoData {
  crop_recommendation: {
    model_name: string;
    algorithm: string;
    version: string;
    trained_on: string;
    dataset: string;
    metrics: Record<string, any>;
    features?: string[];
    feature_names?: string[];
    preprocessing?: string;
    limitations?: string;
  };
  yield_prediction: {
    model_name: string;
    algorithm: string;
    version: string;
    trained_on: string;
    dataset: string;
    metrics: Record<string, any>;
    features?: string[];
    feature_names?: string[];
    preprocessing?: string;
    limitations?: string;
  };
  disease_detection: {
    model_name: string;
    algorithm: string;
    version: string;
    trained_on: string;
    dataset: string;
    metrics: Record<string, any>;
    features?: string[];
    feature_names?: string[];
    preprocessing?: string;
    limitations?: string;
  };
}

async function requestJson<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errMsg = `Request failed with status ${res.status}`;
      try {
        const errorJson = await res.json();
        if (errorJson.message) {
          errMsg = errorJson.message;
        }
      } catch {
        // ignore fallback
      }
      throw new Error(errMsg);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

// 1. Crop Recommendation
export async function getCropRecommendation(
  payload: CropRecommendationPayload
): Promise<CropRecommendationResponse> {
  return requestJson<CropRecommendationResponse>("/api/crop-recommendation", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 2. Yield Prediction
export async function getYieldPrediction(
  payload: YieldPredictionPayload
): Promise<YieldPredictionResponse> {
  return requestJson<YieldPredictionResponse>("/api/yield-prediction", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 3. Disease Risk (Non-Image)
export async function getDiseaseRisk(
  payload: DiseaseRiskPayload
): Promise<DiseaseRiskResponse> {
  return requestJson<DiseaseRiskResponse>("/api/disease-risk", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// 4. Disease Leaf Image Prediction
export async function getDiseaseImagePrediction(
  formData: FormData
): Promise<DiseasePredictionResponse> {
  const url = `${API_BASE_URL}/api/disease-prediction`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    let errMsg = `Image diagnosis failed: ${res.statusText}`;
    try {
      const errorJson = await res.json();
      if (errorJson.message) errMsg = errorJson.message;
    } catch {}
    throw new Error(errMsg);
  }

  return await res.json();
}

// 5. Weather
export async function getWeather(
  latitude: number,
  longitude: number,
  locationName: string = "Farm Coordinates"
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    location_name: locationName,
  });
  return requestJson<WeatherData>(`/api/weather?${params.toString()}`);
}

// 6. Schemes
export async function getGovernmentSchemes(
  state?: string,
  category?: string,
  search?: string
): Promise<GovernmentScheme[]> {
  const params = new URLSearchParams();
  if (state && state !== "All") params.append("state", state);
  if (category && category !== "All") params.append("category", category);
  if (search) params.append("search", search);

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  return requestJson<GovernmentScheme[]>(`/api/schemes${queryStr}`);
}

// 7. Route Planner
export async function getRoute(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number,
  originName: string = "Origin Farm",
  destName: string = "Destination Market"
): Promise<RouteResponse> {
  const params = new URLSearchParams({
    origin_lat: originLat.toString(),
    origin_lon: originLon.toString(),
    dest_lat: destLat.toString(),
    dest_lon: destLon.toString(),
    origin_name: originName,
    destination_name: destName,
  });
  return requestJson<RouteResponse>(`/api/routes?${params.toString()}`);
}

// 8. Prediction History
export async function getPredictionHistory(
  predictionType?: string,
  limit: number = 20
): Promise<{ total: number; predictions: PredictionHistoryItem[] }> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (predictionType && predictionType !== "all") {
    params.append("prediction_type", predictionType);
  }
  return requestJson<{ total: number; predictions: PredictionHistoryItem[] }>(
    `/api/predictions?${params.toString()}`
  );
}

// 9. Model Info
export async function getModelInfo(): Promise<ModelInfoData> {
  return requestJson<ModelInfoData>("/api/model-info");
}
