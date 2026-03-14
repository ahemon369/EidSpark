
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
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
  ExternalLink,
  Save,
  History
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const charities = [
  { name: "As-Sunnah Foundation", url: "https://assunnahfoundation.org/", logo: "AS" },
  { name: "Mastul Foundation", url: "https://www.mastul.net/", logo: "MF" },
  { name: "Bidyanondo", url: "https://www.bidyanondo.org/", logo: "BD" },
]

export default function ZakatCalculator() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [values, setValues] = useState({
    cash: "",
    gold: "",
    savings: "",
    business: "",
    debt: "",
    expenses: ""
  })
  const [isSaving, setIsSaving] = useState(false)

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
      zakatAmount,
      inputs: { cash, gold, savings, business }
    }
  }, [values])

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "zakatCalculations"),
      orderBy("calculationDate", "desc"),
      limit(5)
    )
  }, [db, user])

  const { data: history } = useCollection(historyQuery)

  const handleSave = async () => {
    if (!db || !user) {
      toast({ title: "Please sign in", description: "You need to be logged in to save your history." })
      return
    }

    setIsSaving(true)
    try {
      await addDoc(collection(db, "users", user.uid, "zakatCalculations"), {
        userId: user.uid,
        calculationDate: new Date().toISOString(),
        cashAmount: results.inputs.cash,
        goldValue: results.inputs.gold,
        savingsAmount: results.inputs.savings,
        businessAssetsAmount: results.inputs.business,
        calculatedZakat: results.zakatAmount,
        notes: "Self-calculated via EidSpark"
      })
      toast({ title: "Calculation Saved", description: "Your Zakat record has been added to your history." })
    } catch (error) {
      // Handled by global listener
    } finally {
      setIsSaving(false)
    }
  }

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
            <TabsTrigger value="history" className="rounded-2xl font-bold text-lg data-[state=active]:gold-gradient data-[state=active]:text-white transition-all gap-2">
              <History className="w-5 h-5" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="animate-in fade-in slide-in-from-bottom duration-700">
            <div className="grid lg:grid-cols-12 gap-8 items-start">
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
                      {['cash', 'gold', 'savings', 'business'].map((key) => (
                        <div key={key} className="space-y-3">
                          <Label htmlFor={key} className="text-sm font-black text-muted-foreground uppercase tracking-wider">
                            {key === 'cash' ? 'Cash & Bank' : key === 'gold' ? 'Gold Value' : key === 'savings' ? 'Savings/FDR' : 'Business Assets'}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40 font-bold">৳</span>
                            <Input
                              id={key}
                              type="number"
                              placeholder="0.00"
                              value={values[key as keyof typeof values]}
                              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                              className="rounded-2xl h-14 pl-10 text-lg border-2 border-primary/5 focus:border-primary/30 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardHeader className="p-10 pb-6 bg-destructive/5 pt-0 border-t border-destructive/10">
                    <CardTitle className="text-3xl font-black text-destructive flex items-center gap-3 mt-10">
                      <MinusCircle className="w-8 h-8" />
                      Liabilities
                    </CardTitle>
                    <CardDescription className="text-lg font-medium">Subtract debts and monthly expenses.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="grid sm:grid-cols-2 gap-8">
                      {['debt', 'expenses'].map((key) => (
                        <div key={key} className="space-y-3">
                          <Label htmlFor={key} className="text-sm font-black text-muted-foreground uppercase tracking-wider">
                            {key === 'debt' ? 'Short-term Debts' : 'Monthly Expenses'}
                          </Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-destructive/40 font-bold">৳</span>
                            <Input
                              id={key}
                              type="number"
                              placeholder="0.00"
                              value={values[key as keyof typeof values]}
                              onChange={(e) => setValues({ ...values, [key]: e.target.value })}
                              className="rounded-2xl h-14 pl-10 text-lg border-2 border-destructive/5 focus:border-destructive/30 bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-32">
                <Card className="emerald-gradient text-white shadow-2xl border-none rounded-[3rem] overflow-hidden p-2">
                  <div className="bg-white/10 backdrop-blur-md rounded-[2.8rem] p-10 space-y-8">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <p className="text-white/70 font-black uppercase text-xs tracking-widest">Calculated Result</p>
                        <h3 className="text-2xl font-black">Estimated Zakat</h3>
                      </div>
                      <BadgeDollarSign className="w-10 h-10 text-secondary" />
                    </div>

                    <div className="space-y-2">
                      <div className="text-7xl font-black tracking-tighter">
                        ৳{results.zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </div>
                      <p className="text-white/60 font-medium">Your 2.5% mandatory contribution</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Button 
                        onClick={handleSave} 
                        disabled={isSaving || !user}
                        className="w-full bg-secondary text-primary font-black h-16 rounded-2xl text-lg hover:bg-secondary/90 shadow-xl group"
                      >
                        {isSaving ? "Saving..." : "Save Calculation"} <Save className="ml-2 w-5 h-5" />
                      </Button>
                      {!user && <p className="text-center text-xs text-white/50">Sign in to save your history</p>}
                    </div>
                  </div>
                </Card>

                <Card className="bg-amber-50 border-2 border-amber-100 rounded-[2.5rem] p-8 space-y-4">
                  <div className="flex items-center gap-3 text-amber-900 font-black text-lg">
                    <Info className="w-5 h-5" />
                    Nisab Guide
                  </div>
                  <p className="text-amber-800/80 font-medium text-sm">
                    Zakat is due if your net wealth exceeds the Nisab threshold (approx. ৳750,000) and is held for one lunar year.
                  </p>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom duration-700">
             {!user ? (
               <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed">
                 <p className="text-muted-foreground font-bold">Please sign in to view your calculation history.</p>
               </div>
             ) : (
               <div className="grid gap-6">
                 {history?.length === 0 && (
                    <div className="text-center py-20 bg-white/50 rounded-[3rem] border-2 border-dashed">
                      <p className="text-muted-foreground font-bold">No calculations saved yet.</p>
                    </div>
                 )}
                 {history?.map((entry) => (
                   <Card key={entry.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl p-8">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="space-y-1 text-center md:text-left">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Date: {new Date(entry.calculationDate).toLocaleDateString()}</p>
                          <h4 className="text-2xl font-black text-primary">৳{entry.calculatedZakat.toLocaleString()} Zakat</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase text-muted-foreground/60">Cash</p>
                              <p className="font-bold">৳{entry.cashAmount.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase text-muted-foreground/60">Gold</p>
                              <p className="font-bold">৳{entry.goldValue.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase text-muted-foreground/60">Savings</p>
                              <p className="font-bold">৳{entry.savingsAmount.toLocaleString()}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-[10px] font-black uppercase text-muted-foreground/60">Business</p>
                              <p className="font-bold">৳{entry.businessAssetsAmount.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>
                   </Card>
                 ))}
               </div>
             )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
