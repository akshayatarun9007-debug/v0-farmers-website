import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { TransportationRoutes } from "@/components/transportation-routes"
import { CropPrediction } from "@/components/crop-prediction"
import { WeatherSection } from "@/components/weather-section"
import { MarketPrices } from "@/components/market-prices"
import { FarmTools } from "@/components/farm-tools"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TransportationRoutes />
        <CropPrediction />
        <WeatherSection />
        <MarketPrices />
        <FarmTools />
      </main>
      <Footer />
    </div>
  )
}
