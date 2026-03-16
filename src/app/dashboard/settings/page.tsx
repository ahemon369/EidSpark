
"use client"

import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { User, Shield, Bell, Moon, Camera, Save, Loader2, Lock, CheckCircle2, Eye, Globe } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function ProfileSettings() {
  const { user } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [privacy, setPrivacy] = useState("public")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userDocRef)

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
      setAvatarPreview(user.photoURL || null)
    }
    if (userData) {
      setUsername(userData.username || "")
      setPrivacy(userData.privacy || "public")
    }
    const savedTheme = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedTheme)
  }, [user, userData])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !auth || !db) return
    if (!displayName.trim() || !username.trim()) {
      toast({ variant: "destructive", title: "Missing Information", description: "Name and Username are required." })
      return
    }

    setIsSaving(true)
    
    try {
      // Check for username uniqueness if changed
      if (username !== userData?.username) {
        const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()))
        const snap = await getDocs(q)
        if (!snap.empty) {
          toast({ variant: "destructive", title: "Username Taken", description: "Please choose another unique username." })
          setIsSaving(false)
          return
        }
      }

      await updateProfile(auth.currentUser!, {
        displayName: displayName,
        photoURL: avatarPreview || user.photoURL
      })

      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        username: username.toLowerCase().replace(/\s+/g, ''),
        avatarUrl: avatarPreview || user.photoURL,
        privacy: privacy,
        updatedAt: new Date().toISOString()
      })

      toast({ title: "Profile Updated Successfully", description: "Your account details have been saved." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "An error occurred." })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Unsupported File", description: "Please upload an image file." })
      return
    }
    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      setAvatarPreview(event.target?.result as string)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val)
    localStorage.setItem("darkMode", val.toString())
    if (val) document.body.classList.add("dark")
    else document.body.classList.remove("dark")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
        <p className="text-muted-foreground font-medium">Manage your personal profile and application preferences.</p>
      </div>

      <div className="grid gap-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Profile Information</CardTitle>
                <CardDescription>Update your public display name and unique profile URL.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSaveProfile} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-slate-100 shadow-xl transition-all group-hover:scale-105 overflow-hidden">
                    <AvatarImage src={avatarPreview || ""} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white font-black text-4xl">{displayName?.[0] || user?.email?.[0]}</AvatarFallback>
                  </Avatar>
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Camera className="w-5 h-5 text-primary" />}
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <div className="flex-grow space-y-4 w-full">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="h-12 rounded-xl border-2" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Unique Username</Label>
                      <Input 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        className="h-12 rounded-xl border-2" 
                        placeholder="johndoe"
                      />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-500">Your profile will be at: <span className="text-primary font-bold">eidspark.app/profile/{username || 'username'}</span></p>
                    <Globe className="w-4 h-4 text-slate-300" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-black text-sm">Profile Privacy</h4>
                    <p className="text-xs text-muted-foreground">Control who can view your greetings and stats.</p>
                  </div>
                  <Select value={privacy} onValueChange={setPrivacy}>
                    <SelectTrigger className="w-[180px] rounded-xl h-11">
                      <SelectValue placeholder="Select Privacy" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends Only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" disabled={isSaving} className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                  <Moon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Display Mode</h4>
                  <p className="text-sm text-muted-foreground font-medium">Switch between light and dark themes.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border">
                <span className="text-sm font-bold text-slate-700">Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-500">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-lg">Notifications</h4>
                  <p className="text-sm text-muted-foreground font-medium">Enable platform activity alerts.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border">
                <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
