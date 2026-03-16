"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Calculator, 
  Landmark, 
  Wallet, 
  BadgeDollarSign, 
  MinusCircle, 
  Info,
  Save,
  History,
  Loader2
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/back-button"

export default function ZakatCalculator() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [values, setValues] = useState({ cash: "", gold: "", savings: "", business: "", debt: "", expenses: "" })
  const [isSaving, setIsSaving] = useState(false)

  const results = useMemo(() => {
    const assets = (parseFloat(values.cash) || 0) + (parseFloat(values.gold) || 0) + (parseFloat(values.savings) || 0) + (parseFloat(values.business) || 0)
    const liabilities = (parseFloat(values.debt) || 0) + (parseFloat(values.expenses) || 0)
    const netWealth = Math.max(0, assets - liabilities)
    return { zakatAmount: netWealth * 0.025, inputs: values }
  }, [values])

  const historyQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "zakatCalculations"), orderBy("calculationDate", "desc"), limit(5))
  }, [db, user])
  
  const { data: historyData } = useCollection(historyQuery)
  const history = historyData || []

  const handleSave = async () => {
    if (!db || !user) { toast({ title: "Sign in required" }); return }
    setIsSaving(true)
    try {
      await addDoc(collection(db, "users", user.uid, "zakatCalculations"), {
        userId: user.uid,
        calculationDate: new Date().toISOString(),
        cashAmount: parseFloat(values.cash) || 0,
        goldValue: parseFloat(values.gold) || 0,
        savingsAmount: parseFloat(values.savings) || 0,
        businessAssetsAmount: parseFloat(values.business) || 0,
        calculatedZakat: results.zakatAmount
      })
      toast({ title: "Calculation Saved" })
    } catch (error) {} finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-screen islamic-pattern bg-background pb-0">
      <Navbar />
      
      <div className="relative pt-[80px]">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-secondary text-sm font-black uppercase tracking-widest border border-primary/20">
              <Landmark className="w-4 h-4" />
              <span>Islamic Finance Assistant</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-primary dark:text-white tracking-tight">Zakat Assistant</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Calculate your mandatory Zakat with precision in BDT.</p>
          </div>

          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl shadow-xl p-1">
              <TabsTrigger value="calculator" className="rounded-xl font-bold">Calculator</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl font-bold">History</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="grid lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
              <div className="lg:col-span-7 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="p-10 bg-primary/5"><CardTitle className="text-3xl font-black text-primary dark:text-secondary flex items-center gap-3"><Wallet className="w-8 h-8" /> Assets</CardTitle></CardHeader>
                  <CardContent className="p-10 grid sm:grid-cols-2 gap-8">
                    {['cash', 'gold', 'savings', 'business'].map(key => (
                      <div key={key} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{key}</Label>
                        <Input type="number" placeholder="0.00" value={values[key as keyof typeof values]} onChange={e => setValues({...values, [key]: e.target.value})} className="h-14 rounded-xl border-2" />
                      </div>
                    ))}
                  </CardContent>
                  <CardHeader className="p-10 bg-destructive/5 border-t border-destructive/10"><CardTitle className="text-3xl font-black text-destructive flex items-center gap-3"><MinusCircle className="w-8 h-8" /> Liabilities</CardTitle></CardHeader>
                  <CardContent className="p-10 grid sm:grid-cols-2 gap-8">
                    {['debt', 'expenses'].map(key => (
                      <div key={key} className="space-y-3">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{key}</Label>
                        <Input type="number" placeholder="0.00" value={values[key as keyof typeof values]} onChange={e => setValues({...values, [key]: e.target.value})} className="h-14 rounded-xl border-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-5 space-y-8">
                <Card className="emerald-gradient text-white shadow-2xl border-none rounded-[3rem] p-10 space-y-8">
                  <div className="flex justify-between items-center"><h3 className="text-2xl font-black">Result</h3><BadgeDollarSign className="w-10 h-10 text-secondary" /></div>
                  <div className="space-y-2">
                    <div className="text-7xl font-black tracking-tighter">৳{results.zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <p className="text-white/60 font-medium">Estimated 2.5% Zakat</p>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving || !user} className="w-full bg-secondary text-primary font-black h-16 rounded-2xl text-lg hover:scale-[1.02] transition-transform">
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Save Calculation
                  </Button>
                </Card>
                <Card className="bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-100 dark:border-amber-900/30 rounded-[2.5rem] p-8 flex gap-4">
                  <Info className="w-6 h-6 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Nisab threshold is approx. ৳750,000 held for one lunar year.</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="animate-in fade-in duration-700">
              {history && history.length > 0 ? (
                <div className="grid gap-6">
                  {history.map(entry => (
                    <Card key={entry.id} className="border-none shadow-xl rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 flex justify-between items-center">
                      <div className="space-y-1"><p className="text-xs font-black text-muted-foreground uppercase">{new Date(entry.calculationDate).toLocaleDateString()}</p><h4 className="text-2xl font-black text-primary dark:text-secondary">৳{entry.calculatedZakat.toLocaleString()}</h4></div>
                      <div className="hidden md:flex gap-10">
                        <div className="text-center"><p className="text-[10px] font-black uppercase text-muted-foreground/60">Cash</p><p className="font-bold">৳{entry.cashAmount.toLocaleString()}</p></div>
                        <div className="text-center"><p className="text-[10px] font-black uppercase text-muted-foreground/60">Gold</p><p className="font-bold">৳{entry.goldValue.toLocaleString()}</p></div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border-2 border-dashed opacity-40 font-bold uppercase tracking-widest">No calculations yet</div>}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </div>
  )
}
