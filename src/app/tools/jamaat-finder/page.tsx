
"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MapPin, 
  Search, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  Navigation,
  Globe,
  LocateFixed,
  Sparkles,
  Info,
  Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AddJamaatTimeModal } from "@/components/add-jamaat-time-modal"
import { AdminJamaatPanel } from "@/components/admin-jamaat-panel"
import { useToast } from "@/hooks/use-toast"

const JamaatMap = dynamic(() => import("@/components/jamaat-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center space-y-4 animate-pulse rounded-[3rem]">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary/40 uppercase tracking-widest">Initialising Live Map...</p>
    </div>
  ),
})

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function JamaatFinderPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  
  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques")
  }, [db])
  const { data: allMosques, isLoading: loadingMosques } = useCollection(mosquesRef)

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "roles_admin", user.uid)
  }, [db, user])
  const { data: adminDoc } = useDoc(adminRoleRef)
  const isAdmin = !!adminDoc

  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "Geolocation is not supported by your browser." })
      return
    }
    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(loc)
        setIsDetecting(false)
        toast({ title: "Location Found", description: "Showing nearest mosques." })
      },
      () => {
        setIsDetecting(false)
        toast({ variant: "destructive", title: "Location Error", description: "Please enable GPS access." })
      }
    )
  }, [toast])

  const filteredMosques = useMemo(() => {
    if (!allMosques) return []
    let mosques = [...allMosques]
    if (userLocation) {
      mosques = mosques.map(m => ({
        ...m,
        distance: calculateDistance(userLocation[0], userLocation[1], m.latitude, m.longitude)
      }))
      mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }
    if (!searchQuery) return mosques
    const q = searchQuery.toLowerCase()
    return mosques.filter(m => 
      m.name.toLowerCase().includes(q) ||
      m.district.toLowerCase().includes(q) ||
      m.area.toLowerCase().includes(q)
    )
  }, [allMosques, searchQuery, userLocation])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-0 transition-colors duration-500">
      <Navbar />
      
      {/* Floating Status Indicator */}
      <div className="fixed bottom-8 right-8 z-[100] animate-in slide-in-from-bottom-10 duration-1000">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl border border-primary/10 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Updates Active</span>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary dark:text-secondary text-xs font-black uppercase tracking-widest border border-primary/10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
              <span>Community-Driven Platform</span>
            </div>
            <h1 className="text-5xl lg:text-[90px] font-black text-primary dark:text-white tracking-tighter leading-[0.9]">Find Eid Prayers</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              Discover verified Eid prayer times across Bangladesh. Join thousands of users contributing to the most accurate prayer map.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 lg:pb-4">
            <div className="relative w-full sm:w-96 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input 
                placeholder="Mosque, District, or Area..." 
                className="h-16 pl-14 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl border-primary/5 focus:border-primary/20 transition-all text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-4 w-full sm:w-auto">
              <Button 
                variant="outline" 
                className={cn(
                  "flex-1 sm:flex-none h-16 rounded-[2rem] border-2 font-black px-8 shadow-xl transition-all hover:scale-105 active:scale-95",
                  userLocation ? "border-emerald-500 bg-emerald-500/5 text-emerald-600" : "border-slate-200"
                )}
                onClick={handleFindNearMe}
                disabled={isDetecting}
              >
                {isDetecting ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <LocateFixed className="w-5 h-5 mr-3" />}
                Near Me
              </Button>
              <AddMosqueModal />
            </div>
          </div>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <div className="flex justify-between items-center mb-10">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-primary/5 p-1 rounded-[2.5rem] h-16 shadow-2xl">
              <TabsTrigger value="map" className="rounded-[2rem] font-black px-10 h-full text-base transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl">Map View</TabsTrigger>
              <TabsTrigger value="list" className="rounded-[2rem] font-black px-10 h-full text-base transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-xl">List View</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin" className="rounded-[2rem] font-black px-10 h-full text-base transition-all data-[state=active]:bg-secondary data-[state=active]:text-primary">Admin Control</TabsTrigger>}
            </TabsList>
            
            <div className="hidden lg:flex items-center gap-6">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Confirmed</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]"></div>
                 <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Pending Verification</span>
               </div>
            </div>
          </div>

          <TabsContent value="map" className="animate-in fade-in zoom-in duration-1000 h-[800px] rounded-[4rem] overflow-hidden border-[12px] border-white dark:border-slate-900 shadow-[0_64px_128px_-12px_rgba(0,0,0,0.1)]">
            <JamaatMap mosques={filteredMosques} onSelectMosque={setSelectedMosqueId} userLocation={userLocation} />
          </TabsContent>

          <TabsContent value="list" className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredMosques.length > 0 ? filteredMosques.map((mosque) => (
                <MosqueCard key={mosque.id} mosque={mosque} isAdmin={isAdmin} />
              )) : (
                <div className="col-span-full py-32 text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto">
                    <Globe className="w-12 h-12 text-primary/20" />
                  </div>
                  <p className="text-2xl font-black text-muted-foreground">No mosques found matching "{searchQuery}"</p>
                  <Button variant="ghost" onClick={() => setSearchQuery("")} className="font-bold">Clear Search</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="animate-in fade-in duration-700">
            <AdminJamaatPanel />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

function MosqueCard({ mosque, isAdmin }: { mosque: any, isAdmin: boolean }) {
  const db = useFirestore()
  const timesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques", mosque.id, "jamaatTimes")
  }, [db, mosque.id])
  const { data: times } = useCollection(timesRef)
  
  const approvedTimes = useMemo(() => 
    times?.filter(t => t.isApprovedByAdmin || isAdmin).sort((a, b) => a.time.localeCompare(b.time)) || [], 
  [times, isAdmin])

  return (
    <Card className="border-none shadow-xl rounded-[3.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:-translate-y-3 transition-all duration-500 hover:shadow-[0_48px_96px_-12px_rgba(6,95,70,0.15)] border border-transparent hover:border-primary/10">
      <div className={cn(
        "p-10 text-white relative overflow-hidden transition-all duration-500",
        mosque.isApprovedByAdmin ? "emerald-gradient" : "bg-gradient-to-br from-amber-500 to-amber-600"
      )}>
        <MapPin className="absolute -top-4 -right-4 w-32 h-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black tracking-tight leading-tight">{mosque.name}</h3>
            {mosque.isApprovedByAdmin && <CheckCircle2 className="w-5 h-5 text-secondary fill-secondary" />}
          </div>
          <p className="text-xs font-bold opacity-80 uppercase tracking-[0.2em]">{mosque.area}, {mosque.district}</p>
        </div>
      </div>
      <CardContent className="p-10 space-y-8">
        <div className="flex items-center justify-between border-b border-primary/5 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary opacity-40" />
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Eid Jamaats</p>
          </div>
          <AddJamaatTimeModal mosqueId={mosque.id} mosqueName={mosque.name} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {approvedTimes.length > 0 ? approvedTimes.map((t) => (
            <div key={t.id} className="bg-primary/5 p-4 rounded-[1.5rem] border border-primary/5 flex flex-col items-center group/time hover:bg-primary transition-all duration-300">
              <span className="text-base font-black text-primary group-hover/time:text-white">{t.time}</span>
              {t.communitySubmissionCount > 1 && (
                <div className="flex items-center gap-1 text-[8px] font-black text-emerald-600 group-hover/time:text-emerald-200 uppercase tracking-tighter mt-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </div>
              )}
            </div>
          )) : (
            <div className="col-span-2 py-6 text-center bg-slate-50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Waiting for community updates</p>
            </div>
          )}
        </div>

        <Button 
          className="w-full h-14 font-black emerald-gradient rounded-2xl shadow-xl transition-transform hover:scale-[1.02] active:scale-95 text-white" 
          onClick={() => window.open(mosque.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")}
        >
          <Navigation className="w-5 h-5 mr-3" /> Get Directions
        </Button>
      </CardContent>
    </Card>
  )
}
