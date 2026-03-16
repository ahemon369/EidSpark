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
import { BackButton } from "@/components/back-button"

const MoonMap = dynamic(() => import("@/components/moon-sighting-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center space-y-4 animate-pulse rounded-[3rem]">
      <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-secondary/40 uppercase tracking-widest">Initializing Map...</p>
    </div>
  ),
})

interface StarItem { top: string; left: string; size: string; delay: string; }

export default function MoonSightingTrackerPage() {
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [locationName, setLocationName] = useState(""); const [lat, setLat] = useState<number | "">(""); const [lng, setLng] = useState<number | "">("")
  const [seen, setSeen] = useState(true); const [notes, setNotes] = useState(""); const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null); const [stars, setStars] = useState<StarItem[]>([])

  useEffect(() => {
    setStars([...Array(100)].map(() => ({ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, size: `${Math.random() * 2 + 1}px`, delay: `${Math.random() * 5}s` })))
  }, [])

  const sightingsRef = useMemoFirebase(() => db ? query(collection(db, "moonSightings"), orderBy("timestamp", "desc"), limit(50)) : null, [db])
  const { data: sightings, isLoading: loadingSightings } = useCollection(sightingsRef)
  const adminRoleRef = useMemoFirebase(() => (db && user) ? doc(db, "roles_admin", user.uid) : null, [db, user])
  const { data: adminDoc } = useDoc(adminRoleRef); const isAdmin = !!adminDoc

  const todaySeenCount = sightings?.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString()).length || 0

  const detectLocation = () => {
    if (navigator.geolocation) {
      toast({ title: "Detecting Location..." })
      navigator.geolocation.getCurrentPosition((pos) => { setLat(pos.coords.latitude); setLng(pos.coords.longitude); toast({ title: "Location Detected" }) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) { toast({ title: "Sign in required" }); return }
    if (!locationName || lat === "" || lng === "") { toast({ variant: "destructive", title: "Missing Info" }); return }
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "moonSightings"), { userId: user.uid, userName: user.displayName || "Anonymous User", locationName, lat: Number(lat), lng: Number(lng), seen, notes, timestamp: new Date().toISOString() })
      awardPoints(db, user.uid, 'ReportMoon'); toast({ title: "Sighting Reported!" })
      setLocationName(""); setNotes(""); setLat(""); setLng("")
    } catch (error) {} finally { setIsSubmitting(false) }
  }

  const handleDelete = async (id: string) => {
    if (!db || !user) return; setIsDeleting(id)
    try { await deleteDoc(doc(db, "moonSightings", id)); toast({ title: "Report Removed" }) } catch (error) {} finally { setIsDeleting(null) }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-secondary selection:text-primary relative overflow-hidden flex flex-col">
      <Navbar />
      <div className="fixed inset-0 pointer-events-none opacity-20">{stars.map((star, i) => <div key={i} className="absolute bg-white rounded-full animate-twinkle" style={{ top: star.top, left: star.left, width: star.size, height: star.size, animationDelay: star.delay }} />)}</div>

      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        <main className="max-w-[1800px] mx-auto px-4 py-8 relative z-10 flex-grow">
          <div className="flex justify-center mb-12"><div className="bg-white/5 border border-white/10 backdrop-blur-xl px-10 py-4 rounded-full shadow-2xl flex items-center gap-4"><span className="text-3xl">🌙</span><div className="text-left"><p className="text-2xl font-black"><span className="text-secondary">{todaySeenCount}</span> Moon Sightings Reported</p></div></div></div>
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-3 space-y-8">
              <Card className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl overflow-hidden border-2">
                <CardHeader className="p-8 pb-4"><CardTitle className="text-2xl font-black flex items-center gap-3"><Navigation className="w-6 h-6 text-secondary" /> New Report</CardTitle></CardHeader>
                <CardContent className="p-8 pt-0">
                  {!user ? <Button className="w-full h-14 rounded-2xl emerald-gradient font-black" onClick={() => window.location.href = '/login'}>Log In to Report</Button> : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <Input value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="City / District" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Lat" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" />
                        <Input type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Lon" className="h-14 rounded-2xl bg-white/5 border-white/10 text-white" />
                      </div>
                      <div className="flex items-center justify-between p-6 rounded-3xl border-2 border-white/10 bg-white/5"><Label className="text-sm font-black">Moon Seen?</Label><Switch checked={seen} onCheckedChange={setSeen} /></div>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Weather notes..." className="rounded-2xl bg-white/5 border-white/10 text-white" />
                      <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl">{isSubmitting ? <Loader2 className="animate-spin" /> : "Post Report"}</Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-6 h-[600px] lg:h-[850px]"><MoonMap sightings={sightings || []} /></div>
            <div className="lg:col-span-3 h-[850px] overflow-y-auto custom-scrollbar bg-white/5 rounded-[3rem] p-6 space-y-4">
              <h3 className="text-xl font-black mb-4">Live Feed</h3>
              {sightings?.map(s => <div key={s.id} className="p-4 bg-white/5 rounded-2xl">
                <p className="font-black text-sm">{s.locationName}</p>
                <p className="text-[10px] text-slate-500 uppercase">{s.userName} • {s.seen ? 'SPOTTED' : 'NOT SEEN'}</p>
              </div>)}
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
