# FarmFlow Local Setup & Deployment Guide

This guide provides step-by-step instructions to run the full-stack Smart Farmer platform locally on Windows, macOS, or Linux.

---

## Prerequisites
1. **Python 3.10+** (Tested on Python 3.14 on Windows)
2. **Node.js 18+** & **npm** / **pnpm** (For running the Next.js frontend)
3. **Git**

---

## Step 1: Backend Setup (FastAPI & ML Pipeline)

### 1.1 Navigate to Project Root
```powershell
cd c:\Users\aksha\Downloads\v0-farmers-website
```

### 1.2 Install Python Dependencies
```powershell
python -m pip install -r backend/requirements.txt
```

### 1.3 Acquire Authentic Public Datasets
Downloads authentic ICAR crop recommendations, Government of India crop production records, PlantVillage leaf images, and Government agricultural schemes:
```powershell
python backend/scripts/download_data.py
```

### 1.4 Run Data Preprocessing & Validation
Cleans and audits datasets, removing reporting anomalies and auditing missing values:
```powershell
python backend/scripts/preprocess_data.py
```

### 1.5 Train Machine Learning Models
Trains all 3 models with cross-validation and time-aware splitting:
```powershell
python backend/scripts/train_models.py
```

### 1.6 Verify Models & Run Test Suite
```powershell
# Verify model inferences
python -m backend.scripts.evaluate_models

# Run comprehensive PyTest test suite (12 tests)
python -m pytest backend/tests -v
```

### 1.7 Launch the FastAPI Backend Server
```powershell
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
The API is now live at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`.

---

## Step 2: Frontend Setup (Next.js & React 19)

### 2.1 Configure Environment Variables
Verify `.env.local` exists in the project root:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2.2 Install Dependencies
```powershell
npm install
# or
pnpm install
```

### 2.3 Run Development Server
```powershell
npm run dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Production Deployment

### Backend Production (Docker / Gunicorn)
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ backend/
EXPOSE 8000
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend Production (Vercel / Node.js)
```powershell
npm run build
npm run start
```
Set the production environment variable `NEXT_PUBLIC_API_URL` to your production backend domain.
