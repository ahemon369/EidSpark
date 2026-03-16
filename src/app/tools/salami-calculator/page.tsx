"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sparkles, Moon, Star, Gift, Calculator, Laugh, Info, Share2, Facebook, MessageCircle, Copy, Coins, TrendingUp, Zap, Heart, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore } from "@/firebase"
import { awardPoints } from "@/lib/gamification-utils"
import confetti from 'canvas-confetti'
import { BackButton } from "@/components/back-button"

const salamiList = [
  { id: 1, category: "Very Close Junior", amount: 25, icon: "💎", color: "bg-emerald-500" },
  { id: 2, category: "Normal Junior", amount: 15, icon: "🤝", color: "bg-amber-500" },
  { id: 3, category: "Smart Junior", amount: 10, icon: "🧠", color: "bg-amber-500" },
  { id: 4, category: "Polite Junior", amount: 7, icon: "🙏", color: "bg-orange-500" },
  { id: 5, category: "Junior who only says Salam", amount: 5, icon: "🗣️", color: "bg-orange-500" },
  { id: 6, category: "Junior who sends Eid message online", amount: 3, icon: "📱", color: "bg-slate-400" },
  { id: 7, category: "Junior who asks for Salami directly", amount: 2, icon: "💸", color: "bg-slate-400" },
  { id: 8, category: "Brother who says “Vaiya Salami den”", amount: 50, icon: "👑", color: "bg-emerald-500" },
  { id: 9, category: "If someone writes your name with Mehendi", amount: 100, icon: "🌿", color: "bg-emerald-500" },
]

