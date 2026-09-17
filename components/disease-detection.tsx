"use client"

import { useState, useRef } from "react"
import {
  Bug,
  Upload,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  RefreshCw,
  Camera,
  Activity,
  FileCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  getDiseaseImagePrediction,
  getDiseaseRisk,
  DiseasePredictionResponse,
  DiseaseRiskResponse,
} from "@/lib/api"

const SYMPTOM_OPTIONS: Record<string, string[]> = {
  rice: [
    "Spindle-shaped lesions with gray centers",
    "Water-soaked yellowish streaks on leaves",
    "Brown necrotic margins",
    "Milky bacterial ooze on leaf cut",
    "Rotting neck nodes",
  ],
  wheat: [
    "Yellow to orange powdery pustules in rows",
    "White powdery fungal patches on upper foliage",
    "Chlorosis and drying of flag leaf",
    "Stunted tillering",
  ],
  tomato: [
    "Dark water-soaked lesions with white mildew on leaf undersides",
    "Concentric target-board brown spots",
    "Yellow halos surrounding leaf lesions",
    "Wilting and rapid stem collapse",
  ],
  potato: [
    "Pale green to brown water-soaked blotches",
    "White downy mold on leaf reverse in humid weather",
    "Brown angular spots on older leaves",
    "Tuber surface depression and rot",
  ],
  maize: [
    "Cinnamon-brown to golden powdery pustules",
    "Parallel rectangular gray leaf spots",
    "Early leaf senescence",
  ],
  cotton: [
    "Angular leaf spots bounded by veinlets",
    "Black lesions on branches (Black Arm)",
    "Water-soaked boll rot",
  ],
}

