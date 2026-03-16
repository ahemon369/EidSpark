
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
  Navigation2,
  TrendingUp,
  ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query, where, addDoc, getDocs, orderBy, limit } from "firebase/firestore"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AdminJamaatPanel } from "@/components/admin-jamaat-panel"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [distanceRadius, setDistanceRadius] = useState<number | null>(null)

  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques")
  }, [db])
  const { data: allMosques, isLoading: loadingMosques } = useCollection(mosquesRef)

  // Fetch Admin Status
  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "roles_admin", user.uid)
  }, [db, user])
  const { data: adminDoc } = useDoc(adminRoleRef)
  const isAdmin = !!adminDoc

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

  const trendingMosques = useMemo(() => {
    return [...filteredMosques].sort((a, b) => (b.savesCount || 0) - (a.savesCount || 0)).slice(0, 3)
  }, [filteredMosques])

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
    <div className="h-screen flex flex-col bg-background overflow-hidden selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="flex-grow flex flex-col lg:flex-row relative pt-[80px]">
        {/* Left Panel */}
        <aside className="w-full lg:w-[450px] bg-white dark:bg-slate-950 border-r flex flex-col shadow-2xl z-20 relative">
          
          <Tabs defaultValue="explore" className="flex flex-col h-full">
            <div className="p-6 pb-0 bg-white dark:bg-slate-950 sticky top-0 z-30">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-primary flex items-center gap-2">
                    <Navigation2 className="w-6 h-6 text-secondary fill-secondary" />
                    Jamaat Finder
                  </h1>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Community Verified registry</p>
                </div>
                {isAdmin && (
                  <Badge className="bg-red-50 text-red-600 border-red-100 font-black uppercase text-[8px] h-6">
                    Moderator Mode
                  </Badge>
                )}
              </div>

              <div className="relative group mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Search area, mosque or maidan..." 
                  className="h-14 pl-11 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-primary/5 text-sm font-medium shadow-inner"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <TabsList className="grid w-full grid-cols-2 h-12 bg-primary/5 rounded-xl p-1 mb-6">
                <TabsTrigger value="explore" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Explore Map</TabsTrigger>
                {isAdmin && <TabsTrigger value="admin" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Moderation</TabsTrigger>}
              </TabsList>
            </div>

            <TabsContent value="explore" className="flex-grow flex flex-col overflow-hidden m-0">
              <div className="px-6 mb-4 flex flex-wrap gap-2">
                <Button 
                  variant={filterVerified ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full text-[9px] font-black uppercase h-8 px-4 border-2"
                  onClick={() => setFilterVerified(!filterVerified)}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1.5" /> Verified
                </Button>
                <Button 
                  variant={filterGrounds ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full text-[9px] font-black uppercase h-8 px-4 border-2"
                  onClick={() => setFilterGrounds(!filterGrounds)}
                >
                  <MapIcon className="w-3 h-3 mr-1.5" /> Grounds
                </Button>
                <Button 
                  variant={distanceRadius ? "default" : "outline"} 
                  size="sm" 
                  className="rounded-full text-[9px] font-black uppercase h-8 px-4 border-2"
                  onClick={() => setDistanceRadius(distanceRadius ? null : 5000)}
                >
                  &lt; 5km
                </Button>
              </div>

              <ScrollArea className="flex-grow">
                <div className="p-6 pt-0 space-y-6">
                  {/* Proximity Banner */}
                  {nearestMosque && userLocation && (
                    <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 flex items-center gap-4 animate-in slide-in-from-left duration-500 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Navigation2 className="w-20 h-20" /></div>
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0 border border-white/10">
                        <LocateFixed className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="relative z-10">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 leading-none">Instant Proximity Alert</p>
                        <p className="text-sm font-black leading-tight">
                          The nearest Jamaat is <span className="text-secondary">{nearestMosque.distance! < 1000 ? `${Math.round(nearestMosque.distance!)}m` : `${(nearestMosque.distance! / 1000).toFixed(1)}km`}</span> away at {nearestMosque.name}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Trending Section */}
                  {trendingMosques.length > 0 && !searchQuery && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 px-2">
                        <TrendingUp className="w-4 h-4 text-rose-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Trending in Community</h3>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
                        {trendingMosques.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => setSelectedMosqueId(m.id)}
                            className="min-w-[200px] bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-white text-primary text-[8px] border-none shadow-sm h-5">#{m.savesCount || 0} Saves</Badge>
                              <TrendingUp className="w-3 h-3 text-rose-500 animate-pulse" />
                            </div>
                            <h4 className="font-black text-sm text-slate-800 dark:text-white truncate">{m.name}</h4>
                            <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase tracking-tighter">{m.district}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Main List */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-2">All Registry Results ({filteredMosques.length})</h3>
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
                            "border-2 transition-all duration-300 cursor-pointer rounded-[2rem] overflow-hidden group",
                            selectedMosqueId === mosque.id ? "border-primary shadow-2xl ring-8 ring-primary/5 translate-x-2" : "border-transparent bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                          )}
                          onClick={() => setSelectedMosqueId(mosque.id)}
                        >
                          <CardContent className="p-6 space-y-5">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-2 flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                  {mosque.isApprovedByAdmin ? (
                                    <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 text-[8px] font-black px-2 h-5 uppercase tracking-tighter">Verified</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-[8px] font-black px-2 h-5 uppercase tracking-tighter bg-amber-50/50 border-amber-100 text-amber-700">Community Added</Badge>
                                  )}
                                  {/ground|maidan|stadium|field|eidgah/i.test(mosque.name) && (
                                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-100 text-[8px] font-black px-2 h-5 uppercase tracking-tighter">Ground</Badge>
                                  )}
                                </div>
                                <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight group-hover:text-primary transition-colors">{mosque.name}</h3>
                                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-1.5">
                                  <MapPin className="w-3 h-3" /> {mosque.area || mosque.district}, {mosque.district}
                                </p>
                              </div>
                              {mosque.distance !== undefined && (
                                <div className="bg-secondary/10 text-secondary px-3 py-1.5 rounded-xl text-[10px] font-black shrink-0 border border-secondary/20 shadow-sm">
                                  {mosque.distance < 1000 ? `${Math.round(mosque.distance)}m` : `${(mosque.distance / 1000).toFixed(1)}km`}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800 pt-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                  <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Jamaat Time</p>
                                  <span className="text-sm font-black text-primary">{mosque.eid_prayer_time || "Registry Pending"}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-11 w-11 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-500 transition-all"
                                  onClick={(e) => { e.stopPropagation(); handleSaveMosque(mosque); }}
                                >
                                  <Heart className="w-5 h-5" />
                                </Button>
                                <Button 
                                  variant="default" 
                                  className="h-11 rounded-xl font-black text-xs emerald-gradient px-6 shadow-lg shadow-primary/20"
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
                        <p className="text-sm font-bold uppercase tracking-widest leading-relaxed">No prayer locations found <br /> matching your search.</p>
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="admin" className="flex-grow flex flex-col overflow-hidden m-0">
                <ScrollArea className="flex-grow px-6">
                  <AdminJamaatPanel />
                </ScrollArea>
              </TabsContent>
            )}

            {/* Panel Footer */}
            <div className="p-6 border-t bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleFindNearMe} 
                  disabled={isDetecting}
                  className="w-full h-14 rounded-2xl gold-gradient text-primary font-black shadow-xl hover:scale-[1.02] transition-transform text-lg"
                >
                  {isDetecting ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <LocateFixed className="w-6 h-6 mr-3" />}
                  Sync My GPS Position
                </Button>
                <AddMosqueModal />
              </div>
            </div>
          </Tabs>
        </aside>

        {/* Right Map Panel */}
        <section className="flex-grow relative z-10">
          <JamaatMap 
            mosques={filteredMosques} 
            onSelectMosque={setSelectedMosqueId} 
            userLocation={userLocation}
            selectedId={selectedMosqueId}
          />
          
          {/* Floating Indicators */}
          <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3 items-end">
             <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-primary/10 shadow-2xl flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]"></div>
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">GPS Sync Active</p>
             </div>
             <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full border-2 border-secondary/10 shadow-2xl flex items-center gap-3">
               <Sparkles className="w-4 h-4 text-secondary fill-secondary animate-twinkle" />
               <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Crowd-Powered Registry</p>
             </div>
          </div>

          <div className="lg:hidden absolute bottom-24 left-1/2 -translate-x-1/2 z-[1000]">
             <Button className="rounded-full h-14 px-10 font-black gap-3 shadow-2xl glass-card text-primary border-primary/20 backdrop-blur-xl animate-bounce">
               <ChevronUp className="w-5 h-5" /> Explore {filteredMosques.length} Locations
             </Button>
          </div>
        </section>
      </main>
    </div>
  )
}
