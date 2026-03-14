
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Trash2, Download, ExternalLink, Sparkles, Loader2, Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export default function MyGreetings() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const greetingRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "eidGreetings"), orderBy("generationDate", "desc"))
  }, [db, user])

  const { data: greetings, isLoading } = useCollection(greetingRef)

  const handleDelete = async (id: string) => {
    if (!db || !user) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "users", user.uid, "eidGreetings", id))
      toast({ title: "Greeting Deleted" })
    } catch (error) {}
    setIsDeleting(null)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Loading Gallery...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">My Greeting Gallery</h2>
          <p className="text-muted-foreground font-medium">Manage all your AI-generated Eid blessings.</p>
        </div>
        <Button className="emerald-gradient text-white h-12 rounded-xl font-black px-8" asChild>
          <Link href="/tools/greeting">Create New Card</Link>
        </Button>
      </div>

      {!greetings || greetings.length === 0 ? (
        <Card className="border-none shadow-xl rounded-[3rem] p-24 text-center space-y-6 bg-white">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
            <Send className="w-10 h-10 text-primary/30" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800">No greetings created yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Start by creating your first personalized Eid blessing using our AI generator.
            </p>
          </div>
          <Button className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl shadow-primary/20" asChild>
            <Link href="/tools/greeting">Generate Now</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {greetings.map((g) => (
            <Card key={g.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:shadow-2xl transition-all">
              <div className="aspect-square bg-slate-100 relative group-hover:scale-105 transition-transform duration-500">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-300" />
                </div>
                {/* Visual placeholder for theme */}
                <div className={cn(
                  "absolute inset-0 opacity-40 islamic-pattern",
                  g.templateId === 'moon' ? 'bg-emerald-900' : 
                  g.templateId === 'lantern' ? 'bg-amber-900' :
                  g.templateId === 'mosque' ? 'bg-indigo-900' : 'bg-amber-50'
                )}></div>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg text-slate-800">{g.recipientName}</h4>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {new Date(g.generationDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl h-11 font-bold gap-2 text-xs border-2" asChild>
                    <Link href="/tools/greeting">
                      <ExternalLink className="w-4 h-4" /> Edit
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl h-11 w-11 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(g.id)}
                    disabled={isDeleting === g.id}
                  >
                    {isDeleting === g.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
