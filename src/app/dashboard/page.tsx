
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, limit, orderBy, where, doc } from "firebase/firestore"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { 
  Send, 
  Camera, 
  Wallet, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  Calculator,
  Compass,
  Trophy,
  Medal,
  Target,
  ArrowUpRight,
  TrendingUp,
  Star
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getLevelInfo, LEVELS } from "@/lib/gamification-utils"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()

  const { data: userData } = useCollection(useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users"), where("id", "==", user.uid))
  }, [db, user]))

  const fullUserData = userData?.[0] || { totalPoints: 0 }
  const levelInfo = getLevelInfo(fullUserData.totalPoints || 0)

  const greetingRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "eidGreetings")
  }, [db, user])
  const { data: greetings } = useCollection(greetingRef)

  const salamiRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "salamiEntries")
  }, [db, user])
  const { data: salami } = useCollection(salamiRef)

  const selfieRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "selfiePosters")
  }, [db, user])
  const { data: selfies } = useCollection(selfieRef)

  const challengesRef = useMemoFirebase(() => {
    if (!db || !user) return null
    const today = new Date().toISOString().split('T')[0]
    return query(collection(db, "users", user.uid, "dailyChallengeProgress"), where("date", "==", today))
  }, [db, user])
  const { data: dailyProgress } = useCollection(challengesRef)

  const stats = [
    { label: "Total Points", value: fullUserData.totalPoints || 0, icon: Star, color: "bg-amber-500" },
    { label: "Greetings", value: greetings?.length || 0, icon: Send, color: "bg-blue-500" },
    { label: "Posters", value: selfies?.length || 0, icon: Camera, color: "bg-rose-500" },
    { label: "Salami Tracked", value: salami?.length || 0, icon: Wallet, color: "bg-emerald-500" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Welcome & Progress */}
        <section className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] emerald-gradient p-12 text-white shadow-2xl">
          <div className="relative z-10 space-y-8 max-w-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
                <span>EidSpark Rewards v1.0</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">Welcome back, {user?.displayName?.split(' ')[0]}! 🌙</h2>
              <p className="text-white/80 font-medium text-lg leading-relaxed">
                You're officially an <span className="text-secondary font-black">{levelInfo.name}</span>. Keep engaging to reach Legend status!
              </p>
            </div>

            <div className="space-y-4 bg-black/10 p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-white/60">Level Progress</p>
                <p className="text-xs font-black uppercase tracking-widest text-secondary">{fullUserData.totalPoints || 0} / {levelInfo.nextMin || 'MAX'} XP</p>
              </div>
              <Progress value={levelInfo.progress} className="h-3 bg-white/10" />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                <span>{levelInfo.name}</span>
                <span>{LEVELS[LEVELS.findIndex(l => l.name === levelInfo.name) + 1]?.name || 'Legendary'}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="bg-secondary text-primary font-black px-8 h-14 rounded-2xl hover:scale-105 transition-all shadow-xl" asChild>
                <Link href="/leaderboard">View National Rankings <ArrowUpRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <Trophy className="w-64 h-64 rotate-12" />
          </div>
        </section>

        {/* Stats Column */}
        <section className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 h-full flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Medal className="w-6 h-6 text-secondary" />
                Current Status
              </h3>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-[2rem] bg-secondary/10 flex items-center justify-center text-4xl shadow-inner border-4 border-white">
                  {levelInfo.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Badge Earned</p>
                  <p className="text-2xl font-black text-primary">{levelInfo.name}</p>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Rank Position</span>
                <span className="text-lg font-black text-primary">#12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground">Achievements</span>
                <span className="text-lg font-black text-primary">4 / 12</span>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all bg-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live</div>
              </div>
              <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <Target className="w-6 h-6 text-primary" />
              Daily Challenges
            </h3>
            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Resets in 14h</span>
          </div>
          
          <div className="space-y-4">
            <ChallengeCard title="Generate 3 Eid Excuses" reward={10} count={dailyProgress?.find(p => p.challengeId === 'GenerateExcuse')?.currentCount || 0} target={3} icon="😂" />
            <ChallengeCard title="Upload 1 Eid Poster" reward={15} count={dailyProgress?.find(p => p.challengeId === 'UploadSelfie')?.currentCount || 0} target={1} icon="📸" />
            <ChallengeCard title="Report 1 Moon Sighting" reward={20} count={dailyProgress?.find(p => p.challengeId === 'ReportMoon')?.currentCount || 0} target={1} icon="🌙" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800">Trending Now</h3>
          </div>
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white p-8 space-y-6">
            <div className="flex items-center gap-4 group cursor-pointer" asChild>
              <Link href="/fun-zone" className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm font-black text-slate-800">Selfie Contest Live!</p>
                  <p className="text-xs text-muted-foreground">Upload now for +10 points</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="pt-6 border-t">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Recent Top Player</p>
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10 border-2 border-secondary">
                  <AvatarImage src="https://picsum.photos/seed/winner/100/100" />
                  <AvatarFallback className="bg-secondary text-primary font-black">A</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-black text-slate-800">Ahsan Ahmed</p>
                  <p className="text-[10px] font-bold text-secondary uppercase tracking-tighter">Level 4 • Eid Star</p>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

function ChallengeCard({ title, reward, count, target, icon }: any) {
  const isCompleted = count >= target;
  
  return (
    <Card className={cn(
      "border-none shadow-xl rounded-3xl overflow-hidden transition-all group hover:scale-[1.01]",
      isCompleted ? "bg-emerald-50/50 opacity-60" : "bg-white"
    )}>
      <CardContent className="p-6 flex items-center gap-6">
        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">{icon}</div>
        <div className="flex-grow space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="font-black text-slate-800">{title}</h4>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-full">+{reward} XP</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
              <span>{isCompleted ? 'Mission Accomplished' : 'Progress'}</span>
              <span>{count} / {target}</span>
            </div>
            <Progress value={(count / target) * 100} className="h-1.5" />
          </div>
        </div>
        {isCompleted && <Medal className="w-8 h-8 text-emerald-500 animate-in zoom-in duration-500" />}
      </CardContent>
    </Card>
  )
}
