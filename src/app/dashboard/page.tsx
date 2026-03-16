
"use client"

import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, query, limit, orderBy, where, doc, getCountFromServer } from "firebase/firestore"
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
  Trophy,
  Medal,
  Target,
  ArrowUpRight,
  TrendingUp,
  Star,
  Loader2,
  ExternalLink,
  Share2,
  User
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getLevelInfo, LEVELS } from "@/lib/gamification-utils"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [globalRank, setGlobalRank] = useState<number | null>(null)

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  
  const { data: userData, isLoading: userLoading } = useDoc(userDocRef)

  const fullUserData = userData || { totalPoints: 0, username: '' }
  const levelInfo = getLevelInfo(fullUserData.totalPoints || 0)

  useEffect(() => {
    if (db && fullUserData.totalPoints !== undefined) {
      const q = query(collection(db, "users"), where("totalPoints", ">", fullUserData.totalPoints))
      getCountFromServer(q).then(snapshot => {
        setGlobalRank(snapshot.data().count + 1)
      })
    }
  }, [db, fullUserData.totalPoints])

  const greetingRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "eidGreetings")
  }, [db, user])
  const { data: greetings } = useCollection(greetingRef)

  const stats = [
    { label: "Total Points", value: fullUserData.totalPoints || 0, icon: Star, color: "bg-amber-500" },
    { label: "Greetings", value: greetings?.length || 0, icon: Send, color: "bg-blue-500" },
    { label: "Posters", value: 0, icon: Camera, color: "bg-rose-500" },
    { label: "Salami Tracked", value: 0, icon: Wallet, color: "bg-emerald-500" },
  ]

  const profileUrl = fullUserData.username ? `/profile/${fullUserData.username}` : '/dashboard/settings'

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}${profileUrl}`
    navigator.clipboard.writeText(fullUrl)
    toast({ title: "Profile Link Copied!" })
  }

  if (userLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold text-muted-foreground uppercase tracking-widest text-xs">Syncing Rewards Profile...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="grid lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 relative overflow-hidden rounded-[2.5rem] emerald-gradient p-12 text-white shadow-2xl">
          <div className="relative z-10 space-y-8 max-w-2xl">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
                <span>EidSpark Rewards Active</span>
              </div>
              <h2 className="text-4xl font-black tracking-tight">Welcome back, {user?.displayName?.split(' ')[0]}! 🌙</h2>
              <p className="text-white/80 font-medium text-lg leading-relaxed">
                You're currently an <span className="text-secondary font-black">{levelInfo.name}</span>. Keep participating to unlock exclusive rewards!
              </p>
            </div>

            <div className="space-y-4 bg-black/10 p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-black uppercase tracking-widest text-white/60">Level Progress</p>
                <p className="text-xs font-black uppercase tracking-widest text-secondary">{fullUserData.totalPoints || 0} / {levelInfo.nextMin || 'MAX'} XP</p>
              </div>
              <Progress value={levelInfo.progress} className="h-3 bg-white/10" />
            </div>

            <div className="flex gap-4">
              <Button className="bg-secondary text-primary font-black px-8 h-14 rounded-2xl hover:scale-105 transition-all shadow-xl" asChild>
                <Link href="/leaderboard">View Rankings <ArrowUpRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button variant="outline" className="bg-white/10 border-white/20 text-white font-black px-8 h-14 rounded-2xl hover:bg-white/20 transition-all" asChild>
                <Link href={profileUrl}><User className="mr-2 w-5 h-5" /> View Public Profile</Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none group-hover:scale-110 transition-transform">
            <Trophy className="w-64 h-64 rotate-12" />
          </div>
        </section>

        <section className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 h-full flex flex-col justify-between">
            <div className="space-y-6 text-center">
              <h3 className="text-xl font-black text-slate-800">Public Profile</h3>
              <div className="bg-primary/5 p-6 rounded-3xl border-2 border-dashed border-primary/10 flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Share2 className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Showcase your greetings and stats to your friends!</p>
                <Button onClick={handleCopyLink} className="w-full rounded-xl font-bold gap-2">
                  <Copy className="w-4 h-4" /> Copy Profile Link
                </Button>
              </div>
            </div>
            <div className="pt-6 border-t flex justify-center">
              <Link href="/dashboard/settings" className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-2">
                Edit Profile Settings <ExternalLink className="w-3 h-3" />
              </Link>
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
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Activity</div>
              </div>
              <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
