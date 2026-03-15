
"use client"

import { useState, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Moon, Sparkles, MapPin, Navigation, Send, Clock, Loader2, Info, Share2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

// Dynamically import the map to avoid SSR issues with Leaflet
const MoonMap = dynamic(() => import("@/components/moon-sighting-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-4 animate-pulse rounded-[3rem]">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-secondary/40 uppercase tracking-widest">Initializing Map...</p>
    </div>
  ),
})

export default function MoonSightingMapPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Form State
  const [locationName, setLocationName] = useState("")
  const [lat, setLat] = useState<number | "">("")
  const [lng, setLng] = useState<number | "">("")
  const [seen, setSeen] = useState(true)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Sightings
  const sightingsRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "moonSightings"), orderBy("timestamp", "desc"), limit(100))
  }, [db])

  const { data: sightings, isLoading: loadingSightings } = useCollection(sightingsRef)

  // Auto-detect Location
  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        toast({ title: "Coordinates Detected", description: "Your current location is set." })
      }, (err) => {
        toast({ variant: "destructive", title: "Location Error", description: "Please enter coordinates manually." })
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) {
      toast({ title: "Sign in required", description: "Please log in to report a sighting." })
      return
    }

    if (!locationName || lat === "" || lng === "") {
      toast({ variant: "destructive", title: "Missing Info", description: "Please provide location and coordinates." })
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "moonSightings"), {
        userId: user.uid,
        userName: user.displayName || "Anonymous User",
        locationName,
        lat: Number(lat),
        lng: Number(lng),
        seen,
        notes,
        timestamp: new Date().toISOString()
      })
      
      toast({ title: "Sighting Reported!", description: "Your report is now live on the community map." })
      setLocationName("")
      setNotes("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-secondary selection:text-primary">
      <Navbar />
      
      {/* Stars Background Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-twinkle" 
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`, 
              width: `${Math.random() * 3}px`, 
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-twinkle" />
              <span>Real-Time Community Map</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              Moon Sighting <br />
              <span className="text-secondary drop-shadow-[0_0_30px_rgba(233,190,36,0.3)]">Tracker</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed">
              Join the community in tracking the birth of the new moon across Bangladesh. Real-time reports from every division.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center backdrop-blur-xl">
                <p className="text-3xl font-black text-secondary">{sightings?.filter(s => s.seen).length || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Confirmed Sightings</p>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-3xl p-6 text-center backdrop-blur-xl">
                <p className="text-3xl font-black text-white">{sightings?.length || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Reports</p>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left: Map Section */}
          <div className="lg:col-span-8 space-y-6 h-[600px] lg:h-[800px] animate-in fade-in duration-1000 delay-200">
            <MoonMap sightings={sightings || []} />
          </div>

          {/* Right: Form & Feed Section */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-right duration-700 delay-300">
            <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden group">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-white">
                    <Navigation className="w-6 h-6 text-secondary" /> Report Sight
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={detectLocation} className="rounded-full bg-white/5 hover:bg-secondary/20 hover:text-secondary">
                    <MapPin className="w-5 h-5" />
                  </Button>
                </div>
                <CardDescription className="text-slate-400 font-medium">Contribute to the national community map.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {!user ? (
                  <div className="py-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                      <Globe className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Sign in to report a sighting from your location.</p>
                    <Button className="w-full h-14 rounded-2xl emerald-gradient font-black text-lg" onClick={() => window.location.href = '/login'}>Log In Now</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-500 ml-1">Your City / Location</Label>
                      <Input 
                        value={locationName} 
                        onChange={(e) => setLocationName(e.target.value)} 
                        placeholder="e.g. Dhaka, Gulshan" 
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-secondary/50 focus:ring-secondary/20 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-500 ml-1">Latitude</Label>
                        <Input 
                          type="number" 
                          step="any"
                          value={lat} 
                          onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))} 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-500 ml-1">Longitude</Label>
                        <Input 
                          type="number" 
                          step="any"
                          value={lng} 
                          onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))} 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-white"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/10">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-black text-white">Did you see the moon?</Label>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Verification status</p>
                      </div>
                      <Switch checked={seen} onCheckedChange={setSeen} className="data-[state=checked]:bg-secondary" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-500 ml-1">Extra Notes (Optional)</Label>
                      <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Weather conditions, visibility, etc." 
                        className="rounded-2xl bg-white/5 border-white/10 text-white min-h-[100px]"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl shadow-secondary/10 hover:scale-[1.02] transition-transform">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="w-6 h-6 mr-3" /> Post Report</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="bg-secondary/5 border border-secondary/20 p-6 rounded-[2.5rem] flex gap-4 items-start shadow-2xl">
              <Info className="w-6 h-6 text-secondary shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-black text-secondary uppercase tracking-widest">Sighting Verification</p>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  Community reports are used for guidance. Please refer to official announcements from the Islamic Foundation Bangladesh for the formal Eid declaration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
