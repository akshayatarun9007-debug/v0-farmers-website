"use client"

import { useState } from "react"
import { Sprout, TrendingUp, Droplets, Thermometer, Calendar, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

const yieldData = [
  { month: "Jan", wheat: 0, rice: 0, corn: 0 },
  { month: "Feb", wheat: 10, rice: 5, corn: 8 },
  { month: "Mar", wheat: 25, rice: 15, corn: 20 },
  { month: "Apr", wheat: 45, rice: 35, corn: 40 },
  { month: "May", wheat: 70, rice: 55, corn: 65 },
  { month: "Jun", wheat: 85, rice: 75, corn: 80 },
  { month: "Jul", wheat: 95, rice: 90, corn: 88 },
  { month: "Aug", wheat: 100, rice: 95, corn: 92 },
]

const soilData = [
  { parameter: "pH", value: 6.5, optimal: "6.0-7.0" },
  { parameter: "Nitrogen", value: 85, optimal: "80-100" },
  { parameter: "Phosphorus", value: 45, optimal: "40-60" },
  { parameter: "Potassium", value: 72, optimal: "70-90" },
]

const cropRecommendations = [
  { crop: "Wheat", suitability: 92, season: "Winter", yield: "4.2 tons/ha" },
  { crop: "Rice", suitability: 88, season: "Monsoon", yield: "5.8 tons/ha" },
  { crop: "Corn", suitability: 85, season: "Summer", yield: "3.9 tons/ha" },
  { crop: "Soybean", suitability: 78, season: "Summer", yield: "2.4 tons/ha" },
]

export function CropPrediction() {
  const [selectedCrop, setSelectedCrop] = useState("wheat")

  return (
    <section id="prediction" className="bg-secondary/30 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-primary">
            <Sprout className="h-4 w-4" />
            AI-Powered Predictions
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Crop Yield Prediction
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Leverage machine learning to predict crop yields, get recommendations, and optimize your planting strategy.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Yield Chart */}
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Yield Prediction Timeline</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 border-border text-foreground">
                  <Calendar className="h-4 w-4" />
                  2024
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={yieldData}>
                    <defs>
                      <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wheat"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorWheat)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="rice"
                      stroke="hsl(var(--accent))"
                      fillOpacity={1}
                      fill="url(#colorRice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Wheat</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Rice</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Soil Analysis */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Droplets className="h-5 w-5 text-primary" />
                Soil Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {soilData.map((item) => (
                  <div key={item.parameter} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.parameter}</span>
                      <span className="font-medium text-foreground">
                        {typeof item.value === "number" ? `${item.value}%` : item.value}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${typeof item.value === "number" ? item.value : 65}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Optimal: {item.optimal}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Crop Recommendations */}
        <div className="mt-8">
          <h3 className="mb-6 text-lg font-semibold text-foreground">AI Crop Recommendations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cropRecommendations.map((crop) => (
              <Card
                key={crop.crop}
                className="border-border bg-card transition-all hover:border-primary/50 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Sprout className="h-6 w-6 text-primary" />
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-primary">{crop.suitability}%</span>
                      <p className="text-xs text-muted-foreground">Suitability</p>
                    </div>
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-foreground">{crop.crop}</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Season</span>
                      <span className="text-foreground">{crop.season}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Yield</span>
                      <span className="text-foreground">{crop.yield}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${crop.suitability}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Prediction Form */}
        <Card className="mt-8 border-border bg-card">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Crop Type</label>
                <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground">
                  <option>Wheat</option>
                  <option>Rice</option>
                  <option>Corn</option>
                  <option>Soybean</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Field Size (ha)</label>
                <input
                  type="number"
                  placeholder="Enter field size"
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Irrigation Type</label>
                <select className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-foreground">
                  <option>Drip</option>
                  <option>Sprinkler</option>
                  <option>Flood</option>
                  <option>Rainfed</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Predict Yield
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
