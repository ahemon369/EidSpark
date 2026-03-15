
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc, where } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, Trash2, Send, Copy, ExternalLink, Loader2, Gift, History, Plus } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function SalamiHistory() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Tracker entries (Salami you received/tracked)
  const trackerRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "salamiEntries"), orderBy("createdAt", "desc"))
  }, [db, user])
  const { data: trackerEntries, isLoading: loadingTracker } = useCollection(trackerRef)

  const handleDeleteEntry = async (id: string) => {
    if (!db || !user) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "users", user.uid, "salamiEntries", id))
      toast({ title: "Record Deleted" })
    } catch (error) {}
    setIsDeleting(null)
  }

  const totalSalami = trackerEntries?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">Salami History</h2>
          <p className="text-muted-foreground font-medium">Keep track of your digital blessings and gifts.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 rounded-xl font-bold px-6 border-2" asChild>
            <Link href="/tools/salami">Open Tracker</Link>
          </Button>
          <Button className="emerald-gradient text-white h-12 rounded-xl font-black px-8" asChild>
            <Link href="/tools/salami">Send Eidi</Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden emerald-gradient text-white">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
              <Wallet className="w-8 h-8 text-secondary" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Total Collected</p>
              <p className="text-5xl font-black mt-1">৳{totalSalami.toLocaleString()}</p>
            </div>
            <p className="text-xs font-bold text-white/60">From {trackerEntries?.length || 0} generous donors</p>
          </CardContent>
        </Card>

        <div className="lg:col-span-3">
          <Tabs defaultValue="received" className="w-full">
            <TabsList className="bg-white border rounded-2xl h-14 p-1 mb-8">
              <TabsTrigger value="received" className="rounded-xl font-bold px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                <History className="w-4 h-4 mr-2" /> Received (Tracker)
              </TabsTrigger>
              <TabsTrigger value="sent" className="rounded-xl font-bold px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                <Send className="w-4 h-4 mr-2" /> Digital Envelopes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="received" className="space-y-6">
              <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {trackerEntries && trackerEntries.length > 0 ? (
                    trackerEntries.map((entry) => (
                      <div key={entry.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                            <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">
                              {entry.giverName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-black text-slate-800 text-lg">{entry.giverName}</p>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                              {entry.receivedDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="text-right">
                            <p className="text-2xl font-black text-primary">৳{entry.amount}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={isDeleting === entry.id}
                          >
                            {isDeleting === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center space-y-6 opacity-40">
                      <Gift className="w-16 h-16 mx-auto text-primary" />
                      <div className="space-y-1">
                        <p className="text-xl font-bold">No Salami tracked yet</p>
                        <p className="text-xs uppercase tracking-widest font-black">Open the tracker to start recording</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="sent" className="space-y-6">
               <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden p-12 text-center space-y-6">
                  <Send className="w-16 h-16 mx-auto text-primary/30" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Manage Your Sent Eidi</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      All your digital Salami envelopes will appear here once they're created in the Salami tool.
                    </p>
                  </div>
                  <Button className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl" asChild>
                    <Link href="/tools/salami">Send New Eidi</Link>
                  </Button>
               </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
