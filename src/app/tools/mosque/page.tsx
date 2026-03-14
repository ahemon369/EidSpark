
"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Navigation, Clock, Users } from "lucide-react"
import { Input } from "@/components/ui/input"

const mosques = [
  {
    id: 1,
    name: "Grand Al-Haram Mosque",
    address: "123 Islamic Center Dr, New York",
    distance: "0.8 miles",
    eidPrayers: ["7:00 AM", "8:30 AM", "10:00 AM"],
    capacity: "High"
  },
  {
    id: 2,
    name: "Masjid Al-Noor",
    address: "456 Crescent Way, Brooklyn",
    distance: "1.2 miles",
    eidPrayers: ["7:30 AM", "9:00 AM"],
    capacity: "Medium"
  },
  {
    id: 3,
    name: "Community Prayer Hall",
    address: "789 Unity Ave, Queens",
    distance: "2.5 miles",
    eidPrayers: ["8:00 AM"],
    capacity: "Small"
  }
]

export default function MosqueFinder() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold font-headline text-primary">Mosque Finder</h1>
            <p className="text-muted-foreground">Find nearby mosques for Eid prayers and community events.</p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search location..." className="pl-10 rounded-xl h-12" />
            </div>
            <Button size="icon" className="h-12 w-12 rounded-xl emerald-gradient">
              <Navigation className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* List Section */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
            {mosques.map((mosque) => (
              <Card key={mosque.id} className="hover:shadow-md transition-shadow cursor-pointer group border-primary/10">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-primary group-hover:text-primary-foreground transition-colors group-hover:bg-primary px-2 py-1 rounded-md -mx-2">
                      {mosque.name}
                    </CardTitle>
                    <span className="text-xs font-bold text-muted-foreground bg-accent/30 px-2 py-1 rounded-full">{mosque.distance}</span>
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {mosque.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
                      <Clock className="w-3 h-3" />
                      <span>Eid Prayer Times</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mosque.eidPrayers.map((time) => (
                        <span key={time} className="bg-emerald-50 text-emerald-700 text-xs px-2 py-1 rounded-md font-medium border border-emerald-100">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: <span className="text-primary font-bold">{mosque.capacity}</span></span>
                    </div>
                    <Button variant="link" className="text-primary font-bold h-auto p-0">View Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Map Visual (Mock) */}
          <div className="lg:col-span-2 relative min-h-[500px] lg:min-h-full rounded-3xl overflow-hidden shadow-inner border bg-slate-100">
            {/* Background "Map" - Using a subtle grid pattern for effect */}
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map-grid/1200/800')] opacity-20 grayscale brightness-150"></div>
            
            {/* Map Markers */}
            <div className="absolute top-1/4 left-1/3 animate-bounce">
              <div className="relative">
                <MapPin className="w-10 h-10 text-primary fill-primary/20" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-lg shadow-sm whitespace-nowrap font-bold text-xs text-primary border-primary/20">
                  Grand Al-Haram
                </div>
              </div>
            </div>

            <div className="absolute bottom-1/3 right-1/4 animate-bounce delay-300">
              <div className="relative">
                <MapPin className="w-10 h-10 text-secondary fill-secondary/20" />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass px-3 py-1 rounded-lg shadow-sm whitespace-nowrap font-bold text-xs text-primary border-primary/20">
                  Masjid Al-Noor
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2">
              <Button size="icon" variant="secondary" className="glass shadow-md">+</Button>
              <Button size="icon" variant="secondary" className="glass shadow-md">-</Button>
            </div>

            <div className="absolute top-6 left-6 glass p-4 rounded-2xl max-w-xs shadow-lg animate-in fade-in slide-in-from-left duration-700">
              <h3 className="font-bold text-primary">Map View</h3>
              <p className="text-xs text-muted-foreground mt-1">Showing 3 results near your current location.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
