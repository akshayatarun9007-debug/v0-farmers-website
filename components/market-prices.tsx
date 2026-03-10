"use client"

import { TrendingUp, TrendingDown, ArrowRight, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const priceHistory = [
  { date: "Jan", wheat: 320, rice: 450, corn: 280, soybean: 520 },
  { date: "Feb", wheat: 335, rice: 440, corn: 295, soybean: 510 },
  { date: "Mar", wheat: 350, rice: 460, corn: 310, soybean: 540 },
  { date: "Apr", wheat: 340, rice: 475, corn: 305, soybean: 555 },
  { date: "May", wheat: 365, rice: 490, corn: 320, soybean: 570 },
  { date: "Jun", wheat: 380, rice: 485, corn: 335, soybean: 585 },
]

const currentPrices = [
  { crop: "Wheat", price: 380, change: 4.2, unit: "per quintal", trend: "up" },
  { crop: "Rice", price: 485, change: -1.0, unit: "per quintal", trend: "down" },
  { crop: "Corn", price: 335, change: 4.7, unit: "per quintal", trend: "up" },
  { crop: "Soybean", price: 585, change: 2.6, unit: "per quintal", trend: "up" },
  { crop: "Cotton", price: 720, change: -2.1, unit: "per quintal", trend: "down" },
  { crop: "Sugarcane", price: 295, change: 1.8, unit: "per quintal", trend: "up" },
]

const nearbyMarkets = [
  { name: "Central Mandi", distance: "12 km", bestPrice: "Wheat - $385", timing: "6 AM - 6 PM" },
  { name: "Farmers Market Hub", distance: "25 km", bestPrice: "Rice - $495", timing: "5 AM - 8 PM" },
  { name: "Agricultural Trade Center", distance: "35 km", bestPrice: "Soybean - $590", timing: "7 AM - 5 PM" },
]

export function MarketPrices() {
  return (
    <section id="market" className="bg-secondary/30 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-primary">
            <BarChart3 className="h-4 w-4" />
            Market Intelligence
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Live Market Prices
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Stay updated with real-time crop prices from mandis and markets. Make the best selling decisions with price trends and predictions.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Price Chart */}
          <Card className="lg:col-span-2 border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Price Trends (6 Months)</CardTitle>
              <div className="flex gap-2">
                {["Wheat", "Rice", "Corn"].map((crop) => (
                  <Button key={crop} variant="outline" size="sm" className="border-border text-foreground text-xs">
                    {crop}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="wheat"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rice"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="corn"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--chart-3))", strokeWidth: 2 }}
                    />
                  </LineChart>
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
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-chart-3" />
                  <span className="text-sm text-muted-foreground">Corn</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Nearby Markets */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Nearby Markets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {nearbyMarkets.map((market, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-secondary/50 p-4 transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{market.name}</h4>
                      <p className="text-sm text-muted-foreground">{market.distance}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-primary">{market.bestPrice}</span>
                    <span className="text-muted-foreground">{market.timing}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-border text-foreground">
                View All Markets
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Current Prices Grid */}
        <div className="mt-8">
          <h3 className="mb-6 text-lg font-semibold text-foreground">Current Market Prices</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentPrices.map((item) => (
              <Card key={item.crop} className="border-border bg-card transition-all hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{item.crop}</p>
                      <p className="text-3xl font-bold text-foreground">${item.price}</p>
                      <p className="text-xs text-muted-foreground">{item.unit}</p>
                    </div>
                    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-sm ${
                      item.trend === "up" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {item.trend === "up" ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>{Math.abs(item.change)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${item.trend === "up" ? "bg-primary" : "bg-destructive"}`}
                      style={{ width: `${Math.min(Math.abs(item.change) * 15, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
