
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Star, Sparkles, Share2, Facebook, MessageCircle, ArrowUpRight, Loader2, Wallet, Coins, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLevelInfo } from "@/lib/gamification-utils"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeaderboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Standard Points Leaderboard
  const leaderboardRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "users"), orderBy("totalPoints", "desc"), limit(20))
  }, [db])
  const { data: topUsers, isLoading: loadingPoints } = useCollection(leaderboardRef)

  // Salami Collectors Leaderboard
  const salamiRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "salamiProfiles"), orderBy("totalSalami", "desc"), limit(20))
  }, [db])
  const { data: topCollectors, isLoading: loadingSalami } = useCollection(salamiRef)

  const shareLeaderboard = (platform: 'fb' | 'wa') => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent("Check out the top contributors and Salami collectors on EidSpark! 🌙")
    if (platform === 'fb') window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
    else window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
  }

  if (loadingPoints || loadingSalami) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black text-primary uppercase tracking-widest text-xs">Syncing National Rankings...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-0 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <header className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-[0.2em] border border-primary/20 shadow-sm backdrop-blur-md">
            <Trophy className="w-4 h-4 text-secondary fill-secondary" />
            <span>National Hall of Fame</span>
          </div>
          <h1 className="text-5xl lg:text-[100px] font-black text-primary dark:text-white tracking-tighter leading-[0.85]">
            Champion <br />
            <span className="text-secondary drop-shadow-sm">Board</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Celebrating the most active members and the legendary Salami collectors of our community.
          </p>
        </header>

        <Tabs defaultValue="points" className="space-y-12">
          <TabsList className="flex justify-center w-full gap-4 p-2 bg-white/50 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-primary/5 h-auto">
            <TabsTrigger value="points" className="rounded-full font-black gap-2 py-4 px-10 data-[state=active]:bg-primary data-[state=active]:text-white text-lg">
              <Star className="w-5 h-5" /> Activity XP
            </TabsTrigger>
            <TabsTrigger value="salami" className="rounded-full font-black gap-2 py-4 px-10 data-[state=active]:bg-primary data-[state=active]:text-white text-lg">
              <Wallet className="w-5 h-5" /> Salami Wealth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="points" className="animate-in fade-in zoom-in-95 duration-500">
            {/* Podium */}
            {topUsers && topUsers.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
                <PodiumCard user={topUsers[1]} rank={2} color="bg-slate-300" icon={<Medal className="w-6 h-6 text-slate-600" />} />
                <PodiumCard user={topUsers[0]} rank={1} color="bg-secondary" icon={<Trophy className="w-10 h-10 text-primary animate-bounce" />} isMain />
                <PodiumCard user={topUsers[2]} rank={3} color="bg-amber-600" icon={<Medal className="w-6 h-6 text-amber-900" />} />
              </div>
            )}

            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
              <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                  {topUsers?.map((u, i) => (
                    <RankRow key={u.id} user={u} rank={i + 1} isCurrent={user?.uid === u.id} val={u.totalPoints || 0} unit="XP" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salami" className="animate-in fade-in zoom-in-95 duration-500">
            {/* Collectors List */}
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
              <CardHeader className="p-12 emerald-gradient text-white text-center">
                <Coins className="w-16 h-16 mx-auto mb-6 text-secondary animate-float" />
                <CardTitle className="text-4xl font-black">Elite Collectors</CardTitle>
                <CardDescription className="text-white/70 font-medium">Ranked by total confirmed Salami received.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-primary/5">
                  {topCollectors && topCollectors.length > 0 ? topCollectors.map((c, i) => (
                    <div key={c.id} className={cn(
                      "p-8 flex items-center justify-between hover:bg-primary/5 transition-all group",
                      user?.uid === c.userId ? "bg-secondary/10 border-l-8 border-secondary" : ""
                    )}>
                      <div className="flex items-center gap-8">
                        <div className="w-12 text-center font-black text-3xl text-muted-foreground/30 italic">#{i + 1}</div>
                        <Avatar className="h-16 w-16 border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
                          <AvatarFallback className="bg-primary/5 text-primary font-black text-2xl">{c.displayName?.[0]}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="font-black text-2xl text-primary flex items-center gap-3">
                            {c.displayName}
                            {user?.uid === c.userId && <span className="bg-secondary text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">You</span>}
                          </p>
                          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            <Users className="w-3 h-3" />
                            <span>{c.donorsCount || 0} Generous Friends</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right space-y-1 bg-secondary/10 px-8 py-4 rounded-[1.5rem] border border-secondary/20 shadow-sm group-hover:scale-105 transition-transform">
                        <p className="text-3xl font-black text-primary tracking-tighter">৳{c.totalSalami || 0}</p>
                        <p className="text-[9px] font-black uppercase text-primary/60 tracking-widest">Confirmed Salami</p>
                      </div>
                    </div>
                  )) : (
                    <div className="p-32 text-center opacity-30 space-y-6">
                      <Gift className="w-20 h-20 mx-auto animate-pulse" />
                      <p className="font-black text-xl uppercase tracking-widest">Be the first to collect!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-20 flex flex-col items-center gap-8 text-center animate-in fade-in duration-1000 delay-500">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-muted-foreground">Spread the Spirit of Competition</p>
          <div className="flex gap-4">
            <Button variant="outline" className="h-14 rounded-2xl px-8 border-2 border-green-100 text-green-600 font-bold" onClick={() => shareLeaderboard('wa')}><MessageCircle className="w-5 h-5 mr-2" /> Share</Button>
            <Button variant="outline" className="h-14 rounded-2xl px-8 border-2 border-blue-100 text-blue-600 font-bold" onClick={() => shareLeaderboard('fb')}><Facebook className="w-5 h-5 mr-2" /> Post</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function RankRow({ user, rank, isCurrent, val, unit }: any) {
  const info = getLevelInfo(val);
  return (
    <div className={cn(
      "p-8 flex items-center justify-between hover:bg-primary/5 transition-all group",
      isCurrent ? "bg-secondary/10 border-l-8 border-secondary" : ""
    )}>
      <div className="flex items-center gap-8">
        <div className="w-12 text-center font-black text-3xl text-muted-foreground/30 italic">#{rank}</div>
        <Avatar className="h-16 w-16 border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
          <AvatarImage src={user.avatarUrl || `https://picsum.photos/seed/${user.id}/100/100`} />
          <AvatarFallback className="bg-primary text-white font-black text-2xl">{user.username?.[0]}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="font-black text-2xl text-primary flex items-center gap-3">
            {user.username}
            {isCurrent && <span className="bg-secondary text-primary text-[10px] px-3 py-1 rounded-full uppercase tracking-tighter">You</span>}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            <span className="text-xl">{info.icon}</span>
            <span>{info.name}</span>
          </div>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p className="text-3xl font-black text-primary tracking-tighter">{val.toLocaleString()}</p>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{unit}</p>
      </div>
    </div>
  )
}

function PodiumCard({ user, rank, color, icon, isMain }: any) {
  const info = getLevelInfo(user?.totalPoints || 0);
  return (
    <Card className={cn(
      "border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white group hover:-translate-y-3 transition-all duration-500",
      isMain ? "scale-110 z-10 border-4 border-secondary shadow-secondary/20" : "opacity-90"
    )}>
      <div className={cn("p-10 flex flex-col items-center text-center space-y-8", isMain ? "pt-16" : "")}>
        <div className="relative">
          <Avatar className={cn("border-8 border-white shadow-2xl transition-all duration-700", isMain ? "h-40 w-40" : "h-28 w-28")}>
            <AvatarImage src={user?.avatarUrl || `https://picsum.photos/seed/${user?.id}/100/100`} />
            <AvatarFallback className="bg-primary text-white font-black text-3xl">{user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <div className={cn("absolute -bottom-4 -right-4 w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl font-black text-xl border-4 border-white", color)}>
            {rank}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className={cn("font-black text-primary truncate max-w-[180px]", isMain ? "text-3xl" : "text-xl")}>{user?.username}</h3>
          <div className="bg-primary/5 px-5 py-1.5 rounded-full text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
            {info.icon} {info.name}
          </div>
        </div>
        <div className="space-y-1">
          <p className={cn("font-black text-primary tracking-tighter", isMain ? "text-5xl" : "text-3xl")}>{(user?.totalPoints || 0).toLocaleString()}</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em]">Lifetime XP</p>
        </div>
        <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center bg-slate-50 border-4 border-white shadow-inner", isMain ? "bg-secondary/10" : "")}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
