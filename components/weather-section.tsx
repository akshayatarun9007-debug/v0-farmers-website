"use client"

import { CloudSun, Droplets, Wind, Thermometer, Sun, CloudRain, Cloud, Snowflake } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const weeklyForecast = [
  { day: "Mon", icon: Sun, temp: 28, condition: "Sunny", humidity: 45 },
  { day: "Tue", icon: CloudSun, temp: 26, condition: "Partly Cloudy", humidity: 52 },
  { day: "Wed", icon: Cloud, temp: 24, condition: "Cloudy", humidity: 58 },
  { day: "Thu", icon: CloudRain, temp: 22, condition: "Rain", humidity: 75 },
  { day: "Fri", icon: CloudRain, temp: 20, condition: "Heavy Rain", humidity: 85 },
  { day: "Sat", icon: CloudSun, temp: 23, condition: "Partly Cloudy", humidity: 60 },
  { day: "Sun", icon: Sun, temp: 27, condition: "Sunny", humidity: 48 },
]

const agriculturalAlerts = [
  { type: "warning", message: "Heavy rainfall expected Thursday - Consider delaying irrigation" },
  { type: "info", message: "Ideal conditions for wheat harvesting on Monday-Tuesday" },
  { type: "warning", message: "High humidity may increase pest activity - Monitor crops closely" },
]

export function WeatherSection() {
  return (
    <section id="weather" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-primary">
            <CloudSun className="h-4 w-4" />
            Weather Monitoring
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Real-time Weather Data
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Make informed farming decisions with accurate weather forecasts and agricultural alerts tailored for your region.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Current Weather */}
          <Card className="lg:col-span-1 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Current Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <Sun className="mx-auto mb-4 h-20 w-20 text-accent" />
                <p className="text-5xl font-bold text-foreground">28°C</p>
                <p className="mt-2 text-lg text-muted-foreground">Sunny</p>
                <p className="text-sm text-muted-foreground">Feels like 30°C</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Droplets className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-lg font-semibold text-foreground">45%</p>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Wind className="mx-auto mb-1 h-5 w-5 text-primary" />
                  <p className="text-lg font-semibold text-foreground">12 km/h</p>
                  <p className="text-xs text-muted-foreground">Wind</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Thermometer className="mx-auto mb-1 h-5 w-5 text-accent" />
                  <p className="text-lg font-semibold text-foreground">1015 hPa</p>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                </div>
                <div className="rounded-lg bg-secondary p-3 text-center">
                  <Sun className="mx-auto mb-1 h-5 w-5 text-accent" />
                  <p className="text-lg font-semibold text-foreground">8</p>
                  <p className="text-xs text-muted-foreground">UV Index</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Forecast */}
          <Card className="lg:col-span-3 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weeklyForecast.map((day, index) => {
                  const IconComponent = day.icon
                  return (
                    <div
                      key={day.day}
                      className={`rounded-lg p-4 text-center transition-all ${
                        index === 0 ? "bg-primary/10 border border-primary" : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <p className="mb-2 text-sm font-medium text-muted-foreground">{day.day}</p>
                      <IconComponent className={`mx-auto mb-2 h-8 w-8 ${
                        day.condition.includes("Rain") ? "text-blue-400" : "text-accent"
                      }`} />
                      <p className="text-xl font-bold text-foreground">{day.temp}°</p>
                      <p className="mt-1 text-xs text-muted-foreground">{day.humidity}%</p>
                    </div>
                  )
                })}
              </div>

              {/* Agricultural Alerts */}
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Agricultural Alerts</h4>
                {agriculturalAlerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`rounded-lg border p-3 ${
                      alert.type === "warning"
                        ? "border-accent/50 bg-accent/10"
                        : "border-primary/50 bg-primary/10"
                    }`}
                  >
                    <p className={`text-sm ${
                      alert.type === "warning" ? "text-accent" : "text-primary"
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Breakdown */}
        <Card className="mt-6 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Today&apos;s Hourly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = 6 + i
                const temp = 20 + Math.sin(i / 2) * 8
                const isNow = hour === 14
                return (
                  <div
                    key={i}
                    className={`flex min-w-[80px] flex-col items-center rounded-lg p-3 ${
                      isNow ? "bg-primary/10 border border-primary" : "bg-secondary"
                    }`}
                  >
                    <p className="text-sm text-muted-foreground">
                      {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                    </p>
                    {hour < 8 || hour > 18 ? (
                      <Cloud className="my-2 h-6 w-6 text-muted-foreground" />
                    ) : hour > 10 && hour < 16 ? (
                      <Sun className="my-2 h-6 w-6 text-accent" />
                    ) : (
                      <CloudSun className="my-2 h-6 w-6 text-accent" />
                    )}
                    <p className="font-semibold text-foreground">{Math.round(temp)}°</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
