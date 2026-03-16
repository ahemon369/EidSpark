
"use client"

import { use, useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, limit, doc, getCountFromServer } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Trophy, 
  Star, 
  Share2, 
  Facebook, 
  MessageCircle, 
  Gift, 
  Wallet, 
  Copy, 
  Sparkles, 
  ExternalLink,
  Loader2,
  Lock,
  ArrowRight,
  Flame
} from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { getLevelInfo } from "@/lib/gamification-utils"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"

export default function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const db = useFirestore()
  const { toast } = useToast()
  
  const [profileUser, setProfileUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [globalRank, setGlobalRank] = useState<number | null>(null)

  // Fetch target user by username
  useEffect(() => {
    if (!db || !username) return
    const fetchUser = async () => {
      const q = query(collection(db, "users"), where("username", "==", username.toLowerCase()), limit(1))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const userData = { ...snap.docs[0].data(), id: snap.docs[0].id }
        setProfileUser(userData)
        
        // Fetch Rank
        const rankQ = query(collection(db, "users"), where("totalPoints", ">", userData.totalPoints))
        const rankSnap = await getCountFromServer(rankQ)
        setGlobalRank(rankSnap.data().count + 1)
      }
      setIsLoading(false)
    }
    fetchUser()
  }, [db, username])

  // Fetch Greetings
  const greetingsRef = useMemoFirebase(() => {
    if (!db || !profileUser) return null
    return collection(db, "users", profileUser.id, "eidGreetings")
  }, [db, profileUser])
  const { data: greetings } = useCollection(greetingsRef)

  // Fetch Salami Profile
  const salamiRef = useMemoFirebase(() => {
    if (!db || !profileUser) return null
    return doc(db, "salamiProfiles", profileUser.id)
  }, [db, profileUser])
  const { data: salamiProfile } = useDoc(salamiRef)

  const handleShare = (platform: 'fb' | 'wa' | 'copy') => {
    const url = window.location.href
    const text = `Eid Mubarak! Check out ${profileUser?.username}'s EidSpark profile 🎉`
    if (platform === 'fb') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    else if (platform === 'wa') window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, '_blank')
    else {
      navigator.clipboard.writeText(url)
      toast({ title: "Link Copied!" })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="font-black text-primary uppercase tracking-widest text-xs">Syncing Public Profile...</p>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary">
          <Sparkles className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight">Profile Not Found</h1>
        <p className="text-muted-foreground font-medium">The user @{username} doesn't exist or has moved.</p>
        <Button className="rounded-2xl h-14 px-10 emerald-gradient font-black" asChild><Link href="/">Go Home</Link></Button>
      </div>
    )
  }

  if (profileUser.privacy === 'private') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Lock className="w-24 h-24 text-primary/20 animate-bounce" />
        <h1 className="text-4xl font-black text-primary tracking-tight">Private Profile</h1>
        <p className="text-muted-foreground font-medium">@{username} has set their profile to private.</p>
        <Button className="rounded-2xl h-14 px-10 emerald-gradient font-black" asChild><Link href="/">Return to Home</Link></Button>
      </div>
    )
  }

  const levelInfo = getLevelInfo(profileUser.totalPoints || 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] islamic-pattern pb-20 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-20 mt-[70px]">
        {/* Profile Header */}
        <section className="relative mb-16 animate-in fade-in slide-in-from-top duration-1000">
          <Card className="border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
            <div className="h-48 emerald-gradient relative">
              <div className="absolute inset-0 opacity-10 islamic-pattern"></div>
              <div className="absolute -bottom-16 left-12">
                <Avatar className="h-40 w-40 border-8 border-white shadow-2xl">
                  <AvatarImage src={profileUser.avatarUrl || `https://picsum.photos/seed/${profileUser.id}/200/200`} />
                  <AvatarFallback className="bg-primary text-white text-5xl font-black">{profileUser.username?.[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <CardContent className="pt-20 pb-12 px-12 grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{profileUser.displayName || profileUser.username}</h1>
                  <p className="text-xl text-primary font-black flex items-center gap-2">
                    @{profileUser.username}
                    <span className="bg-secondary/10 text-secondary text-[10px] px-3 py-1 rounded-full uppercase tracking-widest border border-secondary/20">Active Member</span>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex items-center gap-5 group hover:scale-105 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:rotate-12 transition-transform">
                      <Star className="w-7 h-7 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Points Collected</p>
                      <p className="text-3xl font-black text-slate-800">{profileUser.totalPoints.toLocaleString()} XP</p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex items-center gap-5 group hover:scale-105 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner group-hover:rotate-12 transition-transform">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">National Rank</p>
                      <p className="text-3xl font-black text-slate-800">#{globalRank || '...'}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 flex items-center gap-5 group hover:scale-105 transition-transform">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-inner group-hover:rotate-12 transition-transform">
                      <Flame className="w-7 h-7 fill-rose-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Login Streak</p>
                      <p className="text-3xl font-black text-slate-800">{profileUser.streak || 0} Days</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-6 flex flex-col justify-center border-l lg:pl-10 border-slate-100">
                <div className="space-y-4">
                  <p className="text-xs font-black uppercase text-muted-foreground tracking-[0.3em]">Share Profile</p>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-bold border-2 gap-2 text-green-600 hover:bg-green-50" onClick={() => handleShare('wa')}>
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </Button>
                    <Button variant="outline" className="flex-1 rounded-2xl h-14 font-bold border-2 gap-2 text-blue-600 hover:bg-blue-50" onClick={() => handleShare('fb')}>
                      <Facebook className="w-5 h-5" /> Share
                    </Button>
                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 hover:bg-white border-2" onClick={() => handleShare('copy')}>
                      <Copy className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-secondary/10 flex items-center justify-center text-3xl shadow-inner border-4 border-white">
                      {levelInfo.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Level Progression</p>
                      <p className="text-xl font-black text-primary">{levelInfo.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Greetings Gallery */}
          <section className="lg:col-span-8 space-y-10">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-secondary" />
                Festive Gallery
              </h2>
              <span className="text-xs font-black uppercase text-muted-foreground tracking-widest">{greetings?.length || 0} Cards Shared</span>
            </div>

            {!greetings || greetings.length === 0 ? (
              <div className="bg-white/50 border-4 border-dashed border-slate-200 rounded-[3rem] p-24 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No greetings public yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {greetings.map((g) => (
                  <Card key={g.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:-translate-y-2 transition-all duration-500">
                    <div className="aspect-square relative overflow-hidden bg-slate-100">
                      <div className={cn(
                        "absolute inset-0 opacity-40 islamic-pattern",
                        g.templateId === 'moon' ? 'bg-emerald-900' : 'bg-amber-100'
                      )}></div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-4">
                        <p className="font-black text-2xl text-slate-800 line-clamp-3 leading-tight">"{g.recipientName}"</p>
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">AI Generated Blessing</p>
                      </div>
                    </div>
                    <CardContent className="p-8 flex items-center justify-between border-t border-slate-50">
                      <div>
                        <p className="font-black text-slate-800 text-lg">Eid Blessing</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Shared on {new Date(g.generationDate).toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 bg-primary/5 text-primary hover:bg-primary hover:text-white" onClick={() => handleShare('copy')}>
                        <Share2 className="w-5 h-5" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Salami Hub */}
          <aside className="lg:col-span-4 space-y-10">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Gift className="w-8 h-8 text-secondary" />
              Salami Hub
            </h2>

            {salamiProfile ? (
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white p-10 text-center space-y-8 relative overflow-hidden group">
                <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="relative z-10 space-y-8">
                  <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl border-8 border-slate-50 inline-block group-hover:rotate-2 transition-transform">
                    <QRCodeSVG value={window.location.href} size={200} level="H" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Send Me Eid Salami 🎁</h3>
                    <p className="text-slate-500 font-medium leading-relaxed italic px-4">"{salamiProfile.message}"</p>
                  </div>
                  
                  <div className="space-y-4 pt-6 border-t">
                    <div className="bg-[#E2136E]/5 p-5 rounded-2xl border border-[#E2136E]/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-[#E2136E]" />
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase text-[#E2136E] tracking-widest">bKash</p>
                          <p className="font-black text-slate-800">{salamiProfile.bkashNumber}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(salamiProfile.bkashNumber); toast({title: "Copied!"}) }} className="rounded-xl text-[#E2136E] hover:bg-[#E2136E]/10">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {salamiProfile.nagadNumber && (
                      <div className="bg-[#F7941D]/5 p-5 rounded-2xl border border-[#F7941D]/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5 text-[#F7941D]" />
                          <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-[#F7941D] tracking-widest">Nagad</p>
                            <p className="font-black text-slate-800">{salamiProfile.nagadNumber}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(salamiProfile.nagadNumber); toast({title: "Copied!"}) }} className="rounded-xl text-[#F7941D] hover:bg-[#F7941D]/10">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full h-16 rounded-2xl emerald-gradient text-white font-black text-lg shadow-xl" asChild>
                    <Link href={`/salami/${profileUser.username}`}>Go to Payment Page <ArrowRight className="ml-2 w-5 h-5" /></Link>
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border-none shadow-xl rounded-[3rem] bg-white p-12 text-center space-y-6 opacity-60">
                <Gift className="w-16 h-16 mx-auto text-slate-300" />
                <p className="text-slate-400 font-bold text-sm uppercase tracking-widest leading-relaxed">@{username} hasn't configured their Salami Hub yet.</p>
              </Card>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}

import { getDocs } from "firebase/firestore"
import { useDoc } from "@/firebase"
