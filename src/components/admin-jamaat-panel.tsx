
"use client"

import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, updateDoc, deleteDoc, collectionGroup, query, where } from "firebase/firestore"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Clock, 
  MapPin, 
  ShieldAlert,
  Loader2,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function AdminJamaatPanel() {
  const db = useFirestore()
  const { toast } = useToast()
  const [processing, setProcessing] = useState<string | null>(null)

  // Fetch pending mosques
  const mosquesRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "mosques"), where("isApprovedByAdmin", "==", false))
  }, [db])
  const { data: pendingMosques, isLoading: loadingMosques } = useCollection(mosquesRef)

  const handleApproveMosque = async (id: string) => {
    if (!db) return
    setProcessing(id)
    try {
      await updateDoc(doc(db, "mosques", id), { isApprovedByAdmin: true })
      toast({ title: "Mosque Approved!" })
    } catch (error) {}
    setProcessing(null)
  }

  const handleDeleteMosque = async (id: string) => {
    if (!db) return
    setProcessing(id)
    try {
      await deleteDoc(doc(db, "mosques", id))
      toast({ title: "Mosque Deleted" })
    } catch (error) {}
    setProcessing(null)
  }

  return (
    <div className="space-y-10">
      <div className="bg-secondary/10 border-2 border-secondary/20 p-8 rounded-[3rem] flex gap-6 items-center">
        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-xl">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-primary tracking-tight">Admin Moderation Center</h2>
          <p className="text-sm font-medium text-muted-foreground">Approve or reject community contributions to maintain data quality.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Pending Mosques */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-primary">Pending Mosques ({pendingMosques?.length || 0})</h3>
          </div>
          
          <div className="space-y-4">
            {loadingMosques ? (
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            ) : pendingMosques && pendingMosques.length > 0 ? (
              pendingMosques.map((m) => (
                <Card key={m.id} className="border-none shadow-xl rounded-[2rem] overflow-hidden bg-white/80 backdrop-blur-xl group">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-primary">{m.name}</h4>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> {m.area}, {m.district}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full bg-slate-50" onClick={() => window.open(m.googleMapsLink || `https://www.google.com/maps/search/?api=1&query=${m.latitude},${m.longitude}`, "_blank")}>
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>

                    {m.description && (
                      <div className="bg-slate-50 p-4 rounded-xl mb-6 border border-slate-100">
                        <p className="text-xs italic text-muted-foreground leading-relaxed">"{m.description}"</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        disabled={processing === m.id}
                        className="rounded-xl h-12 font-black emerald-gradient text-white shadow-lg"
                        onClick={() => handleApproveMosque(m.id)}
                      >
                        {processing === m.id ? <Loader2 className="animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>}
                      </Button>
                      <Button 
                        disabled={processing === m.id}
                        variant="ghost"
                        className="rounded-xl h-12 font-black text-destructive hover:bg-destructive/5 border-2 border-transparent hover:border-destructive/10"
                        onClick={() => handleDeleteMosque(m.id)}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-20 text-center bg-white/50 rounded-[3rem] border-2 border-dashed opacity-40">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                <p className="font-bold text-sm uppercase tracking-widest">All caught up!</p>
              </div>
            )}
          </div>
        </section>

        {/* Global Pending Times (Simplified check) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xl font-black text-primary">Data Health</h3>
          </div>
          <Card className="border-none shadow-xl rounded-[3rem] bg-white p-10 text-center space-y-6">
             <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary">
               <Clock className="w-10 h-10" />
             </div>
             <div className="space-y-2">
               <h4 className="text-xl font-black">Jamaat Time Verifications</h4>
               <p className="text-sm text-muted-foreground font-medium">
                 Individual prayer times are automatically ranked by community verification counts. Admins can manually override if flagged.
               </p>
             </div>
             <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                   <span className="text-xs font-black text-emerald-800 uppercase tracking-widest">Auto-Verified</span>
                   <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                   <span className="text-xs font-black text-blue-800 uppercase tracking-widest">Global Flag System</span>
                   <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-black">COMING SOON</span>
                </div>
             </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
