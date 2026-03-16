
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Gift, Wallet, Loader2, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { BackButton } from "@/components/back-button"

export default function SalamiTrackerPage() {
  const { user } = useUser(); const db = useFirestore(); const { toast } = useToast()
  const [name, setName] = useState(""); const [amount, setAmount] = useState(""); const [senderName, setSenderName] = useState(user?.displayName || "")
  const [recipientName, setRecipientName] = useState(""); const [salamiMsg, setSalamiMsg] = useState(""); const [salamiAmt, setSalamiAmt] = useState("")
  const [paymentLink, setPaymentLink] = useState(""); const [generatedLink, setGeneratedLink] = useState(""); const [isCreating, setIsCreating] = useState(false)

  const salamiQuery = useMemoFirebase(() => (db && user) ? query(collection(db, "users", user.uid, "salamiEntries"), orderBy("createdAt", "desc")) : null, [db, user])
  const { data: salamiData } = useCollection(salamiQuery); const salamiEntries = salamiData || []

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault(); if (!name || !amount || !user || !db) return
    try { await addDoc(collection(db, "users", user.uid, "salamiEntries"), { trackerUserId: user.uid, giverName: name, amount: parseFloat(amount), receivedDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() }); setName(""); setAmount(""); toast({ title: "Salami Recorded!" }) } catch (error) {}
  }

  const handleCreateEnvelope = async (e: React.FormEvent) => {
    e.preventDefault(); if (!recipientName || !db || !user) return; setIsCreating(true)
    try { const docRef = await addDoc(collection(db, "salamiCards"), { senderName: senderName || "Someone", recipientName, message: salamiMsg, amount: parseFloat(salamiAmt) || 0, paymentLink, createdAt: new Date().toISOString() }); setGeneratedLink(`${window.location.origin}/reveal/${docRef.id}`); toast({ title: "Envelope Created!" }) } catch (error) {} finally { setIsCreating(false) }
  }

  const total = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 flex flex-col transition-all duration-300">
      <Navbar />
      
      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-6 py-8 flex-grow">
          <div className="text-left mb-12 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none">Salami Center</h1>
            <p className="text-xl text-slate-500 font-medium max-w-2xl">Track your personal collection or send festive digital envelopes.</p>
          </div>

          {!user ? (
            <Card className="max-w-md mx-auto p-12 text-center bg-white rounded-[3rem] border-dashed border-2 shadow-xl">
              <Gift className="w-16 h-16 mx-auto mb-6 text-primary/20" />
              <Button className="w-full h-14 rounded-2xl emerald-gradient text-white font-black" onClick={() => window.location.href = '/login'}>Sign In to Track</Button>
            </Card>
          ) : (
            <Tabs defaultValue="tracker" className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-12 h-16 bg-white shadow-lg rounded-2xl p-1">
                <TabsTrigger value="tracker" className="rounded-xl font-black">Personal Tracker</TabsTrigger>
                <TabsTrigger value="envelope" className="rounded-xl font-black">Digital Envelope</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tracker" className="grid lg:grid-cols-12 gap-8 outline-none animate-in fade-in slide-in-from-bottom-4">
                <div className="lg:col-span-4 space-y-8">
                  <Card className="shadow-2xl rounded-[3rem] overflow-hidden bg-white border-none">
                    <div className="emerald-gradient p-12 text-white text-center">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-60" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">Total Collection</p>
                      <p className="text-6xl font-black tracking-tighter">৳{total.toLocaleString()}</p>
                    </div>
                    <CardContent className="p-10 space-y-6">
                      <form onSubmit={handleAdd} className="space-y-4">
                        <Input placeholder="Giver's Name" value={name} onChange={e => setName(e.target.value)} required className="h-14 rounded-xl" />
                        <Input type="number" placeholder="Amount (৳)" value={amount} onChange={e => setAmount(e.target.value)} required className="h-14 rounded-xl" />
                        <Button type="submit" className="w-full h-14 emerald-gradient text-white rounded-xl font-black shadow-xl">Log Record</Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="lg:col-span-8 shadow-xl rounded-[3rem] bg-white h-full min-h-[600px] border-none overflow-hidden">
                  <div className="p-8 border-b bg-slate-50/50">
                    <h3 className="text-xl font-black text-slate-800">Recent Tracker Log</h3>
                  </div>
                  <ScrollArea className="h-[500px]">
                    <div className="divide-y">
                      {salamiEntries.length > 0 ? salamiEntries.map(e => (
                        <div key={e.id} className="p-8 flex justify-between items-center hover:bg-slate-50 transition-all">
                          <div className="space-y-1">
                            <p className="font-black text-slate-800 text-lg">{e.giverName}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{e.receivedDate}</p>
                          </div>
                          <p className="text-3xl font-black text-primary tracking-tight">৳{e.amount}</p>
                        </div>
                      )) : (
                        <div className="p-32 text-center opacity-20">
                          <Gift className="w-16 h-16 mx-auto mb-4" />
                          <p className="font-black uppercase tracking-widest">No entries yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </Card>
              </TabsContent>
              
              <TabsContent value="envelope" className="outline-none animate-in fade-in slide-in-from-bottom-4">
                <Card className="max-w-3xl mx-auto shadow-2xl rounded-[4rem] bg-white p-12 space-y-10 border-none">
                  {!generatedLink ? (
                    <form onSubmit={handleCreateEnvelope} className="space-y-8">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Recipient Details</Label>
                        <Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="To: (Recipient Name)" required className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg font-bold shadow-inner" />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Your Blessing Message</Label>
                        <Textarea value={salamiMsg} onChange={e => setSalamiMsg(e.target.value)} className="min-h-[120px] rounded-2xl bg-slate-50 border-none p-6 text-lg shadow-inner" placeholder="Wishing you a blessed Eid..." required />
                      </div>
                      <Button type="submit" disabled={isCreating} className="w-full h-20 rounded-[2.5rem] gold-gradient text-primary font-black text-2xl shadow-2xl hover:scale-[1.02] transition-transform">
                        {isCreating ? <Loader2 className="animate-spin" /> : "Seal Magic Envelope"}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center space-y-8 p-10 bg-primary/5 rounded-[3rem] border-2 border-primary/10 border-dashed animate-in zoom-in">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                        <Sparkles className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black text-primary leading-none">Envelope Ready!</h3>
                        <p className="text-slate-500 font-medium">Send this magic link to your favorite relative.</p>
                      </div>
                      <div className="flex gap-3">
                        <Input value={generatedLink} readOnly className="h-14 rounded-xl bg-white border-2 border-primary/10 px-4 font-mono text-sm" />
                        <Button onClick={() => { navigator.clipboard.writeText(generatedLink); toast({title: "Copied Link!"}) }} className="h-14 w-14 rounded-xl bg-primary text-white shrink-0"><Copy className="w-5 h-5" /></Button>
                      </div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}

import { ScrollArea } from "@/components/ui/scroll-area"
