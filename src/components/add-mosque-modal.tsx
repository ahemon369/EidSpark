
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
import { Plus, MapPin, Loader2, Globe, Sparkles } from "lucide-react"
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
      toast({ title: "Detecting...", description: "Fetching GPS coordinates." })
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString()
        }))
        toast({ title: "Location Detected!" })
      }, () => {
        toast({ variant: "destructive", title: "Error", description: "GPS failed. Please enter manually." })
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) {
      toast({ variant: "destructive", title: "Sign in required" })
      return
    }

    if (!formData.name || !formData.district || !formData.latitude || !formData.longitude) {
      toast({ variant: "destructive", title: "Required Fields", description: "Name, District, and Coordinates are mandatory." })
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
      
      toast({ title: "Mosque Submitted!", description: "It will appear on the map once approved by an admin." })
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
        <Button className="h-14 rounded-2xl emerald-gradient font-black text-white px-8 shadow-xl hover:scale-[1.02] transition-transform">
          <Plus className="w-5 h-5 mr-2" /> Add Local Mosque
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden">
        <div className="emerald-gradient p-10 text-white relative">
          <Sparkles className="absolute top-6 right-6 w-10 h-10 opacity-20" />
          <DialogHeader>
            <DialogTitle className="text-3xl font-black">Submit Mosque</DialogTitle>
            <DialogDescription className="text-white/70 font-medium">
              Help your community find prayer locations.
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Mosque Name</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Baitul Mukarram National Mosque" 
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">District</Label>
                <Input 
                  value={formData.district} 
                  onChange={e => setFormData({...formData, district: e.target.value})}
                  placeholder="Dhaka" 
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Area / Neighborhood</Label>
                <Input 
                  value={formData.area} 
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  placeholder="Paltan" 
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl space-y-4 border border-primary/5">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Location Coordinates
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={detectLocation} className="text-[10px] font-black uppercase text-secondary h-6 hover:bg-secondary/10">
                  Auto-Detect GPS
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="number" step="any"
                  value={formData.latitude} 
                  onChange={e => setFormData({...formData, latitude: e.target.value})}
                  placeholder="Lat" 
                  className="h-10 rounded-lg bg-white"
                />
                <Input 
                  type="number" step="any"
                  value={formData.longitude} 
                  onChange={e => setFormData({...formData, longitude: e.target.value})}
                  placeholder="Lng" 
                  className="h-10 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Google Maps Link (Optional)</Label>
              <Input 
                value={formData.googleMapsLink} 
                onChange={e => setFormData({...formData, googleMapsLink: e.target.value})}
                placeholder="https://goo.gl/maps/..." 
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Additional Notes</Label>
              <Textarea 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Capacity, facilities, etc." 
                className="rounded-xl min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl gold-gradient text-primary font-black text-lg shadow-xl hover:scale-[1.02] transition-transform">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <><Globe className="w-5 h-5 mr-3" /> Submit for Review</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
