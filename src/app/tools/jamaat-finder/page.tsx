
"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
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
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AddJamaatTimeModal } from "@/components/add-jamaat-time-modal"
import { AdminJamaatPanel } from "@/components/admin-jamaat-panel"
import { useToast } from "@/hooks/use-toast"

// Dynamically import map to avoid SSR issues with Leaflet
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
  const R = 6371e3 // metres
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
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
  
  // Fetch Mosques
  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques")
  }, [db])
  const { data: allMosques, isLoading: loadingMosques } = useCollection(mosquesRef)

  // Fetch Admin Role logic
  const rolesRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "roles_admin")
  }, [db, user])
  const { data: adminRoles } = useCollection(rolesRef)
  const isAdmin = adminRoles?.some(role => role.id === user?.uid)

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
      (err) => {
        setIsDetecting(false)
        toast({ variant: "destructive", title: "Location Error", description: "Please enable GPS access to find mosques near you." })
      }
    )
  }, [toast])

  const filteredMosques = useMemo(() => {
    if (!allMosques) return []
    let mosques = allMosques.filter(m => m.isApprovedByAdmin || isAdmin)
    
    // Calculate distances if user location is known
    if (userLocation) {
      mosques = mosques.map(m => ({
        ...m,
        distance: calculateDistance(userLocation[0], userLocation[1], m.latitude, m.longitude)
      }))
      // Sort by distance
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
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      
      <main className="max-w-[1800px] mx-auto px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 animate-in fade-in slide-in-from-top duration-700">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
              <Globe className="w-4 h-4 text-secondary animate-pulse" />
              <span>Live Eid Jamaat Finder</span>
            </div>
            <h1 className="text-4xl lg:text-7xl font-black text-primary tracking-tight">Find Eid Prayers</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-xl">
              Discover verified Eid prayer times across Bangladesh. Contributed by the community, for the community.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                placeholder="Search by mosque or district..." 
                className="h-14 pl-12 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border-primary/10 focus:border-primary/30 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className={cn(
                "h-14 rounded-2xl border-2 font-black px-6 shadow-xl transition-all",
                userLocation ? "border-primary bg-primary/5 text-primary" : "border-slate-200 hover:border-primary/30"
              )}
              onClick={handleFindNearMe}
              disabled={isDetecting}
            >
              {isDetecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LocateFixed className="w-5 h-5 mr-2" />}
              Find Near Me
            </Button>
            <AddMosqueModal />
          </div>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <div className="flex justify-between items-center mb-8">
            <TabsList className="bg-white/50 backdrop-blur-md border border-primary/10 p-1 rounded-2xl h-14 shadow-xl">
              <TabsTrigger value="map" className="rounded-xl font-bold px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                <MapPin className="w-4 h-4 mr-2" /> Map View
              </TabsTrigger>
              <TabsTrigger value="list" className="rounded-xl font-bold px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                <Filter className="w-4 h-4 mr-2" /> List View
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="admin" className="rounded-xl font-bold px-8 h-full data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  <Settings className="w-4 h-4 mr-2" /> Moderation
                </TabsTrigger>
              )}
            </TabsList>
            
            <div className="hidden md:flex items-center gap-4 bg-white/50 px-6 py-3 rounded-2xl border border-primary/5 shadow-sm">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                 <span className="text-[10px] font-black uppercase text-primary tracking-widest">Live Updates Active</span>
               </div>
            </div>
          </div>

          <TabsContent value="map" className="animate-in fade-in duration-700">
            <div className="h-[750px] relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-50">
              <JamaatMap 
                mosques={filteredMosques} 
                onSelectMosque={setSelectedMosqueId} 
                userLocation={userLocation}
              />
            </div>
          </TabsContent>

          <TabsContent value="list" className="animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {loadingMosques ? (
                [...Array(8)].map((_, i) => (
                  <Card key={i} className="rounded-[2.5rem] h-[300px] animate-pulse bg-slate-100" />
                ))
              ) : filteredMosques.length > 0 ? (
                filteredMosques.map((mosque) => (
                  <MosqueCard key={mosque.id} mosque={mosque} isAdmin={isAdmin} />
                ))
              ) : (
                <div className="col-span-full py-32 text-center space-y-6 bg-white/50 rounded-[3rem] border-2 border-dashed">
                  <MapPin className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
                  <p className="text-xl font-bold text-muted-foreground">No mosques found matching your search.</p>
                  <AddMosqueModal />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="admin" className="animate-in fade-in duration-700">
            <AdminJamaatPanel />
          </TabsContent>
        </Tabs>
      </main>
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

  const approvedTimes = useMemo(() => {
    return times?.filter(t => t.isApprovedByAdmin || isAdmin).sort((a, b) => a.time.localeCompare(b.time)) || []
  }, [times, isAdmin])

  return (
    <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10">
      <div className="emerald-gradient p-8 text-white relative">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
          <MapPin className="w-20 h-20" />
        </div>
        <div className="relative z-10 space-y-2">
          <h3 className="text-2xl font-black tracking-tight leading-tight">{mosque.name}</h3>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-bold text-white/70 uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" />
              {mosque.area}, {mosque.district}
            </p>
            {mosque.distance !== undefined && (
              <p className="text-[10px] font-black text-secondary uppercase tracking-widest">
                {mosque.distance < 1000 ? `${Math.round(mosque.distance)}m away` : `${(mosque.distance / 1000).toFixed(1)}km away`}
              </p>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Scheduled Jamaats</p>
            <AddJamaatTimeModal mosqueId={mosque.id} mosqueName={mosque.name} />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {approvedTimes.length > 0 ? (
              approvedTimes.map((t) => (
                <div key={t.id} className="bg-primary/5 p-3 rounded-2xl border border-primary/5 flex flex-col items-center justify-center gap-1 group/time relative">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-primary" />
                    <span className="text-sm font-black text-primary">{t.time}</span>
                  </div>
                  {t.communitySubmissionCount > 1 && (
                    <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 py-4 text-center border-2 border-dashed rounded-2xl opacity-40">
                <p className="text-[10px] font-bold uppercase tracking-widest">No times added yet</p>
              </div>
            )}
          </div>
        </div>

        {mosque.description && (
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{mosque.description}"
          </p>
        )}

        <div className="pt-4 border-t border-primary/5 flex gap-2">
          <Button 
            className="flex-1 rounded-xl h-12 font-black shadow-lg emerald-gradient"
            onClick={() => {
              if (mosque.googleMapsLink) {
                window.open(mosque.googleMapsLink, "_blank")
              } else {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")
              }
            }}
          >
            <Navigation className="w-4 h-4 mr-2" /> Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
