"use client"

import { useState } from "react"
import { MapPin, Truck, Clock, Fuel, Navigation, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const sampleRoutes = [
  {
    id: 1,
    from: "Green Valley Farm",
    to: "City Central Market",
    distance: "45 km",
    duration: "52 min",
    fuelCost: "$12.50",
    status: "optimal",
    stops: ["Collection Point A", "Highway Junction"],
  },
  {
    id: 2,
    from: "Sunrise Orchards",
    to: "Fresh Foods Warehouse",
    distance: "78 km",
    duration: "1h 15min",
    fuelCost: "$22.00",
    status: "moderate",
    stops: ["Packaging Unit", "Cold Storage"],
  },
  {
    id: 3,
    from: "Highland Dairy",
    to: "Metro Distribution Center",
    distance: "32 km",
    duration: "38 min",
    fuelCost: "$9.20",
    status: "optimal",
    stops: ["Quality Check"],
  },
]

export function TransportationRoutes() {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")

  return (
    <section id="routes" className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-primary">
            <Truck className="h-4 w-4" />
            Transportation Routes
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Optimize Your Delivery Routes
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Plan efficient routes from farm to market. Save fuel, time, and ensure fresh delivery of your produce.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Route Planner */}
          <Card className="lg:col-span-1 border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Navigation className="h-5 w-5 text-primary" />
                Route Planner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Origin</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary" />
                  <Input
                    placeholder="Enter pickup location"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="pl-10 bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
                  <Input
                    placeholder="Enter drop-off location"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="pl-10 bg-secondary border-border text-foreground"
                  />
                </div>
              </div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Calculate Route
              </Button>

              <div className="mt-6 rounded-lg border border-border bg-secondary/50 p-4">
                <h4 className="mb-3 text-sm font-medium text-foreground">Quick Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Routes</span>
                    <span className="font-medium text-foreground">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vehicles in Transit</span>
                    <span className="font-medium text-foreground">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Distance Today</span>
                    <span className="font-medium text-foreground">342 km</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Map Placeholder */}
          <Card className="lg:col-span-2 border-border bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="relative h-[400px] bg-secondary/30">
                {/* Simulated Map */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-full w-full">
                    {/* Grid lines */}
                    <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Route lines */}
                      <path d="M 100 300 Q 200 200 300 250 T 500 150" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeDasharray="8,4" className="animate-pulse"/>
                      <path d="M 150 350 Q 250 280 400 300 T 600 200" stroke="hsl(var(--accent))" strokeWidth="2" fill="none" opacity="0.6"/>
                      
                      {/* Location markers */}
                      <circle cx="100" cy="300" r="8" fill="hsl(var(--primary))" />
                      <circle cx="500" cy="150" r="8" fill="hsl(var(--accent))" />
                      <circle cx="300" cy="250" r="5" fill="hsl(var(--muted-foreground))" />
                    </svg>
                    
                    {/* Labels */}
                    <div className="absolute left-[80px] top-[310px] rounded bg-primary px-2 py-1 text-xs text-primary-foreground">
                      Farm
                    </div>
                    <div className="absolute right-[120px] top-[130px] rounded bg-accent px-2 py-1 text-xs text-accent-foreground">
                      Market
                    </div>
                  </div>
                </div>
                
                {/* Map controls */}
                <div className="absolute right-4 top-4 flex flex-col gap-2">
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-card border border-border">
                    <span className="text-lg">+</span>
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-card border border-border">
                    <span className="text-lg">-</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Route List */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Recent Routes</h3>
          {sampleRoutes.map((route) => (
            <Card key={route.id} className="border-border bg-card transition-all hover:border-primary/50">
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${route.status === 'optimal' ? 'bg-primary/10' : 'bg-accent/10'}`}>
                      <Truck className={`h-5 w-5 ${route.status === 'optimal' ? 'text-primary' : 'text-accent'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <span className="font-medium">{route.from}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{route.to}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Via: {route.stops.join(" → ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{route.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{route.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Fuel className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{route.fuelCost}</span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      route.status === 'optimal' 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {route.status === 'optimal' ? 'Optimal' : 'Moderate'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
