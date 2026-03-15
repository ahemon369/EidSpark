
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calculator, 
  Send, 
  Wallet, 
  Timer, 
  MapPin, 
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  Camera,
  Moon,
  Facebook,
  Instagram,
  MessageCircle,
  Layout,
  Map as MapIcon,
  Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const tools = [
  {
    title: "Zakat Calculator",
    description: "Calculate your zakat obligation in BDT accurately with our modern tool.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "Greeting Generator",
    description: "Create AI-powered Eid cards with traditional Bangladeshi motifs.",
    icon: Send,
    href: "/tools/greeting",
    color: "bg-amber-100 text-amber-700"
  },
  {
    title: "Selfie Frame",
    description: "Decorate your Eid selfies with beautiful themed frames and share.",
    icon: Camera,
    href: "/tools/selfie",
    color: "bg-orange-100 text-orange-700"
  },
  {
    title: "Salami Tracker",
    description: "Keep track of your Eid Eidi/Salami and join the national leaderboard.",
    icon: Wallet,
    href: "/tools/salami",
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Eid Countdown",
    description: "Animated countdown to Eid-ul-Fitr and Eid-ul-Adha for Bangladesh.",
    icon: Timer,
    href: "/tools/countdown",
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "Mosque & Prayer",
    description: "Find mosques near you and stay on track with accurate prayer times.",
    icon: MapPin,
    href: "/tools/mosque",
    color: "bg-rose-100 text-rose-700"
  }
]

const highlights = [
  {
    title: "AI Greeting Generator",
    description: "Our trilingual AI creates heartfelt blessings in Bangla, English, and Arabic, tailored just for your loved ones.",
    icon: Sparkles,
    color: "text-amber-500"
  },
  {
    title: "Mosque Finder Map",
    description: "Real-time navigation to the nearest mosques across all divisions of Bangladesh with accurate prayer timings.",
    icon: MapIcon,
    color: "text-emerald-500"
  },
  {
    title: "Eid Selfie Frame Creator",
    description: "Replace backgrounds and add premium architectural frames to your festive photos instantly.",
    icon: Layout,
    color: "text-blue-500"
  }
]

