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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Sparkles, Moon, Star, Gift, Calculator, Laugh, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const salamiList = [
  { id: 1, category: "Very Close Junior", amount: 25 },
  { id: 2, category: "Normal Junior", amount: 15 },
  { id: 3, category: "Smart Junior", amount: 10 },
  { id: 4, category: "Polite Junior", amount: 7 },
  { id: 5, category: "Junior who only says Salam", amount: 5 },
  { id: 6, category: "Junior who sends Eid message online", amount: 3 },
  { id: 7, category: "Junior who asks for Salami directly", amount: 2 },
  { id: 8, category: "Brother who says “Vaiya Salami den”", amount: 50 },
  { id: 9, category: "If someone writes your name with Mehendi", amount: 100 },
]

export default function SalamiCalculatorPage() {
  const [selectedId, setSelectedId] = useState<string>("")
  const [result, setResult] = useState<string | null>(null)

  const handleCalculate = () => {
    const item = salamiList.find((s) => s.id.toString() === selectedId)
    if (item) {
      setResult(`You should give ${item.amount} BDT Eid Salami 😄`)
    }
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-0 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-secondary/10 text-secondary text-xs font-black uppercase tracking-[0.2em] border border-secondary/20 shadow-sm backdrop-blur-md">
            <Laugh className="w-4 h-4 text-secondary fill-secondary" />
            <span>Fun Feature • Eid 2026 Edition</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-black text-primary dark:text-white tracking-tighter leading-[0.9]">
            Eid Salami <br />
            <span className="text-secondary drop-shadow-sm">List 2026</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            The unofficial, totally non-binding, and hilarious guide to Eid Salami distribution in Bangladesh.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Table Section */}
          <div className="lg:col-span-7 space-y-8 animate-in fade-in slide-in-from-left duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20">
              <CardHeader className="p-10 border-b border-secondary/10 bg-secondary/5">
                <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                  <Gift className="w-6 h-6 text-secondary" />
                  Official Rates
                </CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Market rates for 2026</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none bg-slate-50 dark:bg-slate-800/50">
                      <TableHead className="w-[80px] font-black uppercase text-[10px] tracking-widest pl-10">Serial</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest">Category</TableHead>
                      <TableHead className="text-right font-black uppercase text-[10px] tracking-widest pr-10">Amount (BDT)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salamiList.map((item) => (
                      <TableRow key={item.id} className="border-secondary/5 hover:bg-secondary/5 transition-colors group">
                        <TableCell className="font-bold text-muted-foreground pl-10">{item.id.toString().padStart(2, '0')}</TableCell>
                        <TableCell className="font-black text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">{item.category}</TableCell>
                        <TableCell className="text-right font-black text-secondary pr-10">৳{item.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-8 rounded-[3rem] border-2 border-amber-100 dark:border-amber-900/20 flex gap-5 items-start shadow-xl backdrop-blur-md">
              <Info className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
              <div className="space-y-2">
                <p className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">Disclaimer</p>
                <p className="text-lg font-bold text-amber-700/80 dark:text-amber-200/60 leading-relaxed italic">
                  "This list is only for fun 😂. Use it at your own risk! EidSpark is not responsible for any family drama caused by these rates."
                </p>
              </div>
            </div>
          </div>

          {/* Calculator Section */}
          <aside className="lg:col-span-5 space-y-8 animate-in fade-in slide-in-from-right duration-700">
            <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 overflow-hidden sticky top-24">
              <div className="p-10 gold-gradient text-primary relative overflow-hidden">
                <Moon className="absolute -right-4 -top-4 w-32 h-32 opacity-10 rotate-12" />
                <div className="relative z-10 space-y-2">
                  <div className="inline-flex items-center gap-2 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Interactive Tool</span>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tight">Salami Calc</CardTitle>
                  <CardDescription className="text-primary/70 font-bold uppercase text-[10px] tracking-widest">Quick decision assistant</CardDescription>
                </div>
              </div>

              <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Who are you giving to?</Label>
                  <Select value={selectedId} onValueChange={setSelectedId}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-secondary/10 bg-slate-50 focus:border-secondary/30 transition-all font-bold px-6">
                      <SelectValue placeholder="Select a situation..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-secondary/10">
                      {salamiList.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()} className="font-bold rounded-xl m-1">
                          {item.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleCalculate}
                  disabled={!selectedId}
                  className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95 group"
                >
                  <Calculator className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                  Calculate My Salami
                </Button>

                {result && (
                  <div className="animate-in zoom-in duration-500 bg-secondary/10 border-2 border-secondary/20 p-8 rounded-[2.5rem] text-center space-y-4">
                    <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto text-primary shadow-lg animate-bounce">
                      <Gift className="w-8 h-8" />
                    </div>
                    <p className="text-2xl font-black text-primary leading-tight">{result}</p>
                    <div className="flex justify-center gap-2">
                      {[1,2,3].map(i => <Star key={i} className="w-4 h-4 fill-secondary text-secondary animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] opacity-40">
              <Moon className="w-3.5 h-3.5" />
              <span>EidSpark Happiness Division</span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
