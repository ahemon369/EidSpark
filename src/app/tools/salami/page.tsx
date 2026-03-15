
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Plus, Trophy, Trash2, Lock, Crown, Send, Mail, Copy, Loader2, Gift, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, serverTimestamp, setDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SalamiTracker() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [senderName, setSenderName] = useState(user?.displayName || "")
  const [recipientName, setRecipientName] = useState("")
  const [salamiMsg, setSalamiMsg] = useState("")
  const [salamiAmt, setSalamiAmt] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const salamiQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "receivedSalami"), orderBy("receivedAt", "desc"))
  }, [db, user])
  const { data: salamiData } = useCollection(salamiQuery)
  const salamiEntries = salamiData || []

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !user || !db) return
    const giftAmount = parseFloat(amount)
    try {
      await addDoc(collection(db, "users", user.uid, "receivedSalami"), {
        userId: user.uid,
        fromPerson: name,
        amount: giftAmount,
        receivedAt: new Date().toISOString()
      })
      setName(""); setAmount("")
      toast({ title: "Salami Recorded!" })
    } catch (error) {}
  }

  const handleCreateEnvelope = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientName || !db || !user) return
    setIsCreating(true)
    try {
      const docRef = await addDoc(collection(db, "salamiCards"), {
        senderName: senderName || "Someone Special",
        recipientName,
        message: salamiMsg,
        amount: parseFloat(salamiAmt) || 0,
        paymentLink,
        createdAt: new Date().toISOString()
      })
      setGeneratedLink(`${window.location.origin}/salami/${docRef.id}`)
      toast({ title: "Envelope Created!" })
    } catch (error) {
      toast({ variant: "destructive", title: "Error" })
    } finally {
      setIsCreating(false)
    }
  }

  const total = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-0">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary dark:text-secondary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Gift className="w-4 h-4 text-secondary" />
            <span>Digital Eidi Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary dark:text-white tracking-tight">Salami & Eidi</h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">Track your collection or send unique digital envelopes.</p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto p-12 text-center space-y-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-dashed border-2 rounded-[3rem]">
            <Lock className="w-12 h-12 mx-auto text-primary/40" />
            <h3 className="text-xl font-bold">Sign in to start tracking</h3>
            <Button className="w-full h-14 rounded-2xl emerald-gradient text-white font-bold" onClick={() => window.location.href = '/login'}>Sign In Now</Button>
          </Card>
        ) : (
          <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-12 h-16 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-1 border border-primary/10 shadow-xl rounded-2xl">
              <TabsTrigger value="tracker" className="rounded-xl font-bold">Personal Tracker</TabsTrigger>
              <TabsTrigger value="envelope" className="rounded-xl font-bold">Digital Envelope</TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker" className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-fit">
                <div className="emerald-gradient p-10 text-white text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <p className="text-white/80 font-black uppercase tracking-widest text-xs mb-2">Total Collected</p>
                  <p className="text-5xl font-black">৳{total.toLocaleString()}</p>
                </div>
                <CardContent className="p-8">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <Input placeholder="From Person" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" required />
                    <Input type="number" placeholder="Amount (৳)" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl" required />
                    <Button type="submit" className="w-full h-14 emerald-gradient rounded-xl font-black text-lg">Add Record</Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-2xl border-none rounded-[2.5rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-full min-h-[500px]">
                <CardHeader className="p-8 pb-4 border-b border-primary/5"><CardTitle className="text-2xl font-black">History</CardTitle></CardHeader>
                <CardContent className="p-0 overflow-y-auto max-h-[600px] custom-scrollbar">
                  {salamiEntries.length > 0 ? (
                    salamiEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm"><AvatarFallback className="bg-primary text-white font-bold">{entry.fromPerson?.[0]}</AvatarFallback></Avatar>
                          <div><p className="font-black text-lg text-primary dark:text-secondary">{entry.fromPerson}</p></div>
                        </div>
                        <p className="text-2xl font-black text-primary dark:text-secondary">৳{entry.amount}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center text-muted-foreground italic">No records found yet.</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="envelope" className="animate-in fade-in duration-500">
              <Card className="max-w-3xl mx-auto shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-primary/5">
                <CardHeader className="emerald-gradient p-10 text-white text-center relative">
                  <Sparkles className="absolute top-4 right-4 w-10 h-10 opacity-20" />
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <CardTitle className="text-3xl font-black">Digital Eidi Envelope</CardTitle>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                  {!generatedLink ? (
                    <form onSubmit={handleCreateEnvelope} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your Name" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" required />
                        <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient Name" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" required />
                      </div>
                      <textarea className="w-full h-32 rounded-xl border-2 border-primary/5 p-4 bg-slate-50 dark:bg-slate-800 outline-none" value={salamiMsg} onChange={(e) => setSalamiMsg(e.target.value)} placeholder="Festive Message..." required />
                      <div className="grid md:grid-cols-2 gap-6">
                        <Input type="number" value={salamiAmt} onChange={(e) => setSalamiAmt(e.target.value)} placeholder="Amount (Optional)" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
                        <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="Payment Info (Optional)" className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800" />
                      </div>
                      <Button type="submit" disabled={isCreating} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl">
                        {isCreating ? <Loader2 className="animate-spin" /> : "Generate Shareable Link"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-8 animate-in zoom-in">
                      <div className="bg-primary/5 p-10 rounded-[2.5rem] border-4 border-dashed border-primary/10 space-y-6">
                        <Send className="w-12 h-12 mx-auto text-primary" />
                        <p className="font-black text-primary uppercase tracking-widest">Magic Link Ready!</p>
                        <div className="flex gap-2">
                          <Input value={generatedLink} readOnly className="h-14 rounded-xl bg-white dark:bg-slate-800 font-mono text-xs border-2" />
                          <Button onClick={() => { navigator.clipboard.writeText(generatedLink); toast({ title: "Copied!" }) }} className="h-14 w-14 rounded-xl emerald-gradient shrink-0"><Copy className="w-6 h-6" /></Button>
                        </div>
                      </div>
                      <Button variant="ghost" onClick={() => { setGeneratedLink(""); setRecipientName(""); setSalamiMsg(""); }} className="font-bold">Create Another</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <Footer />
    </div>
  )
}
