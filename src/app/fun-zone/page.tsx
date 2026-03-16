
"use client"

import { useState, useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
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
  TrendingUp,
  Star,
  CheckCircle2,
  MessageSquare,
  Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, query, orderBy, limit, doc, increment, setDoc, deleteDoc, updateDoc } from "firebase/firestore"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { awardPoints } from "@/lib/gamification-utils"
import confetti from 'canvas-confetti'

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
  },
  {
    q: "Eid এর শপিং কবে করো?",
    options: [
      { text: "চাঁদ রাতে তাড়াহুড়ো করে", type: "Salami Hunter" },
      { text: "এক মাস আগে শান্তিমতো", type: "Shopping Master" },
      { text: "কিনি না, উপহার পাই", type: "Masjid Lover" },
      { text: "পুরো শপিং মল ঘুরে কয়েকবার", type: "Shopping Master" }
    ]
  },
  {
    q: "ঈদে সেমাই খাওয়ার পর কি করো?",
    options: [
      { text: "সাথে সাথে ঘুম দেই", type: "Food Warrior" },
      { text: "প্রতিবেশীর বাসায় ঘুরতে যাই", type: "Masjid Lover" },
      { text: "বড়দের পা ছুয়ে সালামি খুঁজি", type: "Salami Hunter" },
      { text: "১০০টা সেলফি তুলি", type: "Shopping Master" }
    ]
  },
  {
    q: "তোমার সেরা ঈদ গিফট কি হতে পারে?",
    options: [
      { text: "এক গাদা সালামি (কড়কড়ে নোট)", type: "Salami Hunter" },
      { text: "সবার ভালোবাসা ও দোয়া", type: "Masjid Lover" },
      { text: "এক হাড়ি কাচ্চি বিরিয়ানি", type: "Food Warrior" },
      { text: "ব্র্যান্ডেড ঘড়ি বা পাঞ্জাবি", type: "Shopping Master" }
    ]
  }
]

