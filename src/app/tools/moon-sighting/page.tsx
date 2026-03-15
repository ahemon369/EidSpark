
"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Moon, 
  Sparkles, 
  Navigation, 
  Send, 
  Clock, 
  Loader2, 
  Info, 
  Globe,
  Trash2,
  CheckCircle2,
  XCircle,
  EyeOff,
  ShieldCheck,
  Star
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { awardPoints } from "@/lib/gamification-utils"

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

interface StarItem {
  top: string;
  left: string;
  size: string;
  delay: string;
}

export default function MoonSightingTrackerPage() {
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
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  
  // Star State for hydration fix
  const [stars, setStars] = useState<StarItem[]>([])

  useEffect(() => {
    // Generate stars only on the client to avoid hydration mismatch
    const generatedStars = [...Array(100)].map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`
    }))
    setStars(generatedStars)
  }, [])

  // Fetch Sightings
  const sightingsRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "moonSightings"), orderBy("timestamp", "desc"), limit(50))
  }, [db])

  const { data: sightings, isLoading: loadingSightings } = useCollection(sightingsRef)

  // Fetch Admin Role
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "roles_admin", user.uid)
  }, [db, user])
  const { data: adminDoc } = useDoc(adminRoleRef)
  const isAdmin = !!adminDoc

  // Today's specific reports counter logic
  const todaySeenCount = sightings?.filter(s => {
    const reportDate = new Date(s.timestamp);
    const today = new Date();
    return reportDate.toDateString() === today.toDateString();
  }).length || 0;

  // Auto-detect Location
  const detectLocation = () => {
    if (navigator.geolocation) {
      toast({ title: "Detecting Location...", description: "Please allow GPS access." })
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        toast({ title: "Location Detected", description: "GPS coordinates updated." })
      }, (err) => {
        toast({ variant: "destructive", title: "Location Error", description: "Could not get GPS. Please enter manually." })
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
      
      // Award Points
      awardPoints(db, user.uid, 'ReportMoon')

      toast({ title: "Sighting Reported!", description: "Your report is now live on the community map." })
      setLocationName("")
      setNotes("")
      setLat("")
      setLng("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "moonSightings", id))
      toast({ title: "Report Removed" })
    } catch (error) {}
    setIsDeleting(null)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-secondary selection:text-primary relative overflow-hidden">
      <Navbar />
      
      {/* Immersive Star Field */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {stars.map((star, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-twinkle" 
            style={{ 
              top: star.top, 
              left: star.left, 
              width: star.size, 
              height: star.size,
              animationDelay: star.delay
            }}
          />
        ))}
      </div>

      <main className="max-w-[1800px] mx-auto px-4 py-16 sm:px-6 lg:px-8 relative z-10">
        
        {/* Today's Counter Banner */}
        <div className="flex justify-center mb-12 animate-in fade-in slide-in-from-top duration-1000">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-10 py-4 rounded-full shadow-[0_0_50px_rgba(233,190,36,0.1)] flex items-center gap-4 border-2">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary blur-lg opacity-40 animate-pulse"></div>
              <span className="text-3xl relative">🌙</span>
            </div>
            <div className="text-left">
              <p className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-none">
                <span className="text-secondary">{todaySeenCount}</span> Moon Sightings Reported
              </p>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">In Bangladesh Today</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top duration-700 delay-200">
          <div className="space-y-6 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md">
              <Sparkles className="w-4 h-4 animate-twinkle" />
              <span>Real-Time Community Network</span>
            </div>
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
              Moon Sight <br />
              <span className="text-secondary drop-shadow-[0_0_30px_rgba(233,190,36,0.3)]">Tracker</span>
            </h1>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
              Track the hilal across Bangladesh. Earn <span className="text-secondary font-black">+8 XP</span> per report!
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl shadow-2xl min-w-[160px]">
                <p className="text-5xl font-black text-secondary">{sightings?.filter(s => s.seen).length || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Total Spotted</p>
             </div>
             <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 text-center backdrop-blur-xl shadow-2xl min-w-[160px]">
                <p className="text-5xl font-black text-white">{sightings?.length || 0}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Total Reports</p>
             </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-3 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border-2">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-black flex items-center gap-3 text-white">
                    <Navigation className="w-6 h-6 text-secondary" /> New Report
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={detectLocation} className="rounded-full bg-white/5 hover:bg-secondary/20 hover:text-secondary border border-white/10">
                    <Globe className="w-5 h-5" />
                  </Button>
                </div>
                <CardDescription className="text-slate-400 font-medium pt-2">Help the community by reporting your observation.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                {!user ? (
                  <div className="py-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <Globe className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">Sign in to report a sighting and earn points.</p>
                    <Button className="w-full h-14 rounded-2xl emerald-gradient font-black text-lg shadow-xl" onClick={() => window.location.href = '/login'}>Log In Now</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 flex items-center justify-center gap-2">
                      <Star className="w-4 h-4 text-secondary fill-secondary" />
                      <span className="text-[10px] font-black uppercase text-secondary tracking-widest">+8 Eid Points per report</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">City / District</Label>
                      <Input 
                        value={locationName} 
                        onChange={(e) => setLocationName(e.target.value)} 
                        placeholder="e.g. Dhaka, Mirpur" 
                        className="h-14 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-secondary/50 focus:ring-secondary/20 transition-all border-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Latitude</Label>
                        <Input 
                          type="number" 
                          step="any"
                          value={lat} 
                          onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))} 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-white border-2"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Longitude</Label>
                        <Input 
                          type="number" 
                          step="any"
                          value={lng} 
                          onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))} 
                          className="h-14 rounded-2xl bg-white/5 border-white/10 text-white border-2"
                        />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center justify-between p-6 rounded-3xl border-2 transition-all",
                      seen ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                    )}>
                      <Label htmlFor="seen-toggle" className="flex-grow cursor-pointer space-y-0.5">
                        <span className="text-sm font-black text-white block">Moon Seen?</span>
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">
                          {seen ? "YES - Spotted" : "NO - Not visible"}
                        </span>
                      </Label>
                      <Switch id="seen-toggle" checked={seen} onCheckedChange={setSeen} />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Observation Notes</Label>
                      <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Weather, clouds, visibility..." 
                        className="rounded-2xl bg-white/5 border-white/10 text-white min-h-[100px] border-2"
                      />
                    </div>

                    <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl hover:scale-[1.02] transition-transform">
                      {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send className="w-6 h-6 mr-3" /> Post Report</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="bg-secondary/5 border-2 border-secondary/20 p-8 rounded-[3rem] flex gap-5 items-start shadow-2xl">
              <Info className="w-8 h-8 text-secondary shrink-0" />
              <div className="space-y-2">
                <p className="text-xs font-black text-secondary uppercase tracking-widest">Official Notice</p>
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  Community reports are for guidance only. Wait for the official National Moon Sighting Committee announcement.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 h-[600px] lg:h-[850px] animate-in fade-in duration-1000 delay-200">
            <MoonMap sightings={sightings || []} />
          </div>

          <div className="lg:col-span-3 space-y-6 animate-in fade-in slide-in-from-right duration-700">
            <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl h-[850px] flex flex-col border-2">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-xl font-black flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  Live Feed
                </CardTitle>
                <CardDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest">Real-time reports</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-grow">
                {loadingSightings ? (
                  <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary" /></div>
                ) : sightings && sightings.length > 0 ? (
                  <div className="divide-y divide-white/5">
                    {sightings.map((s) => (
                      <div key={s.id} className="p-6 hover:bg-white/5 transition-all group relative">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center border",
                              s.seen ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-rose-500/20 border-rose-500/30 text-rose-400"
                            )}>
                              {s.seen ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-black text-sm text-white">{s.locationName}</h4>
                              <div className="flex items-center gap-1">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.userName}</p>
                                {isAdmin && <ShieldCheck className="w-3 h-3 text-secondary" />}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500">{format(new Date(s.timestamp), "h:mm aa")}</p>
                            <p className="text-[10px] font-bold text-slate-600">{format(new Date(s.timestamp), "MMM d")}</p>
                          </div>
                        </div>
                        {s.notes && <p className="text-[11px] text-slate-400 italic pl-13 line-clamp-2 leading-relaxed">"{s.notes}"</p>}
                        
                        {user && (user.uid === s.userId || isAdmin) && (
                          <button 
                            onClick={() => handleDelete(s.id)}
                            disabled={isDeleting === s.id}
                            className="absolute top-6 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-500 text-white p-1.5 rounded-lg shadow-lg hover:scale-110 active:scale-95 z-20"
                          >
                            {isDeleting === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-20 text-center opacity-30">
                    <EyeOff className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-black text-xs uppercase tracking-widest">No reports yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
