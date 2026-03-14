
"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Timer, Sparkles, Navigation, List, Info, ChevronRight, LocateFixed } from "lucide-react"
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
  { name: "My Location", coords: null },
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
  const [currentPrayerName, setCurrentPrayerName] = useState<string | null>(null)

  // Fetch Prayer Times
  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const [lat, lng] = mapConfig.center
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

  // Prayer logic: Countdown and Current Prayer Highlighting
  useEffect(() => {
    if (!prayerTimes) return

    const timer = setInterval(() => {
      const now = new Date()
      
      const getPrayerDate = (timeStr: string, isTomorrow = false) => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        const date = new Date()
        if (isTomorrow) date.setDate(date.getDate() + 1)
        date.setHours(hours, minutes, 0)
        return date
      }

      const prayers = [
        { name: "Fajr", date: getPrayerDate(prayerTimes.Fajr) },
        { name: "Dhuhr", date: getPrayerDate(prayerTimes.Dhuhr) },
        { name: "Asr", date: getPrayerDate(prayerTimes.Asr) },
        { name: "Maghrib", date: getPrayerDate(prayerTimes.Maghrib) },
        { name: "Isha", date: getPrayerDate(prayerTimes.Isha) },
      ]

      let currentIdx = -1
      for (let i = prayers.length - 1; i >= 0; i--) {
        if (now >= prayers[i].date) {
          currentIdx = i
          break
        }
      }

      const currentName = currentIdx === -1 ? "Isha" : prayers[currentIdx].name
      setCurrentPrayerName(currentName)

      let nextIdx = currentIdx + 1
      let isNextTomorrow = false
      if (nextIdx >= prayers.length) {
        nextIdx = 0
        isNextTomorrow = true
      }

      const next = prayers[nextIdx]
      const nextDate = getPrayerDate(prayerTimes[next.name], isNextTomorrow)
      
      const diff = nextDate.getTime() - now.getTime()
      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff / (1000 * 60)) % 60)
      const s = Math.floor((diff / 1000) % 60)

      setNextPrayer({
        name: next.name,
        time: prayerTimes[next.name],
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
          setSelectedCity("My Location")
        })
      }
    }
  }

  const handleLocationFound = useCallback((location: [number, number]) => {
    setMapConfig({ center: location, zoom: 15 })
    setSelectedCity("My Location")
  }, [])

  const handleMosquesUpdate = useCallback((newMosques: any[]) => {
    // Sort mosques by distance before updating state
    const sorted = [...newMosques].sort((a, b) => (a.distance || 0) - (b.distance || 0))
    setMosques(sorted)
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
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
              <span>Real-Time Mosque Finder</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Find Mosques Near You</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Instant mosque discovery and directions for <span className="text-primary font-bold">{selectedCity === "My Location" ? "Your Current Area" : selectedCity}</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Select Division</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "rounded-xl h-10 px-5 font-bold transition-all text-xs border-2 flex items-center gap-2",
                    selectedCity === city.name 
                      ? "emerald-gradient text-white border-transparent shadow-lg scale-105" 
                      : "border-primary/10 text-primary hover:bg-primary/5 bg-white"
                  )}
                >
                  {city.name === "My Location" && <LocateFixed className="w-3 h-3" />}
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prayer Times Section */}
        <div className="mb-12 grid lg:grid-cols-12 gap-6 animate-in fade-in duration-700 delay-200">
          <Card className="lg:col-span-4 emerald-gradient border-none shadow-2xl rounded-[2.5rem] overflow-hidden text-white relative group">
             <CardContent className="p-8 relative z-10 flex flex-col justify-between h-full min-h-[280px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">
                    <Timer className="w-3.5 h-3.5 text-secondary" />
                    Next Prayer: {nextPrayer?.name || "..."}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">Time Remaining</h3>
                </div>
                
                <div className="py-4">
                  <div className="text-7xl font-black tracking-tighter drop-shadow-2xl font-mono">
                    {nextPrayer?.remaining || "00:00:00"}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                   <Clock className="w-4 h-4 text-secondary" />
                   <span className="font-bold text-sm">Azaan at {formatTime(nextPrayer?.time || "")}</span>
                </div>
             </CardContent>
             <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
                <Clock className="w-48 h-48" />
             </div>
          </Card>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => {
              const isCurrent = currentPrayerName === p;
              const isNext = nextPrayer?.name === p;
              
              return (
                <Card key={p} className={cn(
                  "border-none shadow-xl rounded-[2rem] transition-all duration-500 overflow-hidden flex flex-col justify-center items-center p-6 text-center space-y-4",
                  isCurrent 
                    ? "bg-secondary text-primary scale-105 shadow-secondary/20 ring-4 ring-secondary/20" 
                    : isNext 
                      ? "bg-primary/5 border-2 border-primary/20" 
                      : "bg-white hover:bg-primary/5 group"
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                    isCurrent ? "bg-white/30" : "bg-primary/5 group-hover:bg-primary group-hover:text-white"
                  )}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-widest", 
                      isCurrent ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      {p}
                    </p>
                    <p className="text-xl font-black">{prayerTimes ? formatTime(prayerTimes[p]) : "--:--"}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Map & List Section */}
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl flex flex-col h-[700px]">
              <CardHeader className="p-8 pb-4 bg-primary/5">
                <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                  <List className="w-5 h-5 text-secondary" />
                  Sorted by Distance
                </CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground/60">{mosques.length} nearby locations</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-grow">
                {mosques.length > 0 ? (
                  <div className="divide-y divide-primary/5">
                    {mosques.map((mosque) => (
                      <div key={mosque.id} className="p-6 hover:bg-primary/5 transition-colors group">
                        <div className="flex justify-between items-start gap-3">
                          <div className="space-y-1">
                            <h4 className="font-black text-primary text-sm leading-tight group-hover:text-secondary transition-colors">
                              {mosque.tags.name || mosque.tags["name:en"] || "Unnamed Mosque"}
                            </h4>
                            <p className="text-[10px] text-muted-foreground font-medium">
                              {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location details hidden"}
                            </p>
                            {mosque.distance !== undefined && (
                              <p className="text-[11px] font-black uppercase text-secondary tracking-widest pt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {mosque.distance < 1000 
                                  ? `${Math.round(mosque.distance)}m away` 
                                  : `${(mosque.distance / 1000).toFixed(1)}km away`}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="rounded-xl h-10 px-4 text-xs font-black text-primary hover:bg-primary hover:text-white border-2 border-primary/5"
                            onClick={() => {
                              const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                              window.open(url, "_blank")
                            }}
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Navigate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center space-y-4 opacity-40">
                    <MapPin className="w-10 h-10 mx-auto text-primary" />
                    <p className="text-xs font-bold uppercase tracking-widest">Searching Mosques...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-secondary/5 p-6 rounded-[2rem] border border-secondary/20 flex gap-4 items-start shadow-sm">
              <Info className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-primary uppercase tracking-wider">Note for Users</p>
                <p className="text-[11px] text-primary/70 font-bold leading-relaxed">
                  Real-time data provided by OpenStreetMap. Distances are calculated in a straight line from your coordinates.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 min-h-[500px] lg:h-[700px] relative animate-in fade-in slide-in-from-right duration-700">
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-8 border-white bg-slate-50">
              <MosqueMap 
                center={mapConfig.center} 
                zoom={mapConfig.zoom} 
                onLocationFound={handleLocationFound} 
                onMosquesUpdate={handleMosquesUpdate}
              />
            </div>
            
            <div className="absolute bottom-6 left-6 glass-card p-4 rounded-[1.5rem] border-white/40 shadow-xl pointer-events-none hidden md:flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
              <p className="text-xs font-black text-primary uppercase tracking-widest">Live Location Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
