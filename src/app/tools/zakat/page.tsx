
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Info, InfoIcon } from "lucide-react"

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
    // Simple Zakat rule: 2.5% of total assets
    const zakat = total * 0.025
    setResult(zakat)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">Zakat Calculator</h1>
          <p className="text-muted-foreground mt-4">Calculate your annual zakat obligation with ease.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg border-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Asset Details
              </CardTitle>
              <CardDescription>Enter the values of your assets in your local currency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cash">Cash in Hand / Bank</Label>
                <Input
                  id="cash"
                  type="number"
                  placeholder="0.00"
                  value={values.cash}
                  onChange={(e) => setValues({ ...values, cash: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gold">Gold / Silver Value</Label>
                <Input
                  id="gold"
                  type="number"
                  placeholder="0.00"
                  value={values.gold}
                  onChange={(e) => setValues({ ...values, gold: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="savings">Investment / Savings</Label>
                <Input
                  id="savings"
                  type="number"
                  placeholder="0.00"
                  value={values.savings}
                  onChange={(e) => setValues({ ...values, savings: e.target.value })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business">Business Assets</Label>
                <Input
                  id="business"
                  type="number"
                  placeholder="0.00"
                  value={values.business}
                  onChange={(e) => setValues({ ...values, business: e.target.value })}
                  className="rounded-xl"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCalculate} className="w-full emerald-gradient py-6 text-lg rounded-xl">
                Calculate Zakat
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            {result !== null ? (
              <Card className="emerald-gradient text-white shadow-xl border-none">
                <CardHeader>
                  <CardTitle className="text-white/80 text-lg">Your Calculated Zakat</CardTitle>
                </CardHeader>
                <CardContent className="text-center py-8">
                  <div className="text-5xl font-bold mb-2">
                    ${result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-white/80">This amount represents 2.5% of your total assets.</p>
                </CardContent>
                <CardFooter className="bg-black/10 py-4">
                  <p className="text-xs text-center w-full text-white/60">
                    Always consult with a local scholar for specific rulings regarding your situation.
                  </p>
                </CardFooter>
              </Card>
            ) : (
              <Card className="bg-accent/30 border-dashed border-2 flex items-center justify-center p-12 text-center">
                <div className="space-y-4">
                  <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <InfoIcon className="w-8 h-8 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground">Fill in your assets to see your zakat calculation here.</p>
                </div>
              </Card>
            )}

            <Card className="bg-amber-50 border-amber-200">
              <CardHeader>
                <CardTitle className="text-amber-800 text-lg flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  What is Zakat?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-amber-700 leading-relaxed">
                Zakat is one of the Five Pillars of Islam. It is a mandatory religious duty for all Muslims who meet the necessary criteria of wealth to help the needy. It is typically 2.5% of a Muslim's total savings and wealth above a minimum amount (Nisab).
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
