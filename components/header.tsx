"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Leaf, Bell, User, Cpu } from "lucide-react"
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
          <div>
            <span className="text-xl font-bold text-foreground">FarmFlow</span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-primary uppercase tracking-wider bg-primary/10 border border-primary/20 rounded px-1.5 py-0.5">
              AI Powered
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="#dashboard" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <Link href="#prediction" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Crop Decision
          </Link>
          <Link href="#disease" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Disease Lab
          </Link>
          <Link href="#routes" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Routes & Freight
          </Link>
          <Link href="#weather" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Agro Weather
          </Link>
          <Link href="#schemes" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Govt Schemes
          </Link>
          <Link href="#market" className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            Mandi Prices
          </Link>
        </nav>

        <div className="hidden items-center gap-3 sm:flex">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const el = document.getElementById("prediction")
              el?.scrollIntoView({ behavior: "smooth" })
            }}
            className="border-primary/40 text-xs text-primary hover:bg-primary/10"
          >
            Predict Yield
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const el = document.getElementById("disease")
              el?.scrollIntoView({ behavior: "smooth" })
            }}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
          >
            Scan Leaf
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border bg-background p-4 lg:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="#dashboard" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Dashboard</Link>
            <Link href="#prediction" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Crop Decision</Link>
            <Link href="#disease" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Disease Lab</Link>
            <Link href="#routes" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Routes & Freight</Link>
            <Link href="#weather" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Agro Weather</Link>
            <Link href="#schemes" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Govt Schemes</Link>
            <Link href="#market" onClick={() => setIsMenuOpen(false)} className="text-sm font-medium text-muted-foreground">Mandi Prices</Link>
          </nav>
        </div>
      )}
    </header>
  )
}
