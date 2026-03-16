"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [selectedId, setSelectedId] = useState<string>(""); const [result, setResult] = useState<{ amount: number; category: string } | null>(null); const [isCalculating, setIsCalculating] = useState(false)

  const handleCalculate = () => {
    setIsCalculating(true); const item = salamiList.find((s) => s.id.toString() === selectedId)
    setTimeout(() => {
      if (item) { setResult({ amount: item.amount, category: item.category }); confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); if (user && db) awardPoints(db, user.uid, 'SalamiCalc') }
      setIsCalculating(false)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
          <header className="text-center mb-24 space-y-6">
            <h1 className="text-6xl lg:text-[110px] font-black text-primary tracking-tighter leading-[0.85]">Salami <br /> <span className="text-secondary drop-shadow-sm">Registry</span></h1>
            <p className="text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">The unofficial guides to Eid Salami.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-10">
              <div className="grid sm:grid-cols-2 gap-6">
                {salamiList.map(item => (
                  <Card key={item.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group hover:-translate-y-2 transition-all cursor-pointer" onClick={() => setSelectedId(item.id.toString())}>
                    <div className="flex items-center gap-5"><div className="text-3xl">{item.icon}</div><h4 className="font-black text-lg">{item.category}</h4></div>
                    <p className="text-3xl font-black text-primary">৳{item.amount}</p>
                  </Card>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 space-y-10 sticky top-24">
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="h-20 rounded-[2rem] font-black px-8 text-xl shadow-inner"><SelectValue placeholder="Relative status..." /></SelectTrigger>
                  <SelectContent className="rounded-[2rem] p-2">{salamiList.map(i => <SelectItem key={i.id} value={i.id.toString()} className="font-black rounded-[1.5rem] m-1 text-lg py-4">{i.icon} {i.category}</SelectItem>)}</SelectContent>
                </Select>
                <Button onClick={handleCalculate} disabled={!selectedId || isCalculating} className="w-full h-24 rounded-[2.5rem] gold-gradient text-primary font-black text-3xl shadow-2xl">{isCalculating ? <Loader2 className="animate-spin" /> : "Get Result"}</Button>
                {result && !isCalculating && <div className="animate-in zoom-in text-center p-10 bg-secondary/10 rounded-[3rem]"><p className="text-6xl font-black text-primary">৳{result.amount}</p><p className="text-xs uppercase font-black tracking-widest mt-2">Suggested Gift</p></div>}
              </Card>
            </aside>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
