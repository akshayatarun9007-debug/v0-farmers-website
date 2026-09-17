# FarmFlow API Technical Documentation

The FarmFlow Smart Agriculture REST API is built on FastAPI, offering asynchronous high-throughput endpoints for Indian farmers, agricultural extension officers, and supply chain coordinators.

- **Base URL (Local):** `http://localhost:8000`
- **Interactive Swagger UI:** `http://localhost:8000/docs`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`

---

## 1. System Health
### `GET /api/health`
Checks server responsiveness and database connectivity.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "service": "FarmFlow API",
  "version": "1.0.0",
  "database": "connected"
}
```

---

## 2. Multi-Crop Recommendation
### `POST /api/crop-recommendation`
Returns ranked crop recommendations with suitability percentages and ICAR agronomic constraints.

**Request Body (`application/json`):**
```json
{
  "state": "Punjab",
  "district": "Ludhiana",
  "season": "Rabi",
  "soil_type": "Alluvial Loam",
  "nitrogen": 90.0,
  "phosphorus": 45.0,
  "potassium": 40.0,
  "ph": 6.8,
  "temperature": 18.5,
  "humidity": 60.0,
  "rainfall": 80.0,
  "irrigation": "Tube-well"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "top_crop": "Wheat",
  "recommendations": [
    {
      "crop": "Wheat",
      "suitability_score": 88.5,
      "confidence": 0.885,
      "reasons": [
        "Highly compatible with Rabi season conditions.",
        "Mean temperature matches the physiological thermal envelope."
      ],
      "agronomic_notes": "Cool winter growing season followed by bright warm sunshine during ripening.",
      "season_fit": true,
      "soil_fit": true,
      "temperature_fit": true,
      "rainfall_fit": true,
      "warnings": []
    },
    {
      "crop": "Maize",
      "suitability_score": 11.2,
      "confidence": 0.112,
      "reasons": ["Compatible with soil nutrient profile."],
      "agronomic_notes": "Highly sensitive to water stagnation.",
      "season_fit": true,
      "soil_fit": true,
      "temperature_fit": true,
      "rainfall_fit": true,
      "warnings": []
    }
  ],
  "input_summary": { ... },
  "model_version": "1.0.0",
  "agronomic_safety_status": "Safe: Optimal agronomic fit"
}
```

---

## 3. Crop Yield Prediction
### `POST /api/yield-prediction`
Calculates expected yield (tonnes/ha) and total harvest (tonnes) using historical regression models with empirical confidence intervals.

**Request Body (`application/json`):**
```json
{
  "state": "Punjab",
  "district": "Ludhiana",
  "crop": "Wheat",
  "season": "Rabi",
  "cultivated_area": 3.5,
  "year": 2024
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "crop": "Wheat",
  "predicted_yield_per_hectare": 4.15,
  "predicted_total_production": 14.53,
  "unit": "tonnes/hectare",
  "production_unit": "tonnes",
  "confidence_interval": {
    "confidence_level": 0.95,
    "lower_bound": 0.58,
    "upper_bound": 7.72,
    "unit": "tonnes/hectare"
  },
  "historical_benchmark": {
    "historical_mean_yield": 3.85,
    "historical_min_yield": 0.95,
    "historical_max_yield": 5.42,
    "difference_from_mean_percent": 7.8,
    "sample_count": 840
  },
  "model_version": "1.0.0",
  "input_summary": { ... }
}
```

---

## 4. Disease Leaf Image Prediction
### `POST /api/disease-prediction`
Diagnoses plant leaf diseases from uploaded photos.

**Request (`multipart/form-data`):**
- `file`: Image file (JPEG, PNG, WebP)
- `crop`: Crop name (optional)

