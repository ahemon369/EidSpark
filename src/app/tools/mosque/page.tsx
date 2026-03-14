
"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Globe, Navigation, ChevronRight, List, Info, Clock, Timer, Sparkles, Map as MapIcon } from "lucide-react"
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
  { name: "Barisal", coords: [22.7010, 90.3535] as [number, number] },
  { name: "Rangpur", coords: [25.7439, 89.2752] as [number, number] },
]

export default function MosqueFinder() {
  const [mapConfig, setMapConfig] = useState<{ center: [number, number]; zoom: number }>({
    center: [23.8103, 90.4125], // Default to Dhaka
    zoom: 13,
  })
  const [selectedCity, setSelectedCity] = useState("Dhaka")
  const [mosques, setMosques] = useState<any[]>([])
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null)

  // Fetch Prayer Times
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const [lat, lng] = mapConfig.center
        // Method 1: University of Islamic Sciences, Karachi (Best for Bangladesh/Hanafi)
        const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=1`)
        const data = await response.json()
        if (data.data) {
          setPrayerTimes(data.data.timings)
        }
      } catch (error) {
        console.error("Failed to fetch prayer times:", error)
      }
    }
    fetchTimes()
  }, [mapConfig.center])

  // Countdown logic
  useEffect(() => {
    if (!prayerTimes) return

    const timer = setInterval(() => {
      const now = new Date()
      const prayers = [
        { name: "Fajr", time: prayerTimes.Fajr },
        { name: "Dhuhr", time: prayerTimes.Dhuhr },
        { name: "Asr", time: prayerTimes.Asr },
        { name: "Maghrib", time: prayerTimes.Maghrib },
        { name: "Isha", time: prayerTimes.Isha },
      ]

      let upcoming = null
      for (const p of prayers) {
        const [hours, minutes] = p.time.split(':').map(Number)
        const prayerDate = new Date()
        prayerDate.setHours(hours, minutes, 0)

        if (prayerDate > now) {
          upcoming = { ...p, date: prayerDate }
          break
        }
      }

      // If all passed today, next is tomorrow's Fajr
      if (!upcoming) {
        const [hours, minutes] = prayers[0].time.split(':').map(Number)
        const tomorrowFajr = new Date()
        tomorrowFajr.setDate(tomorrowFajr.getDate() + 1)
        tomorrowFajr.setHours(hours, minutes, 0)
        upcoming = { ...prayers[0], date: tomorrowFajr }
      }

      const diff = upcoming.date.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setNextPrayer({
        name: upcoming.name,
        time: upcoming.time,
        remaining: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [prayerTimes])

  const handleCitySelect = (city: typeof cities[0]) => {
    setSelectedCity(city.name)
    if (city.coords) {
      setMapConfig({ center: city.coords, zoom: 14 })
    } else {
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

  const handleMosquesUpdate = useCallback((newMosques: any[]) => {
    setMosques(newMosques)
  }, [])

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "--:--"
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hours = h % 12 || 12
    return `${hours}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
              <span>Prayer & Mosque Companion</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Mosque Finder</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl">
              Locate mosques and view accurate daily prayer times for your location in <span className="text-primary font-bold">Bangladesh</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <p className="text-sm font-black text-muted-foreground uppercase tracking-widest ml-1">Change Location</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "rounded-2xl h-12 px-6 font-bold transition-all text-sm border-2",
                    selectedCity === city.name 
                      ? "emerald-gradient text-white border-transparent shadow-lg scale-105" 
                      : "border-primary/10 text-primary hover:bg-primary/5 bg-white"
                  )}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prayer Times Section */}
        <div className="mb-16 grid lg:grid-cols-12 gap-8 animate-in fade-in duration-700 delay-200">
          <Card className="lg:col-span-4 emerald-gradient border-none shadow-2xl rounded-[3rem] overflow-hidden text-white relative group">
             <CardContent className="p-10 relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-white/60 font-black uppercase tracking-[0.2em] text-xs">
                    <Timer className="w-4 h-4 text-secondary" />
                    Next Prayer Countdown
                  </div>
                  <h3 className="text-4xl font-black">{nextPrayer?.name || "Loading..."}</h3>
                </div>
                
                <div className="space-y-1">
                  <div className="text-7xl font-black tracking-tighter drop-shadow-2xl">
                    {nextPrayer?.remaining || "00:00:00"}
                  </div>
                  <p className="text-white/60 font-bold uppercase tracking-widest text-sm">Time Remaining</p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                   <Clock className="w-4 h-4 text-secondary" />
                   <span className="font-bold">Starts at {formatTime(nextPrayer?.time || "")}</span>
                </div>
             </CardContent>
             <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <Clock className="w-64 h-64" />
             </div>
          </Card>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { id: 'Fajr', icon: Clock },
              { id: 'Dhuhr', icon: Clock },
              { id: 'Asr', icon: Clock },
              { id: 'Maghrib', icon: Clock },
              { id: 'Isha', icon: Clock },
            ].map((p) => {
              const isCurrent = nextPrayer && nextPrayer.name === p.id;
              return (
                <Card key={p.id} className={cn(
                  "border-none shadow-xl rounded-[2.5rem] transition-all duration-500 overflow-hidden flex flex-col justify-center items-center p-6 text-center space-y-4",
                  isCurrent ? "bg-secondary text-primary scale-105 shadow-secondary/20" : "bg-white hover:bg-primary/5 group"
                )}>
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                    isCurrent ? "bg-white/20" : "bg-primary/5 group-hover:bg-primary group-hover:text-white"
                  )}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn("text-xs font-black uppercase tracking-widest", isCurrent ? "text-primary/60" : "text-muted-foreground")}>{p.id}</p>
                    <p className="text-2xl font-black">{prayerTimes ? formatTime(prayerTimes[p.id]) : "--:--"}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Map & List Section */}
        <div className="grid lg:grid-cols-12 gap-10">
          {/* List and Info Panel */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl flex flex-col max-h-[800px]">
              <CardHeader className="p-10 pb-6 bg-primary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <List className="w-6 h-6 text-secondary" />
                  Nearby Mosques
                </CardTitle>
                <CardDescription className="text-sm font-bold">{mosques.length} results found in this area</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-grow">
                {mosques.length > 0 ? (
                  <div className="divide-y divide-primary/5">
                    {mosques.map((mosque) => (
                      <div key={mosque.id} className="p-6 hover:bg-primary/5 transition-colors group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <h4 className="font-black text-primary leading-tight group-hover:text-secondary transition-colors">
                              {mosque.tags.name || mosque.tags["name:en"] || "Unnamed Mosque"}
                            </h4>
                            <p className="text-xs text-muted-foreground font-medium">
                              {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location details unavailable"}
                            </p>
                            {mosque.distance && (
                              <p className="text-[10px] font-black uppercase text-secondary tracking-widest pt-1">
                                {mosque.distance < 1000 
                                  ? `${Math.round(mosque.distance)}m away` 
                                  : `${(mosque.distance / 1000).toFixed(1)}km away`}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="rounded-xl h-10 w-10 p-0 text-primary hover:bg-primary hover:text-white"
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                              window.open(url, "_blank")
                            }}
                          >
                            <Navigation className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                      <MapPin className="w-8 h-8 text-primary/20" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">Move the map or search to find mosques nearby.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-secondary/10 p-8 rounded-[2.5rem] border-2 border-secondary/20 space-y-4">
              <div className="flex items-center gap-3 text-primary font-black">
                <Info className="w-5 h-5 text-secondary" />
                Community Notice
              </div>
              <p className="text-xs text-primary/70 font-bold leading-relaxed">
                Prayer times are calculated based on the Karachi methodology, standard for Bangladesh. Always refer to your local masjid for actual Jamat timings.
              </p>
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-8 min-h-[600px] lg:min-h-[800px] relative animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border-8 border-white bg-slate-50">
              <MosqueMap 
                center={mapConfig.center} 
                zoom={mapConfig.zoom} 
                onLocationFound={handleLocationFound} 
                onMosquesUpdate={handleMosquesUpdate}
              />
            </div>
            
            <div className="absolute bottom-10 left-10 glass-card p-6 rounded-[2rem] border-white/40 shadow-2xl pointer-events-none hidden md:block">
              <h3 className="font-black text-2xl text-primary">Live Explorer</h3>
              <p className="text-sm text-muted-foreground font-bold mt-2">Discovering mosques in <span className="text-secondary">{selectedCity}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
