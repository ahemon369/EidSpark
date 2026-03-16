
"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, History, Loader2, Calculator } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"

export default function ZakatCalculatorPage() {
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
    <div className="min-h-screen islamic-pattern bg-background pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 flex-grow">
          <div className="text-left mb-12 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">Zakat Assistant</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">Calculate your mandatory Zakat with precision in BDT.</p>
          </div>

          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-12 h-14 bg-white shadow-md rounded-2xl p-1">
              <TabsTrigger value="calculator" className="rounded-xl font-bold">Calculator</TabsTrigger>
              <TabsTrigger value="history" className="rounded-xl font-bold">History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="grid lg:grid-cols-12 gap-8 outline-none">
              <div className="lg:col-span-7 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white p-10 grid sm:grid-cols-2 gap-8">
                  {['cash', 'gold', 'savings', 'business', 'debt', 'expenses'].map(key => (
                    <div key={key} className="space-y-3">
                      <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">{key}</Label>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        value={values[key as keyof typeof values]} 
                        onChange={e => setValues({...values, [key]: e.target.value})} 
                        className="h-14 rounded-xl border-2 border-slate-100 bg-slate-50 focus:border-primary/20" 
                      />
                    </div>
                  ))}
                </Card>
              </div>
              <div className="lg:col-span-5 space-y-8">
                <Card className="emerald-gradient text-white shadow-2xl rounded-[3rem] p-10 space-y-8 relative overflow-hidden">
                  <Calculator className="absolute -right-10 -top-10 w-48 h-48 opacity-10 rotate-12" />
                  <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Required Zakat Amount</p>
                    <div className="text-7xl font-black tracking-tighter">৳{results.zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={isSaving || !user} 
                    className="w-full bg-secondary text-primary font-black h-16 rounded-2xl text-lg hover:scale-[1.02] transition-transform shadow-xl relative z-10"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Save Calculation</>}
                  </Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="outline-none">
              <div className="space-y-4">
                {history && history.length > 0 ? history.map(entry => (
                  <Card key={entry.id} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 flex justify-between items-center group hover:bg-slate-50 transition-all">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{new Date(entry.calculationDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                      <h4 className="text-3xl font-black text-primary">৳{entry.calculatedZakat.toLocaleString()}</h4>
                    </div>
                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <History className="w-6 h-6" />
                    </div>
                  </Card>
                )) : (
                  <div className="py-24 text-center opacity-30">
                    <History className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">No history yet</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
