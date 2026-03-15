
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Trash2, Download, ExternalLink, Loader2, Image as ImageIcon, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import Image from "next/image"

export default function MySelfieGallery() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const selfieRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "selfiePosters"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: selfies, isLoading } = useCollection(selfieRef)

  const handleDelete = async (id: string) => {
    if (!db || !user) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "users", user.uid, "selfiePosters", id))
      toast({ title: "Poster Removed" })
    } catch (error) {}
    setIsDeleting(null)
  }

  const handleDownload = (url: string) => {
    const link = document.createElement('a')
    link.download = `EidSpark-Selfie-${Date.now()}.png`
    link.href = url
    link.click()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs text-center">Loading Your Gallery...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">My Selfie Gallery</h2>
          <p className="text-muted-foreground font-medium">Manage your saved AI festive posters.</p>
        </div>
        <Button className="emerald-gradient text-white h-12 rounded-xl font-black px-8" asChild>
          <Link href="/tools/selfie">
            <Camera className="w-4 h-4 mr-2" /> Take New Selfie
          </Link>
        </Button>
      </div>

      {!selfies || selfies.length === 0 ? (
        <Card className="border-none shadow-xl rounded-[3rem] p-24 text-center space-y-6 bg-white">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-10 h-10 text-primary/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">No posters saved yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Create a festive poster using our AI Selfie Studio and save it here to keep your memories.
            </p>
          </div>
          <Button className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl" asChild>
            <Link href="/tools/selfie">Go to Studio</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {selfies.map((s) => (
            <Card key={s.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all">
              <div className="aspect-square relative overflow-hidden bg-slate-100">
                <Image 
                  src={s.imageUrl} 
                  alt="Saved Selfie" 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 left-4 z-10">
                   <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm border border-primary/10 flex items-center gap-1">
                     <Sparkles className="w-3 h-3" /> AI Generated
                   </div>
                </div>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-slate-800">Festive Poster</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(s.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold gap-2 text-xs border-2" onClick={() => handleDownload(s.imageUrl)}>
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl h-11 w-11 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(s.id)}
                    disabled={isDeleting === s.id}
                  >
                    {isDeleting === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
