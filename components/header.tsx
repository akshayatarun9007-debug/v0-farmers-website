"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Leaf, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">FarmFlow</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="#dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="#routes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Routes
          </Link>
          <Link href="#prediction" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Crop Prediction
          </Link>
          <Link href="#weather" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Weather
          </Link>
          <Link href="#market" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Market Prices
          </Link>
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Get Started
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="#dashboard" className="text-sm font-medium text-muted-foreground">Dashboard</Link>
            <Link href="#routes" className="text-sm font-medium text-muted-foreground">Routes</Link>
            <Link href="#prediction" className="text-sm font-medium text-muted-foreground">Crop Prediction</Link>
            <Link href="#weather" className="text-sm font-medium text-muted-foreground">Weather</Link>
            <Link href="#market" className="text-sm font-medium text-muted-foreground">Market Prices</Link>
            <Button className="mt-2 w-full bg-primary text-primary-foreground">Get Started</Button>
          </nav>
        </div>
      )}
    </header>
  )
}
