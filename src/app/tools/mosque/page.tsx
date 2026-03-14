"use client"

import { useState, useCallback } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Navigation, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Dynamically import the map to avoid SSR issues with Leaflet
const MosqueMap = dynamic(() => import("@/components/mosque-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center space-y-4 animate-pulse rounded-[3rem]">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary/40 uppercase tracking-widest">Initializing Map...</p>
    </div>
  ),
})

const cities = [
  { name: "Current Location", coords: null },
  { name: "Dhaka", coords: [23.8103, 90.4125] as [number, number] },
  { name: "Chittagong", coords: [22.3569, 91.7832] as [number, number] },
  { name: "Sylhet", coords: [24.8949, 91.8687] as [number, number] },
  { name: "Rajshahi", coords: [24.3745, 88.6042] as [number, number] },
  { name: "Khulna", coords: [22.8456, 89.5403] as [number, number] },
]

export default function MosqueFinder() {
  const [mapConfig, setMapConfig] = useState<{ center: [number, number]; zoom: number }>({
    center: [23.8103, 90.4125], // Default to Dhaka
    zoom: 13,
  })
  const [selectedCity, setSelectedCity] = useState("Dhaka")

  const handleCitySelect = (city: typeof cities[0]) => {
    setSelectedCity(city.name)
    if (city.coords) {
      setMapConfig({ center: city.coords, zoom: 14 })
    } else {
      // Re-trigger geolocation if possible
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          setMapConfig({ center: [pos.coords.latitude, pos.coords.longitude], zoom: 15 })
        })
      }
    }
  }

  const handleLocationFound = useCallback((location: [number, number]) => {
    setMapConfig({ center: location, zoom: 15 })
    setSelectedCity("Current Location")
  }, [])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Globe className="w-4 h-4" />
              <span>Real-time Mosque Discovery</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Mosque Finder</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl">
              Locate mosques near you across Bangladesh using open-source community mapping data.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">Navigate to city</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <Button
                  key={city.name}
                  variant={selectedCity === city.name ? "default" : "outline"}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "rounded-2xl h-12 px-6 font-bold transition-all",
                    selectedCity === city.name 
                      ? "emerald-gradient text-white border-none shadow-lg scale-105" 
                      : "border-primary/10 text-primary hover:bg-primary/5"
                  )}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  {city.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Info Section */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
              <CardHeader className="p-10 pb-6 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Navigation className="w-6 h-6 text-secondary" />
                  How it works
                </CardTitle>
              </CardHeader>
              <CardContent className="p-10 space-y-8">
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center text-white shrink-0 shadow-md">1</div>
                    <div>
                      <h4 className="font-black text-primary text-lg">Grant Access</h4>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed">Enable browser location to see mosques immediately around you.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center text-white shrink-0 shadow-md">2</div>
                    <div>
                      <h4 className="font-black text-primary text-lg">Explore the Map</h4>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed">Drag the map or choose a city. The database refreshes automatically.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center text-white shrink-0 shadow-md">3</div>
                    <div>
                      <h4 className="font-black text-primary text-lg">Find Directions</h4>
                      <p className="text-muted-foreground font-medium text-sm leading-relaxed">Click any mosque icon to view details and navigate via Google Maps.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-primary/5">
                  <div className="glass-card p-6 rounded-3xl border-secondary/20 bg-secondary/5">
                    <div className="flex items-center gap-3 text-secondary font-black mb-2">
                      <Globe className="w-5 h-5" />
                      Open Data
                    </div>
                    <p className="text-xs text-primary/60 font-bold leading-relaxed">
                      Powered by OpenStreetMap and Overpass API. Data is community-maintained and reflects verified Islamic places of worship in Bangladesh.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button className="w-full h-16 rounded-[2rem] gold-gradient text-white font-black text-xl shadow-xl hover:scale-[1.02] transition-transform" asChild>
              <a href="https://www.openstreetmap.org/edit#map=15" target="_blank">
                Contribute a Mosque <ChevronRight className="ml-2 w-6 h-6" />
              </a>
            </Button>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-8 min-h-[600px] lg:min-h-[800px] relative animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-8 border-white bg-slate-50">
              <MosqueMap 
                center={mapConfig.center} 
                zoom={mapConfig.zoom} 
                onLocationFound={handleLocationFound} 
              />
            </div>
            
            {/* Map Overlay Details */}
            <div className="absolute bottom-10 left-10 glass-card p-6 rounded-[2rem] border-white/40 shadow-2xl pointer-events-none hidden md:block">
              <h3 className="font-black text-2xl text-primary">Interactive Map</h3>
              <p className="text-sm text-muted-foreground font-bold mt-2">Discovering mosques in <span className="text-secondary">{selectedCity}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
