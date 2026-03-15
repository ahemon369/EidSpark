
"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Clock, 
  Timer, 
  Sparkles, 
  Navigation, 
  List, 
  Info, 
  ChevronRight, 
  LocateFixed, 
  Heart, 
  Loader2,
  Globe,
  Map as MapIcon
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

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
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [mapConfig, setMapConfig] = useState<{ center: [number, number]; zoom: number }>({
    center: [23.8103, 90.4125], // Default to Dhaka
    zoom: 13,
  })
  const [selectedCity, setSelectedCity] = useState("Dhaka")
  const [locationMeta, setLocationName] = useState({ city: "Dhaka", country: "Bangladesh" })
  const [mosques, setMosques] = useState<any[]>([])
  const [prayerTimes, setPrayerTimes] = useState<any>(null)
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null)
  const [currentPrayerName, setCurrentPrayerName] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Reverse Geocoding
  const fetchLocationMeta = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      const data = await response.json()
      setLocationName({ 
        city: data.city || data.locality || "Unknown City", 
        country: data.countryName || "Bangladesh" 
      })
    } catch (e) {
      console.error("Geocoding failed")
    }
  }

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
    fetchLocationMeta(mapConfig.center[0], mapConfig.center[1])
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
      handleFindNearMe()
    }
  }

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "Geolocation is not supported by your browser." })
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setMapConfig({ center: loc, zoom: 15 })
        setSelectedCity("My Location")
        setIsLocating(false)
        toast({ title: "Location Updated", description: "Showing mosques near you." })
      },
      () => {
        setIsLocating(false)
        toast({ variant: "destructive", title: "Access Denied", description: "Please enable GPS to find nearby mosques." })
      }
    )
  }

  const handleLocationFound = useCallback((location: [number, number]) => {
    setMapConfig({ center: location, zoom: 15 })
    setSelectedCity("My Location")
  }, [])

  const handleMosquesUpdate = useCallback((newMosques: any[]) => {
    const sorted = [...newMosques].sort((a, b) => (a.distance || 0) - (b.distance || 0))
    setMosques(sorted)
  }, [])

  const handleSaveMosque = async (mosque: any) => {
    if (!user || !db) {
      toast({ title: "Sign in required", description: "Log in to save favorite mosques." })
      return
    }

    setSavingId(mosque.id.toString())
    try {
      const q = query(
        collection(db, "users", user.uid, "savedMosques"), 
        where("mosqueId", "==", mosque.id.toString())
      )
      const existing = await getDocs(q)
      
      if (!existing.empty) {
        toast({ title: "Already Saved", description: "This mosque is already in your favorites." })
        setSavingId(null)
        return
      }

      await addDoc(collection(db, "users", user.uid, "savedMosques"), {
        userId: user.uid,
        mosqueId: mosque.id.toString(),
        name: mosque.tags.name || mosque.tags["name:en"] || "Unnamed Mosque",
        address: mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Bangladesh",
        lat: mosque.lat,
        lon: mosque.lon,
        savedAt: new Date().toISOString()
      })
      toast({ title: "Mosque Saved!", description: "Find it in your dashboard favorites." })
    } catch (error) {
      console.error(error)
    } finally {
      setSavingId(null)
    }
  }

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "--:--"
    const [h, m] = timeStr.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hours = h % 12 || 12
    return `${hours}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 selection:bg-primary selection:text-white">
      <Navbar />
      
      <main className="max-w-[1800px] mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
              <span>{locationMeta.city}, {locationMeta.country}</span>
            </div>
            <h1 className="text-4xl lg:text-[80px] font-black text-primary dark:text-white tracking-tighter leading-none">Live Prayer Map</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-xl">
              Real-time Azan tracker and mosque finder. Currently showing <span className="text-primary font-bold">{selectedCity === "My Location" ? "Your Area" : selectedCity}</span>.
            </p>
          </div>
          
          <div className="flex flex-col gap-3">
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Change Location</p>
            <div className="flex flex-wrap gap-2">
              {cities.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city)}
                  className={cn(
                    "rounded-xl h-12 px-6 font-bold transition-all text-xs border-2 flex items-center gap-2",
                    selectedCity === city.name 
                      ? "emerald-gradient text-white border-transparent shadow-xl scale-105" 
                      : "border-primary/10 text-primary hover:bg-primary/5 bg-white dark:bg-slate-900"
                  )}
                >
                  {city.name === "My Location" && <LocateFixed className="w-3.5 h-3.5" />}
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Status Cards */}
        <div className="mb-12 grid lg:grid-cols-12 gap-6 animate-in fade-in duration-700 delay-200">
          <Card className="lg:col-span-4 emerald-gradient border-none shadow-[0_32px_64px_-12px_rgba(6,95,70,0.3)] rounded-[3rem] overflow-hidden text-white relative group">
             <CardContent className="p-10 relative z-10 flex flex-col justify-between h-full min-h-[320px]">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/60 font-black uppercase tracking-[0.25em] text-[10px]">
                    <Timer className="w-4 h-4 text-secondary animate-twinkle" />
                    Next Azan: {nextPrayer?.name || "..." }
                  </div>
                  <h3 className="text-4xl font-black tracking-tight">Counting Down</h3>
                </div>
                
                <div className="py-6">
                  <div className="text-[100px] font-black tracking-tighter leading-none drop-shadow-2xl font-mono tabular-nums">
                    {nextPrayer?.remaining || "00:00:00"}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-6 border-t border-white/10">
                   <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                     <Clock className="w-5 h-5 text-secondary" />
                   </div>
                   <span className="font-bold text-lg">{nextPrayer?.name} at {formatTime(nextPrayer?.time || "")}</span>
                </div>
             </CardContent>
             <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:rotate-12 transition-transform duration-1000 scale-150">
                <Clock className="w-64 h-64" />
             </div>
          </Card>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].map((p) => {
              const isCurrent = currentPrayerName === p;
              const isNext = nextPrayer?.name === p;
              
              return (
                <Card key={p} className={cn(
                  "border-none shadow-2xl rounded-[2.5rem] transition-all duration-500 overflow-hidden flex flex-col justify-center items-center p-8 text-center space-y-6",
                  isCurrent 
                    ? "bg-secondary text-primary scale-105 shadow-secondary/20 ring-8 ring-secondary/10" 
                    : isNext 
                      ? "bg-primary/5 border-2 border-primary/20" 
                      : "bg-white dark:bg-slate-900 hover:bg-primary/5 group"
                )}>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                    isCurrent ? "bg-white/30" : "bg-primary/5 group-hover:bg-primary group-hover:text-white"
                  )}>
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <p className={cn(
                      "text-[10px] font-black uppercase tracking-[0.2em]", 
                      isCurrent ? "text-primary/70" : "text-muted-foreground"
                    )}>
                      {p}
                    </p>
                    <p className="text-2xl font-black">{prayerTimes ? formatTime(prayerTimes[p]) : "--:--"}</p>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Map & List Interface */}
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* Sidebar List */}
          <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-left duration-700 lg:order-1 order-2">
            <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col h-[800px]">
              <CardHeader className="p-8 pb-6 border-b border-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                    <List className="w-6 h-6 text-secondary" />
                    Nearby Registry
                  </CardTitle>
                  <div className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase">
                    {mosques.length} Found
                  </div>
                </div>
                <CardDescription className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">Sorted by distance from you</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-grow">
                {mosques.length > 0 ? (
                  <div className="divide-y divide-primary/5">
                    {mosques.map((mosque) => (
                      <div key={mosque.id} className="p-8 hover:bg-primary/5 transition-all group">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-grow">
                            <h4 className="font-black text-primary text-lg leading-tight group-hover:text-secondary transition-colors">
                              {mosque.tags.name || mosque.tags["name:en"] || "Local Mosque"}
                            </h4>
                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                              {mosque.tags["addr:city"] || mosque.tags["addr:full"] || "Location details hidden"}
                            </p>
                            {mosque.distance !== undefined && (
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-[10px] font-black uppercase text-secondary tracking-widest">
                                <MapPin className="w-3 h-3" />
                                {mosque.distance < 1000 
                                  ? `${Math.round(mosque.distance)}m away` 
                                  : `${(mosque.distance / 1000).toFixed(2)}km away`}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="icon"
                              variant="ghost" 
                              className="rounded-xl h-12 w-12 bg-primary/5 text-primary hover:bg-primary hover:text-white border-2 border-transparent transition-all"
                              onClick={() => {
                                const url = `https://www.google.com/maps/dir/?api=1&destination=${mosque.lat},${mosque.lon}`
                                window.open(url, "_blank")
                              }}
                            >
                              <Navigation className="w-5 h-5" />
                            </Button>
                            <Button 
                              size="icon"
                              variant="ghost" 
                              className="rounded-xl h-12 w-12 bg-secondary/5 text-secondary hover:bg-secondary hover:text-primary border-2 border-transparent transition-all"
                              onClick={() => handleSaveMosque(mosque)}
                              disabled={savingId === mosque.id.toString()}
                            >
                              {savingId === mosque.id.toString() ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className="w-5 h-5" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center space-y-6 opacity-40">
                    <MapIcon className="w-16 h-16 mx-auto text-primary animate-float" />
                    <p className="font-black text-sm uppercase tracking-[0.2em]">Searching Local Registry...</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-secondary/5 p-8 rounded-[3rem] border-2 border-secondary/20 flex gap-5 items-start shadow-2xl backdrop-blur-md">
              <Info className="w-8 h-8 text-secondary shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-sm font-black text-primary uppercase tracking-widest">Global Data Sync</p>
                <p className="text-xs text-primary/70 font-medium leading-relaxed">
                  Real-time data sourced from OpenStreetMap. Prayer times calculated using the Aladhan Global Observatory.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Map */}
          <div className="lg:col-span-8 min-h-[600px] lg:h-[800px] relative animate-in fade-in slide-in-from-right duration-700 lg:order-2 order-1">
            <div className="absolute inset-0 rounded-[4rem] overflow-hidden shadow-[0_64px_128px_-12px_rgba(0,0,0,0.2)] border-[12px] border-white dark:border-slate-900 bg-slate-50">
              <MosqueMap 
                center={mapConfig.center} 
                zoom={mapConfig.zoom} 
                onLocationFound={handleLocationFound} 
                onMosquesUpdate={handleMosquesUpdate}
                onSaveMosque={handleSaveMosque}
              />
            </div>
            
            {/* Floating Map Actions */}
            <div className="absolute bottom-10 left-10 z-10">
              <Button 
                onClick={handleFindNearMe}
                disabled={isLocating}
                className="h-16 rounded-2xl emerald-gradient text-white font-black px-10 shadow-[0_20px_50px_rgba(6,95,70,0.4)] hover:scale-105 active:scale-95 transition-all group"
              >
                {isLocating ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <LocateFixed className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform duration-500" />}
                Find Near Me
              </Button>
            </div>

            <div className="absolute top-10 right-10 z-10 glass-card px-6 py-3 rounded-full border-white/40 shadow-2xl flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">GPS Tracking Active</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
