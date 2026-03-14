"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  TrendingUp, 
  Landmark, 
  Heart, 
  Wallet, 
  BadgeDollarSign, 
  MinusCircle, 
  ArrowRight,
  Info,
  ExternalLink
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const charities = [
  { name: "As-Sunnah Foundation", url: "https://assunnahfoundation.org/", logo: "AS" },
  { name: "Mastul Foundation", url: "https://www.mastul.net/", logo: "MF" },
  { name: "Bidyanondo", url: "https://www.bidyanondo.org/", logo: "BD" },
]

export default function ZakatCalculator() {
  const [values, setValues] = useState({
    cash: "",
    gold: "",
    savings: "",
    business: "",
    debt: "",
    expenses: ""
  })

  const results = useMemo(() => {
    const cash = parseFloat(values.cash) || 0
    const gold = parseFloat(values.gold) || 0
    const savings = parseFloat(values.savings) || 0
    const business = parseFloat(values.business) || 0
    const debt = parseFloat(values.debt) || 0
    const expenses = parseFloat(values.expenses) || 0

    const totalAssets = cash + gold + savings + business
    const totalLiabilities = debt + expenses
    const netWealth = Math.max(0, totalAssets - totalLiabilities)
    const zakatAmount = netWealth * 0.025

    return {
      totalAssets,
      totalLiabilities,
      netWealth,
      zakatAmount
    }
  }, [values])

  return (
    <div className="min-h-screen islamic-pattern pb-32">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest border border-primary/20">
            <Landmark className="w-4 h-4" />
            <span>Islamic Finance Assistant</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">
            Zakat <span className="text-secondary">&</span> Sadaqah
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Calculate your mandatory Zakat with precision and plan your voluntary contributions for a blessed Eid.
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 rounded-3xl h-16 bg-white/50 backdrop-blur-md p-1 border border-primary/10 shadow-xl">
            <TabsTrigger value="calculator" className="rounded-2xl font-bold text-lg data-[state=active]:emerald-gradient data-[state=active]:text-white transition-all gap-2">
              <Calculator className="w-5 h-5" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="charity" className="rounded-2xl font-bold text-lg data-[state=active]:gold-gradient data-[state=active]:text-white transition-all gap-2">
              <Heart className="w-5 h-5" />
              Donate
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="animate-in fade-in slide-in-from-bottom duration-700">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Form Section */}
              <div className="lg:col-span-7 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="p-10 pb-6 bg-primary/5">
                    <CardTitle className="text-3xl font-black text-primary flex items-center gap-3">
                      <Wallet className="w-8 h-8 text-secondary" />
                      Current Assets
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">Enter your wealth sources in BDT.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="cash" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Cash & Bank Balance</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">৳</span>
                          <Input
                            id="cash"
                            type="number"
                            placeholder="0.00"
                            value={values.cash}
                            onChange={(e) => setValues({ ...values, cash: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/5 focus:border-primary/30 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="gold" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Gold & Silver Value</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">৳</span>
                          <Input
                            id="gold"
                            type="number"
                            placeholder="0.00"
                            value={values.gold}
                            onChange={(e) => setValues({ ...values, gold: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/5 focus:border-primary/30 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="savings" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Savings / FDR / Insurance</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">৳</span>
                          <Input
                            id="savings"
                            type="number"
                            placeholder="0.00"
                            value={values.savings}
                            onChange={(e) => setValues({ ...values, savings: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/5 focus:border-primary/30 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="business" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Business Stocks / Profit</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">৳</span>
                          <Input
                            id="business"
                            type="number"
                            placeholder="0.00"
                            value={values.business}
                            onChange={(e) => setValues({ ...values, business: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/5 focus:border-primary/30 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>

                  <CardHeader className="p-10 pb-6 bg-destructive/5 pt-0 border-t border-destructive/10">
                    <CardTitle className="text-3xl font-black text-destructive flex items-center gap-3 mt-10">
                      <MinusCircle className="w-8 h-8" />
                      Liabilities
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">Subtract your immediate debts and expenses.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="debt" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Short-term Debts</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-destructive/40 font-bold">৳</span>
                          <Input
                            id="debt"
                            type="number"
                            placeholder="0.00"
                            value={values.debt}
                            onChange={(e) => setValues({ ...values, debt: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-destructive/5 focus:border-destructive/30 bg-white"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="expenses" className="text-sm font-black text-muted-foreground uppercase tracking-wider">Monthly Living Expenses</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-destructive/40 font-bold">৳</span>
                          <Input
                            id="expenses"
                            type="number"
                            placeholder="0.00"
                            value={values.expenses}
                            onChange={(e) => setValues({ ...values, expenses: e.target.value })}
                            className="rounded-2xl h-14 pl-10 text-lg border-2 border-destructive/5 focus:border-destructive/30 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Section */}
              <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                <Card className="emerald-gradient text-white shadow-2xl border-none rounded-[3rem] overflow-hidden p-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-[2.8rem] p-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-white/70 font-black uppercase text-xs tracking-widest">Calculated Result</p>
                        <h3 className="text-2xl font-black">Estimated Zakat</h3>
                      </div>
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse">
                        <BadgeDollarSign className="w-6 h-6 text-secondary" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-7xl font-black tracking-tighter">
                        ৳{results.zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <p className="text-white/60 font-medium">Your 2.5% mandatory contribution</p>
                    </div>

                    <div className="pt-8 border-t border-white/10 grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white/50 uppercase tracking-widest">Net Wealth</p>
                        <p className="text-xl font-bold">৳{results.netWealth.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-white/50 uppercase tracking-widest">Liabilities</p>
                        <p className="text-xl font-bold">৳{results.totalLiabilities.toLocaleString()}</p>
                      </div>
                    </div>

                    <Button className="w-full bg-secondary text-primary font-black h-16 rounded-2xl text-lg hover:bg-secondary/90 shadow-xl group" asChild>
                      <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                        Pay Your Zakat <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Button>
                  </div>
                </Card>

                <Card className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8 space-y-4">
                  <div className="flex items-center gap-3 text-amber-900 font-black text-lg">
                    <Info className="w-5 h-5" />
                    Understanding Nisab
                  </div>
                  <p className="text-amber-800/80 font-medium leading-relaxed text-sm">
                    Zakat is only mandatory if your net wealth exceeds the <strong>Nisab threshold</strong> (approx. ৳7-8 Lakh depending on current gold prices) and is held for one lunar year.
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="charity" className="animate-in fade-in slide-in-from-bottom duration-700">
            <div className="grid md:grid-cols-3 gap-8">
              {charities.map((charity) => (
                <Card key={charity.name} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-300">
                  <div className="emerald-gradient h-32 flex items-center justify-center">
                    <span className="text-4xl font-black text-white opacity-20">{charity.logo}</span>
                  </div>
                  <CardContent className="p-8 space-y-4 text-center">
                    <h3 className="text-2xl font-black text-primary">{charity.name}</h3>
                    <p className="text-muted-foreground font-medium text-sm">Support verified zakat projects and social welfare in Bangladesh.</p>
                    <Button variant="outline" className="w-full rounded-xl h-12 border-2 border-primary/10 text-primary font-bold hover:bg-primary/5" asChild>
                      <a href={charity.url} target="_blank" rel="noopener noreferrer">
                        Visit Website <ExternalLink className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="mt-16 text-center space-y-8 p-12 glass-card rounded-[3rem]">
              <h3 className="text-3xl font-black text-primary">"The wealth of a person is never diminished by charity."</h3>
              <div className="flex justify-center gap-8">
                <div className="space-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto text-primary">
                    <Heart className="w-8 h-8 fill-primary" />
                  </div>
                  <p className="font-bold text-sm">Blessed Eid</p>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto text-secondary">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-sm">Reward X700</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}