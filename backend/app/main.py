import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from backend.app.api import (
    crop,
    yield_prediction,
    disease,
    weather,
    schemes,
    routes,
    predictions,
    model_info,
)
from backend.app.models.database import init_db

app = FastAPI(
    title="FarmFlow Smart Agriculture API",
    description="Production-grade AI/ML and Agricultural Services API for Indian Farmers",
    version="1.0.0",
)

# Initialize database on startup
@app.on_event("startup")
def on_startup():
    init_db()

# Enable CORS for Next.js frontend
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000,*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom error handlers returning structured JSON
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": str(exc.detail)},
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    field = ".".join(str(loc) for loc in first_error.get("loc", []))
    msg = first_error.get("msg", "Invalid input value")
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": f"Validation error on {field}: {msg}" if field else msg,
            "details": errors,
        },
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": f"Internal server error: {str(exc)}",
        },
    )

# Health endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "FarmFlow API",
        "version": "1.0.0",
        "database": "connected",
    }

# Include API Routers
app.include_router(crop.router, prefix="/api", tags=["Crop Recommendation"])
app.include_router(yield_prediction.router, prefix="/api", tags=["Yield Prediction"])
app.include_router(disease.router, prefix="/api", tags=["Disease Detection"])
app.include_router(weather.router, prefix="/api", tags=["Weather Integration"])
app.include_router(schemes.router, prefix="/api", tags=["Government Schemes"])
app.include_router(routes.router, prefix="/api", tags=["Transport Routes"])
app.include_router(predictions.router, prefix="/api", tags=["Prediction History"])
app.include_router(model_info.router, prefix="/api", tags=["Model Management"])
