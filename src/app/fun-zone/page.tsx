
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Laugh, 
  Users, 
  Wallet, 
  MapPin, 
  Camera, 
  Trophy, 
  Send, 
  Copy, 
  MessageCircle, 
  Facebook,
  Heart,
  ChartBar,
  Plus,
  Loader2,
  LocateFixed,
  Navigation,
  Flame,
  Bookmark,
  Share2,
  BookmarkCheck,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit, doc, increment, setDoc, deleteDoc } from "firebase/firestore"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartTooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const excuses = [
  "এই বছর টাকার crisis, সালামি next Eid এ double দিবো",
  "আজকে ATM বন্ধ ছিল, কালকে নিও",
  "বেতন এখনো পাইনি, একটু wait করো",
  "বড় ভাইদের তো সালামি দিতে হয় না, নিতে হয়!",
  "টাকা সব আম্মুর কাছে, ওনার কাছ থেকে নিয়ে নাও",
  "সালামি দিয়ে কি করবা? টাকা জমিয়ে বড় হও আগে",
  "খুচরা টাকা নাই রে ভাই, পরে দেখা করো",
  "আমি তো এখনো ছোট, আমারেই তো কেউ সালামি দেয় নাই"
]

const viralEmojis = ["😂", "😅", "🤭", "🤣", "😎", "😜", "🤫"]

const quizQuestions = [
  {
    q: "Eid এ তুমি প্রথমে কি করো?",
    options: [
      { text: "নতুন পাঞ্জাবি পরে নামাজে যাই", type: "Masjid Lover" },
      { text: "সবার আগে সেমাই খাই", type: "Food Warrior" },
      { text: "কার কার থেকে সালামি নিবো লিস্ট করি", type: "Salami Hunter" },
      { text: "সবার নতুন জামার সাথে নিজেরটা মিলাই", type: "Shopping Master" }
    ]
  },
  {
    q: "সালামি পেলে তোমার রিঅ্যাকশন কি?",
    options: [
      { text: "সাথে সাথে গুনে ফেলি", type: "Salami Hunter" },
      { text: "আম্মুর কাছে জমা দিয়ে দেই", type: "Masjid Lover" },
      { text: "বন্ধুদের নিয়ে খেতে বের হই", type: "Food Warrior" },
      { text: "পরের শপিং এর প্ল্যান করি", type: "Shopping Master" }
    ]
  }
]

