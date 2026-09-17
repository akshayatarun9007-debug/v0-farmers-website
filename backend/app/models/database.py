import os
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./backend/data/farmflow.db")

# Ensure directory exists for SQLite
if DATABASE_URL.startswith("sqlite"):
    db_path = DATABASE_URL.replace("sqlite:///", "")
    db_dir = os.path.dirname(db_path)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Farmer(Base):
    __tablename__ = "farmers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(120), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)  # Never store plain text passwords
    state = Column(String(50), nullable=True)
    district = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farms = relationship("Farm", back_populates="farmer", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="farmer", cascade="all, delete-orphan")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    name = Column(String(100), nullable=False)
    state = Column(String(50), nullable=False)
    district = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_hectares = Column(Float, default=1.0)
    soil_type = Column(String(50), nullable=True)
    irrigation_type = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("Farmer", back_populates="farms")


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    prediction_type = Column(String(50), index=True, nullable=False)  # 'crop_recommendation', 'yield_prediction', 'disease_detection', 'disease_risk'
    model_version = Column(String(50), nullable=True)
    input_data = Column(JSON, nullable=False)
    output_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    farmer = relationship("Farmer", back_populates="predictions")
    crop_detail = relationship("CropPredictionDetail", uselist=False, back_populates="prediction", cascade="all, delete-orphan")
    yield_detail = relationship("YieldPredictionDetail", uselist=False, back_populates="prediction", cascade="all, delete-orphan")
    disease_detail = relationship("DiseasePredictionDetail", uselist=False, back_populates="prediction", cascade="all, delete-orphan")


class CropPredictionDetail(Base):
    __tablename__ = "crop_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False, unique=True)
    state = Column(String(50), nullable=True)
    district = Column(String(50), nullable=True)
    season = Column(String(30), nullable=True)
    soil_type = Column(String(50), nullable=True)
    nitrogen = Column(Float, nullable=True)
    phosphorus = Column(Float, nullable=True)
    potassium = Column(Float, nullable=True)
    ph = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    rainfall = Column(Float, nullable=True)
    top_recommended_crop = Column(String(100), nullable=False)
    suitability_score = Column(Float, nullable=False)
    all_recommendations = Column(JSON, nullable=False)

    prediction = relationship("Prediction", back_populates="crop_detail")


class YieldPredictionDetail(Base):
    __tablename__ = "yield_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False, unique=True)
    crop = Column(String(100), nullable=False)
    state = Column(String(50), nullable=True)
    district = Column(String(50), nullable=True)
    season = Column(String(30), nullable=True)
    area_hectares = Column(Float, nullable=False)
    predicted_yield_per_hectare = Column(Float, nullable=False)
    predicted_total_production = Column(Float, nullable=False)
    unit = Column(String(30), default="tonnes/hectare")
    confidence_interval = Column(JSON, nullable=True)

    prediction = relationship("Prediction", back_populates="yield_detail")


class DiseasePredictionDetail(Base):
    __tablename__ = "disease_predictions"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("predictions.id"), nullable=False, unique=True)
    detection_type = Column(String(20), nullable=False)  # 'image' or 'symptom_risk'
    crop = Column(String(100), nullable=True)
    predicted_condition = Column(String(150), nullable=False)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(30), nullable=True)
    recommended_action = Column(Text, nullable=True)
    top_alternatives = Column(JSON, nullable=True)

    prediction = relationship("Prediction", back_populates="disease_detail")


class SavedLocation(Base):
    __tablename__ = "saved_locations"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"), nullable=True)
    name = Column(String(100), nullable=False)
    location_type = Column(String(50), default="farm")  # 'farm', 'mandi', 'warehouse'
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=False)
    eligibility = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    level = Column(String(50), default="Central")  # 'Central' or state name
    category = Column(String(100), nullable=True)  # 'Income Support', 'Insurance', 'Credit', etc.
    official_source = Column(String(255), nullable=False)
    application_url = Column(String(255), nullable=True)
    last_verified = Column(String(30), nullable=False)
    is_active = Column(Boolean, default=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False, index=True)
    version = Column(String(50), nullable=False)
    algorithm = Column(String(100), nullable=False)
    trained_on = Column(DateTime, default=datetime.utcnow)
    dataset_name = Column(String(200), nullable=False)
    dataset_url = Column(String(255), nullable=True)
    metrics = Column(JSON, nullable=False)
    feature_names = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
