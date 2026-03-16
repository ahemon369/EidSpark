
"use client"

import { useState, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Compass, 
  MapPin, 
  RefreshCcw, 
  LocateFixed, 
  Loader2, 
  Navigation2, 
  Milestone,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"

export default function QiblaCompassPage() {
  const { toast } = useToast()
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)
  const [locationName, setLocationName] = useState<string>("Detecting...")
  const [distance, setDistance] = useState<number | null>(null)
  const [qiblaDir, setQiblaDir] = useState<number | null>(null)
  const [heading, setHeading] = useState<number>(0)
  const [permissionGranted, setPermissionAllow] = useState<boolean | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const KAABA = { lat: 21.4225, lon: 39.8262 }

  const calculateQibla = useCallback((lat: number, lon: number) => {
    const φ1 = (lat * Math.PI) / 180; const φ2 = (KAABA.lat * Math.PI) / 180; const Δλ = (KAABA.lon - lon) * Math.PI / 180
    const y = Math.sin(Δλ) * Math.cos(φ2); const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  }, [])

  const getLocation = useCallback(() => {
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords; setCoords({ lat: latitude, lon: longitude })
      setQiblaDir(calculateQibla(latitude, longitude)); setDistance(Math.round(6371 * 2 * Math.atan2(Math.sqrt(Math.sin((KAABA.lat - latitude) * Math.PI / 360) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(KAABA.lat * Math.PI / 180) * Math.sin((KAABA.lon - longitude) * Math.PI / 360) ** 2), Math.sqrt(1 - (Math.sin((KAABA.lat - latitude) * Math.PI / 360) ** 2 + Math.cos(latitude * Math.PI / 180) * Math.cos(KAABA.lat * Math.PI / 180) * Math.sin((KAABA.lon - longitude) * Math.PI / 360) ** 2)))))
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`).then(r => r.json()).then(d => setLocationName(`${data.city || data.locality}, ${data.countryName}`)).catch(() => setLocationName("Unknown Location"))
      setIsLocating(false)
    }, () => setIsLocating(false))
  }, [calculateQibla])

  const requestPermission = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      const r = await (DeviceOrientationEvent as any).requestPermission(); if (r === 'granted') { setPermissionAllow(true); window.addEventListener("deviceorientation", (e) => setHeading((e as any).webkitCompassHeading || e.alpha), true) }
    } else { setPermissionAllow(true); window.addEventListener("deviceorientation", (e) => setHeading((e as any).webkitCompassHeading || e.alpha), true) }
  }

  useEffect(() => { getLocation() }, [getLocation])

  const isAligned = qiblaDir !== null && Math.abs((heading - qiblaDir + 540) % 360 - 180) < 5

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-5xl mx-auto px-6 py-8 flex-grow">
          <header className="text-left mb-16 space-y-4">
            <h1 className="text-4xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9]">Qibla <br /><span className="text-secondary drop-shadow-sm">Finder</span></h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">High-precision navigation pointing towards the Holy Kaaba.</p>
          </header>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col items-center justify-center gap-12">
              <div className={cn("w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-white shadow-2xl border-[16px] border-white relative flex items-center justify-center transition-all duration-700", isAligned ? "ring-[20px] ring-secondary/20 scale-105" : "ring-8 ring-primary/5")}>
                <div className="absolute inset-0 rounded-full border border-primary/5 opacity-30 pointer-events-none p-4">
                  {[...Array(72)].map((_, i) => <div key={i} className="absolute top-0 left-1/2 -translate-x-1/2 h-full py-2" style={{ transform: `rotate(${i * 5}deg)` }}><div className={cn("w-0.5 rounded-full", i % 18 === 0 ? "h-6 bg-primary" : "h-3 bg-primary/40")} /></div>)}
                </div>
                <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 ease-out" style={{ transform: `rotate(${-heading}deg)` }}>
                  <div className="absolute top-12 flex flex-col items-center"><span className="text-destructive font-black text-2xl mb-1">N</span><div className="w-2 h-10 bg-destructive rounded-full shadow-lg" /></div>
                  {qiblaDir !== null && <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: `rotate(${qiblaDir}deg)` }}><div className="relative -translate-y-28 sm:-translate-y-44"><div className={cn("w-24 h-24 bg-emerald-950 rounded-[2.5rem] flex flex-col items-center justify-center shadow-2xl border-4 border-secondary transition-all", isAligned ? "scale-125 bg-emerald-900 shadow-secondary/50" : "scale-100")}><Navigation2 className="w-12 h-12 text-secondary fill-secondary animate-pulse" /><span className="text-[10px] font-black text-secondary mt-1 tracking-widest uppercase">Kaaba</span></div></div></div>}
                </div>
              </div>
              {!permissionGranted && <Button onClick={requestPermission} className="h-16 px-12 emerald-gradient text-white rounded-2xl font-black text-xl shadow-2xl hover:scale-[1.02] transition-transform">Enable Compass</Button>}
            </div>

            <div className="space-y-8">
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                <div className={cn("p-10 text-white transition-colors duration-1000", isAligned ? "emerald-gradient" : "bg-slate-800")}>
                  <div className="flex justify-between items-center mb-10">
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Status</p><h3 className="text-2xl font-black">{isAligned ? "Perfectly Aligned" : "Scanning..." }</h3></div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/10">{isAligned ? <ShieldCheck className="w-8 h-8 text-secondary fill-secondary" /> : <Loader2 className="w-8 h-8 animate-spin text-white/40" />}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-10">
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">My Heading</p><p className="text-5xl font-black">{Math.round(heading)}°</p></div>
                    <div className="space-y-1"><p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Qibla Angle</p><p className="text-5xl font-black text-secondary">{qiblaDir ? Math.round(qiblaDir) : "--"}°</p></div>
                  </div>
                </div>
                <CardContent className="p-10 space-y-10">
                  <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0"><MapPin className="w-7 h-7" /></div><div className="space-y-1"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Location</p><p className="text-lg font-black text-slate-800">{isLocating ? "Detecting..." : locationName}</p></div></div>
                  <div className="flex items-center gap-6"><div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0"><Milestone className="w-7 h-7" /></div><div className="space-y-1"><p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance to Kaaba</p><p className="text-3xl font-black text-primary">{distance ? `~ ${distance.toLocaleString()} km` : "Calculating..."}</p></div></div>
                  <Button variant="ghost" className="w-full justify-between h-14 rounded-2xl font-bold border border-slate-100 hover:bg-slate-50" onClick={getLocation}>Refresh GPS<RefreshCcw className="w-4 h-4 text-muted-foreground" /></Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
