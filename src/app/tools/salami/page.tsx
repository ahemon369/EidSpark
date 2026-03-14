
"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, Plus, Trophy, Trash2, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

type SalamiEntry = {
  id: string
  name: string
  amount: number
}

export default function SalamiTracker() {
  const [entries, setEntries] = useState<SalamiEntry[]>([
    { id: "1", name: "Uncle Ahmed", amount: 50 },
    { id: "2", name: "Grandpa", amount: 100 },
    { id: "3", name: "Aunt Sarah", amount: 30 }
  ])
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !amount) return
    
    const newEntry: SalamiEntry = {
      id: Date.now().toString(),
      name,
      amount: parseFloat(amount)
    }
    
    setEntries([newEntry, ...entries])
    setName("")
    setAmount("")
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id))
  }

  const total = entries.reduce((acc, curr) => acc + curr.amount, 0)
  const sortedEntries = [...entries].sort((a, b) => b.amount - a.amount)

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold font-headline text-primary">Salami Tracker</h1>
          <p className="text-muted-foreground mt-4">Keep track of your Eid gifts and see who's the top contributor!</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg border-primary/10 overflow-hidden">
              <div className="emerald-gradient p-8 text-white text-center">
                <Wallet className="w-10 h-10 mx-auto mb-4 opacity-80" />
                <p className="text-white/80 font-medium mb-1">Total Salami Collected</p>
                <p className="text-4xl font-bold">${total.toLocaleString()}</p>
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input 
                      id="amount" 
                      type="number" 
                      placeholder="0" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="rounded-xl"
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
                  ${entries.length > 0 ? (total / entries.length).toFixed(1) : 0}
                </p>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="shadow-lg border-primary/10">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-secondary" />
                    Gift Leaderboard
                  </CardTitle>
                  <CardDescription>Ranked by highest contribution</CardDescription>
                </div>
                <div className="text-sm font-bold text-primary bg-accent/50 px-3 py-1 rounded-full">
                  {entries.length} Entries
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {sortedEntries.length > 0 ? (
                    sortedEntries.map((entry, index) => (
                      <div 
                        key={entry.id} 
                        className={cn(
                          "flex items-center justify-between p-6 hover:bg-accent/20 transition-colors",
                          index === 0 && "bg-secondary/5"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                            index === 0 ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"
                          )}>
                            {index + 1}
                          </div>
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-primary text-white font-bold">
                              {entry.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-lg text-primary">{entry.name}</p>
                            <p className="text-xs text-muted-foreground">Contributor #{index + 1}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-2xl font-bold text-primary">${entry.amount}</p>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                            onClick={() => handleDelete(entry.id)}
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
          </div>
        </div>
      </div>
    </div>
  )
}
