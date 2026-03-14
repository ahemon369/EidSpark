
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Trash2, Navigation, ExternalLink, Loader2, Sparkles, Map as MapIcon, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function SavedMosques() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const mosqueRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "savedMosques"), orderBy("savedAt", "desc"))
  }, [db, user])

  const { data: mosques, isLoading } = useCollection(mosqueRef)

  const handleDelete = async (id: string) => {
    if (!db || !user) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "users", user.uid, "savedMosques", id))
      toast({ title: "Mosque Removed" })
    } catch (error) {}
    setIsDeleting(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Loading Favorites...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">Favorite Mosques</h2>
          <p className="text-muted-foreground font-medium">Quick access to your saved prayer locations.</p>
        </div>
        <Button className="emerald-gradient text-white h-12 rounded-xl font-black px-8" asChild>
          <Link href="/tools/mosque">
            <Plus className="w-4 h-4 mr-2" /> Find More
          </Link>
        </Button>
      </div>

      {!mosques || mosques.length === 0 ? (
        <Card className="border-none shadow-xl rounded-[3rem] p-24 text-center space-y-6 bg-white border-2 border-dashed">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-10 h-10 text-primary/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">No mosques saved yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Use the Mosque Finder to discover and save your favorite prayer locations across Bangladesh.
            </p>
          </div>
          <Button className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl" asChild>
            <Link href="/tools/mosque">Explore Map</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mosques.map((m) => (
            <Card key={m.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:-translate-y-1 transition-all">
              <div className="aspect-[16/9] bg-slate-100 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <MapIcon className="w-24 h-24" />
                </div>
                <div className="absolute top-4 left-4 z-10">
                   <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10">
                     Favorite
                   </div>
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-1">
                  <h4 className="font-black text-lg text-slate-800 line-clamp-1">{m.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-1 font-medium">{m.address || "Dhaka, Bangladesh"}</p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1 rounded-xl h-11 font-bold gap-2 text-xs emerald-gradient text-white" 
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lon}`
                      window.open(url, "_blank")
                    }}
                  >
                    <Navigation className="w-4 h-4" /> Navigate
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl h-11 w-11 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(m.id)}
                    disabled={isDeleting === m.id}
                  >
                    {isDeleting === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
