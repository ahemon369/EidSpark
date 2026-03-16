
"use client"

import { useState, useEffect, useRef } from "react"
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
  ExternalLink,
  Smartphone
} from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { QRCodeSVG } from "qrcode.react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BackButton } from "@/components/back-button"

export default function QRSalamiTool() {
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast(); const qrRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({ username: "", displayName: user?.displayName || "", bkashNumber: "", nagadNumber: "", rocketNumber: "", message: "ঈদে সালামি দিবেন না? তাড়াতাড়ি স্ক্যান করুন! 😂" })
  const [isSaving, setIsSaving] = useState(false); const [isChecking, setIsChecking] = useState(false)

  const profileRef = useMemoFirebase(() => (db && user) ? doc(db, "salamiProfiles", user.uid) : null, [db, user])
  const { data: profile } = useDoc(profileRef)

  useEffect(() => { 
    if (profile) setFormData({ 
      username: profile.username || "", 
      displayName: profile.displayName || "", 
      bkashNumber: profile.bkashNumber || "", 
      nagadNumber: profile.nagadNumber || "", 
      rocketNumber: profile.rocketNumber || "",
      message: profile.message || "" 
    }) 
  }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !db) return; setIsSaving(true)
    try {
      if (formData.username !== profile?.username) {
        setIsChecking(true); 
        const q = query(collection(db, "salamiProfiles"), where("username", "==", formData.username.toLowerCase())); 
        const snap = await getDocs(q)
        if (!snap.empty) { 
          toast({ variant: "destructive", title: "Username Taken" }); 
          setIsSaving(false); setIsChecking(false); 
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
        rocketNumber: formData.rocketNumber,
        message: formData.message, 
        totalSalami: profile?.totalSalami || 0, 
        donorsCount: profile?.donorsCount || 0, 
        createdAt: profile?.createdAt || new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      }, { merge: true })
      toast({ title: "Profile Updated!" })
    } catch (error) {} finally { setIsSaving(false) }
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/salami/${formData.username || 'yourname'}` : ""

  const downloadQR = () => {
    const svg = document.querySelector('.qr-preview svg') as SVGSVGElement;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `EidSpark-QR-${formData.username || 'user'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] islamic-pattern pb-20 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
          <header className="text-center mb-16 space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md">
              <QrCode className="w-4 h-4 text-secondary fill-secondary" />
              <span>Digital Salami Hub</span>
            </div>
            <h1 className="text-5xl lg:text-[80px] font-black text-slate-900 tracking-tighter leading-none">QR Generator</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Share your unique QR and collect Salami digitally across bKash, Nagad, and Rocket.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <section className="lg:col-span-7 space-y-8">
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10">
                <form onSubmit={handleSave} className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Unique Username</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="johndoe" className="h-14 pl-12 rounded-2xl bg-slate-50 border-none shadow-inner" required />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">bKash Number</Label>
                      <Input value={formData.bkashNumber} onChange={e => setFormData({...formData, bkashNumber: e.target.value})} placeholder="017..." className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" required />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Nagad (Optional)</Label>
                      <Input value={formData.nagadNumber} onChange={e => setFormData({...formData, nagadNumber: e.target.value})} placeholder="018..." className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Rocket (Optional)</Label>
                      <Input value={formData.rocketNumber} onChange={e => setFormData({...formData, rocketNumber: e.target.value})} placeholder="019..." className="h-14 rounded-2xl bg-slate-50 border-none shadow-inner" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-2">Greeting Message</Label>
                    <Textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50 border-none shadow-inner p-6" />
                  </div>

                  <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-[2rem] gold-gradient text-primary font-black text-xl shadow-2xl transition-all hover:scale-[1.02]">
                    {isSaving ? <Loader2 className="animate-spin" /> : "Save & Generate QR"}
                  </Button>
                </form>
              </Card>
            </section>

            <aside className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 text-center space-y-10 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern group-hover:scale-110 transition-transform duration-1000"></div>
                <div ref={qrRef} className="qr-preview bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-slate-50 inline-block group-hover:rotate-2 transition-transform">
                  {formData.username ? <QRCodeSVG value={publicUrl} size={240} level="H" /> : <div className="w-[240px] h-[240px] bg-slate-50 flex items-center justify-center rounded-2xl"><QrCode className="w-12 h-12 text-slate-300" /></div>}
                </div>
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-14 rounded-2xl border-2 font-bold gap-2" onClick={() => { navigator.clipboard.writeText(publicUrl); toast({title: "Copied!"}) }}>
                      <Copy className="w-4 h-4" /> Link
                    </Button>
                    <Button variant="outline" className="h-14 rounded-2xl border-2 font-bold gap-2" onClick={downloadQR} disabled={!formData.username}>
                      <Download className="w-4 h-4" /> Image
                    </Button>
                  </div>
                  <Button className="h-16 rounded-2xl emerald-gradient text-white font-black text-lg shadow-xl" asChild>
                    <Link href={`/salami/${formData.username || ''}`}>
                      Preview Page <ExternalLink className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
                <div className="pt-6 border-t flex items-center justify-center gap-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary"><Smartphone className="w-5 h-5" /></div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground">Mobile Ready</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary"><Trophy className="w-5 h-5" /></div>
                    <span className="text-[8px] font-black uppercase text-muted-foreground">Viral Hub</span>
                  </div>
                </div>
              </Card>
            </aside>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
