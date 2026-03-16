
"use client"

import { useState, use, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Gift, 
  Wallet, 
  Smartphone, 
  CheckCircle2, 
  Heart, 
  Share2, 
  Sparkles, 
  SmartphoneNfc,
  Copy,
  Loader2,
  Trophy,
  Users,
  Info,
  Star,
  QrCode
} from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase, useAuth } from "@/firebase"
import { collection, query, where, limit, updateDoc, doc, increment } from "firebase/firestore"
import { signInAnonymously } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import confetti from 'canvas-confetti'
import Image from "next/image"
import { QRCodeSVG } from "qrcode.react"
import Link from "next/link"

const amounts = [10, 20, 50, 100]

export default function PublicSalamiProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const db = useFirestore()
  const auth = useAuth()
  const { toast } = useToast()
  
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [hasSent, setHasSent] = useState(false)

  // Query profile by username (case-insensitive search)
  const profileQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "salamiProfiles"), where("username", "==", id.toLowerCase()), limit(1))
  }, [db, id])
  const { data: profiles, isLoading } = useCollection(profileQuery)
  const profile = profiles?.[0]

  const handleConfirm = async () => {
    if (!profile || !db || !selectedAmount) return
    setIsConfirming(true)
    
    try {
      // Ensure user is signed in (anonymously if needed) to satisfy security rules
      if (auth && !auth.currentUser) {
        await signInAnonymously(auth)
      }

      await updateDoc(doc(db, "salamiProfiles", profile.id), {
        totalSalami: increment(selectedAmount),
        donorsCount: increment(1)
      })
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#065f46', '#fbbf24', '#ffffff']
      })

      setHasSent(true)
      toast({ title: "Salami Confirmed! ✨", description: `Thank you for your generosity of ৳${selectedAmount}.` })
    } catch (error) {
      console.error(error)
      toast({ variant: "destructive", title: "Confirmation Failed", description: "Please try again later." })
    } finally {
      setIsConfirming(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied to clipboard!" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-primary font-black tracking-widest uppercase text-xs">Loading Profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Gift className="w-20 h-20 text-primary/20 animate-bounce" />
        <h1 className="text-4xl font-black text-primary">Profile Not Found</h1>
        <p className="text-muted-foreground font-medium">This user hasn't created a Salami profile yet.</p>
        <Button className="rounded-2xl h-14 px-10 emerald-gradient font-black" onClick={() => window.location.href = '/'}>Go Home</Button>
      </div>
    )
  }

  const publicUrl = typeof window !== 'undefined' ? window.location.href : ""

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-4 py-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        <Card className="border-none shadow-[0_64px_128px_-12px_rgba(6,95,70,0.15)] rounded-[4rem] overflow-hidden bg-white/90 backdrop-blur-xl border-4 border-white">
          <CardHeader className="emerald-gradient p-12 text-white text-center relative">
            <Sparkles className="absolute top-8 right-8 w-12 h-12 opacity-20 animate-twinkle" />
            <div className="flex flex-col items-center gap-6">
              <div className="w-28 h-28 rounded-[2.5rem] bg-white/20 border-4 border-white/30 flex items-center justify-center shadow-2xl backdrop-blur-md">
                <span className="text-5xl">🌙</span>
              </div>
              
              {/* QR Code visible on profile card */}
              <div className="bg-white p-3 rounded-2xl shadow-xl hidden sm:block">
                <QRCodeSVG value={publicUrl} size={100} level="H" />
              </div>
            </div>
            
            <CardTitle className="text-5xl font-black tracking-tighter leading-none mb-4 mt-6">{profile.displayName}</CardTitle>
            <p className="text-white/80 text-xl font-medium leading-relaxed italic px-4">"{profile.message}"</p>
          </CardHeader>

          <CardContent className="p-12 space-y-12">
            {!hasSent ? (
              <>
                {/* QR Code for Mobile (Centered & Large) */}
                <div className="sm:hidden flex flex-col items-center justify-center space-y-4">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-8 border-slate-50">
                    <QRCodeSVG value={publicUrl} size={200} level="H" />
                  </div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Scan to pay salami</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Choose Salami Amount</p>
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-secondary" />
                      <span className="text-[10px] font-black text-primary uppercase">{profile.donorsCount || 0} People Sent Salami</span>
                    </div>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                    {amounts.map(amt => (
                      <button
                        key={amt}
                        onClick={() => setSelectedAmount(amt)}
                        className={cn(
                          "h-16 px-8 rounded-2xl font-black text-xl transition-all shadow-sm flex items-center gap-2 shrink-0 snap-center",
                          selectedAmount === amt 
                            ? "gold-gradient text-primary scale-110 shadow-xl" 
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"
                        )}
                      >
                        ৳{amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black uppercase text-center text-muted-foreground tracking-[0.3em]">Payment Instructions</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="border-none shadow-xl rounded-[2rem] bg-[#E2136E] text-white overflow-hidden group">
                      <div className="p-8 flex flex-col items-center text-center space-y-4">
                        <SmartphoneNfc className="w-10 h-10 opacity-80" />
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase opacity-60">bKash</p>
                          <p className="text-xl font-black tracking-tight">{profile.bkashNumber}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-none h-10 px-4"
                          onClick={() => copyToClipboard(profile.bkashNumber)}
                        >
                          <Copy className="w-4 h-4 mr-2" /> Copy
                        </Button>
                      </div>
                    </Card>

                    {profile.nagadNumber && (
                      <Card className="border-none shadow-xl rounded-[2rem] bg-[#F7941D] text-white overflow-hidden">
                        <div className="p-8 flex flex-col items-center text-center space-y-4">
                          <Smartphone className="w-10 h-10 opacity-80" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-60">Nagad</p>
                            <p className="text-xl font-black tracking-tight">{profile.nagadNumber}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-none h-10 px-4"
                            onClick={() => copyToClipboard(profile.nagadNumber)}
                          >
                            <Copy className="w-4 h-4 mr-2" /> Copy
                          </Button>
                        </div>
                      </Card>
                    )}

                    {profile.rocketNumber && (
                      <Card className="border-none shadow-xl rounded-[2rem] bg-purple-600 text-white overflow-hidden">
                        <div className="p-8 flex flex-col items-center text-center space-y-4">
                          <Smartphone className="w-10 h-10 opacity-80" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase opacity-60">Rocket</p>
                            <p className="text-xl font-black tracking-tight">{profile.rocketNumber}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-none h-10 px-4"
                            onClick={() => copyToClipboard(profile.rocketNumber)}
                          >
                            <Copy className="w-4 h-4 mr-2" /> Copy
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    disabled={!selectedAmount || isConfirming} 
                    onClick={handleConfirm}
                    className="w-full h-20 rounded-[2.5rem] emerald-gradient text-white font-black text-2xl shadow-2xl hover:scale-[1.02] transition-transform group"
                  >
                    {isConfirming ? <Loader2 className="animate-spin mr-3" /> : <CheckCircle2 className="w-8 h-8 mr-3 group-hover:rotate-12 transition-transform" />}
                    Confirm I Sent ৳{selectedAmount || ''} Salami
                  </Button>
                  <p className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-widest mt-6">
                    Note: This confirms your intent to the collector and updates the leaderboard.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-12 space-y-10 animate-in zoom-in duration-700">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-secondary blur-[60px] opacity-40 animate-pulse"></div>
                  <div className="w-40 h-40 bg-secondary rounded-[3.5rem] flex items-center justify-center mx-auto text-7xl shadow-2xl relative z-10 animate-bounce">
                    🎉
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-black text-primary tracking-tighter">Blessing Sent!</h3>
                  <p className="text-xl text-muted-foreground font-medium max-sm:text-sm max-w-sm mx-auto leading-relaxed">
                    You've just made {profile.displayName}'s Eid a little brighter. May Allah reward your generosity!
                  </p>
                </div>
                <div className="pt-8 flex flex-col gap-4 max-w-sm mx-auto">
                  <Button className="h-16 rounded-2xl gold-gradient text-primary font-black text-lg shadow-xl" asChild>
                    <a href="/tools/qr-salami">Create Your Own QR Page <Sparkles className="ml-2 w-5 h-5" /></a>
                  </Button>
                  <Button variant="ghost" onClick={() => setHasSent(false)} className="font-bold text-muted-foreground uppercase tracking-widest text-xs">
                    Send More Salami
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Progress Bar for Virality */}
        <div className="mt-16 text-center space-y-8">
          <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/5 flex flex-col items-center gap-6">
            <Trophy className="w-12 h-12 text-secondary fill-secondary" />
            <div className="space-y-2">
              <p className="text-4xl font-black text-primary tracking-tighter leading-none">৳{profile.totalSalami.toLocaleString()}</p>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Community Confirmed Collection</p>
            </div>
            <div className="w-full max-w-md h-3 bg-primary/10 rounded-full overflow-hidden">
              <div 
                className="h-full emerald-gradient transition-all duration-1000" 
                style={{ width: `${Math.min(100, (profile.totalSalami / 10000) * 100)}%` }} 
              />
            </div>
            <p className="text-xs font-bold text-muted-foreground italic">Target: ৳10,000 for "Eid Legend" Badge</p>
          </div>

          <div className="flex items-center justify-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] opacity-40">
            <Info className="w-4 h-4" />
            <span>Secured Verification System • Bangladesh 2026</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
