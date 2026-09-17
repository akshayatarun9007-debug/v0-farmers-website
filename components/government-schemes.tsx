"use client"

import { useState, useEffect } from "react"
import {
  Landmark,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getGovernmentSchemes, GovernmentScheme } from "@/lib/api"

const CATEGORIES = [
  "All",
  "Direct Income Support",
  "Crop Insurance",
  "Agricultural Credit",
  "Soil & Nutrient Management",
  "Irrigation & Water Conservation",
  "Organic Farming & Soil Health",
  "Debt Relief",
]

const STATES = [
  "All",
  "Central",
  "Maharashtra",
  "Telangana",
  "Punjab",
  "Uttar Pradesh",
  "Madhya Pradesh",
]

export function GovernmentSchemes() {
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedState, setSelectedState] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  const loadSchemes = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getGovernmentSchemes(
        selectedState === "All" ? undefined : selectedState,
        selectedCategory === "All" ? undefined : selectedCategory,
        searchQuery || undefined
      )
      setSchemes(data)
    } catch (err: any) {
      setError(err.message || "Failed to load government agricultural schemes.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSchemes()
  }, [selectedCategory, selectedState])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadSchemes()
  }

  return (
    <section id="schemes" className="bg-secondary/20 px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-primary">
            <Landmark className="h-4 w-4" />
            Institutional Support & Subsidies
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Government Agricultural Schemes
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Official, verified financial assistance, crop insurance subsidies, and institutional credit schemes provided by the Ministry of Agriculture & Farmers Welfare, GoI and State Departments.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-12">
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search scheme name, eligibility, or benefits..."
                className="pl-10 border-border bg-secondary"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              >
                {STATES.map((s) => (
                  <option key={s} value={s}>{s} Schemes</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <Button type="submit" className="w-full bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Schemes Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Fetching verified government schemes...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 text-center text-destructive">
            <p className="font-semibold">Unable to fetch schemes</p>
            <p className="text-sm mt-1">{error}</p>
            <Button onClick={loadSchemes} variant="outline" className="mt-4">
              Try Again
            </Button>
          </div>
        ) : schemes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No schemes matching your search or filters.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => (
              <Card
                key={scheme.id}
                className="flex flex-col justify-between border-border bg-card transition-all hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      {scheme.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground border border-border rounded px-2 py-0.5">
                      {scheme.level}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-lg font-bold text-foreground">
                    {scheme.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 text-xs">
                    {scheme.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="font-semibold text-primary mb-1">Benefits:</p>
                    <p className="text-muted-foreground line-clamp-3">{scheme.benefits}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Eligibility:</p>
                    <p className="text-muted-foreground line-clamp-2">{scheme.eligibility}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span>Verified: {scheme.last_verified}</span>
                    {scheme.application_url && (
                      <a
                        href={scheme.application_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        Official Portal
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
