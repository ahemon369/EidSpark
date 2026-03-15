
"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, limit, orderBy } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Send, 
  Camera, 
  Wallet, 
  MapPin, 
  ArrowRight, 
  Sparkles,
  Calculator,
  Timer,
  Layout,
  Compass
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

export default function DashboardOverview() {
  const { user } = useUser()
  const db = useFirestore()

  // Stats fetching
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

  const mosqueRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "savedMosques")
  }, [db, user])
  const { data: mosques } = useCollection(mosqueRef)

  const stats = [
    { label: "Greetings Created", value: greetings?.length || 0, icon: Send, color: "bg-blue-500" },
    { label: "Salami Collected", value: salami?.length || 0, icon: Wallet, color: "bg-emerald-500" },
    { label: "Saved Mosques", value: mosques?.length || 0, icon: MapPin, color: "bg-amber-500" },
    { label: "Eid Rank", value: "Top 5%", icon: Sparkles, color: "bg-purple-500" },
  ]

  const quickActions = [
    { title: "New Greeting", desc: "Design a custom card", href: "/tools/greeting", icon: Send, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Selfie Studio", desc: "AI poster frames", href: "/tools/selfie", icon: Camera, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "Qibla Finder", desc: "Compass direction", href: "/tools/qibla", icon: Compass, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Zakat Calc", desc: "Financial assistant", href: "/tools/zakat", icon: Calculator, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] emerald-gradient p-12 text-white shadow-2xl">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-secondary fill-secondary" />
            <span>Celebrate with EidSpark</span>
          </div>
          <h2 className="text-4xl font-black tracking-tight">Assalamu Alaikum, {user?.displayName?.split(' ')[0]}! 🌙</h2>
          <p className="text-white/80 font-medium text-lg leading-relaxed">
            Your Eid companion is ready. You've created {greetings?.length || 0} greetings so far. Let's make this Eid the most memorable one yet.
          </p>
          <Button className="bg-secondary text-primary font-black px-8 h-12 rounded-xl mt-4 hover:scale-105 transition-all shadow-xl" asChild>
            <Link href="/tools/greeting">Create New Greeting</Link>
          </Button>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <Sparkles className="w-64 h-64" />
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:-translate-y-1 transition-all">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">Live</div>
              </div>
              <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Quick Actions */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black text-slate-800">Quick Tools</h3>
            <Link href="/" className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:underline">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all h-full bg-white">
                  <CardContent className="p-8 flex items-center gap-6">
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6", action.bg)}>
                      <action.icon className={cn("w-8 h-8", action.color)} />
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-slate-800">{action.title}</h4>
                      <p className="text-sm font-medium text-muted-foreground">{action.desc}</p>
                    </div>
                    <div className="ml-auto w-10 h-10 rounded-full border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity Mini */}
        <section className="space-y-6">
          <div className="px-2">
            <h3 className="text-xl font-black text-slate-800">Recent Greetings</h3>
          </div>
          <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {greetings?.slice(0, 3).map((g) => (
                  <div key={g.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-black overflow-hidden border">
                       <Send className="w-6 h-6 text-primary/30" />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm">To: {g.recipientName}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(g.generationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="ml-auto rounded-full" asChild>
                      <Link href="/dashboard/greetings">
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                {(!greetings || greetings.length === 0) && (
                  <div className="p-12 text-center space-y-4 opacity-40">
                    <Send className="w-12 h-12 mx-auto text-primary" />
                    <p className="font-bold text-xs uppercase tracking-widest">No greetings yet</p>
                  </div>
                )}
              </div>
              {greetings && greetings.length > 0 && (
                <div className="p-6 bg-slate-50/50">
                  <Button variant="ghost" className="w-full font-black text-primary text-xs uppercase tracking-widest" asChild>
                    <Link href="/dashboard/greetings">View Gallery</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
