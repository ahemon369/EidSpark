
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Star, Sparkles, Share2, Facebook, MessageCircle, ArrowUpRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getLevelInfo } from "@/lib/gamification-utils"
import { useToast } from "@/hooks/use-toast"

export default function LeaderboardPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const leaderboardRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "users"), orderBy("totalPoints", "desc"), limit(20))
  }, [db])

  const { data: topUsers, isLoading } = useCollection(leaderboardRef)

  const shareLeaderboard = (platform: 'fb' | 'wa') => {
    const url = encodeURIComponent(window.location.href)
    const text = encodeURIComponent("Check out the top contributors on EidSpark Leaderboard! 🌙")
    if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${text}%20${url}`, '_blank')
    }
  }

  if (isLoading) {
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
          <h1 className="text-5xl lg:text-8xl font-black text-primary dark:text-white tracking-tighter leading-[0.9]">
            The EidSpark <br />
            <span className="text-secondary drop-shadow-sm">Champions</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Celebrating the most active and helpful members of our community this Eid season.
          </p>
        </header>

        {/* Podium */}
        {topUsers && topUsers.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-end">
            {/* 2nd Place */}
            <PodiumCard user={topUsers[1]} rank={2} color="bg-slate-300" icon={<Medal className="w-6 h-6 text-slate-600" />} delay="delay-100" />
            
            {/* 1st Place */}
            <PodiumCard user={topUsers[0]} rank={1} color="bg-secondary" icon={<Trophy className="w-10 h-10 text-primary animate-bounce" />} isMain delay="duration-1000" />
            
            {/* 3rd Place */}
            <PodiumCard user={topUsers[2]} rank={3} color="bg-amber-600" icon={<Medal className="w-6 h-6 text-amber-900" />} delay="delay-200" />
          </div>
        )}

        {/* List */}
        <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20">
          <CardHeader className="p-10 border-b bg-primary/5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <div className="space-y-1">
                <CardTitle className="text-2xl font-black text-primary">Top 20 Contributors</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Updated in real-time</CardDescription>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => shareLeaderboard('wa')} className="rounded-xl font-bold h-10 border-2 border-green-100 text-green-600 hover:bg-green-50"><MessageCircle className="w-4 h-4 mr-2" /> Share</Button>
                <Button variant="outline" size="sm" onClick={() => shareLeaderboard('fb')} className="rounded-xl font-bold h-10 border-2 border-blue-100 text-blue-600 hover:bg-blue-50"><Facebook className="w-4 h-4 mr-2" /> Post</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-primary/5">
              {topUsers?.map((u, i) => (
                <div key={u.id} className={cn(
                  "p-6 sm:p-8 flex items-center justify-between hover:bg-primary/5 transition-all group",
                  user?.uid === u.id ? "bg-secondary/10 border-l-8 border-secondary" : ""
                )}>
                  <div className="flex items-center gap-6">
                    <div className="w-10 text-center font-black text-2xl text-muted-foreground/40 italic">#{i + 1}</div>
                    <Avatar className="h-14 w-14 border-4 border-white shadow-xl group-hover:scale-110 transition-transform">
                      <AvatarImage src={u.avatarUrl || `https://picsum.photos/seed/${u.id}/100/100`} />
                      <AvatarFallback className="bg-primary text-white font-black text-xl">{u.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="font-black text-xl text-primary flex items-center gap-2">
                        {u.username}
                        {user?.uid === u.id && <span className="bg-secondary text-primary text-[8px] px-2 py-0.5 rounded-full uppercase tracking-tighter">You</span>}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                        <span>{getLevelInfo(u.totalPoints || 0).icon}</span>
                        <span>{getLevelInfo(u.totalPoints || 0).name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-2xl font-black text-primary tracking-tighter">{u.totalPoints || 0}</p>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-16 text-center text-muted-foreground">
          <p className="text-xs font-black uppercase tracking-[0.4em]">Stay Active • Earn Points • Be a Legend ✨</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function PodiumCard({ user, rank, color, icon, isMain, delay }: any) {
  const info = getLevelInfo(user?.totalPoints || 0);
  
  return (
    <Card className={cn(
      "border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white group hover:-translate-y-2 transition-all animate-in zoom-in",
      isMain ? "scale-110 z-10 border-4 border-secondary shadow-secondary/20" : "",
      delay
    )}>
      <div className={cn("p-8 flex flex-col items-center text-center space-y-6", isMain ? "pt-12" : "")}>
        <div className="relative">
          <Avatar className={cn("h-24 w-24 border-8 border-white shadow-2xl", isMain ? "h-32 w-32" : "")}>
            <AvatarImage src={user?.avatarUrl || `https://picsum.photos/seed/${user?.id}/100/100`} />
            <AvatarFallback className="bg-primary text-white font-black">{user?.username?.[0]}</AvatarFallback>
          </Avatar>
          <div className={cn("absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-xl font-black", color)}>
            {rank}
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-xl font-black text-primary">{user?.username}</h3>
          <div className="flex items-center justify-center gap-2 bg-primary/5 px-4 py-1 rounded-full text-[10px] font-black uppercase text-primary tracking-widest">
            {info.icon} {info.name}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-4xl font-black text-primary tracking-tighter">{user?.totalPoints || 0}</p>
          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Points earned</p>
        </div>

        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100", isMain ? "bg-secondary/10 border-secondary/20" : "")}>
          {icon}
        </div>
      </div>
    </Card>
  )
}
