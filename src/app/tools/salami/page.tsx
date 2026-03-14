
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Plus, Trophy, Trash2, Lock, Crown, Send, Mail, Copy, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, serverTimestamp, setDoc, query, orderBy, limit } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SalamiTracker() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  // Tracker State
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")

  // Digital Envelope State
  const [senderName, setSenderName] = useState(user?.displayName || "")
  const [recipientName, setRecipientName] = useState("")
  const [salamiMsg, setSalamiMsg] = useState("")
  const [salamiAmt, setSalamiAmt] = useState("")
  const [paymentLink, setPaymentLink] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  // Fetch user's gifts from Firestore
  const salamiQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "salamiEntries")
  }, [db, user])

  const { data, isLoading: loadingSalami } = useCollection(salamiQuery)
  const salamiEntries = data || []

  // Fetch global leaderboard
  const leaderboardQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "leaderboard"), orderBy("totalSalami", "desc"), limit(10))
  }, [db])

  const { data: leaderboardData, isLoading: loadingLeaderboard } = useCollection(leaderboardQuery)
  const leaderboard = leaderboardData || []

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount || !user || !db) return
    
    const giftAmount = parseFloat(amount)
    
    try {
      addDoc(collection(db, "users", user.uid, "salamiEntries"), {
        userId: user.uid,
        personName: name,
        amount: giftAmount,
        entryDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      })

      const currentTotal = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const newTotal = currentTotal + giftAmount
      
      setDoc(doc(db, "leaderboard", user.uid), {
        displayName: user.displayName || "Anonymous",
        photoURL: user.photoURL || "",
        totalSalami: newTotal
      }, { merge: true })

      setName("")
      setAmount("")
      toast({
        title: "Salami Added!",
        description: `Successfully recorded ৳${giftAmount} from ${name}.`
      })
    } catch (error) {}
  }

  const handleCreateEnvelope = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipientName || !db || !user) return
    
    setIsCreating(true)
    try {
      const docRef = await addDoc(collection(db, "salamiCards"), {
        senderName: senderName || "Someone Special",
        recipientName: recipientName,
        message: salamiMsg,
        amount: parseFloat(salamiAmt) || 0,
        paymentLink: paymentLink,
        createdAt: new Date().toISOString()
      })
      
      const link = `${window.location.origin}/salami/${docRef.id}`
      setGeneratedLink(link)
      toast({ title: "Envelope Created!" })
    } catch (error) {
      toast({ variant: "destructive", title: "Error" })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (entryId: string, entryAmount: number) => {
    if (!db || !user) return
    try {
      deleteDoc(doc(db, "users", user.uid, "salamiEntries", entryId))
      const currentTotal = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const newTotal = Math.max(0, currentTotal - entryAmount)
      setDoc(doc(db, "leaderboard", user.uid), { totalSalami: newTotal }, { merge: true })
    } catch (error) {}
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink)
    toast({ title: "Copied!" })
  }

  const total = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const sortedEntries = [...salamiEntries].sort((a, b) => (b.amount || 0) - (a.amount || 0))

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Salami & Eidi</h1>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto p-12 text-center space-y-6 bg-white/80 backdrop-blur-xl border-dashed border-2 rounded-[3rem]">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-primary/40" />
            </div>
            <h3 className="text-xl font-bold text-primary">Sign in to start tracking</h3>
            <Button className="w-full h-14 rounded-2xl emerald-gradient text-white font-bold" onClick={() => window.location.href = '/login'}>
              Sign In Now
            </Button>
          </Card>
        ) : (
          <Tabs defaultValue="tracker" className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-12 h-16 bg-white/50 backdrop-blur-md p-1 border border-primary/10 shadow-xl rounded-2xl">
              <TabsTrigger value="tracker" className="rounded-xl font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Wallet className="w-4 h-4" /> Tracker
              </TabsTrigger>
              <TabsTrigger value="envelope" className="rounded-xl font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Send className="w-4 h-4" /> Send Eidi
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="rounded-xl font-bold gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
                <Trophy className="w-4 h-4" /> Leaderboard
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker" className="animate-in fade-in duration-500">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="shadow-2xl border-none rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <div className="emerald-gradient p-10 text-white text-center">
                      <Wallet className="w-12 h-12 mx-auto mb-4 opacity-80" />
                      <p className="text-white/80 font-black uppercase tracking-widest text-xs mb-2">Total Collected</p>
                      <p className="text-5xl font-black">৳{total.toLocaleString()}</p>
                    </div>
                    <CardContent className="p-8">
                      <form onSubmit={handleAdd} className="space-y-4">
                        <Input placeholder="From Person" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" required />
                        <Input type="number" placeholder="Amount (৳)" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl" required min="0" />
                        <Button type="submit" className="w-full h-14 emerald-gradient rounded-xl font-black text-lg shadow-lg">
                          <Plus className="w-5 h-5 mr-2" /> Add Record
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-2">
                  <Card className="shadow-2xl border-none rounded-[2.5rem] bg-white/80 backdrop-blur-xl h-full">
                    <CardHeader className="p-8 pb-4 border-b border-primary/5">
                      <CardTitle className="text-2xl font-black text-primary">Salami History</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-primary/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {loadingSalami ? (
                          <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                        ) : sortedEntries.length > 0 ? (
                          sortedEntries.map((entry) => (
                            <div key={entry.id} className="flex items-center justify-between p-6 hover:bg-primary/5 transition-colors group">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarFallback className="bg-primary text-white font-bold">{entry.personName?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-black text-lg text-primary">{entry.personName}</p>
                                  <p className="text-xs text-muted-foreground font-medium">Received {new Date(entry.entryDate).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <p className="text-2xl font-black text-primary">৳{entry.amount}</p>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => handleDelete(entry.id, entry.amount)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-32 text-center text-muted-foreground opacity-40">
                            <Wallet className="w-16 h-16 mx-auto mb-4" />
                            <p className="font-bold">No records yet. Start collecting!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="envelope" className="animate-in fade-in duration-500">
              <div className="max-w-3xl mx-auto">
                <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="emerald-gradient p-10 text-white text-center">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <CardTitle className="text-3xl font-black">Digital Eidi Envelope</CardTitle>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    {!generatedLink ? (
                      <form onSubmit={handleCreateEnvelope} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Your Name" className="h-12 rounded-xl" required />
                          <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Recipient Name" className="h-12 rounded-xl" required />
                        </div>
                        <textarea className="w-full h-32 rounded-xl border-2 border-primary/5 p-4 focus:border-primary/20 outline-none transition-all" value={salamiMsg} onChange={(e) => setSalamiMsg(e.target.value)} placeholder="Eid Message..."></textarea>
                        <div className="grid md:grid-cols-2 gap-6">
                          <Input type="number" value={salamiAmt} onChange={(e) => setSalamiAmt(e.target.value)} placeholder="Amount (৳)" className="h-12 rounded-xl" />
                          <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="bKash/Nagad link" className="h-12 rounded-xl" />
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl">
                          {isCreating ? "Processing..." : "Generate Magic Link"}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-8 text-center">
                        <div className="bg-primary/5 p-8 rounded-[2rem] border-2 border-dashed border-primary/20 space-y-4">
                          <p className="text-primary font-black uppercase tracking-widest text-sm">Magic Link Ready!</p>
                          <div className="flex gap-2">
                            <Input value={generatedLink} readOnly className="h-12 rounded-xl bg-white font-mono text-xs" />
                            <Button onClick={copyToClipboard} size="icon" className="h-12 w-12 rounded-xl emerald-gradient shrink-0"><Copy className="w-5 h-5" /></Button>
                          </div>
                        </div>
                        <Button variant="ghost" onClick={() => setGeneratedLink("")} className="text-muted-foreground hover:text-primary">Create Another</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="animate-in fade-in duration-500">
              <div className="max-w-2xl mx-auto">
                <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                  <CardHeader className="emerald-gradient p-10 text-white text-center">
                    <Crown className="w-12 h-12 mx-auto mb-4 text-secondary fill-secondary" />
                    <CardTitle className="text-3xl font-black">Top Receivers</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-primary/5">
                      {loadingLeaderboard ? (
                        <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                      ) : leaderboard.length > 0 ? (
                        leaderboard.map((player, index) => (
                          <div key={player.id} className={cn("flex items-center justify-between p-8", player.id === user.uid && "bg-secondary/10 border-l-8 border-secondary")}>
                            <div className="flex items-center gap-6">
                              <span className="text-2xl font-black text-muted-foreground/40">{index + 1}</span>
                              <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                <AvatarImage src={player.photoURL} />
                                <AvatarFallback className="bg-secondary text-primary font-black text-xl">{player.displayName?.[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-black text-xl text-primary">{player.displayName}</p>
                              </div>
                            </div>
                            <p className="text-3xl font-black text-primary">৳{player.totalSalami.toLocaleString()}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-32 text-center opacity-40">No entries yet.</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