export default function Home() {
  const [previewIndex, setPreviewIndex] = useState(0)
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  const previews = [
    {
      label: "Greeting Designer",
      title: "Eid Mubarak Card",
      desc: "AI-generated trilingual blessings.",
      icon: Send,
      image: PlaceHolderImages.find(img => img.id === "preview-greeting")?.imageUrl || "",
      hint: PlaceHolderImages.find(img => img.id === "preview-greeting")?.imageHint || "eid greeting"
    },
    {
      label: "Selfie Studio",
      title: "Royal Arch Frame",
      desc: "AI background replacement active.",
      icon: Camera,
      image: PlaceHolderImages.find(img => img.id === "preview-selfie")?.imageUrl || "",
      hint: PlaceHolderImages.find(img => img.id === "preview-selfie")?.imageHint || "eid selfie"
    },
    {
      label: "Mosque Finder",
      title: "Nearby Prayer Locations",
      desc: "Real-time markers in Dhaka.",
      icon: MapIcon,
      image: PlaceHolderImages.find(img => img.id === "preview-map")?.imageUrl || "",
      hint: PlaceHolderImages.find(img => img.id === "preview-map")?.imageHint || "mosque map"
    }
  ]

  // Auto-cycling Hero Preview
  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previews.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [previews.length])

  // Live Countdown logic
  useEffect(() => {
    const target = new Date()
    target.setDate(target.getDate() + 18) // Simulated future Eid date
    
    const tick = () => {
      const now = new Date().getTime()
      const diff = target.getTime() - now
      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        })
      }
    }
    const timer = setInterval(tick, 1000)
    tick()
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white islamic-pattern">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 emerald-gradient">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             <div className="absolute top-20 right-[10%] animate-float">
               <Moon className="w-40 h-40 text-secondary fill-secondary" />
             </div>
             <div className="absolute bottom-20 left-[5%] animate-float delay-1000">
               <Sparkles className="w-32 h-32 text-secondary/40" />
             </div>
             <div className="absolute inset-0 opacity-10 islamic-pattern"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold tracking-wide backdrop-blur-md shadow-xl">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>The Ultimate Eid Companion for Bangladesh</span>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight">
                    EidSpark – <span className="text-secondary drop-shadow-2xl">Spark</span> Your Celebration
                  </h1>
                  
                  <p className="text-xl text-white/80 max-w-xl leading-relaxed font-medium">
                    Smart Eid tools for everyone in Bangladesh. From Zakat calculation to AI Eid greetings and mosque finding.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-5">
                  <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 rounded-2xl px-12 h-16 text-xl font-black shadow-2xl hover:scale-105 transition-all" asChild>
                    <Link href="#tools">Explore Tools <ChevronRight className="ml-2 w-6 h-6" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-2xl px-12 h-16 text-xl font-black border-2 border-white/30 text-white hover:bg-white/10 transition-all backdrop-blur-sm shadow-xl" asChild>
                    <Link href="/tools/greeting">Create Greeting</Link>
                  </Button>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-emerald-900 bg-muted overflow-hidden shadow-lg transition-transform hover:scale-110 hover:z-20">
                          <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" width={48} height={48} />
                        </div>
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-900 bg-secondary flex items-center justify-center text-primary font-black text-xs shadow-lg">
                        +10k
                      </div>
                    </div>
                    <div className="text-sm font-bold text-white/70">
                      <span className="text-white block text-lg font-black tracking-tight">10,000+ Active Users</span>
                      In Dhaka, Chittagong, Sylhet & Rajshahi
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Hero Preview */}
              <div className="relative animate-in fade-in zoom-in duration-1000 delay-200 hidden lg:block">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                   <div className="bg-secondary text-primary px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl border-2 border-white/20 animate-pulse">
                     Live Feature Preview
                   </div>
                </div>

                <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_48px_96px_-12px_rgba(0,0,0,0.5)] border-8 border-white/10 bg-white/5 backdrop-blur-md aspect-square max-w-lg mx-auto">
                  {previews.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "absolute inset-0 transition-all duration-1000 ease-in-out",
                        previewIndex === idx ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95 pointer-events-none"
                      )}
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover opacity-90"
                          priority={idx === 0}
                          data-ai-hint={item.hint}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-12 left-10 right-10 text-white glass-card p-8 rounded-[2.5rem] border-white/20 bg-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <item.icon className="w-6 h-6 text-secondary" />
                          <span className="text-xs font-black uppercase tracking-[0.2em] text-secondary">{item.label}</span>
                        </div>
                        <h4 className="text-3xl font-black mb-2">{item.title}</h4>
                        <p className="text-white/70 font-medium">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-[30rem] h-[30rem] bg-primary/30 rounded-full blur-[140px] -z-10 animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Countdown Section */}
        <section className="relative -mt-16 z-20 px-4">
          <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] border border-primary/5">
             <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl emerald-gradient flex items-center justify-center text-white shadow-lg">
                      <Timer className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-primary">Eid-ul-Fitr Countdown</h3>
                      <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Stay Excited • Stay Blessed</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 md:gap-8">
                   {[
                     { label: "Days", value: countdown.days },
                     { label: "Hours", value: countdown.hours },
                     { label: "Mins", value: countdown.minutes },
                     { label: "Secs", value: countdown.seconds }
                   ].map((t) => (
                     <div key={t.label} className="text-center group">
                        <div className="text-4xl md:text-5xl font-black text-primary drop-shadow-sm group-hover:text-secondary transition-colors duration-300 tabular-nums">
                          {t.value.toString().padStart(2, '0')}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
                          {t.label}
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-16 relative bg-white/30 backdrop-blur-sm border-b border-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                  <Users className="w-3 h-3" />
                  <span>The Community Choice</span>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-slate-800">Trusted by Muslims across Bangladesh</h3>
              </div>
              
              <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20">
                <div className="group">
                  <div className="text-5xl font-black text-primary group-hover:text-secondary transition-colors duration-300">10,000+</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Active Users</p>
                </div>
                
                <div className="hidden lg:block w-px h-16 bg-slate-200"></div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center lg:text-left">Serving all major divisions</p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'].map((city) => (
                      <span key={city} className="px-4 py-1.5 rounded-xl bg-white text-primary font-bold text-xs border-2 border-primary/5 shadow-sm hover:border-primary/20 transition-all cursor-default">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-32 relative bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <h2 className="text-4xl lg:text-7xl font-black text-primary tracking-tight">Powerful Tools for Your Eid</h2>
              <p className="text-xl text-muted-foreground font-medium">Everything you need for a blessed celebration in one beautiful place.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {tools.map((tool, index) => (
                <Link key={tool.title} href={tool.href} className="group">
                  <Card className="h-full border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(6,95,70,0.15)] transition-all duration-200 ease-in-out rounded-[3rem] overflow-hidden group-hover:-translate-y-2 active:scale-95 border-2 border-transparent hover:border-primary/5">
                    <CardHeader className="p-12 pb-0">
                      <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center mb-10 transition-transform duration-200 ease-in-out group-hover:scale-110 shadow-lg", tool.color)}>
                        <tool.icon className="w-10 h-10" />
                      </div>
                      <CardTitle className="text-3xl font-black group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                      <CardDescription className="text-lg mt-6 leading-relaxed font-medium">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 pt-8 flex justify-end">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:scale-110 group-hover:translate-x-2 transition-all duration-200 ease-in-out">
                        <ArrowRight className="w-7 h-7" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mosque Finder Highlight */}
        <section className="py-24 px-4">
          <div className="max-w-7xl mx-auto emerald-gradient rounded-[4rem] p-12 lg:p-24 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8 text-white">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-secondary" />
                    <span>Explore Bangladesh</span>
                  </div>
                  <h2 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">Find Mosques Near You 🕌</h2>
                  <p className="text-xl text-white/80 font-medium max-w-lg">
                    Discover nearby mosques across Bangladesh with real-time locations and accurate prayer times. Perfect for Eid prayers or daily congregation.
                  </p>
                  <Button size="lg" className="bg-secondary text-primary font-black px-12 h-16 rounded-2xl text-xl hover:scale-105 transition-all shadow-xl" asChild>
                    <Link href="/tools/mosque">Open Mosque Map</Link>
                  </Button>
               </div>
               
               <div className="relative hidden lg:block">
                  <div className="aspect-[4/3] bg-white/10 rounded-[3rem] border-8 border-white/10 backdrop-blur-md relative overflow-hidden group animate-float">
                     <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
                     <MapIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 text-white/20" />
                     {/* Floating marker simulations with pulsing animation */}
                     <div className="absolute top-[20%] left-[30%] w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-2xl border-2 border-white animate-pulse">
                        <MapPin className="w-5 h-5 text-primary" />
                     </div>
                     <div className="absolute top-[60%] left-[70%] w-10 h-10 bg-secondary rounded-full flex items-center justify-center shadow-2xl border-2 border-white animate-pulse delay-700">
                        <MapPin className="w-5 h-5 text-primary" />
                     </div>
                  </div>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </section>

        {/* Feature Highlights Section */}
        <section className="py-32 bg-accent/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 transform translate-x-1/2"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
             <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
                <h2 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Everything You Need for Eid in One Place</h2>
                <p className="text-lg text-muted-foreground font-medium">Smart, intuitive, and built for the community.</p>
             </div>

             <div className="grid md:grid-cols-3 gap-12">
               {highlights.map((item, idx) => (
                 <div key={idx} className="space-y-6 group">
                   <div className={cn("w-20 h-20 rounded-[2.5rem] bg-white shadow-xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:-rotate-3", item.color)}>
                     <item.icon className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-black text-primary">{item.title}</h3>
                   <p className="text-muted-foreground font-medium leading-relaxed">
                     {item.description}
                   </p>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="emerald-gradient rounded-[4rem] p-20 lg:p-32 relative overflow-hidden shadow-[0_64px_128px_-12px_rgba(6,95,70,0.3)]">
              <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center text-white">
                <div className="space-y-10 text-center lg:text-left">
                  <h2 className="text-5xl lg:text-7xl font-black leading-tight">Ready to Spark Your Eid?</h2>
                  <p className="text-white/80 text-2xl font-medium max-w-md mx-auto lg:mx-0">
                    Join thousands of Bangladeshi families making their Eid more organized and joyful.
                  </p>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-6">
                    <Button size="lg" className="bg-secondary text-primary font-black px-12 h-20 rounded-3xl text-2xl hover:scale-105 transition-transform shadow-2xl" asChild>
                      <Link href="/login">Get Started Free</Link>
                    </Button>
                    <Button size="lg" variant="outline" className="border-2 border-white/30 text-white font-black px-12 h-20 rounded-3xl text-2xl hover:bg-white/10 transition-all backdrop-blur-sm shadow-xl" asChild>
                      <Link href="#tools">Explore Eid Tools</Link>
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                   <div className="relative aspect-square w-full max-w-md mx-auto">
                     <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse blur-3xl"></div>
                     <Star className="absolute top-0 right-0 w-32 h-32 text-secondary fill-secondary animate-float shadow-secondary/50" />
                     <Star className="absolute bottom-12 left-0 w-20 h-20 text-secondary/30 fill-secondary/30 animate-float delay-700" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 rounded-full border-[12px] border-white/10 flex items-center justify-center animate-spin-slow">
                           <Sparkles className="w-24 h-24 text-secondary/40 drop-shadow-[0_0_20px_rgba(233,190,36,0.5)]" />
                        </div>
                     </div>
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-secondary/20 rounded-full blur-[80px]"></div>
                   </div>
                </div>
              </div>
              
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-white/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[40rem] h-[40rem] bg-secondary/20 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 space-y-8">
              <Link href="/" className="flex items-center gap-4">
                <div className="relative w-14 h-14 overflow-hidden flex items-center justify-center">
                  {logo?.imageUrl && (
                    <Image 
                      src={logo.imageUrl} 
                      alt="EidSpark Official Logo" 
                      width={56} 
                      height={56} 
                      className="object-contain"
                    />
                  )}
                </div>
                <span className="text-3xl font-black tracking-tight text-primary">EidSpark</span>
              </Link>
              <div className="space-y-4">
                <h4 className="text-lg font-black text-primary uppercase tracking-widest">About EidSpark</h4>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Empowering the Bangladeshi community with smart Eid tools. Our mission is to blend tradition with modern technology for a more meaningful celebration.
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-black text-primary uppercase tracking-widest mb-8">Tools</h4>
              <ul className="space-y-5 text-muted-foreground font-bold">
                <li><Link href="/tools/zakat" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Zakat Calculator</Link></li>
                <li><Link href="/tools/greeting" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Greeting Generator</Link></li>
                <li><Link href="/tools/selfie" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Selfie Frame</Link></li>
                <li><Link href="/tools/salami" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Salami Tracker</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-primary uppercase tracking-widest mb-8">Platform</h4>
              <ul className="space-y-5 text-muted-foreground font-bold">
                <li><Link href="/tools/countdown" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Eid Countdown</Link></li>
                <li><Link href="/tools/mosque" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> Mosque Finder</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors flex items-center gap-2"><ChevronRight className="w-4 h-4" /> About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-primary uppercase tracking-widest mb-8">Contact</h4>
              <ul className="space-y-6 text-muted-foreground font-bold">
                <li className="flex items-start gap-3">
                   <MapPin className="w-5 h-5 text-primary shrink-0" />
                   <span>Dhaka, Bangladesh</span>
                </li>
                <li className="flex items-center gap-3">
                   <MessageCircle className="w-5 h-5 text-primary shrink-0" />
                   <Link href="mailto:hello@eidspark.bd" className="hover:text-primary transition-colors">hello@eidspark.bd</Link>
                </li>
                <li className="pt-4 flex gap-6">
                  <Link href="#" className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Facebook className="w-6 h-6" />
                  </Link>
                  <Link href="#" className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Instagram className="w-6 h-6" />
                  </Link>
                  <Link href="#" className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <MessageCircle className="w-6 h-6" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground font-bold text-sm">
              © {new Date().getFullYear()} EidSpark Bangladesh. All rights reserved.
            </p>
            <div className="flex gap-10 text-sm font-black text-primary uppercase tracking-widest">
              <Link href="#" className="hover:opacity-70 transition-opacity">Privacy Policy</Link>
              <Link href="#" className="hover:opacity-70 transition-opacity">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
