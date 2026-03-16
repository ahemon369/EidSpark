"use client"

import { useUser, useAuth, useFirestore } from "@/firebase"
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { doc, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog"
import { User, Shield, Bell, Moon, Camera, Save, Loader2, Lock, CheckCircle2 } from "lucide-react"
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
  
  // Local states
  const [displayName, setDisplayName] = useState("")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Password change states
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  })
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)

  // Initialize data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
      setAvatarPreview(user.photoURL || null)
    }
    
    // Load dark mode from local storage
    const savedTheme = localStorage.getItem("darkMode") === "true"
    setDarkMode(savedTheme)
    if (savedTheme) document.body.classList.add("dark")
  }, [user])

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !auth || !db) return
    if (!displayName.trim()) {
      toast({ variant: "destructive", title: "Name Required", description: "Please enter your full name." })
      return
    }

    setIsSaving(true)
    
    updateProfile(auth.currentUser!, {
      displayName: displayName,
      photoURL: avatarPreview || user.photoURL
    }).then(() => {
      const userRef = doc(db, "users", user.uid)
      updateDoc(userRef, {
        username: displayName,
        avatarUrl: avatarPreview || user.photoURL,
        updatedAt: new Date().toISOString()
      }).catch(async (err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: userRef.path,
          operation: 'update'
        }))
      })

      toast({ title: "Profile Updated Successfully", description: "Your account details have been saved." })
    }).catch((error) => {
      toast({ variant: "destructive", title: "Update Failed", description: error.message || "An error occurred while saving your profile." })
    }).finally(() => {
      setIsSaving(false)
    })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ variant: "destructive", title: "Unsupported File", description: "Please upload an image file (JPG or PNG)." })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setAvatarPreview(base64)
      setIsUploading(false)
      toast({ title: "Photo Previewed", description: "Click 'Save Changes' to permanently update your photo." })
    }
    reader.readAsDataURL(file)
  }

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val)
    localStorage.setItem("darkMode", val.toString())
    if (val) {
      document.body.classList.add("dark")
    } else {
      document.body.classList.remove("dark")
    }
  }

  const toggleNotifications = (val: boolean) => {
    setNotifications(val)
    if (!user || !db) return
    
    const userRef = doc(db, "users", user.uid)
    updateDoc(userRef, {
      notificationsEnabled: val
    }).catch(async () => {
      // Background fail
    })
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth || !auth.currentUser || !user?.email) return

    if (passwordForm.new !== passwordForm.confirm) {
      toast({ variant: "destructive", title: "Passwords Mismatch", description: "The new password and confirmation do not match." })
      return
    }

    if (passwordForm.new.length < 6) {
      toast({ variant: "destructive", title: "Password Too Short", description: "Your new password must be at least 6 characters." })
      return
    }

    setIsChangingPassword(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.current)
      await reauthenticateWithCredential(auth.currentUser, credential)
      
      await updatePassword(auth.currentUser, passwordForm.new)
      
      toast({ title: "Password Updated", description: "Your security settings have been refreshed." })
      setPasswordModalOpen(false)
      setPasswordForm({ current: "", new: "", confirm: "" })
    } catch (error: any) {
      let msg = "Failed to update password. Please check your credentials."
      if (error.code === 'auth/wrong-password') msg = "The current password entered is incorrect."
      toast({ variant: "destructive", title: "Security Error", description: msg })
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800">Account Settings</h2>
        <p className="text-muted-foreground font-medium">Manage your personal profile and application preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Profile Info */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardHeader className="p-10 border-b border-slate-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 rounded-2xl text-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black">Profile Information</CardTitle>
                <CardDescription>Update your public display name and avatar.</CardDescription>
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
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                  />
                </div>
                <div className="flex-grow space-y-4 w-full">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)} 
                        className="h-12 rounded-xl border-2 focus:border-primary/20" 
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <Input value={user?.email || ""} readOnly className="h-12 rounded-xl bg-slate-50 opacity-60 cursor-not-allowed" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-medium">Your profile name is visible to other community members.</p>
                </div>
              </div>
              <Button type="submit" disabled={isSaving} className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl shadow-primary/20">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preferences */}
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
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
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
                  <p className="text-sm text-muted-foreground font-medium">Enable or disable platform alerts.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                <Switch checked={notifications} onCheckedChange={toggleNotifications} />
              </div>
            </div>
          </Card>
        </div>

        {/* Security Info */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-10">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 rounded-2xl text-red-500">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-lg">Security & Privacy</h4>
                <p className="text-sm text-muted-foreground font-medium">Protect your credentials and data privacy.</p>
              </div>
            </div>
            
            <Dialog open={passwordModalOpen} onOpenChange={setPasswordModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-xl font-bold h-12 border-2 hover:bg-slate-50">
                  <Lock className="w-4 h-4 mr-2" /> Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] sm:max-w-[425px]">
                <form onSubmit={handleChangePassword}>
                  <DialogHeader className="space-y-3 mb-6">
                    <DialogTitle className="text-2xl font-black">Update Password</DialogTitle>
                    <DialogDescription>Enter your current password to authorize security changes.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Current Password</Label>
                      <Input 
                        type="password" 
                        required
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({...passwordForm, current: e.target.value})}
                        className="h-12 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Password</Label>
                      <Input 
                        type="password" 
                        required
                        value={passwordForm.new}
                        onChange={(e) => setPasswordForm({...passwordForm, new: e.target.value})}
                        className="h-12 rounded-xl" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Confirm New Password</Label>
                      <Input 
                        type="password" 
                        required
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm: e.target.value})}
                        className="h-12 rounded-xl" 
                      />
                    </div>
                  </div>
                  <DialogFooter className="mt-6">
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="w-full h-12 rounded-xl font-black emerald-gradient text-white"
                    >
                      {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                      Update Password
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  )
}
