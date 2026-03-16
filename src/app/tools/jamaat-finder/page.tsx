
"use client"

import { useState, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Search, 
  Loader2, 
  LocateFixed, 
  Navigation2, 
  ChevronUp, 
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query } from "firebase/firestore"
import { AddMosqueModal } from "@/components/add-mosque-modal"
import { AdminJamaatPanel } from "@/components/admin-jamaat-panel"
import { useToast } from "@/hooks/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackButton } from "@/components/back-button"
import { calculateDistance } from "@/lib/geo-utils"

const JamaatMap = dynamic(() => import("@/components/jamaat-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black text-primary/40 uppercase tracking-widest">Loading Map Interface...</p>
    </div>
  ),
})

export default function JamaatFinderPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMosqueId, setSelectedMosqueId] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false)

  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, "mosques")
  }, [db])
  const { data: allMosques } = useCollection(mosquesRef)

  const adminRoleRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "roles_admin", user.uid)
  }, [db, user])
  const { data: adminDoc } = useDoc(adminRoleRef)
  const isAdmin = !!adminDoc

  const handleFindNearMe = useCallback(() => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Not Supported" }); return
    }
    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition((pos) => {
      const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
      setUserLocation(loc); setIsDetecting(false); toast({ title: "Location Locked" })
    }, () => {
      setIsDetecting(false); toast({ variant: "destructive", title: "GPS Error" })
    })
  }, [toast])

  const filteredMosques = useMemo(() => {
    if (!allMosques) return []
    let mosques = allMosques.map(m => ({ 
      ...m, 
      distance: userLocation ? calculateDistance(userLocation[0], userLocation[1], m.latitude, m.longitude) : undefined 
    }))
    if (userLocation) { mosques.sort((a, b) => (a.distance || 0) - (b.distance || 0)) }
    return mosques.filter(m => {
      const nameMatch = m.name?.toLowerCase().includes(searchQuery.toLowerCase())
      const districtMatch = m.district?.toLowerCase().includes(searchQuery.toLowerCase())
      return !searchQuery || nameMatch || districtMatch
    })
  }, [allMosques, searchQuery, userLocation])

  const nearestMosque = useMemo(() => {
    if (!userLocation || filteredMosques.length === 0) return null
    return filteredMosques[0]
  }, [userLocation, filteredMosques])

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden selection:bg-secondary selection:text-primary transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col h-full overflow-hidden">
        <BackButton />
        
        <main className="flex-grow flex flex-col lg:flex-row relative">
          <aside className={cn(
            "fixed inset-x-0 bottom-0 z-40 bg-white transition-transform duration-500 lg:relative lg:inset-auto lg:w-[450px] lg:translate-y-0 border-r flex flex-col shadow-2xl",
            isMobilePanelOpen ? "h-[85vh] translate-y-0" : "h-[80px] translate-y-0 lg:h-full"
          )}>
            <div className="lg:hidden h-[80px] flex items-center justify-center cursor-pointer border-b px-6 gap-4" onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}>
              <p className="font-black text-primary text-sm uppercase tracking-widest flex items-center gap-2"><Navigation2 className="w-4 h-4" /> {isMobilePanelOpen ? "Close Registry" : `Show ${filteredMosques.length} Locations`}</p>
              {isMobilePanelOpen ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
            </div>
            
            <Tabs defaultValue="explore" className="flex flex-col h-full">
              <div className="p-6 pb-0 bg-white sticky top-0 z-30">
                <h1 className="text-2xl font-black text-primary flex items-center gap-2 mb-6"><Navigation2 className="w-6 h-6 text-secondary fill-secondary" /> Jamaat Finder</h1>
                <div className="relative group mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search area, mosque or maidan..." className="h-14 pl-11 rounded-2xl bg-slate-50 border-none shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <TabsList className="grid w-full grid-cols-2 h-12 bg-primary/5 rounded-xl p-1 mb-6">
                  <TabsTrigger value="explore" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Explore Map</TabsTrigger>
                  {isAdmin && <TabsTrigger value="admin" className="rounded-lg font-black text-[10px] uppercase tracking-widest">Moderation</TabsTrigger>}
                </TabsList>
              </div>

              <TabsContent value="explore" className="flex-grow flex flex-col overflow-hidden m-0">
                <ScrollArea className="flex-grow">
                  <div className="p-6 pt-0 space-y-6">
                    {nearestMosque && userLocation && (
                      <div className="bg-primary p-6 rounded-[2rem] text-white shadow-xl flex items-center gap-4 relative overflow-hidden">
                        <LocateFixed className="w-6 h-6 text-secondary shrink-0" />
                        <p className="text-sm font-black leading-tight">The nearest Jamaat is <span className="text-secondary">{Math.round(nearestMosque.distance!)}m</span> away.</p>
                      </div>
                    )}
                    <div className="space-y-4">
                      {filteredMosques.map((mosque) => (
                        <Card key={mosque.id} className={cn("border-2 transition-all cursor-pointer rounded-[2rem] overflow-hidden", selectedMosqueId === mosque.id ? "border-primary shadow-2xl" : "border-transparent bg-white shadow-sm")} onClick={() => setSelectedMosqueId(mosque.id)}>
                          <CardContent className="p-6 space-y-5">
                            <h3 className="font-black text-lg text-slate-800">{mosque.name}</h3>
                            <div className="flex items-center justify-between border-t pt-5">
                              <span className="text-sm font-black text-primary">{mosque.eid_prayer_time || "Pending"}</span>
                              <Button variant="default" className="h-11 rounded-xl font-black text-xs emerald-gradient px-6" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`, "_blank") }}>Directions</Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
              {isAdmin && <TabsContent value="admin" className="flex-grow flex flex-col overflow-hidden m-0"><ScrollArea className="flex-grow px-6"><AdminJamaatPanel /></ScrollArea></TabsContent>}
              <div className="p-6 border-t bg-slate-50/50">
                <Button onClick={handleFindNearMe} disabled={isDetecting} className="w-full h-14 rounded-2xl gold-gradient text-primary font-black shadow-xl text-lg">{isDetecting ? <Loader2 className="animate-spin" /> : <LocateFixed className="w-6 h-6 mr-3" />} Sync GPS Position</Button>
                <div className="mt-3"><AddMosqueModal /></div>
              </div>
            </Tabs>
          </aside>

          <section className="flex-grow relative z-10 h-full">
            <JamaatMap mosques={filteredMosques} onSelectMosque={setSelectedMosqueId} userLocation={userLocation} selectedId={selectedMosqueId} />
          </section>
        </main>
      </div>
    </div>
  )
}
