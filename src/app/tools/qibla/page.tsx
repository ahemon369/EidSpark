
"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Compass, MapPin, Info, RefreshCcw, LocateFixed, Sparkles, Loader2, Navigation2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function QiblaFinder() {
  const { toast } = useToast()
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [qiblaDir, setQiblaDir] = useState<number | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionAllow] = useState<boolean | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  // Kaaba Coordinates
  const kaaba = { lat: 21.4225, lon: 39.8262 }

  const calculateQibla = useCallback((lat: number, lon: number) => {
    // Convert to radians
    const φ1 = (lat * Math.PI) / 180
    const φ2 = (kaaba.lat * Math.PI) / 180
    const λ1 = (lon * Math.PI) / 180
    const λ2 = (kaaba.lon * Math.PI) / 180

    const Δλ = λ2 - λ1

    const y = Math.sin(Δλ) * Math.cos(φ2)
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    
    const q = (Math.atan2(y, x) * 180) / Math.PI
    return (q + 360) % 360
  }, [])

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
        setError(null)
        setIsLocating(false)
      },
      (err) => {
        setError("Please enable location access to calculate Qibla direction.")
        setIsLocating(false)
        console.error(err)
      },
      { enableHighAccuracy: true }
    )
  }, [calculateQibla])

  const requestOrientationPermission = async () => {
    // Check if device supports orientation
    if (typeof window !== 'undefined' && !window.DeviceOrientationEvent) {
      toast({ title: "Not Supported", description: "This device does not have compass sensors.", variant: "destructive" })
      return
    }

    // For iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === 'granted') {
          setPermissionAllow(true)
          startCompass()
        } else {
          setPermissionAllow(false)
          toast({ title: "Permission Denied", description: "Motion access is required for real-time tracking.", variant: "destructive" })
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      // For non-iOS devices or older versions
      setPermissionAllow(true)
      startCompass()
    }
  }

  const startCompass = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is specifically for iOS and provides absolute North
      let compass = (e as any).webkitCompassHeading || e.alpha
      
      if (compass !== null && compass !== undefined) {
        // If it's standard alpha (non-iOS), it might be relative. 
        // Absolute orientation requires 'absolute' property or 'deviceorientationabsolute' event
        setHeading(compass)
      }
    }

    // Use absolute event if available for Android
    if ("ondeviceorientationabsolute" in window) {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true)
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true)
    }
  }

  useEffect(() => {
    getLocation()
  }, [getLocation])

  // Calculate direction relative to user's phone orientation
  // If qiblaDir is 250 and heading is 0 (North), the needle points at 250.
  // If phone is facing 250, heading is 250, then needle points at 0 (Straight Ahead).
  const isAligned = qiblaDir !== null && Math.abs((heading - qiblaDir + 540) % 360 - 180) < 5

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Compass className="w-4 h-4 text-secondary" />
            <span>Precise Qibla Finder</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary dark:text-white tracking-tight">Qibla Compass</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Pointing you towards the Kaaba using real-time GPS and device orientation.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-12">
          {/* Compass Visualization */}
          <div className="relative group perspective-1000">
            {/* The Outer Static Frame */}
            <div 
              className={cn(
                "w-72 h-72 sm:w-[450px] sm:h-[450px] rounded-full bg-white dark:bg-slate-900 shadow-[0_32px_64px_-12px_rgba(6,95,70,0.2)] border-[12px] border-white dark:border-slate-800 relative flex items-center justify-center transition-all duration-500",
                isAligned ? "ring-[12px] ring-secondary/20 scale-105" : "ring-4 ring-primary/5"
              )}
            >
              {/* Decorative Compass Markings (Static) */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/5 opacity-20 pointer-events-none">
                {[...Array(72)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "absolute top-0 left-1/2 -translate-x-1/2 h-full py-1",
                      i % 2 === 0 ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transform: `rotate(${i * 5}deg)` }}
                  >
                    <div className={cn("w-0.5 rounded-full bg-primary", i % 6 === 0 ? "h-4" : "h-2")}></div>
                  </div>
                ))}
              </div>

              {/* Rotating Compass Disc */}
              <div 
                className="relative w-full h-full flex items-center justify-center transition-transform duration-300 ease-out"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                {/* North Indicator */}
                <div className="absolute top-8 flex flex-col items-center">
                  <span className="text-destructive font-black text-2xl mb-1 drop-shadow-sm">N</span>
                  <div className="w-1.5 h-6 bg-destructive rounded-full shadow-sm"></div>
                </div>

                {/* Cardinal Directions */}
                <span className="absolute right-10 text-primary font-black text-sm opacity-40">E</span>
                <span className="absolute bottom-10 text-primary font-black text-sm opacity-40">S</span>
                <span className="absolute left-10 text-primary font-black text-sm opacity-40">W</span>

                {/* Qibla Direction Needle */}
                {qiblaDir !== null && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ transform: `rotate(${qiblaDir}deg)` }}
                  >
                    <div className="relative group/kaaba -translate-y-24 sm:-translate-y-40">
                       <div className={cn(
                         "w-20 h-20 bg-emerald-950 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-secondary overflow-hidden transition-all duration-500",
                         isAligned ? "scale-125 shadow-secondary/40" : "scale-100"
                       )}>
                          <Navigation2 className="w-10 h-10 text-secondary fill-secondary animate-pulse" />
                       </div>
                       <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-secondary text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase whitespace-nowrap shadow-xl">
                         Kaaba
                       </div>
                       
                       {/* Arrow pointing to center */}
                       <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1.5 h-32 emerald-gradient rounded-full shadow-lg opacity-60"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Central Pivot Cap */}
              <div className="absolute w-8 h-8 bg-white dark:bg-slate-800 rounded-full shadow-2xl border-4 border-primary/10 z-20 flex items-center justify-center">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              </div>
            </div>

            {/* Alignment Glow Effect */}
            {isAligned && (
              <div className="absolute inset-0 -z-10 bg-secondary/20 rounded-full blur-[100px] animate-pulse"></div>
            )}
          </div>

          {/* Controls & Metrics Panel */}
          <div className="max-w-md w-full space-y-6">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20">
              <CardContent className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8 relative">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <LocateFixed className="w-3 h-3" /> Device Heading
                    </p>
                    <p className="text-4xl font-black text-primary transition-all">
                      {Math.round(heading)}°
                    </p>
                  </div>
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-px bg-primary/10"></div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 justify-end">
                      Bearing to Qibla <Sparkles className="w-3 h-3 text-secondary" />
                    </p>
                    <p className="text-4xl font-black text-secondary">
                      {qiblaDir ? Math.round(qiblaDir) : "--"}°
                    </p>
                  </div>
                </div>

                {!permissionGranted && (
                  <Button 
                    onClick={requestOrientationPermission}
                    className="w-full h-16 emerald-gradient text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] transition-transform active:scale-95 group"
                  >
                    <RefreshCcw className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" /> 
                    Enable Compass Sensors
                  </Button>
                )}

                {error ? (
                  <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-bold flex items-start gap-4 animate-in shake-in duration-500">
                    <Info className="w-6 h-6 shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                ) : isLocating ? (
                  <div className="flex items-center justify-center gap-3 text-muted-foreground py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-bold uppercase tracking-widest">Syncing GPS...</span>
                  </div>
                ) : null}

                {isAligned && (
                  <div className="p-6 rounded-[2rem] bg-secondary/10 border-2 border-secondary/20 text-primary text-center font-black animate-bounce shadow-xl shadow-secondary/5 flex items-center justify-center gap-3">
                    <Sparkles className="w-6 h-6 animate-twinkle" /> 
                    <span>Aligned with Qibla</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Location Info */}
            {coords && (
              <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase">Current Location</p>
                    <p className="text-xs font-bold text-primary">{coords.lat.toFixed(4)}°, {coords.lon.toFixed(4)}°</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={getLocation} className="rounded-full hover:bg-primary/10">
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Calibration Tip */}
            <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-900/20 flex gap-5 items-start shadow-sm">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-amber-600 shadow-md shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Calibration Tip</p>
                <p className="text-sm text-amber-700/80 dark:text-amber-200/60 font-medium leading-relaxed">
                  Hold your phone flat and move it in a <strong>figure-8 pattern</strong> to calibrate the magnetic sensors. Ensure you are away from large metal objects or high-voltage equipment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CSS for custom animations */}
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .animate-twinkle {
          animation: twinkle 2s infinite ease-in-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  )
}
