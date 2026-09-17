"use client"

import { useState, useEffect } from "react"
import {
  MapPin,
  Truck,
  Clock,
  Fuel,
  Navigation,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  IndianRupee,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getRoute, RouteResponse } from "@/lib/api"

const POPULAR_CORRIDORS = [
  {
    name: "Nashik Onion Farm → Mumbai Vashi APMC",
    origin_name: "Nashik Onion Belt",
    origin_lat: 19.997,
    origin_lon: 73.789,
    dest_name: "Mumbai Vashi APMC Mandi",
    dest_lat: 19.076,
    dest_lon: 72.877,
    crop: "Onion",
  },
  {
    name: "Abohar Kinnow Farm → Delhi Azadpur Mandi",
    origin_name: "Abohar Orchards, Punjab",
    origin_lat: 30.145,
    origin_lon: 74.199,
    dest_name: "Delhi Azadpur Mandi",
    dest_lat: 28.718,
    dest_lon: 77.177,
    crop: "Kinnow / Wheat",
  },
  {
    name: "Guntur Chilli Farm → Hyderabad Malakpet",
    origin_name: "Guntur Chilli Belt, AP",
    origin_lat: 16.306,
    origin_lon: 80.436,
    dest_name: "Hyderabad Malakpet Mandi",
    dest_lat: 17.375,
    dest_lon: 78.490,
    crop: "Red Chilli",
  },
  {
    name: "Kolhapur Sugarcane → Pune Market Yard",
    origin_name: "Kolhapur Farm, MH",
    origin_lat: 16.705,
    origin_lon: 74.243,
    dest_name: "Pune Gultekdi Market Yard",
    dest_lat: 18.495,
    dest_lon: 73.868,
    crop: "Sugarcane / Jaggery",
  },
]

