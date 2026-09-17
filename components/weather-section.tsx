"use client"

import { useState, useEffect } from "react"
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Sun,
  CloudRain,
  Cloud,
  AlertTriangle,
  MapPin,
  RefreshCw,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getWeather, WeatherData } from "@/lib/api"

const AGRI_ZONES = [
  { name: "Punjab (Ludhiana Hub)", lat: 30.901, lon: 75.857 },
  { name: "Maharashtra (Nagpur Zone)", lat: 21.145, lon: 79.088 },
  { name: "Karnataka (Dharwad Agri Belt)", lat: 15.458, lon: 75.007 },
  { name: "Uttar Pradesh (Varanasi Plains)", lat: 25.317, lon: 82.973 },
  { name: "Gujarat (Saurashtra Groundnut Hub)", lat: 21.522, lon: 70.457 },
]

export function WeatherSection() {
  const [selectedZone, setSelectedZone] = useState(AGRI_ZONES[0])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadWeather = async (zone: typeof AGRI_ZONES[0]) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getWeather(zone.lat, zone.lon, zone.name)
      setWeather(data)
    } catch (err: any) {
      setError(err.message || "Failed to load meteorological data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWeather(selectedZone)
  }, [selectedZone])

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase()
    if (c.includes("rain") || c.includes("drizzle")) return CloudRain
    if (c.includes("cloud")) return Cloud
    if (c.includes("partly")) return CloudSun
    return Sun
  }

  return (
    <section id="weather" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-primary">
            <CloudSun className="h-4 w-4" />
            Meteorological Agro-Intelligence
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Real-time Weather & Agricultural Advisories
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Synchronized with NASA POWER agro-climatology grids and live forecasting to schedule irrigation, foliar spraying, and pest mitigation.
          </p>

          {/* Agricultural Zone Selector */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Select Farm Region:</span>
            {AGRI_ZONES.map((z) => (
              <Button
                key={z.name}
                variant="outline"
                size="sm"
                onClick={() => setSelectedZone(z)}
                className={`text-xs border-border ${
                  selectedZone.name === z.name
                    ? "border-primary bg-primary/10 text-foreground"
                    : "hover:border-primary/50"
                }`}
              >
                <MapPin className="h-3 w-3 mr-1 text-primary" />
                {z.name.split(" ")[0]}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex h-72 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Fetching satellite agro-weather for {selectedZone.name}...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-semibold">Unable to fetch live weather</p>
            <p className="text-sm mt-1">{error}</p>
            <Button onClick={() => loadWeather(selectedZone)} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : weather ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              {/* Current Weather Card */}
              <Card className="border-border bg-card lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-foreground text-sm font-semibold flex items-center justify-between">
                    <span>Current Conditions</span>
                    <span className="text-[11px] text-muted-foreground">{selectedZone.name.split(" ")[0]}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    {(() => {
                      const IconComp = getWeatherIcon(weather.current.condition)
                      return <IconComp className="mx-auto mb-3 h-16 w-16 text-accent" />
                    })()}
                    <p className="text-5xl font-extrabold text-foreground">
                      {weather.current.temperature}°C
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {weather.current.condition}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Feels like {weather.current.apparent_temperature}°C
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-secondary p-2.5 text-center">
                      <Droplets className="mx-auto mb-1 h-4 w-4 text-primary" />
                      <p className="text-sm font-bold text-foreground">{weather.current.humidity}%</p>
                      <p className="text-[10px] text-muted-foreground">Humidity</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-2.5 text-center">
                      <Wind className="mx-auto mb-1 h-4 w-4 text-primary" />
                      <p className="text-sm font-bold text-foreground">
                        {weather.current.wind_speed_kmh} km/h
                      </p>
                      <p className="text-[10px] text-muted-foreground">Wind</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-2.5 text-center">
                      <Thermometer className="mx-auto mb-1 h-4 w-4 text-accent" />
                      <p className="text-sm font-bold text-foreground">
                        {weather.current.pressure_hpa} hPa
                      </p>
                      <p className="text-[10px] text-muted-foreground">Pressure</p>
                    </div>
                    <div className="rounded-lg bg-secondary p-2.5 text-center">
                      <CloudRain className="mx-auto mb-1 h-4 w-4 text-accent" />
                      <p className="text-sm font-bold text-foreground">
                        {weather.current.precipitation_mm} mm
                      </p>
                      <p className="text-[10px] text-muted-foreground">Rainfall</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 7-Day Forecast & Advisories */}
              <Card className="border-border bg-card lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-foreground text-sm font-semibold flex items-center justify-between">
                    <span>7-Day Agricultural Forecast</span>
                    <span className="text-xs text-muted-foreground font-normal">{weather.source}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Forecast Strip */}
                  <div className="grid grid-cols-7 gap-2">
                    {weather.daily_forecast.map((day, idx) => {
                      const IconComp = getWeatherIcon(day.condition)
                      return (
                        <div
                          key={day.date}
                          className={`rounded-xl p-3 text-center transition-all ${
                            idx === 0
                              ? "border border-primary bg-primary/10 shadow-sm"
                              : "bg-secondary hover:bg-secondary/80"
                          }`}
                        >
                          <p className="mb-1 text-xs font-semibold text-muted-foreground">{day.day}</p>
                          <IconComp className="mx-auto my-2 h-6 w-6 text-accent" />
                          <p className="text-base font-bold text-foreground">{day.temp_max}°</p>
                          <p className="text-[11px] text-muted-foreground">{day.temp_min}°</p>
                          {day.rainfall_mm > 0 && (
                            <p className="text-[10px] font-semibold text-primary mt-1">
                              {day.rainfall_mm}mm
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Agricultural Alerts */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Dynamic Agricultural Advisories
                    </h4>
                    {weather.agricultural_advisories.map((advisory, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-3 text-xs flex items-start gap-2.5 ${
                          advisory.status === "Warning"
                            ? "border-accent/50 bg-accent/10 text-accent"
                            : advisory.status === "Advisory"
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border bg-secondary/50 text-foreground"
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-semibold">{advisory.category}: </strong>
                          <span>{advisory.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hourly Breakdown */}
            {weather.hourly_forecast.length > 0 && (
              <Card className="border-border bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Next 12 Hours Farm Weather
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {weather.hourly_forecast.map((h, i) => {
                      const IconComp = getWeatherIcon(h.condition)
                      return (
                        <div
                          key={i}
                          className="flex min-w-[85px] flex-col items-center rounded-xl bg-secondary p-3 text-center"
                        >
                          <p className="text-xs text-muted-foreground">{h.time}</p>
                          <IconComp className="my-2 h-5 w-5 text-accent" />
                          <p className="text-sm font-bold text-foreground">{h.temperature}°C</p>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            💧 {h.humidity}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </section>
  )
}