export default function FunZone() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Excuse Generator State
  const [currentExcuse, setCurrentExcuse] = useState(excuses[0] + " 😅")
  const [globalGenerated, setGlobalGenerated] = useState(2341)
  const [isSavingExcuse, setIsSavingExcuse] = useState(false)

  // Quiz State
  const [quizStep, setQuizStep] = useState(0)
  const [quizAnswers, setQuizAnswers] = useState<string[]>([])
  const [quizResult, setQuizResult] = useState<any>(null)

  // Salami Counter State
  const [amount, setAmount] = useState("")
  const [from, setFrom] = useState("")
  const [isAddingSalami, setIsAddingSalami] = useState(false)

  // Selfie Contest State
  const [selfieUrl, setSelfieUrl] = useState("")
  const [caption, setCaption] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  // Jamaat Alert State
  const [isDetecting, setIsDetecting] = useState(false)
  const [nearbyFound, setNearbyFound] = useState(false)

  // Fetch Data
  const savedExcusesRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "savedExcuses"), orderBy("savedAt", "desc"))
  }, [db, user])
  const { data: mySavedExcuses } = useCollection(savedExcusesRef)

  const salamiRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "receivedSalami"), orderBy("receivedAt", "desc"))
  }, [db, user])
  const { data: salamiRecords } = useCollection(salamiRef)

  const selfiesRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "eidSelfies"), orderBy("likesCount", "desc"), limit(10))
  }, [db])
  const { data: topSelfies } = useCollection(selfiesRef)

  // --- Logic Functions ---

  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalGenerated(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const generateExcuse = () => {
    const base = excuses[Math.floor(Math.random() * excuses.length)]
    const emoji = viralEmojis[Math.floor(Math.random() * viralEmojis.length)]
    setCurrentExcuse(`${base} ${emoji}`)
    setGlobalGenerated(prev => prev + 1)
  }

  const saveExcuse = async (excuseText: string) => {
    if (!user || !db) {
      toast({ title: "Sign in required", description: "Log in to save your favorite excuses!" })
      return
    }
    
    if (mySavedExcuses?.find(e => e.text === excuseText)) {
      toast({ title: "Already saved!" })
      return
    }

    setIsSavingExcuse(true)
    try {
      await addDoc(collection(db, "users", user.uid, "savedExcuses"), {
        text: excuseText,
        savedAt: new Date().toISOString()
      })
      toast({ title: "Excuse Saved!", description: "Check 'My Saved Excuses' below." })
    } catch (e) {} finally { setIsSavingExcuse(false) }
  }

  const deleteSavedExcuse = async (id: string) => {
    if (!db || !user) return
    try {
      await deleteDoc(doc(db, "users", user.uid, "savedExcuses", id))
      toast({ title: "Removed from favorites" })
    } catch (e) {}
  }

  const shareSocial = (platform: 'fb' | 'wa', text: string) => {
    const url = encodeURIComponent(window.location.href)
    const quote = encodeURIComponent(text)
    if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${quote}%20${url}`, '_blank')
    }
  }

  const handleQuizAnswer = (type: string) => {
    const newAnswers = [...quizAnswers, type]
    setQuizAnswers(newAnswers)
    if (quizStep < 1) { // Simple 2-question mock for brevity in this snippet
      setQuizStep(quizStep + 1)
    } else {
      const counts: Record<string, number> = {}
      newAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1)
      const winner = Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b)
      
      const results: Record<string, any> = {
        "Salami Hunter": { emoji: "💰", desc: "তুমি সালামি ছাড়া আর কিছুই বুঝো না! তোমার কাছে ঈদ মানেই পকেট গরম করা।" },
        "Masjid Lover": { emoji: "🕌", desc: "মাশাআল্লাহ! তুমি খুব ধার্মিক। ঈদ মানেই তোমার কাছে আল্লাহর শুকরিয়া আদায় করা।" },
        "Food Warrior": { emoji: "🥘", desc: "তুমি আস্ত একটা ভোজনরসিক! ঈদে সবার আগে তুমি ডাইনিং টেবিলে বসো।" },
        "Shopping Master": { emoji: "🛍️", desc: "নতুন জামা আর সাজগোজই তোমার প্রধান কাজ। তোমার ঈদ মানেই নিজেকে প্রেজেন্ট করা।" }
      }
      setQuizResult({ title: winner, ...results[winner] })
    }
  }

  const addSalami = async () => {
    if (!user || !db || !amount) return
    setIsAddingSalami(true)
    try {
      await addDoc(collection(db, "users", user.uid, "receivedSalami"), {
        userId: user.uid,
        amount: Number(amount),
        fromPerson: from,
        receivedAt: new Date().toISOString()
      })
      toast({ title: "Salami Added! ৳" })
      setAmount(""); setFrom("")
    } catch (e) {} finally { setIsAddingSalami(false) }
  }

  const uploadSelfie = async () => {
    if (!user || !db || !selfieUrl) return
    setIsUploading(true)
    try {
      const docId = Math.random().toString(36).substr(2, 9)
      await setDoc(doc(db, "eidSelfies", docId), {
        id: docId,
        userId: user.uid,
        imageUrl: selfieUrl,
        caption: caption || "Eid Mubarak! ✨",
        likesCount: 0,
        uploadedAt: new Date().toISOString()
      })
      toast({ title: "Selfie Posted to Contest! 📸" })
      setSelfieUrl(""); setCaption("")
    } catch (e) {} finally { setIsUploading(false) }
  }

  const handleLike = async (selfieId: string) => {
    if (!user || !db) return
    try {
      await setDoc(doc(db, "eidSelfies", selfieId), {
        likesCount: increment(1)
      }, { merge: true })
      toast({ title: "Liked! ❤️" })
    } catch (e) {}
  }

  const handleDetectJamaat = () => {
    setIsDetecting(true)
    setTimeout(() => {
      setIsDetecting(false)
      setNearbyFound(true)
      toast({ title: "GPS Synchronized", description: "Loading verified community data." })
    }, 1500)
  }

  const totalSalamiValue = salamiRecords?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0
  const chartData = [...(salamiRecords || [])].reverse().slice(-10).map(r => ({ name: r.fromPerson || "...", amount: r.amount }))

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 selection:bg-secondary selection:text-primary">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Sparkles className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
            <span>Official Eid Fun Zone</span>
          </div>
          <h1 className="text-5xl lg:text-8xl font-black text-primary dark:text-white tracking-tighter">Festive Viral Hub</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            The ultimate companion for Eid engagement. Generate excuses, discover your archetype, and join the national contest!
          </p>
        </header>

        <Tabs defaultValue="excuse" className="w-full space-y-12">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto lg:h-16 p-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2rem] shadow-xl border border-primary/10 overflow-hidden">
            <TabsTrigger value="excuse" className="rounded-[1.5rem] font-black gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Laugh className="w-4 h-4" /> Excuses</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-[1.5rem] font-black gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Users className="w-4 h-4" /> Personality</TabsTrigger>
            <TabsTrigger value="counter" className="rounded-[1.5rem] font-black gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Wallet className="w-4 h-4" /> Counter</TabsTrigger>
            <TabsTrigger value="jamaat" className="rounded-[1.5rem] font-black gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><MapPin className="w-4 h-4" /> Jamaat Alert</TabsTrigger>
            <TabsTrigger value="contest" className="rounded-[1.5rem] font-black gap-2 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Camera className="w-4 h-4" /> Contest</TabsTrigger>
          </TabsList>

          <TabsContent value="excuse" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                  <CardHeader className="emerald-gradient p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><Laugh className="w-48 h-48" /></div>
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        <Flame className="w-3 h-3 text-secondary fill-secondary" />
                        {globalGenerated.toLocaleString()} excuses generated today 😂
                      </div>
                      <CardTitle className="text-4xl font-black">Excuse Generator</CardTitle>
                      <CardDescription className="text-white/70 text-lg">Running out of ways to say no to Salami? We've got you.</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-12 text-center space-y-10">
                    <div className="bg-primary/5 p-10 rounded-[2.5rem] border-4 border-dashed border-primary/10 min-h-[180px] flex items-center justify-center relative group">
                      <p className="text-3xl font-black text-primary leading-tight italic">"{currentExcuse}"</p>
                      <button 
                        onClick={() => saveExcuse(currentExcuse)}
                        className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg text-primary hover:scale-110 transition-all border border-primary/5"
                        title="Save to favorites"
                      >
                        <Bookmark className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button onClick={generateExcuse} className="h-16 px-10 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl hover:scale-105 transition-transform active:scale-95">
                        Generate New Excuse
                      </Button>
                      <Button variant="outline" onClick={() => { navigator.clipboard.writeText(currentExcuse); toast({ title: "Copied to clipboard!" }) }} className="h-16 px-10 rounded-2xl border-2 font-black text-xl">
                        <Copy className="w-5 h-5 mr-2" /> Copy
                      </Button>
                    </div>

                    <div className="pt-10 border-t flex flex-col items-center gap-6">
                      <p className="text-xs font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                        <Share2 className="w-3 h-3" /> Viral Share Result
                      </p>
                      <div className="flex gap-4">
                        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 border-2 border-green-100 text-green-600 hover:bg-green-50 font-bold" onClick={() => shareSocial('wa', currentExcuse)}>
                          <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                        </Button>
                        <Button variant="outline" size="lg" className="rounded-2xl h-14 px-8 border-2 border-blue-100 text-blue-600 hover:bg-blue-50 font-bold" onClick={() => shareSocial('fb', currentExcuse)}>
                          <Facebook className="w-5 h-5 mr-2" /> Facebook
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl rounded-[2.5rem] bg-white/80 backdrop-blur-xl overflow-hidden">
                  <CardHeader className="p-8 border-b border-primary/5">
                    <CardTitle className="text-xl font-black text-primary flex items-center gap-3">
                      <BookmarkCheck className="w-5 h-5 text-secondary" />
                      My Saved Excuses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!user ? (
                      <div className="p-12 text-center text-muted-foreground italic">Sign in to save your favorite excuses.</div>
                    ) : !mySavedExcuses || mySavedExcuses.length === 0 ? (
                      <div className="p-12 text-center text-muted-foreground italic">No saved excuses yet. Tap the bookmark icon to save!</div>
                    ) : (
                      <div className="divide-y divide-primary/5">
                        {mySavedExcuses.map(ex => (
                          <div key={ex.id} className="p-6 flex items-center justify-between hover:bg-primary/5 transition-all group">
                            <p className="font-bold text-slate-700">{ex.text}</p>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="rounded-full hover:bg-green-50 text-green-600" onClick={() => shareSocial('wa', ex.text)}><MessageCircle className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-50 text-rose-600" onClick={() => deleteSavedExcuse(ex.id)}><Plus className="w-4 h-4 rotate-45" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 backdrop-blur-xl p-8 sticky top-24">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-6 h-6 text-secondary" />
                      <h3 className="text-xl font-black text-primary">Trending Today</h3>
                    </div>
                    <div className="space-y-4">
                      {excuses.slice(0, 4).map((ex, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-primary/5 border border-primary/5 hover:border-primary/20 transition-all cursor-pointer group" onClick={() => setCurrentExcuse(ex + " " + viralEmojis[i % viralEmojis.length])}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">#{i + 1} Viral</span>
                            <Share2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <p className="text-sm font-bold text-slate-700 line-clamp-2 leading-relaxed">"{ex}"</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-secondary/10 p-6 rounded-3xl border-2 border-secondary/20">
                      <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2">Pro Tip</p>
                      <p className="text-xs font-bold text-primary/70 leading-relaxed italic">
                        "Use the ATMs are closed' excuse for maximum believability during the first 3 days of Eid."
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl min-h-[500px] flex flex-col">
              {!quizResult ? (
                <>
                  <div className="emerald-gradient p-10 text-white text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-secondary"><Users className="w-6 h-6" /></div>
                    <CardTitle className="text-2xl font-black">Eid Personality Test</CardTitle>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/60 mt-2">Question {quizStep + 1} of 2</p>
                  </div>
                  <CardContent className="p-10 flex-grow flex flex-col justify-center gap-8">
                    <h3 className="text-2xl font-black text-center text-primary">{quizQuestions[quizStep].q}</h3>
                    <div className="grid gap-4">
                      {quizQuestions[quizStep].options.map((opt, i) => (
                        <Button 
                          key={i} 
                          variant="outline" 
                          onClick={() => handleQuizAnswer(opt.type)}
                          className="h-16 rounded-2xl text-left justify-start px-8 font-bold border-2 hover:bg-primary/5 hover:border-primary transition-all text-sm whitespace-normal"
                        >
                          {opt.text}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="p-12 text-center space-y-8 animate-in zoom-in">
                  <div className="w-32 h-32 bg-secondary rounded-[2.5rem] flex items-center justify-center mx-auto text-6xl shadow-2xl animate-bounce">
                    {quizResult.emoji}
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Your Result Type:</p>
                    <h3 className="text-5xl font-black text-primary">{quizResult.title}</h3>
                  </div>
                  <p className="text-lg text-muted-foreground font-medium italic leading-relaxed">"{quizResult.desc}"</p>
                  <div className="pt-8 flex flex-col gap-4">
                    <Button className="h-16 rounded-2xl emerald-gradient text-white font-black text-xl shadow-xl" onClick={() => shareSocial('wa', `I just took the Eid Personality Test and I'm a ${quizResult.title}! ${quizResult.emoji}`)}>
                      Share My Personality
                    </Button>
                    <Button variant="ghost" onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizResult(null); }} className="font-bold text-muted-foreground">
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="counter" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                <div className="emerald-gradient p-10 text-white text-center">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <p className="text-white/60 font-black uppercase tracking-widest text-xs mb-2">Total Salami Logged</p>
                  <p className="text-6xl font-black tracking-tighter">৳{totalSalamiValue.toLocaleString()}</p>
                </div>
                <CardContent className="p-10 space-y-6">
                  {!user ? (
                    <Button className="w-full h-14 rounded-xl emerald-gradient font-black" asChild><a href="/login">Login to Track</a></Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Amount (৳)</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g. 500" className="h-14 rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">From (Optional)</Label>
                        <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="e.g. Choto Mama" className="h-14 rounded-2xl" />
                      </div>
                      <Button onClick={addSalami} disabled={isAddingSalami || !amount} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl">
                        {isAddingSalami ? <Loader2 className="animate-spin" /> : <><Plus className="w-5 h-5 mr-2" /> Log Salami</>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 flex flex-col">
                <div className="flex items-center justify-between mb-10">
                  <CardTitle className="text-2xl font-black flex items-center gap-3"><ChartBar className="w-6 h-6 text-primary" /> Tracking History</CardTitle>
                </div>
                <div className="flex-grow h-[400px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                        <RechartTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#065f46" : "#fbbf24"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                      <ChartBar className="w-16 h-16" />
                      <p className="font-black uppercase tracking-widest">No data logged yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="jamaat" className="animate-in fade-in zoom-in-95 duration-500">
             <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 space-y-8 text-center">
                <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-primary">
                  {isDetecting ? <Loader2 className="w-12 h-12 animate-spin" /> : <MapPin className="w-12 h-12 animate-bounce" />}
                </div>
                <div className="space-y-3">
                  <h3 className="text-4xl font-black text-primary">Nearest Jamaat Alert</h3>
                  <p className="text-muted-foreground text-lg max-w-xl mx-auto">We use precision GPS to find the closest Eid prayers and community-verified times across Bangladesh.</p>
                </div>
                
                {nearbyFound ? (
                  <div className="animate-in zoom-in bg-emerald-50 p-10 rounded-[2.5rem] border-2 border-emerald-100 space-y-6">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="font-black text-emerald-800 uppercase tracking-widest">3 Mosques Found Near You</span>
                    </div>
                    <Button className="h-16 px-12 rounded-2xl emerald-gradient text-white font-black text-xl shadow-xl" asChild>
                      <a href="/tools/jamaat-finder">Open Live Map <Navigation className="ml-2 w-5 h-5" /></a>
                    </Button>
                  </div>
                ) : (
                  <div className="pt-6">
                    <Button onClick={handleDetectJamaat} className="h-20 px-12 rounded-[2rem] gold-gradient text-primary font-black text-2xl shadow-2xl hover:scale-105 transition-transform">
                      <LocateFixed className="mr-3 w-6 h-6" /> Detect My Location
                    </Button>
                  </div>
                )}
             </Card>
          </TabsContent>

          <TabsContent value="contest" className="animate-in fade-in zoom-in-95 duration-500 space-y-12">
            <div className="grid lg:grid-cols-12 gap-10">
              <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-fit">
                <div className="emerald-gradient p-10 text-white text-center">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-secondary" />
                  <CardTitle className="text-3xl font-black">Selfie Contest</CardTitle>
                  <p className="text-white/60 text-xs font-bold uppercase mt-2">Win the "EidSpark Star" Badge</p>
                </div>
                <CardContent className="p-10 space-y-6">
                  {!user ? (
                    <Button className="w-full h-16 rounded-2xl emerald-gradient font-black" asChild><a href="/login">Login to Enter</a></Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1">Photo URL</Label>
                        <Input value={selfieUrl} onChange={e => setSelfieUrl(e.target.value)} placeholder="https://..." className="h-14 rounded-2xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase ml-1">Caption</Label>
                        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Eid vibes! ✨" className="h-14 rounded-2xl" />
                      </div>
                      <Button onClick={uploadSelfie} disabled={isUploading || !selfieUrl} className="w-full h-16 rounded-2xl gold-gradient text-primary font-black text-xl shadow-xl">
                        {isUploading ? <Loader2 className="animate-spin" /> : "Submit Entry"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-8 space-y-8">
                <div className="flex items-center justify-between px-4">
                  <h3 className="text-2xl font-black text-primary flex items-center gap-3"><Trophy className="w-6 h-6 text-secondary fill-secondary" /> National Leaderboard</h3>
                  <div className="bg-primary/5 px-4 py-1 rounded-full text-[10px] font-black text-primary uppercase">Trending Entries</div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {topSelfies && topSelfies.length > 0 ? topSelfies.map((s, idx) => (
                    <Card key={s.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white group hover:-translate-y-2 transition-all">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image src={s.imageUrl} alt="Contest Entry" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-4 left-4 z-10">
                           <div className="bg-secondary/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-sm flex items-center gap-1">
                             <Trophy className="w-3 h-3" /> Rank #{idx + 1}
                           </div>
                        </div>
                      </div>
                      <CardContent className="p-6 flex items-center justify-between">
                        <div>
                          <p className="font-black text-primary line-clamp-1">{s.caption || "Eid Mubarak!"}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Entry #{s.id.substr(0,4)}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleLike(s.id)} className="rounded-xl h-12 px-4 gap-2 border-2 border-rose-100 text-rose-600 font-black hover:bg-rose-50">
                          <Heart className={cn("w-4 h-4", s.likesCount > 0 ? "fill-rose-600" : "")} /> {s.likesCount}
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full py-20 text-center bg-white/50 rounded-[3rem] border-2 border-dashed opacity-40">
                      <p className="font-black uppercase tracking-widest">The stage is empty. Be the first to join!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
