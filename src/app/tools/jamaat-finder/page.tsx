
"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  MapPin, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Filter, 
  Loader2, 
  Navigation,
  Globe,
  Settings,
  LocateFixed
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, doc } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AddJamaatTimeModal } from "@/components/add-jamaat-time-modal"
import { AdminJamaatPanel } from "@/components/admin-jamaat-panel"
import { useToast } from "@/hooks/use-toast"

const JamaatMap = dynamic(() => import("@/components/jamaat-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center space-y-4 animate-pulse rounded-[3rem]">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary/40 uppercase tracking-widest">Initializing Map...</p>
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
    let mosques = allMosques.filter(m => m.isApprovedByAdmin || isAdmin)
    if (userLocation) {
      mosques = mosques.map(m => ({
        ...m,
        distance: calculateDistance(userLocation[0], userLocation[1], m.latitude, m.longitude)
      }))
      mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }
    if (!searchQuery) return mosques
    return mosques.filter(m => 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.area.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allMosques, searchQuery, isAdmin, userLocation])

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-0">
      <Navbar />
      <main className="max-w-[1800px] mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-secondary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Globe className="w-4 h-4 text-secondary animate-pulse" />
              <span>Live Eid Jamaat Finder</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-primary dark:text-white tracking-tight">Find Eid Prayers</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Discover verified Eid prayer times across Bangladesh. Contributed by the community, for the community.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search mosques..." 
                className="h-14 pl-12 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-primary/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className={cn(
                "h-14 rounded-2xl border-2 font-black px-6 shadow-xl",
                userLocation ? "border-primary bg-primary/5 text-primary" : "border-slate-200"
              )}
              onClick={handleFindNearMe}
              disabled={isDetecting}
            >
              {isDetecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LocateFixed className="w-5 h-5 mr-2" />}
              Near Me
            </Button>
            <AddMosqueModal />
          </div>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <div className="flex justify-between items-center mb-8">
            <TabsList className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-primary/10 p-1 rounded-2xl h-14 shadow-xl">
              <TabsTrigger value="map" className="rounded-xl font-bold px-8 h-full">Map</TabsTrigger>
              <TabsTrigger value="list" className="rounded-xl font-bold px-8 h-full">List</TabsTrigger>
              {isAdmin && <TabsTrigger value="admin" className="rounded-xl font-bold px-8 h-full">Admin</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="map" className="animate-in fade-in duration-700 h-[750px] rounded-[3rem] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl">
            <JamaatMap mosques={filteredMosques} onSelectMosque={setSelectedMosqueId} userLocation={userLocation} />
          </TabsContent>

          <TabsContent value="list" className="animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredMosques.map((mosque) => (
                <MosqueCard key={mosque.id} mosque={mosque} isAdmin={isAdmin} />
              ))}
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
  const approvedTimes = useMemo(() => times?.filter(t => t.isApprovedByAdmin || isAdmin).sort((a, b) => a.time.localeCompare(b.time)) || [], [times, isAdmin])

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:-translate-y-2 transition-all">
      <div className="emerald-gradient p-8 text-white relative">
        <MapPin className="absolute top-0 right-0 p-4 w-20 h-20 opacity-10" />
        <h3 className="text-2xl font-black">{mosque.name}</h3>
        <p className="text-xs font-bold opacity-70 uppercase tracking-widest">{mosque.area}, {mosque.district}</p>
      </div>
      <CardContent className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Eid Jamaats</p>
          <AddJamaatTimeModal mosqueId={mosque.id} mosqueName={mosque.name} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {approvedTimes.length > 0 ? approvedTimes.map((t) => (
            <div key={t.id} className="bg-primary/5 p-3 rounded-2xl border flex flex-col items-center">
              <span className="text-sm font-black text-primary">{t.time}</span>
              {t.communitySubmissionCount > 1 && (
                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </div>
              )}
            </div>
          )) : <p className="col-span-2 text-[10px] font-bold opacity-40 text-center italic">No times added yet</p>}
        </div>
        <Button className="w-full h-12 font-black emerald-gradient" onClick={() => window.open(mosque.googleMapsLink || `https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")}>
          <Navigation className="w-4 h-4 mr-2" /> Directions
        </Button>
      </CardContent>
    </Card>
  )
}