**Response (200 OK):**
```json
{
  "success": true,
  "crop": "Tomato",
  "predicted_condition": "Early Blight (Alternaria solani)",
  "confidence": 0.92,
  "is_healthy": false,
  "top_predictions": [
    {
      "class_name": "Tomato___Early_blight",
      "crop": "Tomato",
      "condition": "Early Blight",
      "probability": 0.92
    },
    {
      "class_name": "Tomato___Late_blight",
      "crop": "Tomato",
      "condition": "Late Blight",
      "probability": 0.06
    }
  ],
  "explanation": "Fungal pathogen characterized by concentric target-like brown spots surrounded by yellow chlorotic halos.",
  "recommended_next_action": "Remove and destroy affected lower foliage. Apply ICAR-approved bio-fungicides.",
  "disclaimer": "Image-based AI diagnostic indicator. Field inspection and agricultural extension officer verification recommended before applying chemical sprays.",
  "model_version": "1.0.0"
}
```

---

## 5. Disease Risk Assessment (Non-Image)
### `POST /api/disease-risk`
Evaluates pathogen pressure from weather parameters and observed symptoms.

**Request Body (`application/json`):**
```json
{
  "crop": "Rice",
  "temperature": 26.0,
  "humidity": 88.0,
  "rainfall": 150.0,
  "season": "Kharif",
  "symptoms": ["spindle-shaped lesions", "gray centers"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "crop": "Rice",
  "risk_level": "High",
  "risk_score": 85.0,
  "possible_diseases": [
    {
      "disease": "Rice Blast (Magnaporthe oryzae)",
      "probability": 0.85,
      "severity": "Severe",
      "symptoms_match": ["spindle-shaped lesions", "gray centers"]
    }
  ],
  "reasons": [
    "Elevated relative humidity (88%) creates a microclimate conducive to foliar fungal germination.",
    "Recent heavy precipitation (150 mm) facilitates water-splash dispersal."
  ],
  "preventative_measures": [
    "Maintain crop spacing for optimal airflow and sunlight penetration.",
    "Practice crop rotation with non-host legume or cereal crops."
  ],
  "recommended_action": "High disease outbreak risk. Immediate field scouting and preventive bio-agent application advised.",
  "disclaimer": "Risk estimation based on agro-climatic conditions and reported symptoms. Not a confirmed laboratory diagnosis."
}
```

---

## 6. Weather & Agricultural Advisories
### `GET /api/weather`
- **Query Parameters:**
  - `latitude`: Float (-90 to 90)
  - `longitude`: Float (-180 to 180)
  - `location_name`: String (optional)

**Response (200 OK):**
Returns `current` weather metrics, 7-day `daily_forecast`, next 12-hour `hourly_forecast`, and specific `agricultural_advisories` (Irrigation, Spraying, Pest risks).

---

## 7. Transport Routes & Freight Cost
### `GET /api/routes`
- **Query Parameters:**
  - `origin_lat`, `origin_lon`, `dest_lat`, `dest_lon`
  - `origin_name`, `destination_name`

**Response (200 OK):**
```json
{
  "success": true,
  "origin_name": "Nashik Farm",
  "destination_name": "Mumbai APMC",
  "distance_km": 164.2,
  "duration_minutes": 215.0,
  "duration_formatted": "3h 35m",
  "estimated_fuel_litres": 19.3,
  "estimated_transport_cost_inr": 2432.0,
  "waypoints": [ ... ],
  "coordinates": [ [73.789, 19.997], ... ],
  "routing_engine": "OpenStreetMap OSRM Routing Engine"
}
```

---

## 8. Government Schemes
### `GET /api/schemes`
- **Query Parameters:** `state`, `category`, `search`
- **Response:** Array of verified schemes with eligibility, benefits, application portals, and verification dates.

---

## 9. Prediction History
### `GET /api/predictions`
- **Query Parameters:** `prediction_type`, `limit`
- **Response:** Audit history of all farmer predictions saved in SQLite database.

---

## 10. Model Management & Transparency
### `GET /api/model-info`
- **Response:** Detailed specifications and actual calculated metrics for all 3 production models.

---

## Error Response Format
In case of errors, the API never returns unhandled stack traces. It returns structured JSON:
```json
{
  "error": true,
  "message": "Cultivated area must be strictly positive (greater than 0 hectares)."
}
```