export default function SalamiCalculatorPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [selectedId, setSelectedId] = useState<string>("")
  const [result, setResult] = useState<{ amount: number; category: string } | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true)
    const item = salamiList.find((s) => s.id.toString() === selectedId)
    
    setTimeout(() => {
      if (item) {
        setResult({ amount: item.amount, category: item.category })
        
        // Celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#065f46', '#ffffff']
        })

        if (user && db) {
          awardPoints(db, user.uid, 'SalamiCalc')
        }
      }
      setIsCalculating(false)
    }, 800)
  }

  const getSalamiLevel = (amount: number) => {
    if (amount < 10) return { label: "Low", icon: "💸", color: "text-slate-400" }
    if (amount < 50) return { label: "Medium", icon: "💰", color: "text-amber-500" }
    return { label: "High", icon: "🤑", color: "text-emerald-500" }
  }

  const shareSocial = (platform: 'fb' | 'wa') => {
    if (!result) return
    const text = `EidSpark বলছে আমাকে ${result.amount} টাকা সালামি দিতে হবে 😂`
    const url = encodeURIComponent(window.location.href)
    const quote = encodeURIComponent(text)
    
    if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${quote}%20${url}`, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <div className="relative pt-[80px]">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <header className="text-center mb-24 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-secondary/20 shadow-sm backdrop-blur-md">
              <Laugh className="w-4 h-4 text-secondary fill-secondary" />
              <span>Fun Feature • Eid 2026 Edition</span>
            </div>
            <h1 className="text-6xl lg:text-[110px] font-black text-primary dark:text-white tracking-tighter leading-[0.85]">
              Salami <br />
              <span className="text-secondary drop-shadow-sm">Registry</span>
            </h1>
            <p className="text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
              The unofficial, totally non-binding, and hilarious community-driven guide to Eid Salami.
            </p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            {/* Table Section (Now Cards) */}
            <div className="lg:col-span-7 space-y-10 animate-in fade-in slide-in-from-left duration-700">
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-secondary fill-secondary" />
                  <h2 className="text-3xl font-black text-primary tracking-tight">Official Rates</h2>
                </div>
                <div className="bg-primary/5 px-4 py-1.5 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/10">Standard 2026</div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {salamiList.map((item) => (
                  <Card 
                    key={item.id} 
                    className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl group hover:-translate-y-3 transition-all duration-500 border border-transparent hover:border-secondary/20 cursor-pointer"
                    onClick={() => setSelectedId(item.id.toString())}
                  >
                    <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110", item.color + "/10")}>
                          {item.icon}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-slate-800 text-lg group-hover:text-primary transition-colors">{item.category}</h4>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Recommended Gift</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-black text-primary tracking-tighter">৳{item.amount}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="bg-secondary/5 p-10 rounded-[3rem] border-2 border-secondary/20 flex gap-6 items-start shadow-2xl backdrop-blur-md group hover:bg-secondary/[0.08] transition-all">
                <Info className="w-10 h-10 text-secondary shrink-0 mt-1" />
                <div className="space-y-2">
                  <p className="text-sm font-black text-secondary uppercase tracking-[0.3em]">Critical Disclaimer</p>
                  <p className="text-xl font-bold text-primary leading-relaxed italic">
                    "This list is generated for entertainment purposes only 😂. Use it at your own risk! EidSpark is not liable for family tension or stinginess reports."
                  </p>
                </div>
              </div>
            </div>

            {/* Calculator Section */}
            <aside className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right duration-700">
              <Card className="border-none shadow-[0_64px_128px_-12px_rgba(6,95,70,0.15)] rounded-[3.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-4 border-white overflow-hidden sticky top-24">
                <div className="p-12 gold-gradient text-primary relative overflow-hidden">
                  <Moon className="absolute -right-10 -top-10 w-48 h-48 opacity-10 rotate-12" />
                  <div className="relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-sm">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Decision Assistant</span>
                    </div>
                    <CardTitle className="text-5xl font-black tracking-tight leading-none">Salami <br />Calculator</CardTitle>
                    <CardDescription className="text-primary/70 font-black uppercase text-[10px] tracking-[0.3em] mt-2">v2.0 Community Algorithm</CardDescription>
                  </div>
                </div>

                <CardContent className="p-12 space-y-10">
                  <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/5 flex items-center justify-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary shadow-lg"><Star className="w-5 h-5 fill-primary" /></div>
                    <span className="text-[11px] font-black uppercase text-primary tracking-widest">+2 XP per session</span>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] ml-2">Whom are you addressing?</Label>
                    <Select value={selectedId} onValueChange={setSelectedId}>
                      <SelectTrigger className="h-20 rounded-[2rem] border-4 border-slate-50 bg-slate-50 focus:border-secondary/30 transition-all font-black px-8 text-xl text-slate-800 shadow-inner">
                        <SelectValue placeholder="Select relative status..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-[2rem] border-secondary/10 shadow-2xl p-2">
                        {salamiList.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()} className="font-black rounded-[1.5rem] m-1 text-lg py-4 px-6 cursor-pointer">
                            {item.icon} {item.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleCalculate}
                    disabled={!selectedId || isCalculating}
                    className="w-full h-24 rounded-[2.5rem] gold-gradient text-primary font-black text-3xl shadow-[0_20px_50px_rgba(217,119,6,0.3)] hover:scale-105 transition-all active:scale-95 group relative overflow-hidden"
                  >
                    {isCalculating ? (
                      <Loader2 className="w-10 h-10 animate-spin" />
                    ) : (
                      <span className="flex items-center gap-4">
                        <Calculator className="w-10 h-10 group-hover:rotate-12 transition-transform" />
                        Get Result
                      </span>
                    )}
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </Button>

                  {result && !isCalculating && (
                    <div className="animate-in zoom-in duration-500 space-y-10">
                      <div className="bg-secondary/10 border-4 border-secondary/20 p-12 rounded-[3.5rem] text-center space-y-6 relative overflow-hidden shadow-inner">
                        <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern"></div>
                        <Coins className="absolute -left-6 -top-6 w-32 h-32 text-secondary/20 animate-bounce" />
                        <div className="w-24 h-24 bg-secondary rounded-[2rem] flex items-center justify-center mx-auto text-primary shadow-2xl relative z-10 animate-float">
                          <Gift className="w-12 h-12" />
                        </div>
                        <div className="space-y-2 relative z-10">
                          <p className="text-6xl font-black text-primary tracking-tighter leading-none">৳{result.amount}</p>
                          <p className="text-[10px] font-black text-primary/60 uppercase tracking-[0.4em]">Suggested Blessing</p>
                        </div>
                        
                        <div className="pt-8 border-t border-secondary/10 relative z-10">
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em] mb-4">Salami Generosity Meter</p>
                          <div className="flex justify-center gap-6">
                            {["Low", "Medium", "High"].map((lvl) => {
                              const current = getSalamiLevel(result.amount)
                              const isActive = current.label === lvl
                              return (
                                <div key={lvl} className={cn(
                                  "flex flex-col items-center gap-2 transition-all duration-500",
                                  isActive ? "opacity-100 scale-125 translate-y-[-5px]" : "opacity-20 scale-90 grayscale"
                                )}>
                                  <span className="text-3xl">{lvl === "Low" ? "💸" : lvl === "Medium" ? "💰" : "🤑"}</span>
                                  <span className={cn("text-[9px] font-black uppercase tracking-tighter", isActive ? current.color : "")}>{lvl}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-[10px] font-black uppercase text-center text-muted-foreground tracking-[0.5em]">Viral Sharing Center</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Button variant="outline" className="rounded-full h-16 px-10 border-4 border-blue-50 text-blue-600 font-black text-lg hover:bg-blue-50 transition-all shadow-sm" onClick={() => shareSocial('fb')}>
                            <Facebook className="w-6 h-6 mr-3" /> FB
                          </Button>
                          <Button variant="outline" className="rounded-full h-16 px-10 border-4 border-green-50 text-green-600 font-black text-lg hover:bg-green-50 transition-all shadow-sm" onClick={() => shareSocial('wa')}>
                            <MessageCircle className="w-6 h-6 mr-3" /> WA
                          </Button>
                          <Button variant="outline" className="rounded-full h-16 w-16 border-4 border-slate-50 font-black hover:bg-slate-50" onClick={() => { navigator.clipboard.writeText(`EidSpark বলছে আমাকে ${result.amount} টাকা সালামি দিতে হবে 😂`); toast({title: "Copied!"}) }}>
                            <Copy className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </aside>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