export function TransportationRoutes() {
  const [selectedCorridor, setSelectedCorridor] = useState(POPULAR_CORRIDORS[0])
  const [originName, setOriginName] = useState(POPULAR_CORRIDORS[0].origin_name)
  const [originLat, setOriginLat] = useState(POPULAR_CORRIDORS[0].origin_lat.toString())
  const [originLon, setOriginLon] = useState(POPULAR_CORRIDORS[0].origin_lon.toString())

  const [destName, setDestName] = useState(POPULAR_CORRIDORS[0].dest_name)
  const [destLat, setDestLat] = useState(POPULAR_CORRIDORS[0].dest_lat.toString())
  const [destLon, setDestLon] = useState(POPULAR_CORRIDORS[0].dest_lon.toString())

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCalculateRoute = async (
    oLat: number,
    oLon: number,
    dLat: number,
    dLon: number,
    oName: string,
    dName: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getRoute(oLat, oLon, dLat, dLon, oName, dName)
      setRouteResult(res)
    } catch (err: any) {
      setError(err.message || "Failed to calculate road route.")
    } finally {
      setLoading(false)
    }
  }

  // Load initial default route on mount
  useEffect(() => {
    handleCalculateRoute(
      selectedCorridor.origin_lat,
      selectedCorridor.origin_lon,
      selectedCorridor.dest_lat,
      selectedCorridor.dest_lon,
      selectedCorridor.origin_name,
      selectedCorridor.dest_name
    )
  }, [])

  const handleSelectCorridor = (c: typeof POPULAR_CORRIDORS[0]) => {
    setSelectedCorridor(c)
    setOriginName(c.origin_name)
    setOriginLat(c.origin_lat.toString())
    setOriginLon(c.origin_lon.toString())
    setDestName(c.dest_name)
    setDestLat(c.dest_lat.toString())
    setDestLon(c.dest_lon.toString())

    handleCalculateRoute(c.origin_lat, c.origin_lon, c.dest_lat, c.dest_lon, c.origin_name, c.dest_name)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCalculateRoute(
      parseFloat(originLat) || 19.997,
      parseFloat(originLon) || 73.789,
      parseFloat(destLat) || 19.076,
      parseFloat(destLon) || 72.877,
      originName,
      destName
    )
  }

  return (
    <section id="routes" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-primary">
            <Truck className="h-4 w-4" />
            Farm-to-Market Logistics Engine
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Transport Route & Freight Optimizer
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Compute true road mileage, travel duration, diesel fuel requirements, and freight costs from harvest gate to major Indian APMC Mandis using OpenStreetMap OSRM routing.
          </p>

          {/* Quick Corridor Selection */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-1">Major Mandi Corridors:</span>
            {POPULAR_CORRIDORS.map((c) => (
              <Button
                key={c.name}
                variant="outline"
                size="sm"
                onClick={() => handleSelectCorridor(c)}
                className={`text-xs border-border ${
                  selectedCorridor.name === c.name
                    ? "border-primary bg-primary/10 text-foreground"
                    : "hover:border-primary/50"
                }`}
              >
                {c.origin_name.split(" ")[0]} → {c.dest_name.split(" ")[0]} ({c.crop})
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Route Form */}
          <Card className="border-border bg-card lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Navigation className="h-5 w-5 text-primary" />
                Route Waypoints
              </CardTitle>
              <CardDescription>
                Input GPS coordinates or customize the harvest origin and destination mandi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Farm Origin Label</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                    <Input
                      value={originName}
                      onChange={(e) => setOriginName(e.target.value)}
                      placeholder="Origin Farm location"
                      className="pl-10 border-border bg-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground">Origin Lat</label>
                    <Input
                      value={originLat}
                      onChange={(e) => setOriginLat(e.target.value)}
                      className="border-border bg-secondary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Origin Lon</label>
                    <Input
                      value={originLon}
                      onChange={(e) => setOriginLon(e.target.value)}
                      className="border-border bg-secondary text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Destination Mandi</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                    <Input
                      value={destName}
                      onChange={(e) => setDestName(e.target.value)}
                      placeholder="Destination Mandi / Market"
                      className="pl-10 border-border bg-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-muted-foreground">Dest Lat</label>
                    <Input
                      value={destLat}
                      onChange={(e) => setDestLat(e.target.value)}
                      className="border-border bg-secondary text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground">Dest Lon</label>
                    <Input
                      value={destLon}
                      onChange={(e) => setDestLon(e.target.value)}
                      className="border-border bg-secondary text-xs"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Computing Road Network...
                    </>
                  ) : (
                    <>
                      <Navigation className="mr-2 h-4 w-4" />
                      Calculate OSRM Route
                    </>
                  )}
                </Button>
              </form>

              {/* Economic Summary */}
              {routeResult && (
                <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Agricultural Transport Economics
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-card p-3 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Fuel className="h-3.5 w-3.5 text-primary" />
                        Diesel Required
                      </div>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {routeResult.estimated_fuel_litres} Litres
                      </p>
                      <p className="text-[10px] text-muted-foreground">~8.5 km/L truck average</p>
                    </div>

                    <div className="rounded-lg bg-card p-3 border border-border">
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <IndianRupee className="h-3.5 w-3.5 text-accent" />
                        Freight Estimate
                      </div>
                      <p className="mt-1 text-lg font-bold text-accent">
                        ₹{routeResult.estimated_transport_cost_inr.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Fuel + base driver toll</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map & Steps Visualization */}
          <div className="space-y-6 lg:col-span-7">
            {routeResult ? (
              <>
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="border-border bg-card p-4 text-center">
                    <span className="text-xs text-muted-foreground">Total Distance</span>
                    <p className="text-2xl font-bold text-primary mt-1">
                      {routeResult.distance_km} km
                    </p>
                  </Card>
                  <Card className="border-border bg-card p-4 text-center">
                    <span className="text-xs text-muted-foreground">Driving Duration</span>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {routeResult.duration_formatted}
                    </p>
                  </Card>
                  <Card className="border-border bg-card p-4 text-center">
                    <span className="text-xs text-muted-foreground">Engine</span>
                    <p className="text-xs font-semibold text-accent mt-2 line-clamp-1">
                      {routeResult.routing_engine.split(" ")[0]} OSRM
                    </p>
                  </Card>
                </div>

                {/* SVG Visual Road Map */}
                <Card className="border-border bg-card overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-[260px] bg-secondary/30 flex items-center justify-center">
                      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="route-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#route-grid)" />

                        {/* Curved Road Highway Path */}
                        <path
                          d="M 80 190 Q 220 70 380 150 T 640 100"
                          stroke="hsl(var(--primary))"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray="8,6"
                          className="animate-pulse"
                        />

                        {/* Markers */}
                        <circle cx="80" cy="190" r="10" fill="hsl(var(--primary))" />
                        <circle cx="80" cy="190" r="4" fill="hsl(var(--primary-foreground))" />

                        <circle cx="640" cy="100" r="10" fill="hsl(var(--accent))" />
                        <circle cx="640" cy="100" r="4" fill="hsl(var(--accent-foreground))" />

                        <circle cx="380" cy="150" r="6" fill="hsl(var(--border))" />
                      </svg>

                      {/* Overlaid Badges */}
                      <div className="absolute left-6 top-6 rounded-lg bg-card/90 border border-border px-3 py-1.5 shadow-sm">
                        <p className="text-[10px] text-muted-foreground">Origin</p>
                        <p className="text-xs font-semibold text-primary">{routeResult.origin_name}</p>
                      </div>

                      <div className="absolute right-6 bottom-6 rounded-lg bg-card/90 border border-border px-3 py-1.5 shadow-sm text-right">
                        <p className="text-[10px] text-muted-foreground">Destination Market</p>
                        <p className="text-xs font-semibold text-accent">{routeResult.destination_name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Turn-by-Turn Waypoints */}
                {routeResult.waypoints.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-foreground">
                        Turn-by-Turn Navigation Waypoints
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {routeResult.waypoints.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b border-border/50 pb-2 text-xs last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded bg-secondary text-[10px] font-bold text-foreground">
                              {idx + 1}
                            </span>
                            <span className="text-foreground">{step.instruction}</span>
                          </div>
                          {step.distance_meters > 0 && (
                            <span className="text-muted-foreground">
                              {(step.distance_meters / 1000).toFixed(1)} km
                            </span>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="flex h-[380px] items-center justify-center border-dashed border-border bg-card/50 text-center p-8">
                <div className="max-w-md space-y-3">
                  <Truck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h4 className="text-lg font-semibold text-foreground">
                    Calculating Highway Route
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Connecting to OSRM road server...
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