export default function FunZone() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Excuse Generator State
  const [currentExcuse, setCurrentExcuse] = useState(excuses[0])
  const [currentEmoji, setCurrentEmoji] = useState(viralEmojis[0])
  const [viralReach, setViralReach] = useState(65)
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

  // Fetch Data
  const savedExcusesRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "savedExcuses"), orderBy("savedAt", "desc"))
  }, [db, user])
  const { data: mySavedExcuses } = useCollection(savedExcusesRef)

  const salamiRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "salamiEntries"), orderBy("createdAt", "desc"))
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
    setCurrentExcuse(base)
    setCurrentEmoji(emoji)
    setViralReach(Math.floor(Math.random() * 40) + 60)
    setGlobalGenerated(prev => prev + 1)
    
    // Tiny celebration
    confetti({
      particleCount: 20,
      spread: 30,
      origin: { y: 0.6 },
      colors: ['#fbbf24', '#065f46']
    })

    // Award Points
    if (user && db) {
      awardPoints(db, user.uid, 'GenerateExcuse')
    }
  }

  const saveExcuse = async (excuseText: string) => {
    if (!user || !db) {
      toast({ title: "Sign in required", description: "Log in to save your favorite excuses!" })
      return
    }
    
    const fullText = `${excuseText} ${currentEmoji}`
    if (mySavedExcuses?.find(e => e.text === fullText)) {
      toast({ title: "Already saved!" })
      return
    }

    setIsSavingExcuse(true)
    try {
      await addDoc(collection(db, "users", user.uid, "savedExcuses"), {
        text: fullText,
        savedAt: new Date().toISOString()
      })
      toast({ title: "Saved to Profile! 🌙" })
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
    const fullText = `${text} ${currentEmoji}`
    const url = encodeURIComponent(window.location.href)
    const quote = encodeURIComponent(fullText)
    if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`, '_blank')
    } else {
      window.open(`https://wa.me/?text=${quote}%20${url}`, '_blank')
    }
  }

  const handleQuizAnswer = (type: string) => {
    const newAnswers = [...quizAnswers, type]
    setQuizAnswers(newAnswers)
    if (quizStep < quizQuestions.length - 1) { 
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
      
      // Award Points
      if (user && db) {
        awardPoints(db, user.uid, 'PersonalityTest')
      }
    }
  }

  const addSalami = async () => {
    if (!user || !db || !amount) return
    setIsAddingSalami(true)
    try {
      await addDoc(collection(db, "users", user.uid, "salamiEntries"), {
        trackerUserId: user.uid,
        amount: Number(amount),
        giverName: from || "Unknown",
        receivedDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      })
      toast({ title: "Salami Added! ৳" })
      setAmount(""); setFrom("")
      awardPoints(db, user.uid, 'SalamiCalc')
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
        userName: user.displayName || "Friend",
        imageUrl: selfieUrl,
        caption: caption || "Eid vibes! ✨",
        likesCount: 0,
        uploadedAt: new Date().toISOString()
      })
      toast({ title: "Selfie Posted to Contest! 📸" })
      setSelfieUrl(""); setCaption("")
      awardPoints(db, user.uid, 'UploadSelfie')
    } catch (e) {} finally { setIsUploading(false) }
  }

  const handleLikeSelfie = async (id: string) => {
    if (!db || !user) {
      toast({ title: "Sign in required" });
      return;
    }
    try {
      await updateDoc(doc(db, "eidSelfies", id), {
        likesCount: increment(1)
      });
      awardPoints(db, user.uid, 'ReceiveLike');
    } catch (e) {}
  }

  const totalSalamiValue = salamiRecords?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0
  const chartData = [...(salamiRecords || [])].reverse().slice(-10).map(r => ({ name: r.giverName || "...", amount: r.amount }))

  return (
    <div className="min-h-screen bg-background islamic-pattern pb-20 selection:bg-secondary selection:text-primary transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-16 space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest border border-primary/20 backdrop-blur-md shadow-sm">
            <Sparkles className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
            <span>Official Eid Viral Zone</span>
          </div>
          <h1 className="text-6xl lg:text-[100px] font-black text-primary dark:text-white tracking-tighter leading-none">Social Hub</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            The playground for your festive energy. Earn rewards, discover your archetype, and join the national contest!
          </p>
        </header>

        <Tabs defaultValue="excuse" className="w-full space-y-12">
          <TabsList className="flex flex-wrap justify-center w-full gap-2 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-primary/5 h-auto overflow-hidden">
            <TabsTrigger value="excuse" className="rounded-full font-black gap-2 py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Laugh className="w-4 h-4" /> Excuses</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-full font-black gap-2 py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Users className="w-4 h-4" /> Personality</TabsTrigger>
            <TabsTrigger value="counter" className="rounded-full font-black gap-2 py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Wallet className="w-4 h-4" /> Counter</TabsTrigger>
            <TabsTrigger value="jamaat" className="rounded-full font-black gap-2 py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><MapPin className="w-4 h-4" /> Jamaat Alert</TabsTrigger>
            <TabsTrigger value="contest" className="rounded-full font-black gap-2 py-3 px-8 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"><Camera className="w-4 h-4" /> Contest</TabsTrigger>
          </TabsList>

          {/* Excuse Generator Tab */}
          <TabsContent value="excuse" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary/5 blur-[80px] rounded-full opacity-50 -z-10 group-hover:opacity-80 transition-opacity"></div>
                  
                  <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20">
                    <CardHeader className="emerald-gradient p-12 text-white text-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><MessageSquare className="w-48 h-48" /></div>
                      <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 shadow-sm animate-pulse">
                          <Flame className="w-3 h-3 text-secondary fill-secondary" />
                          {globalGenerated.toLocaleString()} active interactions today
                        </div>
                        <CardTitle className="text-5xl font-black tracking-tight">Excuse Generator</CardTitle>
                        <CardDescription className="text-white/70 text-lg">Smart ways to dodge the Salami request gracefully.</CardDescription>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-12 text-center space-y-12">
                      <div className="relative">
                        <div className="text-8xl mb-6 animate-bounce">{currentEmoji}</div>
                        {/* Chat-style speech bubble with CSS triangle */}
                        <div className="relative">
                          <div className="bg-primary/5 p-12 rounded-[2.5rem] border-4 border-dashed border-primary/10 relative group hover:bg-primary/[0.07] transition-all">
                            <p className="text-4xl font-black text-primary leading-tight italic">"{currentExcuse}"</p>
                            <button 
                              onClick={() => saveExcuse(currentExcuse)}
                              className="absolute -top-6 right-6 p-4 bg-white rounded-full shadow-2xl text-primary hover:scale-110 transition-all border border-primary/5 hover:bg-secondary hover:text-white"
                              title="Save to profile"
                            >
                              <Bookmark className="w-6 h-6" />
                            </button>
                          </div>
                          {/* Bubble Arrow */}
                          <div className="absolute left-1/2 -bottom-4 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-primary/5"></div>
                        </div>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                          <span>Viral Reach Intensity</span>
                          <span className="text-primary">{viralReach}% High</span>
                        </div>
                        <Progress value={viralReach} className="h-2.5 bg-primary/10" />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={generateExcuse} className="h-20 px-12 rounded-[2rem] gold-gradient text-primary font-black text-2xl shadow-2xl hover:scale-105 transition-all active:scale-95 animate-glow">
                          Generate Magic
                        </Button>
                        <Button variant="outline" onClick={() => { navigator.clipboard.writeText(`${currentExcuse} ${currentEmoji}`); toast({ title: "Copied!" }) }} className="h-20 px-12 rounded-[2rem] border-4 border-slate-100 font-black text-2xl hover:bg-slate-50">
                          <Copy className="w-6 h-6 mr-2" /> Copy
                        </Button>
                      </div>

                      <div className="pt-12 border-t border-primary/5 flex flex-col items-center gap-8">
                        <p className="text-xs font-black uppercase text-muted-foreground tracking-[0.3em]">Viral Sharing Hub</p>
                        <div className="flex flex-wrap justify-center gap-4">
                          <Button variant="outline" className="rounded-full h-14 px-8 border-2 border-green-100 text-green-600 hover:bg-green-50 font-black shadow-sm" onClick={() => shareSocial('wa', currentExcuse)}>
                            <MessageCircle className="w-5 h-5 mr-3" /> WhatsApp
                          </Button>
                          <Button variant="outline" className="rounded-full h-14 px-8 border-2 border-blue-100 text-blue-600 hover:bg-blue-50 font-black shadow-sm" onClick={() => shareSocial('fb', currentExcuse)}>
                            <Facebook className="w-5 h-5 mr-3" /> Facebook
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-xl rounded-[3rem] bg-white/80 backdrop-blur-xl overflow-hidden border border-white/20">
                  <CardHeader className="p-10 border-b border-primary/5 bg-primary/5">
                    <CardTitle className="text-2xl font-black text-primary flex items-center gap-3">
                      <BookmarkCheck className="w-6 h-6 text-secondary" />
                      Saved To My Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {!user ? (
                      <div className="p-16 text-center text-muted-foreground italic font-medium">Log in to build your personal excuse library.</div>
                    ) : !mySavedExcuses || mySavedExcuses.length === 0 ? (
                      <div className="p-16 text-center text-muted-foreground italic font-medium">Your library is empty. Tap the bookmark icon to save!</div>
                    ) : (
                      <div className="divide-y divide-primary/5">
                        {mySavedExcuses.map(ex => (
                          <div key={ex.id} className="p-8 flex items-center justify-between hover:bg-primary/5 transition-all group">
                            <p className="font-bold text-slate-700 text-lg">{ex.text}</p>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-green-50 text-green-600" onClick={() => shareSocial('wa', ex.text)}><MessageCircle className="w-5 h-5" /></Button>
                              <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 hover:bg-rose-50 text-rose-600" onClick={() => deleteSavedExcuse(ex.id)}><Plus className="w-5 h-5 rotate-45" /></Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <Card className="border-none shadow-2xl rounded-[3rem] bg-white/80 backdrop-blur-xl p-10 sticky top-24 border border-white/20">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-secondary" />
                        <h3 className="text-2xl font-black text-primary tracking-tight">Top Trending</h3>
                      </div>
                      <Zap className="w-5 h-5 text-secondary animate-pulse fill-secondary" />
                    </div>
                    <div className="space-y-5">
                      {excuses.slice(0, 5).map((ex, i) => (
                        <div 
                          key={i} 
                          className="p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-primary/20 hover:bg-white transition-all cursor-pointer group shadow-sm"
                          onClick={() => {
                            setCurrentExcuse(ex)
                            setCurrentEmoji(viralEmojis[i % viralEmojis.length])
                            setViralReach(90 - i * 5)
                          }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em]">#{i + 1} Viral Trend</span>
                            <div className="flex items-center gap-1.5 bg-primary/5 px-2 py-0.5 rounded-full">
                              <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                              <span className="text-[10px] font-bold text-primary">{(150 - i * 15).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-sm font-black text-slate-700 line-clamp-2 leading-relaxed">"{ex}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Personality Test Tab */}
          <TabsContent value="quiz" className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="max-w-3xl mx-auto border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl min-h-[600px] flex flex-col border border-white/20">
              {!quizResult ? (
                <>
                  <div className="emerald-gradient p-12 text-white text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none islamic-pattern"></div>
                    <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 text-secondary backdrop-blur-md border border-white/10"><Users className="w-8 h-8" /></div>
                    <CardTitle className="text-4xl font-black tracking-tight">Personality Test</CardTitle>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-white/60 mt-3">Question {quizStep + 1} of {quizQuestions.length}</p>
                  </div>
                  <CardContent className="p-12 flex-grow flex flex-col justify-center gap-10">
                    <h3 className="text-3xl font-black text-center text-primary leading-tight">{quizQuestions[quizStep].q}</h3>
                    <div className="grid gap-4">
                      {quizQuestions[quizStep].options.map((opt, i) => (
                        <Button 
                          key={i} 
                          variant="outline" 
                          onClick={() => handleQuizAnswer(opt.type)}
                          className="h-20 rounded-[2rem] text-left justify-start px-10 font-black border-2 border-slate-100 hover:border-primary hover:bg-primary/5 transition-all text-lg whitespace-normal group"
                        >
                          <span className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xs text-muted-foreground mr-4 group-hover:bg-primary group-hover:text-white transition-colors">{String.fromCharCode(65 + i)}</span>
                          {opt.text}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="p-16 text-center space-y-10 animate-in zoom-in">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-secondary blur-[60px] opacity-40 animate-pulse"></div>
                    <div className="w-40 h-40 bg-secondary rounded-[3.5rem] flex items-center justify-center mx-auto text-8xl shadow-2xl relative z-10 animate-bounce">
                      {quizResult.emoji}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.4em]">Your Eid Archetype:</p>
                    <h3 className="text-6xl font-black text-primary tracking-tighter">{quizResult.title}</h3>
                  </div>
                  <div className="bg-primary/5 p-10 rounded-[3rem] border-2 border-primary/10">
                    <p className="text-2xl text-slate-700 font-medium italic leading-relaxed">"{quizResult.desc}"</p>
                  </div>
                  <div className="pt-10 flex flex-col gap-4 max-w-md mx-auto">
                    <Button className="h-20 rounded-[2rem] emerald-gradient text-white font-black text-2xl shadow-2xl hover:scale-105 transition-all" onClick={() => shareSocial('wa', `I just took the Eid Personality Test and I'm a ${quizResult.title}! ${quizResult.emoji}`)}>
                      Share Result
                    </Button>
                    <Button variant="ghost" onClick={() => { setQuizStep(0); setQuizAnswers([]); setQuizResult(null); }} className="font-black text-muted-foreground uppercase tracking-widest text-xs">
                      Retake Quiz
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Salami Counter Tab */}
          <TabsContent value="counter" className="animate-in fade-in zoom-in-95 duration-500">
            <div className="grid lg:grid-cols-12 gap-10">
              <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 h-fit">
                <div className="emerald-gradient p-12 text-white text-center relative">
                  <div className="absolute inset-0 opacity-10 pointer-events-none islamic-pattern"></div>
                  <Wallet className="w-16 h-16 mx-auto mb-6 text-secondary" />
                  <p className="text-white/60 font-black uppercase tracking-[0.3em] text-[10px] mb-2">Grand Total Salami</p>
                  <p className="text-7xl font-black tracking-tighter">৳{totalSalamiValue.toLocaleString()}</p>
                </div>
                <CardContent className="p-10 space-y-8">
                  {!user ? (
                    <Button className="w-full h-16 rounded-[1.5rem] emerald-gradient font-black text-lg" asChild><a href="/login">Login to Start Tracking</a></Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Amount (৳)</Label>
                        <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="500" className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-xl font-bold" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-2">From Person</Label>
                        <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="Choto Mama" className="h-16 rounded-2xl bg-slate-50 border-none px-6 text-lg" />
                      </div>
                      <Button onClick={addSalami} disabled={isAddingSalami || !amount} className="w-full h-20 rounded-[2rem] gold-gradient text-primary font-black text-2xl shadow-2xl hover:scale-105 transition-all">
                        {isAddingSalami ? <Loader2 className="animate-spin" /> : <><Plus className="w-6 h-6 mr-3" /> Log Record</>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-12 flex flex-col border border-white/20">
                <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                    <CardTitle className="text-3xl font-black flex items-center gap-3 text-primary"><ChartBar className="w-8 h-8" /> Visual History</CardTitle>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last 10 generous donations</p>
                  </div>
                </div>
                <div className="flex-grow h-[450px]">
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                        <Tooltip 
                          cursor={{fill: 'rgba(6, 95, 70, 0.05)'}}
                          contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }} 
                        />
                        <Bar dataKey="amount" radius={[12, 12, 0, 0]} barSize={40}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#065f46" : "#fbbf24"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-6">
                      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center"><ChartBar className="w-12 h-12" /></div>
                      <p className="font-black uppercase tracking-[0.3em] text-sm">No analytics available yet</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Jamaat Alert Tab */}
          <TabsContent value="jamaat" className="animate-in fade-in zoom-in-95 duration-500">
             <Card className="max-w-4xl mx-auto border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-16 space-y-10 text-center border border-white/20">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-primary blur-[60px] opacity-20"></div>
                  <div className="w-32 h-32 bg-primary/5 rounded-[3.5rem] flex items-center justify-center mx-auto text-primary relative z-10">
                    <MapPin className="w-16 h-16 animate-bounce" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="text-5xl font-black text-primary tracking-tight">Precision Jamaat Locator</h3>
                  <p className="text-muted-foreground text-xl max-w-xl mx-auto leading-relaxed font-medium">Find the nearest verified Eid congregations using real-time GPS synchronization.</p>
                </div>
                
                <div className="pt-8">
                  <Button className="h-24 px-16 rounded-[2.5rem] gold-gradient text-primary font-black text-3xl shadow-2xl hover:scale-105 transition-all" asChild>
                    <a href="/tools/jamaat-finder"><LocateFixed className="mr-4 w-8 h-8" /> Detect Nearby Locations</a>
                  </Button>
                </div>
             </Card>
          </TabsContent>

          {/* Selfie Contest Tab */}
          <TabsContent value="contest" className="animate-in fade-in zoom-in-95 duration-500 space-y-12">
            <div className="grid lg:grid-cols-12 gap-10">
              <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl h-fit border border-white/20">
                <div className="emerald-gradient p-12 text-white text-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10 pointer-events-none islamic-pattern"></div>
                  <Camera className="w-16 h-16 mx-auto mb-6 text-secondary" />
                  <CardTitle className="text-4xl font-black tracking-tight">Selfie Contest</CardTitle>
                  <p className="text-white/60 text-xs font-black uppercase tracking-widest mt-3">Be the next "EidSpark Star"</p>
                </div>
                <CardContent className="p-10 space-y-8">
                  {!user ? (
                    <Button className="w-full h-20 rounded-[2rem] emerald-gradient font-black text-2xl shadow-xl" asChild><a href="/login">Join the Stage</a></Button>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Direct Photo Link</Label>
                        <Input value={selfieUrl} onChange={e => setSelfieUrl(e.target.value)} placeholder="https://imgur.com/..." className="h-16 rounded-2xl bg-slate-50 border-none px-6" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-2">Festive Caption</Label>
                        <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Eid vibes! ✨" className="h-16 rounded-2xl bg-slate-50 border-none px-6" />
                      </div>
                      <Button onClick={uploadSelfie} disabled={isUploading || !selfieUrl} className="w-full h-20 rounded-[2rem] gold-gradient text-primary font-black text-2xl shadow-2xl hover:scale-105 transition-all">
                        {isUploading ? <Loader2 className="animate-spin" /> : "Submit To Contest"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-8 space-y-10">
                <div className="flex items-center justify-between px-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-primary flex items-center gap-3"><Trophy className="w-8 h-8 text-secondary fill-secondary" /> National Board</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Global Top 10 Performances</p>
                  </div>
                  <div className="bg-primary/10 px-5 py-2 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] backdrop-blur-md">Viral Trends</div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-8">
                  {topSelfies && topSelfies.length > 0 ? topSelfies.map((s, idx) => (
                    <Card key={s.id} className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white group hover:-translate-y-3 transition-all duration-500 hover:shadow-[0_48px_96px_-12px_rgba(6,95,70,0.2)]">
                      <div className="aspect-square relative overflow-hidden bg-slate-100">
                        <Image src={s.imageUrl} alt="Contest Entry" fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute top-6 left-6 z-10">
                           <div className="bg-secondary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-primary shadow-2xl border border-white/20 flex items-center gap-2">
                             <Trophy className="w-4 h-4" /> Position #{idx + 1}
                           </div>
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-6 right-6 z-10">
                            <div className="bg-primary/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-2xl flex items-center gap-2 border border-white/20">
                              <Star className="w-4 h-4 text-secondary fill-secondary" /> Champion
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-8 flex items-center justify-between bg-white">
                        <div className="space-y-1">
                          <p className="font-black text-primary text-xl truncate max-w-[180px]">{s.caption || "Eid Mubarak!"}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Contributor: {s.userName}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleLikeSelfie(s.id)} className="rounded-[1.5rem] h-14 px-6 gap-3 border-2 border-rose-100 text-rose-600 font-black hover:bg-rose-50 shadow-sm">
                          <Heart className={cn("w-5 h-5", s.likesCount > 0 ? "fill-rose-600" : "")} /> {s.likesCount}
                        </Button>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="col-span-full py-32 text-center bg-white/50 rounded-[4rem] border-4 border-dashed border-primary/10 opacity-40">
                      <p className="font-black uppercase tracking-[0.4em] text-primary">Be the pioneer. Upload now.</p>
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
