
"use client"

import { useState } from "react"
import { useFirestore, useUser } from "@/firebase"
import { collection, addDoc } from "firebase/firestore"
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
import { Textarea } from "@/components/ui/textarea"
import { Plus, MapPin, Loader2, Globe, Sparkles, LocateFixed, Clock, Landmark, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { awardPoints } from "@/lib/gamification-utils"

export function AddMosqueModal() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    district: "",
    area: "",
    latitude: "",
    longitude: "",
    eidPrayerTime: "",
    description: "",
    type: "mosque" as "mosque" | "ground"
  })

  const detectLocation = () => {
    if (navigator.geolocation) {
      toast({ title: "Detecting Position...", description: "Please wait while we sync with GPS." })
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }))
        toast({ title: "Coordinates Locked!", description: "Location detection successful." })
      }, () => {
        toast({ variant: "destructive", title: "GPS Error", description: "Could not auto-detect location. Please enter manually." })
      }, { enableHighAccuracy: true })
    } else {
      toast({ variant: "destructive", title: "Not Supported", description: "Geolocation is not supported by your browser." })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to contribute to the community map." })
      return
    }

    if (!formData.name || !formData.district || !formData.latitude || !formData.longitude || !formData.eidPrayerTime) {
      toast({ variant: "destructive", title: "Missing Information", description: "Name, District, Prayer Time, and GPS Coordinates are mandatory." })
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "mosques"), {
        name: formData.name,
        district: formData.district,
        area: formData.area,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        eid_prayer_time: formData.eidPrayerTime,
        description: formData.description,
        type: formData.type,
        isApprovedByAdmin: false,
        submittedByUserId: user.uid,
        savesCount: 0,
        createdAt: new Date().toISOString()
      })
      
      awardPoints(db, user.uid, 'AddJamaat')

      toast({ title: "Thank you!", description: "Your contribution is pending verification. Points awarded!" })
      setOpen(false)
      setFormData({ name: "", district: "", area: "", latitude: "", longitude: "", eidPrayerTime: "", description: "", type: "mosque" })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-16 rounded-[2rem] emerald-gradient font-black text-white px-10 shadow-2xl transition-all hover:scale-105 active:scale-95 text-lg">
          <Plus className="w-6 h-6 mr-3" /> Add Jamaat Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-[4rem] border-none shadow-2xl p-0 overflow-hidden bg-white/95 backdrop-blur-2xl">
        <div className="emerald-gradient p-12 text-white relative">
          <Sparkles className="absolute top-8 right-8 w-12 h-12 opacity-20 animate-pulse" />
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tight">Submit Location</DialogTitle>
            <DialogDescription className="text-emerald-50/80 font-medium text-lg mt-2">
              Add your local mosque or Eidgah to the crowd-powered registry.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'mosque'})}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                formData.type === 'mosque' ? "bg-primary/5 border-primary shadow-xl scale-105" : "bg-slate-50 border-transparent opacity-60"
              )}
            >
              <Landmark className={cn("w-10 h-10", formData.type === 'mosque' ? "text-primary" : "text-slate-400")} />
              <span className="text-[10px] font-black uppercase tracking-widest">Permanent Mosque</span>
            </button>
            <button 
              type="button"
              onClick={() => setFormData({...formData, type: 'ground'})}
              className={cn(
                "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                formData.type === 'ground' ? "bg-blue-50 border-blue-500 shadow-xl scale-105" : "bg-slate-50 border-transparent opacity-60"
              )}
            >
              <Users className={cn("w-10 h-10", formData.type === 'ground' ? "text-blue-600" : "text-slate-400")} />
              <span className="text-[10px] font-black uppercase tracking-widest">Large Eidgah/Field</span>
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Name of Mosque or Ground</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Baitul Mukarram or Mirpur Eidgah Field" 
                className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all font-medium px-6"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">District</Label>
                <Input 
                  value={formData.district} 
                  onChange={e => setFormData({...formData, district: e.target.value})}
                  placeholder="Dhaka" 
                  className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all font-medium px-6"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Eid Jamaat Time</Label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={formData.eidPrayerTime} 
                    onChange={e => setFormData({...formData, eidPrayerTime: e.target.value})}
                    placeholder="e.g. 7:30 AM" 
                    className="h-14 pl-10 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[2.5rem] space-y-6 border border-primary/5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-3">
                  <MapPin className="w-4 h-4" /> GPS Precise Location
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={detectLocation} className="text-[10px] font-black uppercase text-secondary h-8 hover:bg-secondary/10 px-4 rounded-full">
                  <LocateFixed className="w-3.5 h-3.5 mr-2" /> Sync GPS
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  type="number" step="any"
                  value={formData.latitude} 
                  onChange={e => setFormData({...formData, latitude: e.target.value})}
                  placeholder="Lat" 
                  className="h-12 rounded-xl bg-white border-none shadow-inner font-mono text-xs px-5"
                />
                <Input 
                  type="number" step="any"
                  value={formData.longitude} 
                  onChange={e => setFormData({...formData, longitude: e.target.value})}
                  placeholder="Lon" 
                  className="h-12 rounded-xl bg-white border-none shadow-inner font-mono text-xs px-5"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Extra Details (Parking, Imam...)</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Share any special arrangements for this year..." 
                className="rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all min-h-[100px] p-6"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] gold-gradient text-primary font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Globe className="w-6 h-6 mr-3" /> Submit to Registry</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
