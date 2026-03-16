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
  ExternalLink
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
  const [formData, setFormData] = useState({ username: "", displayName: user?.displayName || "", bkashNumber: "", nagadNumber: "", message: "ঈদে সালামি দিবেন না? তাড়াতাড়ি স্ক্যান করুন! 😂" })
  const [isSaving, setIsSaving] = useState(false); const [isChecking, setIsChecking] = useState(false)

  const profileRef = useMemoFirebase(() => (db && user) ? doc(db, "salamiProfiles", user.uid) : null, [db, user])
  const { data: profile, isLoading: loadingProfile } = useDoc(profileRef)

  useEffect(() => { if (profile) setFormData({ username: profile.username || "", displayName: profile.displayName || "", bkashNumber: profile.bkashNumber || "", nagadNumber: profile.nagadNumber || "", message: profile.message || "" }) }, [profile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); if (!user || !db) return; setIsSaving(true)
    try {
      if (formData.username !== profile?.username) {
        setIsChecking(true); const q = query(collection(db, "salamiProfiles"), where("username", "==", formData.username)); const snap = await getDocs(q)
        if (!snap.empty) { toast({ variant: "destructive", title: "Username Taken" }); setIsSaving(false); setIsChecking(false); return }
        setIsChecking(false)
      }
      await setDoc(doc(db, "salamiProfiles", user.uid), { id: user.uid, userId: user.uid, username: formData.username.toLowerCase().replace(/\s+/g, ''), displayName: formData.displayName, bkashNumber: formData.bkashNumber, nagadNumber: formData.nagadNumber, message: formData.message, totalSalami: profile?.totalSalami || 0, donorsCount: profile?.donorsCount || 0, createdAt: profile?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() }, { merge: true })
      toast({ title: "Profile Updated!" })
    } catch (error) {} finally { setIsSaving(false) }
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/salami/${formData.username || 'yourname'}` : ""

  return (
    <div className="min-h-screen bg-[#F8FAFC] islamic-pattern pb-20 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
          <header className="text-center mb-16 space-y-6">
            <h1 className="text-5xl lg:text-[80px] font-black text-slate-900 tracking-tighter leading-none">QR Generator</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Share your QR and collect Salami digitally!</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <section className="lg:col-span-7 space-y-8">
              <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10">
                <form onSubmit={handleSave} className="space-y-8">
                  <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Unique Username" className="h-14 rounded-2xl bg-slate-50" required />
                  <Input value={formData.bkashNumber} onChange={e => setFormData({...formData, bkashNumber: e.target.value})} placeholder="bKash Number" className="h-14 rounded-2xl bg-slate-50" required />
                  <Textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="min-h-[120px] rounded-2xl bg-slate-50" />
                  <Button type="submit" disabled={isSaving} className="w-full h-16 rounded-[2rem] gold-gradient text-primary font-black text-xl shadow-2xl">{isSaving ? <Loader2 className="animate-spin" /> : "Save & Generate QR"}</Button>
                </form>
              </Card>
            </section>

            <aside className="lg:col-span-5 space-y-8">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 text-center space-y-10 relative overflow-hidden">
                <div ref={qrRef} className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-slate-50 inline-block">
                  {formData.username ? <QRCodeSVG value={publicUrl} size={240} level="H" /> : <div className="w-[240px] h-[240px] bg-slate-50 flex items-center justify-center"><QrCode className="text-slate-300" /></div>}
                </div>
                <div className="flex flex-col gap-4">
                  <Button variant="outline" className="h-14 rounded-2xl border-2" onClick={() => { navigator.clipboard.writeText(publicUrl); toast({title: "Copied!"}) }}>Copy Link</Button>
                  <Button className="h-14 rounded-2xl emerald-gradient text-white font-black" asChild><Link href={`/salami/${formData.username}`}>Preview Page</Link></Button>
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
