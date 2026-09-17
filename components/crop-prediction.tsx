"use client"

import { useState } from "react"
import {
  Sprout,
  TrendingUp,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import {
  getCropRecommendation,
  getYieldPrediction,
  CropRecommendationResponse,
  YieldPredictionResponse,
} from "@/lib/api"

const INDIAN_STATES = [
  "Punjab",
  "Uttar Pradesh",
  "Haryana",
  "Madhya Pradesh",
  "Maharashtra",
  "Rajasthan",
  "Gujarat",
  "Karnataka",
  "Andhra Pradesh",
  "Tamil Nadu",
  "West Bengal",
  "Bihar",
  "Telangana",
  "Odisha",
  "Chhattisgarh",
]

const MAJOR_CROPS = [
  "Wheat",
  "Rice",
  "Maize",
  "Chickpea",
  "Cotton",
  "Sugarcane",
  "Soyabean",
  "Groundnut",
  "Moong(Green Gram)",
  "Urad",
  "Arhar/Tur",
  "Barley",
  "Bajra",
  "Jowar",
  "Potato",
  "Onion",
]

const SOIL_PRESETS = [
  {
    name: "Punjab Alluvial (Rabi)",
    state: "Punjab",
    district: "Ludhiana",
    season: "Rabi",
    soil: "Alluvial Loam",
    n: 110,
    p: 45,
    k: 38,
    ph: 7.1,
    temp: 18.0,
    hum: 58,
    rain: 85,
  },
  {
    name: "Maharashtra Black Soil (Kharif)",
    state: "Maharashtra",
    district: "Nagpur",
    season: "Kharif",
    soil: "Deep Black (Regur)",
    n: 80,
    p: 50,
    k: 45,
    ph: 7.6,
    temp: 28.5,
    hum: 75,
    rain: 850,
  },
  {
    name: "Bengal Deltaic (Kharif Paddy)",
    state: "West Bengal",
    district: "Burdwan",
    season: "Kharif",
    soil: "Clayey Deltaic",
    n: 95,
    p: 40,
    k: 42,
    ph: 6.4,
    temp: 27.0,
    hum: 84,
    rain: 1250,
  },
]

export function CropPrediction() {
  const [activeTab, setActiveTab] = useState<"recommendation" | "yield">("recommendation")

  // Crop Recommendation Form State
  const [recState, setRecState] = useState("Punjab")
  const [recDistrict, setRecDistrict] = useState("Ludhiana")
  const [recSeason, setRecSeason] = useState("Kharif")
  const [recSoilType, setRecSoilType] = useState("Alluvial Loam")
  const [recN, setRecN] = useState("90")
  const [recP, setRecP] = useState("45")
  const [recK, setRecK] = useState("40")
  const [recPh, setRecPh] = useState("6.8")
  const [recTemp, setRecTemp] = useState("26")
  const [recHum, setRecHum] = useState("72")
  const [recRain, setRecRain] = useState("650")
  const [recIrrigation, setRecIrrigation] = useState("Canal / Tube-well")

  const [recLoading, setRecLoading] = useState(false)
  const [recError, setRecError] = useState<string | null>(null)
  const [recResult, setRecResult] = useState<CropRecommendationResponse | null>(null)

  // Yield Prediction Form State
  const [yieldState, setYieldState] = useState("Punjab")
  const [yieldDistrict, setYieldDistrict] = useState("Ludhiana")
  const [yieldCrop, setYieldCrop] = useState("Wheat")
  const [yieldSeason, setYieldSeason] = useState("Rabi")
  const [yieldArea, setYieldArea] = useState("2.5")
  const [yieldYear, setYieldYear] = useState("2024")

  const [yieldLoading, setYieldLoading] = useState(false)
  const [yieldError, setYieldError] = useState<string | null>(null)
  const [yieldResult, setYieldResult] = useState<YieldPredictionResponse | null>(null)

  const handleApplyPreset = (preset: typeof SOIL_PRESETS[0]) => {
    setRecState(preset.state)
    setRecDistrict(preset.district)
    setRecSeason(preset.season)
    setRecSoilType(preset.soil)
    setRecN(preset.n.toString())
    setRecP(preset.p.toString())
    setRecK(preset.k.toString())
    setRecPh(preset.ph.toString())
    setRecTemp(preset.temp.toString())
    setRecHum(preset.hum.toString())
    setRecRain(preset.rain.toString())
  }

  const handleRecommendSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRecLoading(true)
    setRecError(null)

    try {
      const res = await getCropRecommendation({
        state: recState,
        district: recDistrict,
        season: recSeason,
        soil_type: recSoilType,
        nitrogen: parseFloat(recN) || 0,
        phosphorus: parseFloat(recP) || 0,
        potassium: parseFloat(recK) || 0,
        ph: parseFloat(recPh) || 7.0,
        temperature: parseFloat(recTemp) || 25,
        humidity: parseFloat(recHum) || 60,
        rainfall: parseFloat(recRain) || 200,
        irrigation: recIrrigation,
      })
      setRecResult(res)
    } catch (err: any) {
      setRecError(err.message || "Failed to calculate crop recommendation.")
    } finally {
      setRecLoading(false)
    }
  }

  const handleYieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setYieldLoading(true)
    setYieldError(null)

    try {
      const res = await getYieldPrediction({
        state: yieldState,
        district: yieldDistrict,
        crop: yieldCrop,
        season: yieldSeason,
        cultivated_area: parseFloat(yieldArea) || 1.0,
        year: parseInt(yieldYear) || 2024,
      })
      setYieldResult(res)
    } catch (err: any) {
      setYieldError(err.message || "Failed to predict crop yield.")
    } finally {
      setYieldLoading(false)
    }
  }

  const chartColors = [
    "oklch(0.72 0.18 145)",
    "oklch(0.75 0.15 45)",
    "oklch(0.65 0.15 200)",
    "oklch(0.7 0.2 80)",
    "oklch(0.65 0.18 25)",
  ]

  return (
    <section id="prediction" className="bg-secondary/20 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-primary">
            <Sprout className="h-4 w-4" />
            Machine Learning Agricultural Intelligence
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Crop Decision Engine
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Genuine multi-crop suitability rankings and historical yield regression powered by ICAR agro-climatic boundaries and official Government of India agricultural datasets.
          </p>

          {/* Tab Switcher */}
          <div className="mt-8 inline-flex rounded-xl border border-border bg-card p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("recommendation")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "recommendation"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Crop Recommendation
            </button>
            <button
              onClick={() => setActiveTab("yield")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "yield"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Yield Prediction
            </button>
          </div>
        </div>

        {/* TAB 1: CROP RECOMMENDATION */}
        {activeTab === "recommendation" && (
          <div className="space-y-8">
            {/* Presets Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Layers className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">Soil Profile Presets:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {SOIL_PRESETS.map((p) => (
                  <Button
                    key={p.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleApplyPreset(p)}
                    className="border-border text-xs hover:border-primary/50"
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Recommendation Form & Output */}
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Form Card */}
              <Card className="border-border bg-card lg:col-span-5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Sprout className="h-5 w-5 text-primary" />
                    Soil & Climate Parameters
                  </CardTitle>
                  <CardDescription>
                    Provide soil nutrient test levels and regional weather indicators.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRecommendSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">State</label>
                        <select
                          value={recState}
                          onChange={(e) => setRecState(e.target.value)}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                        >
                          {INDIAN_STATES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">District</label>
                        <Input
                          value={recDistrict}
                          onChange={(e) => setRecDistrict(e.target.value)}
                          placeholder="District"
                          className="border-border bg-secondary text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Season</label>
                        <select
                          value={recSeason}
                          onChange={(e) => setRecSeason(e.target.value)}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                        >
                          <option value="Kharif">Kharif (Monsoon)</option>
                          <option value="Rabi">Rabi (Winter)</option>
                          <option value="Summer">Zaid / Summer</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground">Soil Type</label>
                        <select
                          value={recSoilType}
                          onChange={(e) => setRecSoilType(e.target.value)}
                          className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                        >
                          <option value="Alluvial Loam">Alluvial Loam</option>
                          <option value="Deep Black (Regur)">Deep Black (Regur)</option>
                          <option value="Red Sandy Loam">Red Sandy Loam</option>
                          <option value="Clayey Loam">Clayey Loam</option>
                          <option value="Coastal Sandy">Coastal Sandy</option>
                        </select>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                      <p className="mb-2 text-xs font-semibold text-primary">Soil Nutrients (kg/ha)</p>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Nitrogen (N)</label>
                          <Input
                            type="number"
                            value={recN}
                            onChange={(e) => setRecN(e.target.value)}
                            min={0}
                            max={300}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Phosphorus (P)</label>
                          <Input
                            type="number"
                            value={recP}
                            onChange={(e) => setRecP(e.target.value)}
                            min={0}
                            max={200}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Potassium (K)</label>
                          <Input
                            type="number"
                            value={recK}
                            onChange={(e) => setRecK(e.target.value)}
                            min={0}
                            max={300}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Soil pH</label>
                          <Input
                            type="number"
                            step="0.1"
                            value={recPh}
                            onChange={(e) => setRecPh(e.target.value)}
                            min={0}
                            max={14}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border/70 bg-secondary/30 p-3">
                      <p className="mb-2 text-xs font-semibold text-accent">Microclimate Parameters</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground">Temp (°C)</label>
                          <Input
                            type="number"
                            value={recTemp}
                            onChange={(e) => setRecTemp(e.target.value)}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Humidity (%)</label>
                          <Input
                            type="number"
                            value={recHum}
                            onChange={(e) => setRecHum(e.target.value)}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground">Rainfall (mm)</label>
                          <Input
                            type="number"
                            value={recRain}
                            onChange={(e) => setRecRain(e.target.value)}
                            className="border-border bg-secondary text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {recError && (
                      <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>{recError}</span>
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={recLoading}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {recLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing Soil Envelopes...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Compute Multi-Crop Recommendations
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Results Column */}
              <div className="space-y-6 lg:col-span-7">
                {recResult ? (
                  <>
                    {/* Top Result Banner */}
                    <Card className="border-primary/50 bg-card">
                      <CardContent className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                              Optimal Crop Match
                            </span>
                            <h3 className="text-3xl font-bold text-foreground">
                              {recResult.top_crop}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Model Confidence: {(recResult.recommendations[0]?.confidence * 100).toFixed(1)}% | Status:{" "}
                              <span className="font-medium text-foreground">{recResult.agronomic_safety_status}</span>
                            </p>
                          </div>
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30">
                            <span className="text-2xl font-bold text-primary">
                              {recResult.recommendations[0]?.suitability_score}%
                            </span>
                          </div>
                        </div>

                        {/* Warnings if any */}
                        {recResult.recommendations[0]?.warnings.length > 0 && (
                          <div className="mt-4 space-y-1.5 rounded-lg border border-accent/40 bg-accent/10 p-3 text-xs text-accent">
                            {recResult.recommendations[0].warnings.map((w, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <span>{w}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Chart: Probability Distribution */}
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Multi-Crop Suitability Comparison (%)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={recResult.recommendations.map((r) => ({
                                crop: r.crop,
                                score: r.suitability_score,
                              }))}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="crop" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} domain={[0, 100]} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                {recResult.recommendations.map((_, i) => (
                                  <Cell key={i} fill={chartColors[i % chartColors.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ranked Crop Cards */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        All Ranked Recommendations
                      </h4>
                      {recResult.recommendations.map((crop, idx) => (
                        <div
                          key={crop.crop}
                          className="rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                                {idx + 1}
                              </span>
                              <div>
                                <h5 className="font-semibold text-foreground">{crop.crop}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {crop.reasons[0] || "Nutrient-aligned recommendation"}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-bold text-primary">
                                {crop.suitability_score}%
                              </span>
                              <p className="text-[10px] text-muted-foreground">Suitability</p>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${Math.min(100, Math.max(5, crop.suitability_score))}%` }}
                              />
                            </div>
                          </div>

                          <div className="mt-3 rounded-md bg-secondary/50 p-2 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">ICAR Agronomic Note: </span>
                            {crop.agronomic_notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="flex h-[450px] items-center justify-center border-dashed border-border bg-card/50 text-center p-8">
                    <div className="max-w-md space-y-3">
                      <Sprout className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h4 className="text-lg font-semibold text-foreground">
                        Ready to Recommend
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Select a soil preset or input your farm&apos;s soil and rainfall data, then submit to receive an authentic machine learning recommendation verified against ICAR guidelines.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CROP YIELD PREDICTION */}
        {activeTab === "yield" && (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Form */}
            <Card className="border-border bg-card lg:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Yield Prediction Parameters
                </CardTitle>
                <CardDescription>
                  Trained on 241,324 historical Indian district records with strict time-aware validation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleYieldSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">State</label>
                    <select
                      value={yieldState}
                      onChange={(e) => setYieldState(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">District</label>
                    <Input
                      value={yieldDistrict}
                      onChange={(e) => setYieldDistrict(e.target.value)}
                      placeholder="District"
                      className="border-border bg-secondary text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Crop</label>
                      <select
                        value={yieldCrop}
                        onChange={(e) => setYieldCrop(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                      >
                        {MAJOR_CROPS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Season</label>
                      <select
                        value={yieldSeason}
                        onChange={(e) => setYieldSeason(e.target.value)}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                      >
                        <option value="Kharif">Kharif</option>
                        <option value="Rabi">Rabi</option>
                        <option value="Summer">Summer</option>
                        <option value="Whole Year">Whole Year</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Cultivated Area (Hectares)</label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={yieldArea}
                        onChange={(e) => setYieldArea(e.target.value)}
                        className="border-border bg-secondary text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Harvest Year</label>
                      <Input
                        type="number"
                        value={yieldYear}
                        onChange={(e) => setYieldYear(e.target.value)}
                        className="border-border bg-secondary text-sm"
                      />
                    </div>
                  </div>

                  {yieldError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{yieldError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={yieldLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {yieldLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Running Yield Regressor...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Predict Harvest Yield
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results */}
            <div className="space-y-6 lg:col-span-7">
              {yieldResult ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Card className="border-primary/40 bg-card">
                      <CardContent className="p-6">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Estimated Productivity
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-primary">
                            {yieldResult.predicted_yield_per_hectare}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">tonnes / ha</span>
                        </div>
                        {yieldResult.confidence_interval && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            95% Prediction Interval: [{yieldResult.confidence_interval.lower_bound} – {yieldResult.confidence_interval.upper_bound}] tonnes/ha
                          </p>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-accent/40 bg-card">
                      <CardContent className="p-6">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Total Expected Harvest
                        </span>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="text-4xl font-extrabold text-accent">
                            {yieldResult.predicted_total_production}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground">metric tonnes</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Based on {yieldResult.input_summary.cultivated_area} hectares cultivated
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Benchmark Comparison Chart */}
                  {yieldResult.historical_benchmark && (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Historical Yield Benchmark: {yieldResult.crop}
                        </CardTitle>
                        <CardDescription>
                          Comparison against Government of India official historical records.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[200px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={[
                                { label: "Historical Min", yield: yieldResult.historical_benchmark.historical_min_yield },
                                { label: "Historical Mean", yield: yieldResult.historical_benchmark.historical_mean_yield },
                                { label: "Predicted Yield", yield: yieldResult.predicted_yield_per_hectare },
                                { label: "Historical Max", yield: yieldResult.historical_benchmark.historical_max_yield },
                              ]}
                              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--card))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar dataKey="yield" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]}>
                                <Cell fill="oklch(0.65 0.15 200)" />
                                <Cell fill="oklch(0.75 0.15 45)" />
                                <Cell fill="oklch(0.72 0.18 145)" />
                                <Cell fill="oklch(0.7 0.2 80)" />
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                          <span>
                            State Mean: <strong>{yieldResult.historical_benchmark.historical_mean_yield} t/ha</strong>
                          </span>
                          <span>
                            Variance:{" "}
                            <strong className={yieldResult.historical_benchmark.difference_from_mean_percent >= 0 ? "text-primary" : "text-destructive"}>
                              {yieldResult.historical_benchmark.difference_from_mean_percent > 0 ? "+" : ""}
                              {yieldResult.historical_benchmark.difference_from_mean_percent}%
                            </strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="flex h-[380px] items-center justify-center border-dashed border-border bg-card/50 text-center p-8">
                  <div className="max-w-md space-y-3">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h4 className="text-lg font-semibold text-foreground">
                      Historical Yield Modeling
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Input your crop, land area, and season. The regression model (trained with time-aware splitting on historical crop records) will project expected output with a statistical prediction interval.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
