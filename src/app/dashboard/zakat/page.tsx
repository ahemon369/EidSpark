
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History, Calculator, ArrowRight, Loader2, Landmark } from "lucide-react"
import Link from "next/link"

export default function ZakatHistoryPage() {
  const { user } = useUser()
  const db = useFirestore()

  const historyRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "zakatCalculations"), orderBy("calculationDate", "desc"))
  }, [db, user])

  const { data: history, isLoading } = useCollection(historyRef)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Loading History...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-800">Zakat Records</h2>
          <p className="text-muted-foreground font-medium">A historical view of your calculated obligations.</p>
        </div>
        <Button className="emerald-gradient text-white h-12 rounded-xl font-black px-8" asChild>
          <Link href="/tools/zakat">New Calculation</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {!history || history.length === 0 ? (
          <Card className="border-none shadow-xl rounded-[3rem] p-24 text-center space-y-6 bg-white">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-10 h-10 text-primary/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No calculations saved</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Use our interactive Zakat calculator to determine your contributions and save them for record-keeping.
              </p>
            </div>
            <Button className="emerald-gradient text-white h-14 rounded-2xl font-black px-10 shadow-xl" asChild>
              <Link href="/tools/zakat">Start Calculating</Link>
            </Button>
          </Card>
        ) : (
          history.map((entry) => (
            <Card key={entry.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white p-8 group hover:bg-slate-50 transition-all">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Landmark className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                      Calculated on {new Date(entry.calculationDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                    </p>
                    <h4 className="text-3xl font-black text-slate-800">৳{entry.calculatedZakat.toLocaleString()}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-4 border-t md:border-t-0 md:border-l pt-6 md:pt-0 md:pl-12 w-full md:w-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Cash</p>
                    <p className="font-bold text-sm">৳{entry.cashAmount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Gold</p>
                    <p className="font-bold text-sm">৳{entry.goldValue.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Savings</p>
                    <p className="font-bold text-sm">৳{entry.savingsAmount.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Business</p>
                    <p className="font-bold text-sm">৳{entry.businessAssetsAmount.toLocaleString()}</p>
                  </div>
                </div>

                <Button variant="ghost" size="icon" className="rounded-full hidden md:flex" asChild>
                   <Link href="/tools/zakat">
                     <ArrowRight className="w-5 h-5 text-muted-foreground" />
                   </Link>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
