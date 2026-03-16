
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  QrCode, 
  Share2, 
  Download, 
  Copy, 
  Loader2, 
  Sparkles, 
  Wallet, 
  Phone, 
  User, 
  MessageSquare,
  Facebook,
  MessageCircle,
  Link as LinkIcon,
  RefreshCcw,
  Trophy,
  Users,
  ExternalLink
} from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function QRSalamiTool() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    username: "",
    displayName: user?.displayName || "",
    bkashNumber: "",
    nagadNumber: "",
    message: "ঈদে সালামি দিবেন না? তাড়াতাড়ি স্ক্যান করুন! 😂"
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  // Fetch existing profile
  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "salamiProfiles", user.uid)
  }, [db, user])
  const { data: profile, isLoading: loadingProfile } = useDoc(profileRef)

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        displayName: profile.displayName || "",
        bkashNumber: profile.bkashNumber || "",
        nagadNumber: profile.nagadNumber || "",
        message: profile.message || ""
      })
    }
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !db) return
    
    setIsSaving(true)
    try {
      // Validate unique username if changed
      if (formData.username !== profile?.username) {
        setIsChecking(true)
        const q = query(collection(db, "salamiProfiles"), where("username", "==", formData.username))
        const snap = await getDocs(q)
        if (!snap.empty) {
          toast({ variant: "destructive", title: "Username Taken", description: "Please choose another unique handle." })
          setIsSaving(false)
          setIsChecking(false)
          return
        }
        setIsChecking(false)
      }

      await setDoc(doc(db, "salamiProfiles", user.uid), {
        id: user.uid,
        userId: user.uid,
        username: formData.username.toLowerCase().replace(/\s+/g, ''),
        displayName: formData.displayName,
        bkashNumber: formData.bkashNumber,
        nagadNumber: formData.nagadNumber,
        message: formData.message,
        totalSalami: profile?.totalSalami || 0,
        donorsCount: profile?.donorsCount || 0,
        createdAt: profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true })

      toast({ title: "Profile Updated! 🌙", description: "Your QR Salami page is now live." })
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  // Updated to point to /salami/ for public profiles
  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/salami/${formData.username || 'yourname'}` : ""

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    toast({ title: "Link Copied!" })
  }

  const handleShare = (platform: 'fb' | 'wa') => {
    const text = `😄 Send me Eid Salami! Scan my QR or open this link: ${publicUrl}`
    if (platform === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    else window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}&quote=${encodeURIComponent(text)}`, '_blank')
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md shadow-sm">
            <QrCode className="w-4 h-4 text-secondary fill-secondary" />
            <span>Digital QR Salami System</span>
          </div>
          <h1 className="text-5xl lg:text-[80px] font-black text-primary tracking-tighter leading-none">QR Generator</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Create your personal Salami page, share your QR, and climb the collectors leaderboard!
          </p>
        </header>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Creator Form */}
          <section className="lg:col-span-7 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
              <CardHeader className="emerald-gradient p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Wallet className="w-48 h-48" /></div>
                <CardTitle className="text-3xl font-black flex items-center gap-3">
                  <RefreshCcw className="w-8 h-8 text-secondary" />
                  Customize Profile
                </CardTitle>
                <CardDescription className="text-white/70 font-medium">Set up your bKash/Nagad info securely.</CardDescription>
              </CardHeader>
              <CardContent className="p-10">
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Unique Username</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                        <Input 
                          value={formData.username} 
                          onChange={e => setFormData({...formData, username: e.target.value})}
                          placeholder="rafi2026" 
                          className="h-14 pl-11 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Display Name</Label>
                      <Input 
                        value={formData.displayName} 
                        onChange={e => setFormData({...formData, displayName: e.target.value})}
                        placeholder="Rafi Ahmed" 
                        className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">bKash Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                        <Input 
                          value={formData.bkashNumber} 
                          onChange={e => setFormData({...formData, bkashNumber: e.target.value})}
                          placeholder="017xxxxxxxx" 
                          className="h-14 pl-11 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Nagad Number (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                        <Input 
                          value={formData.nagadNumber} 
                          onChange={e => setFormData({...formData, nagadNumber: e.target.value})}
                          placeholder="018xxxxxxxx" 
                          className="h-14 pl-11 rounded-2xl bg-slate-50 border-none shadow-inner font-bold" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Fun Salami Message</Label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-6 w-4 h-4 text-primary/40" />
                      <Textarea 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        className="min-h-[120px] pl-11 rounded-2xl bg-slate-50 border-none shadow-inner font-medium pt-5" 
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSaving || isChecking} className="w-full h-16 rounded-[2rem] gold-gradient text-primary font-black text-xl shadow-2xl hover:scale-[1.02] transition-transform">
                    {isSaving ? <Loader2 className="animate-spin mr-3" /> : <Save className="w-6 h-6 mr-3" />}
                    Save & Generate QR
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Public Link Card */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 border-2 border-primary/5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase text-primary tracking-widest">Your Live Salami URL</p>
                  <p className="text-sm font-bold text-slate-500 truncate max-w-[300px]">{publicUrl}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold gap-2 border-2" onClick={handleCopyLink}><Copy className="w-4 h-4" /> Copy</Button>
                  <Button className="flex-1 rounded-xl h-12 font-bold gap-2 emerald-gradient text-white" asChild><Link href={`/salami/${formData.username || ''}`}><ExternalLink className="w-4 h-4" /> Preview</Link></Button>
                </div>
              </div>
            </Card>
          </section>

          {/* QR & Share Section */}
          <aside className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
            <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 text-center space-y-10 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern"></div>
              
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-secondary blur-[60px] opacity-20"></div>
                <div className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-slate-50 relative z-10 group">
                  {formData.username ? (
                    <QRCodeSVG 
                      value={publicUrl} 
                      size={240} 
                      includeMargin={true}
                      level="H"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-[240px] h-[240px] bg-slate-50 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                      <QrCode className="w-16 h-16 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest mt-4">Username Required</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-black text-primary tracking-tight">Your Custom QR</h3>
                <p className="text-sm text-muted-foreground font-medium max-w-[280px] mx-auto leading-relaxed">
                  Download this QR and post it on your Instagram or WhatsApp story to collect Salami!
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <Button className="h-16 rounded-2xl gold-gradient text-primary font-black text-lg gap-3" onClick={() => handleShare('wa')}>
                  <MessageCircle className="w-6 h-6" /> Share on WhatsApp
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-14 rounded-2xl border-2 border-blue-100 text-blue-600 font-bold gap-2" onClick={() => handleShare('fb')}>
                    <Facebook className="w-5 h-5" /> Facebook
                  </Button>
                  <Button variant="outline" className="h-14 rounded-2xl border-2 font-bold gap-2" onClick={handleCopyLink}>
                    <LinkIcon className="w-5 h-5" /> Copy Link
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Trophy className="w-32 h-32" /></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-secondary tracking-[0.3em]">Total Collected</p>
                  <p className="text-5xl font-black">৳{profile?.totalSalami || 0}</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2 justify-end">
                    <Users className="w-4 h-4 text-secondary" />
                    <span className="text-2xl font-black">{profile?.donorsCount || 0}</span>
                  </div>
                  <p className="text-[10px] font-black uppercase text-white/60 tracking-widest">Generous Friends</p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
