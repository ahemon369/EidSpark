"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Info, InfoIcon, TrendingUp, Landmark } from "lucide-react"

export default function ZakatCalculator() {
  const [values, setValues] = useState({
    cash: "",
    gold: "",
    savings: "",
    business: ""
  })

  const [result, setResult] = useState<number | null>(null)

  const handleCalculate = () => {
    const total = Object.values(values).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)
    // Zakat is 2.5% of total assets
    const zakat = total * 0.025
    setResult(zakat)
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-black uppercase tracking-widest">
            <Landmark className="w-4 h-4" />
            <span>Syariah Compliant</span>
          </div>
          <h1 className="text-5xl font-black text-primary tracking-tight">Zakat Calculator</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            Calculate your annual Zakat obligation accurately in BDT. Simple, fast, and easy to use.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-7">
            <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[3rem] overflow-hidden">
              <CardHeader className="p-10 pb-6 bg-primary/5">
                <CardTitle className="text-3xl font-black text-primary flex items-center gap-3">
                  <Calculator className="w-8 h-8" />
                  Asset Details (BDT)
                </CardTitle>
                <CardDescription className="text-lg font-medium">Enter your total assets for the current Hijri year.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-10">
                <div className="grid sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="cash" className="text-lg font-bold text-primary">Cash & Bank Balance</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary opacity-50">৳</span>
                      <Input
                        id="cash"
                        type="number"
                        placeholder="0.00"
                        value={values.cash}
                        onChange={(e) => setValues({ ...values, cash: e.target.value })}
                        className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="gold" className="text-lg font-bold text-primary">Gold / Silver Value</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary opacity-50">৳</span>
                      <Input
                        id="gold"
                        type="number"
                        placeholder="0.00"
                        value={values.gold}
                        onChange={(e) => setValues({ ...values, gold: e.target.value })}
                        className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="savings" className="Investment / Savings" className="text-lg font-bold text-primary">Savings / FDR</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary opacity-50">৳</span>
                      <Input
                        id="savings"
                        type="number"
                        placeholder="0.00"
                        value={values.savings}
                        onChange={(e) => setValues({ ...values, savings: e.target.value })}
                        className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="business" className="text-lg font-bold text-primary">Business Assets</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary opacity-50">৳</span>
                      <Input
                        id="business"
                        type="number"
                        placeholder="0.00"
                        value={values.business}
                        onChange={(e) => setValues({ ...values, business: e.target.value })}
                        className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/10 focus:border-primary/30"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-10 pt-0">
                <Button onClick={handleCalculate} className="w-full emerald-gradient h-16 text-xl font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform active:scale-95">
                  Calculate Zakat Now
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-5 space-y-8">
            {result !== null ? (
              <Card className="emerald-gradient text-white shadow-2xl border-none rounded-[3rem] overflow-hidden animate-in zoom-in duration-500">
                <CardHeader className="p-10 pb-6">
                  <div className="flex items-center gap-3 opacity-80 font-black text-sm uppercase tracking-widest">
                    <TrendingUp className="w-5 h-5" />
                    Calculated Result
                  </div>
                </CardHeader>
                <CardContent className="text-center p-10 py-12">
                  <div className="text-6xl font-black mb-4">
                    ৳{result.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <p className="text-white/80 text-xl font-medium">Your Zakat obligation for this year.</p>
                </CardContent>
                <CardFooter className="bg-black/20 p-8 border-t border-white/10">
                  <p className="text-sm text-center w-full text-white/70 font-bold leading-relaxed">
                    This is 2.5% of your total net assets. Please consult a local scholar for specific rulings.
                  </p>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-primary/5 border-dashed border-4 border-primary/10 flex items-center justify-center p-20 text-center rounded-[3rem]">
                <div className="space-y-6">
                  <div className="bg-white w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-xl">
                    <InfoIcon className="w-10 h-10 text-primary/40" />
                  </div>
                  <p className="text-xl text-muted-foreground font-bold">Fill your asset values to see the results here.</p>
                </div>
              </Card>
            )}

            <Card className="bg-amber-50 border-2 border-amber-200 rounded-[2.5rem] overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <CardTitle className="text-amber-900 text-2xl font-black flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  What is Zakat?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 text-lg text-amber-800/80 leading-relaxed font-medium">
                Zakat is one of the Five Pillars of Islam. It is a mandatory religious duty for all Muslims who meet the necessary criteria of wealth (Nisab). It helps circulate wealth and support the needy in our society.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}