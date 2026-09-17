import os
import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models.database import init_db

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    init_db()


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "FarmFlow API"


def test_crop_recommendation_valid():
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "season": "Rabi",
        "nitrogen": 90.0,
        "phosphorus": 45.0,
        "potassium": 40.0,
        "ph": 6.8,
        "temperature": 18.5,
        "humidity": 60.0,
        "rainfall": 80.0,
        "farm_area": 2.0,
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "top_crop" in data
    assert len(data["recommendations"]) > 0
    assert data["recommendations"][0]["suitability_score"] > 0
    assert "agronomic_safety_status" in data


def test_crop_recommendation_invalid_soil():
    # Negative nitrogen should trigger validation error
    payload = {
        "nitrogen": -10.0,
        "phosphorus": 50.0,
        "potassium": 50.0,
        "ph": 6.5,
    }
    response = client.post("/api/crop-recommendation", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] is True


def test_yield_prediction_valid():
    payload = {
        "state": "Punjab",
        "district": "Ludhiana",
        "crop": "Wheat",
        "season": "Rabi",
        "cultivated_area": 3.5,
        "year": 2024,
    }
    response = client.post("/api/yield-prediction", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["predicted_yield_per_hectare"] > 0
    assert data["predicted_total_production"] > 0
    assert data["unit"] == "tonnes/hectare"
    assert "confidence_interval" in data


def test_yield_prediction_invalid_area():
    payload = {
        "state": "Punjab",
        "crop": "Wheat",
        "season": "Rabi",
        "cultivated_area": 0.0,  # Invalid area
    }
    response = client.post("/api/yield-prediction", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["error"] is True


def test_disease_risk_valid():
    payload = {
        "crop": "Rice",
        "temperature": 26.0,
        "humidity": 88.0,
        "rainfall": 150.0,
        "season": "Kharif",
        "symptoms": ["spindle-shaped lesions", "gray centers"],
    }
    response = client.post("/api/disease-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["risk_level"] in ["Low", "Moderate", "High", "Severe"]
    assert len(data["possible_diseases"]) > 0
    assert "disclaimer" in data


def test_disease_prediction_image():
    # Create synthetic test leaf in memory
    img = Image.new("RGB", (128, 128), color=(34, 139, 34))  # Forest green
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("test_leaf.jpg", buf, "image/jpeg")}
    data = {"crop": "Tomato"}

    response = client.post("/api/disease-prediction", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["success"] is True
    assert "predicted_condition" in res_data
    assert "confidence" in res_data
    assert len(res_data["top_predictions"]) > 0


def test_weather_endpoint():
    # Test with coordinates for New Delhi
    response = client.get("/api/weather?latitude=28.61&longitude=77.20&location_name=Delhi+Agri+Zone")
    assert response.status_code == 200
    data = response.json()
    assert "current" in data
    assert len(data["daily_forecast"]) > 0
    assert len(data["agricultural_advisories"]) > 0


def test_schemes_endpoint():
    response = client.get("/api/schemes")
    assert response.status_code == 200
    schemes = response.json()
    assert len(schemes) >= 6
    assert any("PM-KISAN" in s["name"] for s in schemes)


def test_routes_endpoint():
    # Test route from Nashik (farm region) to Mumbai Vashi APMC Mandi
    response = client.get("/api/routes?origin_lat=19.997&origin_lon=73.789&dest_lat=19.076&dest_lon=72.877&origin_name=Nashik+Farm&destination_name=Mumbai+APMC")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["distance_km"] > 50.0
    assert data["estimated_transport_cost_inr"] > 0


def test_prediction_history():
    response = client.get("/api/predictions?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert isinstance(data["predictions"], list)


def test_model_info():
    response = client.get("/api/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "crop_recommendation" in data
    assert "yield_prediction" in data
    assert "disease_detection" in data
    assert data["crop_recommendation"]["metrics"]["test_accuracy"] > 0.95
