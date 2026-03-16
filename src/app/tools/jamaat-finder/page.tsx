"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
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
  Clock,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  Filter,
  ChevronUp,
  Map as MapIcon,
  Heart,
  Navigation2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query, where, addDoc, getDocs } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AddJamaatTimeModal } from "@/components/add-jamaat-time-modal"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

const JamaatMap = dynamic(() => import("@/components/jamaat-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary/40 uppercase tracking-widest">Loading Map Interface...</p>
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
  
  // Filters
  const [filterVerified, setFilterVerified] = useState(false)
  const [filterGrounds, setFilterGrounds] = useState(false)
  const [distanceRadius, setDistanceRadius] = useState<number | null>(null) // in meters

  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques")
  }, [db])
  const { data: allMosques, isLoading: loadingMosques } = useCollection(mosquesRef)

  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported", description: "GPS not supported." })
      return
    }
    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(loc)
        setIsDetecting(false)
        toast({ title: "Location Locked", description: "Syncing nearby Jamaat locations." })
      },
      () => {
        setIsDetecting(false)
        toast({ variant: "destructive", title: "GPS Error", description: "Please enable location access." })
      }
    )
  }, [toast])

  const filteredMosques = useMemo(() => {
    if (!allMosques) return []
    let mosques = allMosques.map(m => {
      let dist = undefined
      if (userLocation) {
        dist = calculateDistance(userLocation[0], userLocation[1], m.latitude, m.longitude)
      }
      return { ...m, distance: dist }
    })

    if (userLocation) {
      mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0))
    }

    return mosques.filter(m => {
      const matchesSearch = !searchQuery || 
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.area && m.area.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesVerified = !filterVerified || m.isApprovedByAdmin
      const matchesGround = !filterGrounds || /ground|maidan|stadium|field|eidgah/i.test(m.name)
      const matchesDistance = !distanceRadius || !m.distance || m.distance <= distanceRadius

      return matchesSearch && matchesVerified && matchesGround && matchesDistance
    })
  }, [allMosques, searchQuery, userLocation, filterVerified, filterGrounds, distanceRadius])

  const nearestMosque = useMemo(() => {
    if (!userLocation || filteredMosques.length === 0) return null
    return filteredMosques[0]
  }, [userLocation, filteredMosques])

  const handleSaveMosque = async (mosque: any) => {
    if (!user || !db) {
      toast({ title: "Login Required", description: "Please sign in to save favorites." })
      return
    }
    try {
      const q = query(collection(db, "users", user.uid, "savedMosques"), where("mosqueId", "==", mosque.id))
      const snap = await getDocs(q)
      if (!snap.empty) {
        toast({ title: "Already Saved" })
        return
      }
      await addDoc(collection(db, "users", user.uid, "savedMosques"), {
        mosqueId: mosque.id,
        name: mosque.name,
        address: mosque.area || mosque.district,
        lat: mosque.latitude,
        lon: mosque.longitude,
        savedAt: new Date().toISOString()
      })
      toast({ title: "Saved to Favorites" })
    } catch (e) {}
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <main className="flex-grow flex flex-col lg:flex-row relative pt-[80px]">
        {/* Left Results Panel */}
        <aside className="w-full lg:w-[400px] xl:w-[450px] bg-white dark:bg-slate-950 border-r flex flex-col shadow-2xl z-20 relative">
          
          {/* Search & Header */}
          <div className="p-6 space-y-6 bg-white dark:bg-slate-950 sticky top-0 border-b">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-primary flex items-center gap-2">
                <Navigation2 className="w-6 h-6 text-secondary fill-secondary" />
                Jamaat Finder
              </h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Real-time Eid Prayer Registry</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Search area, mosque or maidan..." 
                className="h-12 pl-11 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterVerified ? "default" : "outline"} 
                size="sm" 
                className="rounded-full text-[10px] font-black uppercase h-8 px-4"
                onClick={() => setFilterVerified(!filterVerified)}
              >
                Verified Only
              </Button>
              <Button 
                variant={filterGrounds ? "default" : "outline"} 
                size="sm" 
                className="rounded-full text-[10px] font-black uppercase h-8 px-4"
                onClick={() => setFilterGrounds(!filterGrounds)}
              >
                Big Grounds
              </Button>
              <Button 
                variant={distanceRadius ? "default" : "outline"} 
                size="sm" 
                className="rounded-full text-[10px] font-black uppercase h-8 px-4"
                onClick={() => setDistanceRadius(distanceRadius ? null : 5000)}
              >
                &lt; 5km
              </Button>
            </div>

            {nearestMosque && userLocation && (
              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-3 animate-in slide-in-from-left duration-500">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest leading-none mb-1">Proximity Alert</p>
                  <p className="text-xs font-bold text-slate-700">
                    You are <span className="text-primary">{nearestMosque.distance! < 1000 ? `${Math.round(nearestMosque.distance!)}m` : `${(nearestMosque.distance! / 1000).toFixed(1)}km`}</span> from the nearest Jamaat.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Results List */}
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
              {loadingMosques ? (
                <div className="py-20 text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary/40" />
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Syncing Registry...</p>
                </div>
              ) : filteredMosques.length > 0 ? (
                filteredMosques.map((mosque) => (
                  <Card 
                    key={mosque.id} 
                    className={cn(
                      "border-2 transition-all duration-300 cursor-pointer rounded-[1.5rem] overflow-hidden group",
                      selectedMosqueId === mosque.id ? "border-primary shadow-xl ring-4 ring-primary/5" : "border-transparent bg-white dark:bg-slate-900 shadow-sm hover:border-slate-200"
                    )}
                    onClick={() => setSelectedMosqueId(mosque.id)}
                  >
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1 flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            {mosque.isApprovedByAdmin ? (
                              <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[8px] font-black px-2 h-5 uppercase tracking-tighter">Verified</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[8px] font-black px-2 h-5 uppercase tracking-tighter">Community</Badge>
                            )}
                            {/ground|maidan|stadium|field|eidgah/i.test(mosque.name) && (
                              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[8px] font-black px-2 h-5 uppercase tracking-tighter">Ground</Badge>
                            )}
                          </div>
                          <h3 className="font-black text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">{mosque.name}</h3>
                          <p className="text-xs text-muted-foreground font-medium">{mosque.area || mosque.district}, {mosque.district}</p>
                        </div>
                        {mosque.distance !== undefined && (
                          <div className="bg-secondary/10 text-secondary px-2 py-1 rounded-lg text-[10px] font-black shrink-0">
                            {mosque.distance < 1000 ? `${Math.round(mosque.distance)}m` : `${(mosque.distance / 1000).toFixed(1)}km`}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary/40" />
                          <span className="text-sm font-black text-primary">{mosque.eid_prayer_time || "Pending"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveMosque(mosque)
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="h-10 rounded-xl font-black text-xs emerald-gradient px-4"
                            onClick={(e) => {
                              e.stopPropagation()
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank")
                            }}
                          >
                            Directions
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="py-20 text-center opacity-40 space-y-4">
                  <Globe className="w-12 h-12 mx-auto text-primary" />
                  <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">No prayer locations found <br /> matching your filters.</p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Actions Footer */}
          <div className="p-6 border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleFindNearMe} 
                disabled={isDetecting}
                className="w-full h-14 rounded-2xl gold-gradient text-primary font-black shadow-xl hover:scale-[1.02] transition-transform"
              >
                {isDetecting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <LocateFixed className="w-5 h-5 mr-2" />}
                Sync My Position
              </Button>
              <AddMosqueModal />
            </div>
          </div>
        </aside>

        {/* Right Map Panel */}
        <section className="flex-grow relative z-10">
          <JamaatMap 
            mosques={filteredMosques} 
            onSelectMosque={setSelectedMosqueId} 
            userLocation={userLocation}
            selectedId={selectedMosqueId}
          />
          
          {/* Floating Mobile Bottom Sheet Toggle (Desktop hides) */}
          <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000]">
             <Button className="rounded-full h-12 px-8 font-black gap-2 shadow-2xl glass-card text-primary border-primary/20">
               <ChevronUp className="w-4 h-4" /> View Results
             </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
