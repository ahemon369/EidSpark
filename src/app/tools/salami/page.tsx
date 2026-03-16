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
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, serverTimestamp, setDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BackButton } from "@/components/back-button"

export default function SalamiTracker() {
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
    <div className="min-h-screen bg-background islamic-pattern pb-0 flex flex-col">
      <Navbar />
      
      <div className="pt-[80px] flex flex-col flex-grow">
        <BackButton />
        
        <main className="max-w-7xl mx-auto px-4 py-8 flex-grow">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Salami & Eidi</h1>
            <p className="text-muted-foreground font-medium">Track your collection or send unique digital envelopes.</p>
          </div>

          {!user ? <Card className="max-w-md mx-auto p-12 text-center bg-white rounded-[3rem] border-dashed border-2"><Button className="w-full h-14 rounded-2xl emerald-gradient text-white" onClick={() => window.location.href = '/login'}>Sign In to Track</Button></Card> : (
            <Tabs defaultValue="tracker" className="w-full">
              <TabsList className="grid w-full max-w-xl mx-auto grid-cols-2 mb-12 h-16 bg-white shadow-xl rounded-2xl p-1"><TabsTrigger value="tracker" className="rounded-xl font-bold">Personal Tracker</TabsTrigger><TabsTrigger value="envelope" className="rounded-xl font-bold">Digital Envelope</TabsTrigger></TabsList>
              <TabsContent value="tracker" className="grid lg:grid-cols-3 gap-8"><Card className="shadow-2xl rounded-[2.5rem] overflow-hidden bg-white"><div className="emerald-gradient p-10 text-white text-center"><p className="text-5xl font-black">৳{total.toLocaleString()}</p></div><CardContent className="p-8"><form onSubmit={handleAdd} className="space-y-4"><Input placeholder="From" value={name} onChange={e => setName(e.target.value)} required /><Input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} required /><Button type="submit" className="w-full h-14 emerald-gradient rounded-xl font-black">Add Record</Button></form></CardContent></Card><Card className="lg:col-span-2 shadow-2xl rounded-[2.5rem] bg-white h-full min-h-[500px] p-0 overflow-y-auto custom-scrollbar">{salamiEntries.map(e => <div key={e.id} className="p-6 border-b flex justify-between items-center"><p className="font-black">{e.giverName}</p><p className="text-2xl font-black text-primary">৳{e.amount}</p></div>)}</Card></TabsContent>
              <TabsContent value="envelope"><Card className="max-w-3xl mx-auto shadow-2xl rounded-[3rem] bg-white p-10 space-y-8">{!generatedLink ? <form onSubmit={handleCreateEnvelope} className="space-y-6"><Input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="To" required /><textarea value={salamiMsg} onChange={e => setSalamiMsg(e.target.value)} className="w-full h-32 rounded-xl border p-4 bg-slate-50" placeholder="Message..." required /><Button type="submit" disabled={isCreating} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl">{isCreating ? <Loader2 className="animate-spin" /> : "Create Envelope"}</Button></form> : <div className="text-center p-10 bg-primary/5 rounded-[2.5rem]"><p className="font-black mb-4">Magic Link Ready!</p><div className="flex gap-2"><Input value={generatedLink} readOnly /><Button onClick={() => { navigator.clipboard.writeText(generatedLink); toast({title: "Copied!"}) }}><Copy /></Button></div></div>}</Card></TabsContent>
            </Tabs>
          )}
        </main>
      </div>
      <Footer />
    </div>
  )
}
