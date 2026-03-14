
"use client"

import { useUser } from "@/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, Bell, Moon, Camera, Save, Loader2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function ProfileSettings() {
  const { user } = useUser()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  
  // Local states for UI feedback (Note: persistence requires updateProfile/updateEmail)
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false)
      toast({ title: "Settings Updated", description: "Your preferences have been saved." })
    }, 1000)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-slate-800">Settings</h2>
        <p className="text-muted-foreground font-medium">Manage your account and app preferences.</p>
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
                <CardDescription>Personal details and public profile.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSave} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-slate-100 shadow-xl transition-all group-hover:scale-105">
                    <AvatarImage src={user?.photoURL || ""} />
                    <AvatarFallback className="bg-primary text-white font-black text-4xl">{user?.displayName?.[0]}</AvatarFallback>
                  </Avatar>
                  <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border-2 border-slate-100 hover:bg-slate-50 transition-colors">
                    <Camera className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <div className="flex-grow space-y-4 w-full">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</Label>
                      <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</Label>
                      <Input value={user?.email || ""} readOnly className="h-12 rounded-xl bg-slate-50 opacity-60" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic font-medium">Your email cannot be changed once verified.</p>
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
                  <p className="text-sm text-muted-foreground font-medium">Toggle between light and dark.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Dark Mode</span>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
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
                  <p className="text-sm text-muted-foreground font-medium">Manage app alerts.</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
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
                <p className="text-sm text-muted-foreground font-medium">Protect your account and data.</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl font-bold h-12 border-2">Change Password</Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
