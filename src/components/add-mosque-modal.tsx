
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
import { Plus, MapPin, Loader2, Globe, Sparkles, LocateFixed } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    googleMapsLink: "",
    description: ""
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
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) {
      toast({ variant: "destructive", title: "Authentication Required", description: "Please sign in to contribute to the community map." })
      return
    }

    if (!formData.name || !formData.district || !formData.latitude || !formData.longitude) {
      toast({ variant: "destructive", title: "Missing Information", description: "Name, District, and GPS Coordinates are mandatory." })
      return
    }

    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "mosques"), {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        isApprovedByAdmin: false,
        submittedByUserId: user.uid,
        createdAt: new Date().toISOString()
      })
      
      toast({ title: "Submission Received!", description: "Your mosque entry is now pending community verification." })
      setOpen(false)
      setFormData({ name: "", district: "", area: "", latitude: "", longitude: "", googleMapsLink: "", description: "" })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-16 rounded-[2rem] emerald-gradient font-black text-white px-10 shadow-2xl transition-all hover:scale-105 active:scale-95">
          <Plus className="w-6 h-6 mr-3" /> Add Local Mosque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[4rem] border-none shadow-[0_64px_128px_-12px_rgba(0,0,0,0.3)] p-0 overflow-hidden bg-white/95 backdrop-blur-2xl">
        <div className="emerald-gradient p-12 text-white relative">
          <Sparkles className="absolute top-8 right-8 w-12 h-12 opacity-20 animate-pulse" />
          <DialogHeader>
            <DialogTitle className="text-4xl font-black tracking-tight">Submit Mosque</DialogTitle>
            <DialogDescription className="text-emerald-50/80 font-medium text-lg mt-2">
              Contribute to the Live Eid Jamaat Finder and help your community find prayer locations.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Mosque Identification</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Baitul Mukarram National Mosque" 
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
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Area / Neighborhood</Label>
                <Input 
                  value={formData.area} 
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  placeholder="Paltan" 
                  className="h-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all font-medium px-6"
                />
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-[2.5rem] space-y-6 border border-primary/5 relative">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-3">
                  <MapPin className="w-4 h-4" /> Accurate GPS Location
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={detectLocation} className="text-[10px] font-black uppercase text-secondary h-8 hover:bg-secondary/10 px-4 rounded-full">
                  <LocateFixed className="w-3.5 h-3.5 mr-2" /> Auto-Detect
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Input 
                  type="number" step="any"
                  value={formData.latitude} 
                  onChange={e => setFormData({...formData, latitude: e.target.value})}
                  placeholder="Latitude" 
                  className="h-12 rounded-xl bg-white border-none shadow-sm font-mono text-xs px-5"
                />
                <Input 
                  type="number" step="any"
                  value={formData.longitude} 
                  onChange={e => setFormData({...formData, longitude: e.target.value})}
                  placeholder="Longitude" 
                  className="h-12 rounded-xl bg-white border-none shadow-sm font-mono text-xs px-5"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Additional Information (Optional)</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Mosque capacity, specific entrance directions, or facilities..." 
                className="rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 transition-all min-h-[100px] p-6"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] gold-gradient text-primary font-black text-xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Globe className="w-6 h-6 mr-3" /> Add Eid Jamaat</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
