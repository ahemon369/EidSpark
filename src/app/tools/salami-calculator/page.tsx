
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Calculator, Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore } from "@/firebase"
import { awardPoints } from "@/lib/gamification-utils"
import confetti from 'canvas-confetti'
import { BackButton } from "@/components/back-button"

const salamiList = [
  { id: 1, category: "Very Close Junior", amount: 25, icon: "💎" },
  { id: 2, category: "Close Relative", amount: 15, icon: "🤝" },
  { id: 3, category: "Smart Junior", amount: 10, icon: "🧠" },
  { id: 4, category: "Polite Junior", amount: 7, icon: "🙏" },
  { id: 5, category: "The 'Only Salam' Junior", amount: 5, icon: "🗣️" },
  { id: 6, category: "Online Wisher", amount: 3, icon: "📱" },
  { id: 7, category: "Direct Salami Asker", amount: 2, icon: "💸" },
  { id: 8, category: "Brother figure", amount: 50, icon: "👑" },
  { id: 9, category: "Mehendi name writer", amount: 100, icon: "🌿" },
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
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-6 py-8 flex-grow">
          <header className="text-left mb-16 space-y-4">
            <h1 className="text-4xl lg:text-[100px] font-black text-slate-900 tracking-tighter leading-[0.85]">Salami <br /> <span className="text-secondary drop-shadow-sm">Guide</span></h1>
            <p className="text-2xl text-slate-500 font-medium max-w-2xl">The 2026 viral guide to fair Eid Salami pricing.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-10">
              <div className="grid sm:grid-cols-2 gap-6">
                {salamiList.map(item => (
                  <Card key={item.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex items-center justify-between group hover:-translate-y-2 transition-all cursor-pointer" onClick={() => setSelectedId(item.id.toString())}>
                    <div className="flex items-center gap-5"><div className="text-3xl">{item.icon}</div><h4 className="font-black text-lg text-slate-800">{item.category}</h4></div>
                    <p className="text-3xl font-black text-primary">৳{item.amount}</p>
                  </Card>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-5">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-12 space-y-10 sticky top-24">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] ml-2">Quick Evaluation</p>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="h-20 rounded-[2rem] font-black px-8 text-xl shadow-inner border-slate-100 bg-slate-50"><SelectValue placeholder="Select relative status..." /></SelectTrigger>
                    <SelectContent className="rounded-[2rem] p-2">{salamiList.map(i => <SelectItem key={i.id} value={i.id.toString()} className="font-black rounded-[1.5rem] m-1 text-lg py-4">{i.icon} {i.category}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCalculate} disabled={!selectedId || isCalculating} className="w-full h-24 rounded-[2.5rem] gold-gradient text-primary font-black text-3xl shadow-2xl transition-transform hover:scale-105">
                  {isCalculating ? <Loader2 className="animate-spin w-10 h-10" /> : <><Calculator className="w-8 h-8 mr-4" /> Calculate Value</>}
                </Button>
                {result && !isCalculating && <div className="animate-in zoom-in text-center p-10 bg-secondary/10 rounded-[3rem] border-2 border-secondary/20"><p className="text-6xl font-black text-primary">৳{result.amount}</p><p className="text-xs uppercase font-black tracking-widest mt-2 text-primary/60">Suggested Gift Value</p></div>}
              </Card>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
