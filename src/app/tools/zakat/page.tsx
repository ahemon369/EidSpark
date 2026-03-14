"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Info, InfoIcon, TrendingUp, Landmark, Heart } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ZakatCalculator() {
  const [values, setValues] = useState({
    cash: "",
    gold: "",
    savings: "",
    business: ""
  })

  const [sadaqahAmount, setSadaqahAmount] = useState("")
  const [zakatResult, setZakatResult] = useState<number | null>(null)

  const handleCalculateZakat = () => {
    const total = Object.values(values).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)
    // Zakat is 2.5% of total assets
    const zakat = total * 0.025
    setZakatResult(zakat)
  }

  const suggestedSadaqah = [
    { label: "1% for the Poor", percent: 0.01 },
    { label: "5% for Education", percent: 0.05 },
    { label: "10% Generous Giving", percent: 0.10 },
  ]

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest">
            <Landmark className="w-4 h-4" />
            <span>Islamic Finance Tools</span>
          </div>
          <h1 className="text-5xl font-black text-primary tracking-tight">Zakat & Sadaqah</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Calculate your mandatory Zakat and plan your voluntary Sadaqah for this blessed Eid.
          </p>
        </div>

        <Tabs defaultValue="zakat" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 rounded-[1.5rem] h-14 bg-accent/50 p-1">
            <TabsTrigger value="zakat" className="rounded-[1.2rem] font-bold text-lg data-[state=active]:emerald-gradient data-[state=active]:text-white transition-all">
              <Landmark className="w-4 h-4 mr-2" />
              Zakat
            </TabsTrigger>
            <TabsTrigger value="sadaqah" className="rounded-[1.2rem] font-bold text-lg data-[state=active]:gold-gradient data-[state=active]:text-white transition-all">
              <Heart className="w-4 h-4 mr-2" />
              Sadaqah
            </TabsTrigger>
          </TabsList>

          <TabsContent value="zakat">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-10 pb-6 bg-primary/5">
                    <CardTitle className="text-3xl font-black text-primary flex items-center gap-3">
                      <Calculator className="w-8 h-8" />
                      Asset Details (BDT)
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">Enter your net wealth after basic needs.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10">
                    <div className="grid sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="cash" className="text-lg font-bold text-primary">Cash & Bank</Label>
                        <Input
                          id="cash"
                          type="number"
                          placeholder="0.00"
                          value={values.cash}
                          onChange={(e) => setValues({ ...values, cash: e.target.value })}
                          className="rounded-2xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="gold" className="text-lg font-bold text-primary">Gold / Silver Value</Label>
                        <Input
                          id="gold"
                          type="number"
                          placeholder="0.00"
                          value={values.gold}
                          onChange={(e) => setValues({ ...values, gold: e.target.value })}
                          className="rounded-2xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="savings" className="text-lg font-bold text-primary">Savings / FDR</Label>
                        <Input
                          id="savings"
                          type="number"
                          placeholder="0.00"
                          value={values.savings}
                          onChange={(e) => setValues({ ...values, savings: e.target.value })}
                          className="rounded-2xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="business" className="text-lg font-bold text-primary">Business Stocks</Label>
                        <Input
                          id="business"
                          type="number"
                          placeholder="0.00"
                          value={values.business}
                          onChange={(e) => setValues({ ...values, business: e.target.value })}
                          className="rounded-2xl h-14 text-lg border-2 border-primary/10 focus:border-primary/30"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-10 pt-0">
                    <Button onClick={handleCalculateZakat} className="w-full emerald-gradient h-16 text-xl font-black rounded-2xl shadow-xl transition-transform active:scale-95">
                      Calculate Zakat (2.5%)
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-8">
                {zakatResult !== null ? (
                  <Card className="emerald-gradient text-white shadow-2xl border-none rounded-[3rem] overflow-hidden animate-in zoom-in duration-500">
                    <CardHeader className="p-10 pb-6">
                      <div className="flex items-center gap-3 opacity-80 font-black text-sm uppercase tracking-widest">
                        <TrendingUp className="w-5 h-5" />
                        Result in BDT
                      </div>
                    </CardHeader>
                    <CardContent className="text-center p-10 py-12">
                      <div className="text-6xl font-black mb-4">
                        ৳{zakatResult.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </div>
                      <p className="text-white/80 text-xl font-medium">Your mandatory Zakat obligation.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-primary/5 border-dashed border-4 border-primary/10 flex items-center justify-center p-20 text-center rounded-[3rem]">
                    <div className="space-y-6">
                      <InfoIcon className="w-12 h-12 text-primary/20 mx-auto" />
                      <p className="text-xl text-muted-foreground font-bold">Zakat results will appear here.</p>
                    </div>
                  </Card>
                )}
                
                <Card className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] p-8">
                  <h4 className="text-amber-900 text-xl font-black mb-4 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    What is Nisab?
                  </h4>
                  <p className="text-amber-800/80 font-medium leading-relaxed">
                    Nisab is the minimum amount of wealth a Muslim must possess before they are obligated to pay Zakat. For gold, it is approx 87.48 grams.
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sadaqah">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7">
                <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[3rem] overflow-hidden">
                  <CardHeader className="p-10 pb-6 bg-secondary/5">
                    <CardTitle className="text-3xl font-black text-secondary flex items-center gap-3">
                      <Heart className="w-8 h-8 fill-secondary" />
                      Voluntary Sadaqah
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">Plan your additional rewards for this month.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-10">
                    <div className="space-y-4">
                      <Label htmlFor="sadaqahInput" className="text-xl font-bold text-primary">Monthly Surplus / Income (BDT)</Label>
                      <Input
                        id="sadaqahInput"
                        type="number"
                        placeholder="Enter amount"
                        value={sadaqahAmount}
                        onChange={(e) => setSadaqahAmount(e.target.value)}
                        className="rounded-2xl h-16 text-2xl border-2 border-secondary/20 focus:border-secondary transition-all"
                      />
                    </div>
                    
                    <div className="grid gap-4">
                      <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">Suggested Donations</p>
                      <div className="grid sm:grid-cols-3 gap-4">
                        {suggestedSadaqah.map((opt) => (
                          <Button 
                            key={opt.percent}
                            variant="outline"
                            className="h-20 rounded-2xl flex flex-col border-2 border-primary/10 hover:border-secondary hover:bg-secondary/5 group transition-all"
                            onClick={() => {
                              const val = (parseFloat(sadaqahAmount) || 0) * opt.percent
                              alert(`Suggested ${opt.label}: ৳${val.toLocaleString()}`)
                            }}
                          >
                            <span className="text-secondary font-black text-lg group-hover:scale-110 transition-transform">{(opt.percent * 100)}%</span>
                            <span className="text-xs font-bold text-muted-foreground">{opt.label.split('for')[0]}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-10 pt-0">
                    <p className="text-center w-full text-muted-foreground font-medium italic">
                      "Sadaqah extinguishes sin as water extinguishes fire."
                    </p>
                  </CardFooter>
                </Card>
              </div>

              <div className="lg:col-span-5">
                <Card className="gold-gradient text-primary shadow-2xl border-none rounded-[3rem] p-12 text-center space-y-8 h-full flex flex-col justify-center items-center">
                  <div className="w-24 h-24 bg-white/40 rounded-full flex items-center justify-center animate-pulse">
                    <Heart className="w-12 h-12 fill-primary" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-black italic">Multiply Your Rewards</h3>
                    <p className="text-lg font-bold opacity-80 leading-relaxed">
                      Sadaqah is a voluntary act of charity. There is no minimum amount, and it can be given to anyone in need at any time.
                    </p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
