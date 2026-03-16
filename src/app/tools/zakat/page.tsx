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
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [values, setValues] = useState({ cash: "", gold: "", savings: "", business: "", debt: "", expenses: "" })
  const [isSaving, setIsSaving] = useState(false)

  const results = useMemo(() => {
    const assets = (parseFloat(values.cash) || 0) + (parseFloat(values.gold) || 0) + (parseFloat(values.savings) || 0) + (parseFloat(values.business) || 0)
    const liabilities = (parseFloat(values.debt) || 0) + (parseFloat(values.expenses) || 0)
    const netWealth = Math.max(0, assets - liabilities)
    return { zakatAmount: netWealth * 0.025, inputs: values }
  }, [values])

  const historyQuery = useMemoFirebase(() => (db && user) ? query(collection(db, "users", user.uid, "zakatCalculations"), orderBy("calculationDate", "desc"), limit(5)) : null, [db, user])
  const { data: history } = useCollection(historyQuery)

  const handleSave = async () => {
    if (!db || !user) { toast({ title: "Sign in required" }); return }
    setIsSaving(true)
    try {
      await addDoc(collection(db, "users", user.uid, "zakatCalculations"), { userId: user.uid, calculationDate: new Date().toISOString(), cashAmount: parseFloat(values.cash) || 0, goldValue: parseFloat(values.gold) || 0, savingsAmount: parseFloat(values.savings) || 0, businessAssetsAmount: parseFloat(values.business) || 0, calculatedZakat: results.zakatAmount })
      toast({ title: "Calculation Saved" })
    } catch (error) {} finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-screen islamic-pattern bg-background pb-0 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex-grow">
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl lg:text-7xl font-black text-primary tracking-tight">Zakat Assistant</h1>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">Calculate your mandatory Zakat with precision in BDT.</p>
          </div>

          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-16 bg-white shadow-xl rounded-2xl p-1"><TabsTrigger value="calculator" className="rounded-xl font-bold">Calculator</TabsTrigger><TabsTrigger value="history" className="rounded-xl font-bold">History</TabsTrigger></TabsList>
            <TabsContent value="calculator" className="grid lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10 grid sm:grid-cols-2 gap-8">
                  {['cash', 'gold', 'savings', 'business', 'debt', 'expenses'].map(key => <div key={key} className="space-y-3"><Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{key}</Label><Input type="number" placeholder="0.00" value={values[key as keyof typeof values]} onChange={e => setValues({...values, [key]: e.target.value})} className="h-14 rounded-xl border-2" /></div>)}
                </Card>
              </div>
              <div className="lg:col-span-5 space-y-8">
                <Card className="emerald-gradient text-white shadow-2xl rounded-[3rem] p-10 space-y-8"><div className="text-7xl font-black tracking-tighter">৳{results.zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div><Button onClick={handleSave} disabled={isSaving || !user} className="w-full bg-secondary text-primary font-black h-16 rounded-2xl text-lg">{isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5 mr-2" />} Save Calculation</Button></Card>
              </div>
            </TabsContent>
            <TabsContent value="history">{history?.map(entry => <Card key={entry.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 mb-4 flex justify-between items-center"><div className="space-y-1"><p className="text-xs font-black text-muted-foreground uppercase">{new Date(entry.calculationDate).toLocaleDateString()}</p><h4 className="text-2xl font-black text-primary">৳{entry.calculatedZakat.toLocaleString()}</h4></div></Card>)}</TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </div>
  )
}
