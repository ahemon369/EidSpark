
"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Compass, 
  MapPin, 
  Info, 
  RefreshCcw, 
  LocateFixed, 
  Sparkles, 
  Loader2, 
  Navigation2, 
  Globe,
  Milestone,
  ShieldCheck,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function UltraQiblaCompass() {
  const { toast } = useToast()
  
  // Location States
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState<string>("Detecting location...")
  const [distance, setDistance] = useState<number | null>(null)
  
  // Compass States
  const [qiblaDir, setQiblaDir] = useState<number | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionAllow] = useState<boolean | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Kaaba Constants
  const KAABA = { lat: 21.4225, lon: 39.8262 }

  // Calculation: Bearing to Kaaba
  const calculateQibla = useCallback((lat: number, lon: number) => {
    const φ1 = (lat * Math.PI) / 180
    const φ2 = (KAABA.lat * Math.PI) / 180
    const λ1 = (lon * Math.PI) / 180
    const λ2 = (KAABA.lon * Math.PI) / 180

    const Δλ = λ2 - λ1
    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    
    const q = (Math.atan2(y, x) * 180) / Math.PI
    return (q + 360) % 360
  }, [])

  // Calculation: Distance to Kaaba (Haversine)
  const calculateDistance = useCallback((lat: number, lon: number) => {
    const R = 6371 // km
    const dLat = (KAABA.lat - lat) * Math.PI / 180
    const dLon = (KAABA.lon - lon) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat * Math.PI / 180) * Math.cos(KAABA.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c)
  }, [])

  // Reverse Geocoding
  const fetchLocationName = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
      const data = await response.json()
      setLocationName(`${data.city || data.locality}, ${data.countryName}`)
    } catch (e) {
      setLocationName("Unknown Location")
    }
  }

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lon: longitude })
        setQiblaDir(calculateQibla(latitude, longitude))
        setDistance(calculateDistance(latitude, longitude))
        fetchLocationName(latitude, longitude)
        setError(null)
        setIsLocating(false)
      },
      (err) => {
        setError("Please enable location access to calculate accurate Qibla direction.")
        setIsLocating(false)
      },
      { enableHighAccuracy: true }
    )
  }, [calculateQibla, calculateDistance])

  const handleOrientation = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading is absolute North for iOS
    // e.alpha might be relative or absolute depending on the event type used
    let compass = (e as any).webkitCompassHeading || (e as any).alpha
    
    if (compass !== null && compass !== undefined) {
      // If using standard alpha on Android, it might be inverted or relative
      // The listener 'deviceorientationabsolute' handles the absolute North mapping
      setHeading(compass)
    }
  }

  const startCompass = () => {
    if (typeof window !== 'undefined') {
      if ("ondeviceorientationabsolute" in window) {
        window.addEventListener("deviceorientationabsolute", handleOrientation, true)
      } else {
        window.addEventListener("deviceorientation", handleOrientation, true)
      }
    }
  }

  const requestPermission = async () => {
    if (typeof window === 'undefined') return

    // iOS 13+ requires manual permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === 'granted') {
          setPermissionAllow(true)
          startCompass()
          toast({ title: "Compass Enabled", description: "Sensor access granted." })
        } else {
          setPermissionAllow(false)
          setError("Motion sensor permission is required for the real-time compass.")
        }
      } catch (err) {
        setError("Could not request sensor permission.")
      }
    } else {
      // Non-iOS or older versions
      setPermissionAllow(true)
      startCompass()
    }
  }

  useEffect(() => {
    getLocation()
    // Cleanup listeners
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation)
      window.removeEventListener("deviceorientation", handleOrientation)
    }
  }, [getLocation])

  // Check if phone is pointing towards Kaaba
  const isAligned = qiblaDir !== null && Math.abs((heading - qiblaDir + 540) % 360 - 180) < 5

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 transition-colors duration-500 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm backdrop-blur-md">
            <Compass className="w-4 h-4 text-secondary fill-secondary" />
            <span>Ultra Precision Qibla Finder</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-black text-primary dark:text-white tracking-tighter leading-[0.9]">
            Finding the <br />
            <span className="text-secondary drop-shadow-sm">Holy Direction</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Real-time Great-Circle navigation pointing you directly towards the Kaaba.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: The Compass Hardware UI */}
          <div className="flex flex-col items-center justify-center gap-12 order-2 lg:order-1">
            <div className="relative group perspective-1000">
              {/* Outer Glow Ring */}
              <div className={cn(
                "absolute inset-0 -z-10 rounded-full blur-[100px] transition-all duration-1000 opacity-20",
                isAligned ? "bg-secondary scale-150" : "bg-primary"
              )}></div>

              {/* The Compass Housing */}
              <div 
                className={cn(
                  "w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-white dark:bg-slate-900 shadow-[0_64px_128px_-12px_rgba(6,95,70,0.25)] border-[16px] border-white dark:border-slate-800 relative flex items-center justify-center transition-all duration-700",
                  isAligned ? "ring-[20px] ring-secondary/20 scale-105" : "ring-8 ring-primary/5"
                )}
              >
                {/* Degree Markings (Static) */}
                <div className="absolute inset-0 rounded-full border border-primary/5 opacity-30 pointer-events-none p-4">
                  {[...Array(72)].map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute top-0 left-1/2 -translate-x-1/2 h-full py-2"
                      style={{ transform: `rotate(${i * 5}deg)` }}
                    >
                      <div className={cn(
                        "w-0.5 rounded-full", 
                        i % 6 === 0 ? "h-6 bg-primary" : "h-3 bg-primary/40"
                      )}></div>
                      {i % 18 === 0 && (
                        <div className="mt-8 text-[10px] font-black text-primary/40 text-center uppercase tracking-tighter">
                          {i === 0 ? 'N' : i === 18 ? 'E' : i === 36 ? 'S' : 'W'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Rotating Inner Disc */}
                <div 
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out"
                  style={{ transform: `rotate(${-heading}deg)` }}
                >
                  {/* North Pointer */}
                  <div className="absolute top-12 flex flex-col items-center">
                    <span className="text-destructive font-black text-2xl mb-1 drop-shadow-md">N</span>
                    <div className="w-2 h-10 bg-destructive rounded-full shadow-lg"></div>
                  </div>

                  {/* Qibla Direction Indicator */}
                  {qiblaDir !== null && (
                    <div 
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ transform: `rotate(${qiblaDir}deg)` }}
                    >
                      {/* The Main Directional Line */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-1.5 h-[40%] bg-gradient-to-t from-emerald-500/0 via-emerald-500/40 to-secondary rounded-full -translate-y-full blur-[1px]"></div>
                      
                      {/* The Kaaba Arrow */}
                      <div className="relative group/kaaba -translate-y-28 sm:-translate-y-44">
                         <div className={cn(
                           "w-24 h-24 bg-emerald-950 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border-4 border-secondary overflow-hidden transition-all duration-700",
                           isAligned ? "scale-125 shadow-secondary/50 bg-emerald-900" : "scale-100"
                         )}>
                            <Navigation2 className="w-12 h-12 text-secondary fill-secondary animate-pulse" />
                            <span className="text-[10px] font-black text-secondary mt-1 tracking-widest">KABA</span>
                         </div>
                         
                         {/* Glow underlying the arrow */}
                         <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-pulse"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Center Cap */}
                <div className="absolute w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-2xl border-8 border-primary/10 z-30 flex items-center justify-center">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Support Message */}
            {!permissionGranted && (
              <div className="text-center space-y-4 animate-in fade-in duration-1000">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Action Required</p>
                <Button 
                  onClick={requestPermission}
                  className="h-16 px-12 emerald-gradient text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 group"
                >
                  <RefreshCcw className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-700" /> 
                  Enable Live Compass
                </Button>
              </div>
            )}
          </div>

          {/* Right Column: Information & Metrics */}
          <div className="space-y-8 order-1 lg:order-2">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 overflow-hidden">
              <div className={cn(
                "p-10 text-white transition-colors duration-1000",
                isAligned ? "emerald-gradient" : "bg-slate-800"
              )}>
                <div className="flex justify-between items-center mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Status</p>
                    <h3 className="text-2xl font-black">
                      {isAligned ? "Perfectly Aligned" : "Scanning..."}
                    </h3>
                  </div>
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all",
                    isAligned ? "bg-white/20 backdrop-blur-md" : "bg-white/5"
                  )}>
                    {isAligned ? <ShieldCheck className="w-8 h-8 text-secondary fill-secondary" /> : <Loader2 className="w-8 h-8 animate-spin text-white/40" />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                      <LocateFixed className="w-3 h-3" /> My Heading
                    </p>
                    <p className="text-5xl font-black">{Math.round(heading)}°</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                      <Navigation2 className="w-3 h-3 text-secondary fill-secondary" /> Qibla Bearing
                    </p>
                    <p className="text-5xl font-black text-secondary">
                      {qiblaDir ? Math.round(qiblaDir) : "--"}°
                    </p>
                  </div>
                </div>
              </div>

              <CardContent className="p-10 space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Your Current Location</p>
                      <p className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                        {isLocating ? "Detecting..." : locationName}
                      </p>
                      {coords && (
                        <p className="text-xs font-bold text-muted-foreground">
                          {coords.lat.toFixed(4)}° N, {coords.lon.toFixed(4)}° E
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                      <Milestone className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance to Kaaba</p>
                      <p className="text-3xl font-black text-primary">
                        {distance ? `~ ${distance.toLocaleString()} km` : "Calculating..."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="flex gap-4 items-start bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-900/20">
                    <Info className="w-6 h-6 text-amber-600 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Calibration Hint</p>
                      <p className="text-xs font-medium text-amber-700/80 dark:text-amber-200/60 leading-relaxed">
                        Hold your device flat and move it in a <strong>figure-8 motion</strong>. Metal cases or magnetic covers can interfere with accuracy.
                      </p>
                    </div>
                  </div>

                  <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl font-bold group border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={getLocation}>
                    Refresh GPS Data
                    <RefreshCcw className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-700" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              <Globe className="w-3.5 h-3.5" />
              <span>Great-Circle Navigation • Bangladesh Edition</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-twinkle {
          animation: twinkle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
