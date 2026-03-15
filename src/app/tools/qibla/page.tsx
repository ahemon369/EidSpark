
"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Compass, MapPin, Info, RefreshCcw, LocateFixed, Sparkles, Loader2, Navigation2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function QiblaFinder() {
  const { toast } = useToast()
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [qiblaDir, setQiblaDir] = useState<number | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [isCalibrating, setIsCalibrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [permissionGranted, setPermissionAllow] = useState<boolean | null>(null)

  // Kaaba Coordinates
  const kaaba = { lat: 21.4225, lon: 39.8262 }

  const calculateQibla = useCallback((lat: number, lon: number) => {
    const φ1 = (lat * Math.PI) / 180
    const φ2 = (kaaba.lat * Math.PI) / 180
    const λ1 = (lon * Math.PI) / 180
    const λ2 = (kaaba.lon * Math.PI) / 180

    const y = Math.sin(λ2 - λ1)
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(λ2 - λ1)
    const q = (Math.atan2(y, x) * 180) / Math.PI
    return (q + 360) % 360
  }, [])

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lon: longitude })
        setQiblaDir(calculateQibla(latitude, longitude))
        setError(null)
      },
      (err) => {
        setError("Please enable location access to find Qibla direction.")
        console.error(err)
      }
    )
  }, [calculateQibla])

  const requestOrientationPermission = async () => {
    // For iOS 13+ devices
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission()
        if (response === 'granted') {
          setPermissionAllow(true)
          startCompass()
        } else {
          setPermissionAllow(false)
          toast({ title: "Permission Denied", description: "Compass access is required for real-time tracking.", variant: "destructive" })
        }
      } catch (err) {
        console.error(err)
      }
    } else {
      // For other devices
      setPermissionAllow(true)
      startCompass()
    }
  }

  const startCompass = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let compass = (e as any).webkitCompassHeading || e.alpha
      if (compass !== null && compass !== undefined) {
        // On non-iOS devices, alpha is relative to starting point, not absolute North
        // unless absolute orientation is supported
        setHeading(compass)
      }
    }
    window.addEventListener("deviceorientation", handleOrientation, true)
    return () => window.removeEventListener("deviceorientation", handleOrientation)
  }

  useEffect(() => {
    getLocation()
  }, [getLocation])

  const relativeQibla = qiblaDir !== null ? (qiblaDir - heading + 360) % 360 : 0
  const isAligned = Math.abs(relativeQibla) < 5 || Math.abs(relativeQibla - 360) < 5

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Compass className="w-4 h-4 text-secondary" />
            <span>Precise Qibla Finder</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Qibla Direction</h1>
          <p className="text-lg text-muted-foreground font-medium max-w-xl mx-auto">
            Accurate Kaaba direction using your device's magnetometer and GPS.
          </p>
        </div>

        <div className="grid gap-10 items-center justify-center">
          {/* Compass Visualization */}
          <div className="relative group perspective-1000">
            <div 
              className={cn(
                "w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white shadow-[0_32px_64px_-12px_rgba(6,95,70,0.2)] border-[12px] border-white relative flex items-center justify-center transition-all duration-500",
                isAligned ? "ring-8 ring-secondary/20 scale-105" : "ring-4 ring-primary/5"
              )}
            >
              {/* Outer Ring with Degrees */}
              <div className="absolute inset-0 rounded-full border-2 border-primary/5 opacity-40">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute top-0 left-1/2 -translate-x-1/2 h-full py-2 flex flex-col justify-between"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                  >
                    <div className="w-0.5 h-3 bg-primary/20"></div>
                    <div className="w-0.5 h-3 bg-primary/20"></div>
                  </div>
                ))}
              </div>

              {/* Rotating Inner Part */}
              <div 
                className="relative w-full h-full flex items-center justify-center transition-transform duration-100 ease-out"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                {/* North Indicator */}
                <div className="absolute top-6 flex flex-col items-center">
                  <span className="text-destructive font-black text-xl mb-1">N</span>
                  <div className="w-1 h-4 bg-destructive rounded-full"></div>
                </div>

                {/* Qibla Direction Indicator */}
                {qiblaDir !== null && (
                  <div 
                    className="absolute inset-0 flex flex-col items-center pt-10"
                    style={{ transform: `rotate(${qiblaDir}deg)` }}
                  >
                    <div className="relative group/kaaba animate-bounce">
                       <div className="w-16 h-16 bg-emerald-950 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-secondary overflow-hidden">
                          <Navigation2 className="w-8 h-8 text-secondary fill-secondary" />
                       </div>
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase whitespace-nowrap shadow-lg">
                         Qibla Direction
                       </div>
                    </div>
                    <div className="w-1.5 h-32 emerald-gradient rounded-full mt-4 shadow-lg"></div>
                  </div>
                )}
              </div>

              {/* Center Cap */}
              <div className="absolute w-6 h-6 bg-white rounded-full shadow-inner border-4 border-primary/10 z-20"></div>
            </div>

            {/* Alignment Glow */}
            {isAligned && (
              <div className="absolute inset-0 -z-10 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
            )}
          </div>

          {/* Controls & Info */}
          <div className="max-w-md w-full space-y-6">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white/80 backdrop-blur-xl">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Heading</p>
                    <p className="text-3xl font-black text-primary">{Math.round(heading)}°</p>
                  </div>
                  <div className="h-10 w-px bg-primary/10"></div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Qibla Angle</p>
                    <p className="text-3xl font-black text-secondary">{qiblaDir ? Math.round(qiblaDir) : "--"}°</p>
                  </div>
                </div>

                {!permissionGranted && (
                  <Button 
                    onClick={requestOrientationPermission}
                    className="w-full h-14 emerald-gradient text-white rounded-2xl font-black text-lg shadow-xl"
                  >
                    <RefreshCcw className="w-5 h-5 mr-2" /> Enable Compass
                  </Button>
                )}

                {error && (
                  <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-bold flex items-start gap-3">
                    <Info className="w-5 h-5 shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {isAligned && (
                  <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20 text-primary text-center font-black animate-pulse flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" /> You are facing the Qibla
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10 flex gap-4 items-start shadow-sm">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-primary uppercase tracking-wider">Calibration Tip</p>
                <p className="text-[11px] text-primary/70 font-bold leading-relaxed">
                  Hold your phone flat and move it in a figure-8 pattern to calibrate the sensors. Ensure you are away from large metal objects or magnetic fields.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
