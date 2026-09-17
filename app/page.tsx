import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FarmerDashboard } from "@/components/farmer-dashboard"
import { CropPrediction } from "@/components/crop-prediction"
import { DiseaseDetection } from "@/components/disease-detection"
import { TransportationRoutes } from "@/components/transportation-routes"
import { WeatherSection } from "@/components/weather-section"
import { GovernmentSchemes } from "@/components/government-schemes"
import { MarketPrices } from "@/components/market-prices"
import { FarmTools } from "@/components/farm-tools"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FarmerDashboard />
        <CropPrediction />
        <DiseaseDetection />
        <TransportationRoutes />
        <WeatherSection />
        <GovernmentSchemes />
        <MarketPrices />
        <FarmTools />
      </main>
      <Footer />
    </div>
  )
}
