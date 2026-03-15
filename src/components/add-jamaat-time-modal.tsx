
"use client"

import { useState } from "react"
import { useFirestore, useUser } from "@/firebase"
import { collection, addDoc, getDocs, query, where, updateDoc, doc, increment } from "firebase/firestore"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Plus, Loader2, Sparkles, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { awardPoints } from "@/lib/gamification-utils"

export function AddJamaatTimeModal({ mosqueId, mosqueName }: { mosqueId: string, mosqueName: string }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [time, setTime] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) {
      toast({ variant: "destructive", title: "Sign in required" })
      return
    }

    if (!time) {
      toast({ variant: "destructive", title: "Required", description: "Please enter a prayer time." })
      return
    }

    setIsSubmitting(true)
    try {
      // Check if this specific time already exists
      const q = query(
        collection(db, "mosques", mosqueId, "jamaatTimes"),
        where("time", "==", time)
      )
      const existing = await getDocs(q)
      
      if (!existing.empty) {
        const timeDoc = existing.docs[0]
        await updateDoc(doc(db, "mosques", mosqueId, "jamaatTimes", timeDoc.id), {
          communitySubmissionCount: increment(1)
        })
        awardPoints(db, user.uid, 'AddJamaat')
        toast({ title: "Submission Verified!", description: "Points awarded for verification." })
      } else {
        // Create new time entry
        await addDoc(collection(db, "mosques", mosqueId, "jamaatTimes"), {
          mosqueId,
          eidDate: "2026-03-20", 
          time,
          isApprovedByAdmin: false,
          submittedByUserId: user.uid,
          submittedAt: new Date().toISOString(),
          communitySubmissionCount: 1
        })

        awardPoints(db, user.uid, 'AddJamaat')

        // Trigger Notification
        await addDoc(collection(db, "users", user.uid, "notifications"), {
          userId: user.uid,
          title: "Jamaat Time Added! 🕒",
          message: `Your update for ${mosqueName} (${time}) earned you +6 Eid Points!`,
          type: "jamaat",
          isRead: false,
          createdAt: new Date().toISOString()
        })

        toast({ title: "Time Added!", description: "+6 points awarded!" })
      }
      
      setOpen(false)
      setTime("")
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary/5 text-primary hover:bg-primary/10">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="emerald-gradient p-8 text-white relative">
          <Sparkles className="absolute top-4 right-4 w-8 h-8 opacity-20" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Add Jamaat Time</DialogTitle>
            <DialogDescription className="text-white/70 font-medium">
              Schedule for {mosqueName}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 text-secondary fill-secondary" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Earn +6 Eid Points</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Prayer Time</Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                  type="text"
                  value={time} 
                  onChange={e => setTime(e.target.value)}
                  placeholder="e.g. 7:30 AM" 
                  className="h-14 pl-12 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl emerald-gradient text-white font-black text-lg shadow-xl hover:scale-[1.02] transition-transform">
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Add Eid Jamaat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
