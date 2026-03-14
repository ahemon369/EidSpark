
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Plus, Trophy, Trash2, TrendingUp, Lock, Crown, Users } from "lucide-react"
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

  // Fetch user's gifts from Firestore - Using salamiEntries as per backend.json
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
      // Add to user's gifts using schema-compliant fields
      addDoc(collection(db, "users", user.uid, "salamiEntries"), {
        userId: user.uid,
        personName: name,
        amount: giftAmount,
        entryDate: new Date().toISOString(),
        createdAt: serverTimestamp()
      })

      // Update leaderboard profile
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
    } catch (error) {
      // Errors are handled by FirebaseErrorListener
    }
  }

  const handleDelete = async (entryId: string, entryAmount: number) => {
    if (!db || !user) return
    
    try {
      deleteDoc(doc(db, "users", user.uid, "salamiEntries", entryId))
      
      // Update leaderboard
      const currentTotal = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)
      const newTotal = Math.max(0, currentTotal - entryAmount)
      
      setDoc(doc(db, "leaderboard", user.uid), {
        totalSalami: newTotal
      }, { merge: true })

    } catch (error) {
      // Handled globally
    }
  }

  const total = salamiEntries.reduce((acc, curr) => acc + (curr.amount || 0), 0)
  const sortedEntries = [...salamiEntries].sort((a, b) => (b.amount || 0) - (a.amount || 0))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">Salami Tracker</h1>
          <p className="text-muted-foreground mt-4">Keep track of your Eid gifts and see who's the top contributor!</p>
        </div>

        {!user ? (
          <Card className="max-w-md mx-auto p-12 text-center space-y-6 bg-accent/20 border-dashed border-2">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8 text-primary/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary">Sign in to start tracking</h3>
              <p className="text-muted-foreground">Log in with your account to save your Salami history and join the global leaderboard.</p>
            </div>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-1 space-y-6">
              <Card className="shadow-lg border-primary/10 overflow-hidden">
                <div className="emerald-gradient p-8 text-white text-center">
                  <Wallet className="w-10 h-10 mx-auto mb-4 opacity-80" />
                  <p className="text-white/80 font-medium mb-1">Total Salami Collected</p>
                  <p className="text-4xl font-bold">৳{total.toLocaleString()}</p>
                </div>
                <CardContent className="p-6">
                  <form onSubmit={handleAdd} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">From Person</Label>
                      <Input 
                        id="name" 
                        placeholder="e.g. Uncle Omar" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (৳)</Label>
                      <Input 
                        id="amount" 
                        type="number" 
                        placeholder="0" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="rounded-xl"
                        required
                        min="0"
                      />
                    </div>
                    <Button type="submit" className="w-full emerald-gradient rounded-xl py-6">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Entry
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-accent/30 border-none shadow-none p-6 flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Average Gift</p>
                  <p className="text-2xl font-bold text-primary">
                    ৳{salamiEntries.length > 0 ? (total / salamiEntries.length).toFixed(0) : 0}
                  </p>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Tabs defaultValue="my-gifts" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="my-gifts" className="gap-2">
                    <Users className="w-4 h-4" />
                    My Gifts
                  </TabsTrigger>
                  <TabsTrigger value="leaderboard" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    Global Leaderboard
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="my-gifts">
                  <Card className="shadow-lg border-primary/10">
                    <CardHeader className="flex flex-row items-center justify-between border-b">
                      <div>
                        <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                          Your History
                        </CardTitle>
                        <CardDescription>All your Eidi records</CardDescription>
                      </div>
                      <div className="text-sm font-bold text-primary bg-accent/50 px-3 py-1 rounded-full">
                        {salamiEntries.length} Entries
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                        {loadingSalami ? (
                          <div className="p-12 text-center text-muted-foreground">Loading your gifts...</div>
                        ) : sortedEntries.length > 0 ? (
                          sortedEntries.map((entry, index) => (
                            <div 
                              key={entry.id} 
                              className={cn(
                                "flex items-center justify-between p-6 hover:bg-accent/20 transition-colors",
                                index === 0 && "bg-secondary/5"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarFallback className="bg-primary text-white font-bold">
                                    {entry.personName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-lg text-primary">{entry.personName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Received on {entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : 'Just now'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <p className="text-2xl font-bold text-primary">৳{entry.amount}</p>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                  onClick={() => handleDelete(entry.id, entry.amount)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center text-muted-foreground">
                            No entries yet. Start by adding your first gift!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="leaderboard">
                  <Card className="shadow-lg border-primary/10">
                    <CardHeader className="border-b bg-secondary/10">
                      <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                        <Crown className="w-6 h-6 text-secondary fill-secondary" />
                        Top Eidi Receivers
                      </CardTitle>
                      <CardDescription>Global rankings for this year</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                        {loadingLeaderboard ? (
                          <div className="p-12 text-center text-muted-foreground">Loading leaderboard...</div>
                        ) : leaderboard.length > 0 ? (
                          leaderboard.map((player, index) => (
                            <div 
                              key={player.id} 
                              className={cn(
                                "flex items-center justify-between p-6 transition-colors",
                                player.id === user.uid && "bg-primary/5 border-l-4 border-primary"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 text-center font-bold text-muted-foreground">
                                  {index + 1}
                                </div>
                                <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarImage src={player.photoURL} />
                                  <AvatarFallback className="bg-secondary text-primary font-bold">
                                    {player.displayName?.[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-bold text-lg text-primary">
                                    {player.displayName}
                                    {player.id === user.uid && <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">You</span>}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Global Rank</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">৳{player.totalSalami.toLocaleString()}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-20 text-center text-muted-foreground">
                            Leaderboard is empty. Be the first to join!
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
