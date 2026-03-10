"use client"

import { 
  Calculator, 
  Calendar, 
  Bell, 
  Droplets, 
  Bug, 
  Leaf, 
  FileText, 
  Users 
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const tools = [
  {
    icon: Calculator,
    title: "Profit Calculator",
    description: "Calculate expected profits based on crop yields, market prices, and input costs",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Calendar,
    title: "Crop Calendar",
    description: "Plan your farming activities with seasonal crop calendars and reminders",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notifications for weather changes, market prices, and farming deadlines",
    color: "bg-chart-3/20 text-chart-3",
  },
  {
    icon: Droplets,
    title: "Irrigation Planner",
    description: "Optimize water usage with smart irrigation scheduling based on weather data",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Bug,
    title: "Pest Detection",
    description: "AI-powered pest and disease identification from crop images",
    color: "bg-chart-5/20 text-chart-5",
  },
  {
    icon: Leaf,
    title: "Fertilizer Guide",
    description: "Get personalized fertilizer recommendations based on soil analysis",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Farm Records",
    description: "Maintain digital records of all farming activities and expenses",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Users,
    title: "Expert Connect",
    description: "Connect with agricultural experts and extension officers for guidance",
    color: "bg-chart-3/20 text-chart-3",
  },
]

export function FarmTools() {
  return (
    <section className="px-4 py-20">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-primary">
            <Leaf className="h-4 w-4" />
            Essential Tools
          </div>
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Everything You Need to Farm Smarter
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Access powerful tools designed to simplify farm management and boost your productivity.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map((tool, index) => {
            const IconComponent = tool.icon
            return (
              <Card
                key={index}
                className="group border-border bg-card transition-all hover:border-primary/50 hover:-translate-y-1 cursor-pointer"
              >
                <CardContent className="p-6">
                  <div className={`mb-4 inline-flex rounded-lg p-3 ${tool.color}`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
