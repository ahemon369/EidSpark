
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Gift className="w-4 h-4 text-secondary" />
            <span>Digital Eidi Center</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Salami & Eidi</h1>
          <p className="text-muted-foreground font-medium max-w-xl mx-auto">Track your collection or send unique digital envelopes to your loved ones.</p>
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
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">From Person</Label>
                          <Input placeholder="e.g. Uncle Karim" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl" required />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Amount (৳)</Label>
                          <Input type="number" placeholder="500" value={amount} onChange={(e) => setAmount(e.target.value)} className="h-12 rounded-xl" required min="0" />
                        </div>
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
                <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border-2 border-primary/5">
                  <CardHeader className="emerald-gradient p-10 text-white text-center relative">
                    <div className="absolute top-4 right-4"><Sparkles className="w-10 h-10 opacity-20 animate-pulse" /></div>
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
                    <CardTitle className="text-3xl font-black">Digital Eidi Envelope</CardTitle>
                    <CardDescription className="text-white/70 font-medium">Send a beautiful animated card with a magic link.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    {!generatedLink ? (
                      <form onSubmit={handleCreateEnvelope} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Your Name</Label>
                            <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g. Auntie" className="h-12 rounded-xl bg-slate-50" required />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Recipient Name</Label>
                            <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Abir" className="h-12 rounded-xl bg-slate-50" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Eid Message</Label>
                          <textarea 
                            className="w-full h-32 rounded-xl border-2 border-primary/5 p-4 focus:border-primary/20 outline-none transition-all bg-slate-50" 
                            value={salamiMsg} 
                            onChange={(e) => setSalamiMsg(e.target.value)} 
                            placeholder="Write something heartfelt..."
                          ></textarea>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Amount (Optional)</Label>
                            <Input type="number" value={salamiAmt} onChange={(e) => setSalamiAmt(e.target.value)} placeholder="৳" className="h-12 rounded-xl bg-slate-50" />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-black uppercase text-muted-foreground tracking-widest ml-1">Payment/Phone (Optional)</Label>
                            <Input value={paymentLink} onChange={(e) => setPaymentLink(e.target.value)} placeholder="bKash number or link" className="h-12 rounded-xl bg-slate-50" />
                          </div>
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl hover:scale-[1.02] transition-transform">
                          {isCreating ? <Loader2 className="animate-spin" /> : <><Send className="w-6 h-6 mr-3" /> Create & Generate Link</>}
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-8 text-center animate-in zoom-in duration-500">
                        <div className="bg-primary/5 p-10 rounded-[2.5rem] border-4 border-dashed border-primary/10 space-y-6">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl ring-8 ring-primary/5">
                            <Send className="w-10 h-10 text-primary" />
                          </div>
                          <div className="space-y-2">
                            <p className="text-primary font-black uppercase tracking-[0.2em] text-sm">Magic Link Ready!</p>
                            <p className="text-muted-foreground text-xs font-medium">Send this link to {recipientName} to surprise them.</p>
                          </div>
                          <div className="flex gap-2">
                            <Input value={generatedLink} readOnly className="h-14 rounded-xl bg-white font-mono text-xs border-2 border-primary/10 shadow-sm" />
                            <Button onClick={copyToClipboard} size="icon" className="h-14 w-14 rounded-xl emerald-gradient shrink-0 shadow-lg group">
                              <Copy className="w-6 h-6 group-active:scale-90 transition-transform" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-4">
                          <Button variant="outline" className="rounded-xl h-12 gap-2 border-2" onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Eid Mubarak! Here is a digital surprise for you: ' + generatedLink)}`, '_blank')}>
                            <Mail className="w-4 h-4" /> WhatsApp
                          </Button>
                          <Button variant="ghost" onClick={() => { setGeneratedLink(""); setRecipientName(""); setSalamiAmt(""); setSalamiMsg(""); }} className="text-muted-foreground hover:text-primary font-bold">
                            Create Another
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="leaderboard" className="animate-in fade-in duration-500">
              <div className="max-w-2xl mx-auto">
                <Card className="shadow-2xl border-none rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border-2 border-primary/5">
                  <CardHeader className="emerald-gradient p-10 text-white text-center relative">
                    <div className="absolute top-4 right-4 rotate-12"><Crown className="w-12 h-12 text-secondary/30 fill-secondary/30" /></div>
                    <Crown className="w-12 h-12 mx-auto mb-4 text-secondary fill-secondary drop-shadow-lg" />
                    <CardTitle className="text-3xl font-black">Top Receivers</CardTitle>
                    <CardDescription className="text-white/70 font-medium">The most blessed collectors in the community.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-primary/5">
                      {loadingLeaderboard ? (
                        <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
                      ) : leaderboard.length > 0 ? (
                        leaderboard.map((player, index) => (
                          <div key={player.id} className={cn(
                            "flex items-center justify-between p-8 transition-colors",
                            player.id === user.uid ? "bg-secondary/10 border-l-8 border-secondary" : "hover:bg-slate-50"
                          )}>
                            <div className="flex items-center gap-6">
                              <span className={cn(
                                "text-2xl font-black",
                                index === 0 ? "text-secondary" : index === 1 ? "text-slate-400" : index === 2 ? "text-amber-600" : "text-muted-foreground/40"
                              )}>{index + 1}</span>
                              <div className="relative">
                                <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                                  <AvatarImage src={player.photoURL} />
                                  <AvatarFallback className="bg-secondary text-primary font-black text-xl">{player.displayName?.[0]}</AvatarFallback>
                                </Avatar>
                                {index === 0 && <Crown className="absolute -top-3 -right-3 w-8 h-8 text-secondary fill-secondary -rotate-12 drop-shadow-md" />}
                              </div>
                              <div>
                                <p className="font-black text-xl text-primary">{player.displayName}</p>
                                {player.id === user.uid && <p className="text-[10px] font-black text-secondary uppercase tracking-widest">Your Rank</p>}
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