export function DiseaseDetection() {
  const [activeTab, setActiveTab] = useState<"image" | "symptom">("image")

  // Image Diagnosis State
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageCrop, setImageCrop] = useState("Tomato")
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageResult, setImageResult] = useState<DiseasePredictionResponse | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Symptom Risk State
  const [symCrop, setSymCrop] = useState("rice")
  const [symTemp, setSymTemp] = useState("26")
  const [symHum, setSymHum] = useState("85")
  const [symRain, setSymRain] = useState("120")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [riskLoading, setRiskLoading] = useState(false)
  const [riskError, setRiskError] = useState<string | null>(null)
  const [riskResult, setRiskResult] = useState<DiseaseRiskResponse | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setImageResult(null)
      setImageError(null)
    }
  }

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setImageError("Please upload a leaf photograph.")
      return
    }

    setImageLoading(true)
    setImageError(null)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("crop", imageCrop)

      const res = await getDiseaseImagePrediction(formData)
      setImageResult(res)
    } catch (err: any) {
      setImageError(err.message || "Failed to analyze leaf image.")
    } finally {
      setImageLoading(false)
    }
  }

  const handleToggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    )
  }

  const handleRiskSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setRiskLoading(true)
    setRiskError(null)

    try {
      const res = await getDiseaseRisk({
        crop: symCrop,
        temperature: parseFloat(symTemp) || 25,
        humidity: parseFloat(symHum) || 75,
        rainfall: parseFloat(symRain) || 50,
        symptoms: selectedSymptoms,
      })
      setRiskResult(res)
    } catch (err: any) {
      setRiskError(err.message || "Failed to calculate disease risk.")
    } finally {
      setRiskLoading(false)
    }
  }

  return (
    <section id="disease" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-primary">
            <Bug className="h-4 w-4" />
            Pathology & Protection
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Crop Disease Diagnostic Center
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Identify crop leaf infections using authentic PlantVillage-trained diagnostic models or estimate regional pathogen pressure through agro-climatic symptom risk analysis.
          </p>

          {/* Mode Switcher */}
          <div className="mt-8 inline-flex rounded-xl border border-border bg-card p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("image")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "image"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="h-4 w-4" />
              Leaf Photo Diagnosis
            </button>
            <button
              onClick={() => setActiveTab("symptom")}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
                activeTab === "symptom"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-4 w-4" />
              Symptom Risk Estimation
            </button>
          </div>
        </div>

        {/* TAB 1: IMAGE DIAGNOSIS */}
        {activeTab === "image" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <Card className="border-border bg-card lg:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Upload className="h-5 w-5 text-primary" />
                  Upload Crop Leaf Photograph
                </CardTitle>
                <CardDescription>
                  Capture or select a clear, well-lit photo of an individual diseased or suspect leaf.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleImageSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Crop Species</label>
                    <select
                      value={imageCrop}
                      onChange={(e) => setImageCrop(e.target.value)}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Potato">Potato</option>
                      <option value="Corn">Corn (Maize)</option>
                      <option value="Apple">Apple</option>
                      <option value="Other">Other / Auto-detect</option>
                    </select>
                  </div>

                  {/* Drag and Drop Box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 p-6 text-center transition-colors hover:border-primary/50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {previewUrl ? (
                      <div className="space-y-3">
                        <img
                          src={previewUrl}
                          alt="Leaf preview"
                          className="mx-auto max-h-48 rounded-lg object-contain shadow-md"
                        />
                        <p className="text-xs text-primary font-medium">
                          Click to choose a different photo
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                          <Camera className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Click or drag leaf photo here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Supports JPEG, PNG, WebP
                        </p>
                      </>
                    )}
                  </div>

                  {imageError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{imageError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={imageLoading || !selectedFile}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {imageLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Visual Foliar Pathology...
                      </>
                    ) : (
                      <>
                        <Bug className="mr-2 h-4 w-4" />
                        Diagnose Leaf Condition
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Results Column */}
            <div className="space-y-6 lg:col-span-7">
              {imageResult ? (
                <>
                  <Card
                    className={`border ${
                      imageResult.is_healthy ? "border-primary/50" : "border-accent/60"
                    } bg-card`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                            {imageResult.is_healthy ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <AlertTriangle className="h-3.5 w-3.5 text-accent" />
                            )}
                            {imageResult.is_healthy ? "Healthy Plant Foliage" : "Pathogen Infection Detected"}
                          </div>
                          <h3 className="mt-3 text-2xl font-bold text-foreground">
                            {imageResult.predicted_condition}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Crop: <span className="font-semibold text-foreground">{imageResult.crop}</span> | Model Confidence:{" "}
                            <strong className="text-primary">{(imageResult.confidence * 100).toFixed(1)}%</strong>
                          </p>
                        </div>
                      </div>

                      {/* Explanation */}
                      <div className="mt-4 rounded-lg bg-secondary/50 p-3.5 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground mb-1">Pathological Explanation:</p>
                        {imageResult.explanation}
                      </div>

                      {/* Recommended Action */}
                      <div className="mt-3 rounded-lg border border-primary/40 bg-primary/10 p-3.5 text-sm text-foreground">
                        <p className="font-semibold text-primary mb-1">Recommended Agronomic Action:</p>
                        {imageResult.recommended_next_action}
                      </div>

                      {/* Disclaimer */}
                      <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                        <Info className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                        <span>
                          <strong>Agronomic Safety Disclaimer: </strong>
                          {imageResult.disclaimer}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Alternatives */}
                  {imageResult.top_predictions.length > 1 && (
                    <Card className="border-border bg-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-foreground">
                          Diagnostic Alternatives & Probability Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {imageResult.top_predictions.map((alt, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-foreground">
                                {alt.condition} ({alt.crop})
                              </span>
                              <span className="text-muted-foreground">
                                {(alt.probability * 100).toFixed(1)}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full rounded-full bg-primary transition-all"
                                style={{ width: `${alt.probability * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="flex h-[420px] items-center justify-center border-dashed border-border bg-card/50 text-center p-8">
                  <div className="max-w-md space-y-3">
                    <Camera className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h4 className="text-lg font-semibold text-foreground">
                      Visual Foliar Pathology Scanner
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Upload a plant leaf photo to diagnose bacterial spots, fungal blights, rusts, or healthy foliar tissue using authentic benchmark pathology models.
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SYMPTOM & AGRO-CLIMATIC RISK */}
        {activeTab === "symptom" && (
          <div className="grid gap-8 lg:grid-cols-12">
            <Card className="border-border bg-card lg:col-span-5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Activity className="h-5 w-5 text-primary" />
                  Agro-Climatic Risk Inputs
                </CardTitle>
                <CardDescription>
                  Assess potential pathogen risks from ambient weather thresholds and observed symptoms.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRiskSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Crop</label>
                    <select
                      value={symCrop}
                      onChange={(e) => {
                        setSymCrop(e.target.value)
                        setSelectedSymptoms([])
                      }}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                    >
                      <option value="rice">Rice (Paddy)</option>
                      <option value="wheat">Wheat</option>
                      <option value="tomato">Tomato</option>
                      <option value="potato">Potato</option>
                      <option value="maize">Maize (Corn)</option>
                      <option value="cotton">Cotton</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-lg border border-border/70 bg-secondary/30 p-3">
                    <div>
                      <label className="text-[11px] text-muted-foreground">Temp (°C)</label>
                      <Input
                        type="number"
                        value={symTemp}
                        onChange={(e) => setSymTemp(e.target.value)}
                        className="border-border bg-secondary text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Humidity (%)</label>
                      <Input
                        type="number"
                        value={symHum}
                        onChange={(e) => setSymHum(e.target.value)}
                        className="border-border bg-secondary text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-muted-foreground">Rainfall (mm)</label>
                      <Input
                        type="number"
                        value={symRain}
                        onChange={(e) => setSymRain(e.target.value)}
                        className="border-border bg-secondary text-xs"
                      />
                    </div>
                  </div>

                  {/* Symptom Checkboxes */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-foreground">
                      Observed Visual Symptoms (Select all observed):
                    </label>
                    <div className="space-y-1.5">
                      {(SYMPTOM_OPTIONS[symCrop] || []).map((symptom) => {
                        const checked = selectedSymptoms.includes(symptom)
                        return (
                          <div
                            key={symptom}
                            onClick={() => handleToggleSymptom(symptom)}
                            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-xs transition-all ${
                              checked
                                ? "border-primary bg-primary/10 text-foreground font-medium"
                                : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {}}
                              className="rounded border-border accent-primary"
                            />
                            <span>{symptom}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {riskError && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{riskError}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={riskLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {riskLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Evaluating Epidemiological Models...
                      </>
                    ) : (
                      <>
                        <Activity className="mr-2 h-4 w-4" />
                        Estimate Disease Risk Level
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Risk Output */}
            <div className="space-y-6 lg:col-span-7">
              {riskResult ? (
                <>
                  <Card className="border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Non-Image Pathogen Risk Estimation
                          </span>
                          <h3 className="mt-1 text-2xl font-bold text-foreground capitalize">
                            {riskResult.crop} Disease Risk
                          </h3>
                        </div>
                        <div
                          className={`rounded-full px-4 py-1.5 text-sm font-bold ${
                            riskResult.risk_level === "High" || riskResult.risk_level === "Severe"
                              ? "bg-destructive/20 text-destructive border border-destructive/40"
                              : riskResult.risk_level === "Moderate"
                              ? "bg-accent/20 text-accent border border-accent/40"
                              : "bg-primary/20 text-primary border border-primary/40"
                          }`}
                        >
                          {riskResult.risk_level} Risk ({riskResult.risk_score}/100)
                        </div>
                      </div>

                      <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-3.5 text-xs text-foreground">
                        <p className="font-semibold text-primary mb-1">Recommended Action:</p>
                        {riskResult.recommended_action}
                      </div>

                      {/* Reasons */}
                      <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">Epidemiological Factors:</p>
                        {riskResult.reasons.map((r, i) => (
                          <p key={i}>• {r}</p>
                        ))}
                      </div>

                      {/* Disclaimer banner */}
                      <div className="mt-4 rounded-md border border-accent/40 bg-accent/10 p-3 text-xs text-accent">
                        <strong>Disclaimer: </strong>
                        {riskResult.disclaimer}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Possible Diseases */}
                  {riskResult.possible_diseases.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Identified Pathogen Threats
                      </h4>
                      {riskResult.possible_diseases.map((d, i) => (
                        <div key={i} className="rounded-xl border border-border bg-card p-4">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-foreground">{d.disease}</h5>
                            <span className="text-xs font-bold text-accent">{d.severity}</span>
                          </div>
                          {d.symptoms_match.length > 0 && (
                            <p className="mt-1 text-xs text-primary">
                              Matched symptoms: {d.symptoms_match.join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Card className="flex h-[380px] items-center justify-center border-dashed border-border bg-card/50 text-center p-8">
                  <div className="max-w-md space-y-3">
                    <Activity className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h4 className="text-lg font-semibold text-foreground">
                      Agro-Climatic Disease Modeling
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Select your crop and check any visible symptoms or environmental indicators. The risk engine assesses relative humidity and temperature germination windows to project outbreak probability.
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
