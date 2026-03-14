"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Navigation, Clock, Users, Globe, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const famousMosques = [
  {
    id: 1,
    name: "Baitul Mukarram National Mosque",
    city: "Dhaka",
    address: "Topkhana Road, Dhaka 1000",
    distance: "Current Location",
    eidPrayers: ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM"],
    capacity: "Huge",
    famous: true,
    coordinates: { lat: 23.7291, lng: 90.4127 }
  },
  {
    id: 2,
    name: "Sixty Dome Mosque (Shat Gombuj)",
    city: "Bagerhat",
    address: "Bagerhat, Khulna Division",
    distance: "180 km",
    eidPrayers: ["8:00 AM", "9:00 AM"],
    capacity: "Historic Large",
    famous: true,
    coordinates: { lat: 22.6746, lng: 89.7417 }
  },
  {
    id: 3,
    name: "Tara Masjid (Star Mosque)",
    city: "Dhaka",
    address: "Abul Khairat Rd, Dhaka",
    distance: "1.2 km",
    eidPrayers: ["7:30 AM", "8:30 AM"],
    capacity: "Medium",
    famous: true,
    coordinates: { lat: 23.7153, lng: 90.4012 }
  },
  {
    id: 4,
    name: "Hazrat Shah Jalal Dargah Mosque",
    city: "Sylhet",
    address: "Dargah Gate, Sylhet",
    distance: "245 km",
    eidPrayers: ["8:30 AM"],
    capacity: "Large",
    famous: true,
    coordinates: { lat: 24.9015, lng: 91.8679 }
  },
  {
    id: 5,
    name: "Bagha Mosque",
    city: "Rajshahi",
    address: "Bagha, Rajshahi",
    distance: "210 km",
    eidPrayers: ["8:00 AM"],
    capacity: "Medium",
    famous: true,
    coordinates: { lat: 24.2325, lng: 88.8354 }
  },
  {
    id: 6,
    name: "Baytul Aman Jame Mosque (Guthia)",
    city: "Barisal",
    address: "Guthia, Barisal",
    distance: "240 km",
    eidPrayers: ["8:00 AM"],
    capacity: "Large",
    famous: true,
    coordinates: { lat: 22.7844, lng: 90.2241 }
  },
  {
    id: 7,
    name: "Khan Mohammad Mridha Mosque",
    city: "Dhaka",
    address: "Lalbagh, Dhaka",
    distance: "2.5 km",
    eidPrayers: ["7:45 AM"],
    capacity: "Small-Medium",
    famous: true,
    coordinates: { lat: 23.7198, lng: 90.3845 }
  }
]

export default function MosqueFinder() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("All")

  const filteredMosques = famousMosques.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          m.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity === "All" || m.city === selectedCity
    return matchesSearch && matchesCity
  })

  const cities = ["All", "Dhaka", "Chittagong", "Sylhet", "Barisal", "Rajshahi", "Khulna"]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3 h-3" />
              <span>Bangladesh Heritage</span>
            </div>
            <h1 className="text-5xl font-black text-primary tracking-tight">Mosque Finder</h1>
            <p className="text-xl text-muted-foreground font-medium">Find Eid prayers in major cities across Bangladesh.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search mosque or city..." 
                className="pl-12 rounded-2xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30 transition-all" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button size="icon" className="h-14 w-14 rounded-2xl emerald-gradient shadow-lg">
                <Navigation className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* City Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {cities.map(city => (
            <Button
              key={city}
              variant={selectedCity === city ? "default" : "outline"}
              onClick={() => setSelectedCity(city)}
              className={cn(
                "rounded-full px-6 font-bold transition-all",
                selectedCity === city ? "emerald-gradient text-white border-none" : "border-primary/10 text-primary hover:bg-primary/5"
              )}
            >
              {city}
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* List Section */}
          <div className="lg:col-span-5 space-y-6 overflow-y-auto max-h-[800px] pr-4 custom-scrollbar">
            {filteredMosques.map((mosque) => (
              <Card key={mosque.id} className="group border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(6,95,70,0.08)] transition-all duration-500 rounded-[2rem] overflow-hidden cursor-pointer">
                <CardHeader className="p-8 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      {mosque.famous && (
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground font-bold rounded-full text-[10px] mb-2 border-none">
                          FAMOUS LANDMARK
                        </Badge>
                      )}
                      <CardTitle className="text-2xl font-black text-primary group-hover:text-primary transition-colors">
                        {mosque.name}
                      </CardTitle>
                    </div>
                    <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl">{mosque.distance}</span>
                  </div>
                  <CardDescription className="flex items-center gap-2 text-base font-medium">
                    <MapPin className="w-5 h-5 text-primary" />
                    {mosque.address}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-4 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest">
                      <Clock className="w-4 h-4" />
                      <span>Eid-ul-Fitr Prayer Times</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mosque.eidPrayers.map((time) => (
                        <span key={time} className="bg-emerald-50 text-primary text-sm px-4 py-2 rounded-xl font-bold border border-primary/10 shadow-sm">
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                    <div className="flex items-center gap-3 text-muted-foreground font-bold text-sm">
                      <Users className="w-5 h-5 text-primary/40" />
                      <span>Capacity: <span className="text-primary">{mosque.capacity}</span></span>
                    </div>
                    <Button variant="link" className="text-primary font-black h-auto p-0 flex items-center gap-1 group/btn">
                      Get Directions <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredMosques.length === 0 && (
              <div className="py-20 text-center space-y-4 glass-card rounded-[2rem]">
                <Search className="w-12 h-12 text-primary/20 mx-auto" />
                <p className="text-muted-foreground font-bold">No mosques found in your search area.</p>
              </div>
            )}
          </div>

          {/* Map Mock Section */}
          <div className="lg:col-span-7 relative min-h-[600px] lg:min-h-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/bd-map/1600/1200')] opacity-30 grayscale contrast-125"></div>
            <div className="absolute inset-0 bg-emerald-900/5 pointer-events-none"></div>

            {filteredMosques.map((mosque, idx) => (
              <div 
                key={mosque.id}
                className="absolute animate-bounce"
                style={{ 
                  top: `${15 + (idx * 12)}%`, 
                  left: `${25 + (idx * 8)}%` 
                }}
              >
                <div className="relative group/marker">
                  <MapPin className={cn(
                    "w-12 h-12 transition-transform duration-300 group-hover/marker:scale-125",
                    mosque.famous ? "text-secondary fill-secondary/20" : "text-primary fill-primary/20"
                  )} />
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 glass-card px-4 py-2 rounded-2xl shadow-xl whitespace-nowrap font-black text-sm text-primary border-primary/20 opacity-0 group-hover/marker:opacity-100 transition-opacity">
                    {mosque.name}
                  </div>
                </div>
              </div>
            ))}

            <div className="absolute bottom-10 right-10 flex flex-col gap-3">
              <Button size="icon" variant="secondary" className="glass-card w-14 h-14 rounded-2xl shadow-xl text-primary font-black text-2xl">+</Button>
              <Button size="icon" variant="secondary" className="glass-card w-14 h-14 rounded-2xl shadow-xl text-primary font-black text-2xl">-</Button>
            </div>

            <div className="absolute top-10 left-10 glass-card p-6 rounded-[2rem] max-w-xs shadow-2xl animate-in fade-in slide-in-from-left duration-700 border-white/40">
              <h3 className="font-black text-2xl text-primary">Interactive Map</h3>
              <p className="text-sm text-muted-foreground font-bold mt-2">Discover and navigate to {filteredMosques.length} major mosques across Bangladesh.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
