
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Calculator, 
  Send, 
  Wallet, 
  MapPin, 
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  Camera,
  Moon,
  MessageCircle,
  Map as MapIcon,
  Users,
  Globe,
  CheckCircle2,
  Laugh,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const tools = [
  {
    title: "Eid Jamaat Finder",
    description: "Discover nearby mosques and real-time Eid prayer times across Bangladesh.",
    icon: MapIcon,
    href: "/tools/jamaat-finder",
    color: "bg-emerald-100 text-emerald-700",
    darkColor: "dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  {
    title: "Zakat Assistant",
    description: "Calculate your mandatory zakat obligation in BDT with precision.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "bg-blue-100 text-blue-700",
    darkColor: "dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    title: "Greeting Studio",
    description: "Create trilingual AI-powered Eid cards with traditional motifs.",
    icon: Send,
    href: "/tools/greeting",
    color: "bg-amber-100 text-amber-700",
    darkColor: "dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    title: "Selfie Frame AI",
    description: "Decorate your Eid selfies with beautiful themed backdrops and frames.",
    icon: Camera,
    href: "/tools/selfie",
    color: "bg-orange-100 text-orange-700",
    darkColor: "dark:bg-orange-900/30 dark:text-orange-400"
  },
  {
    title: "Salami Guide",
    description: "The official funny list of Eid Salami rates for 2026. Don't be stingy!",
    icon: Laugh,
    href: "/tools/salami-calculator",
    color: "bg-yellow-100 text-amber-700",
    darkColor: "dark:bg-amber-900/30 dark:text-amber-400"
  },
  {
    title: "Salami Tracker",
    description: "Manage your Eid Eidi/Salami and share unique digital envelopes.",
    icon: Wallet,
    href: "/tools/salami",
    color: "bg-purple-100 text-purple-700",
    darkColor: "dark:bg-purple-900/30 dark:text-purple-400"
  }
]

const stats = [
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Mosques Verified", value: "500+", icon: CheckCircle2 },
  { label: "Greetings Sent", value: "50K+", icon: Sparkles },
  { label: "Community Reports", value: "1.2K+", icon: MessageCircle },
]

export default function Home() {
  const [previewIndex, setPreviewIndex] = useState(0)
  
  const previews = [
    {
      label: "Live Map",
      title: "Jamaat Finder",
      desc: "Community verified times in Dhaka.",
      icon: MapIcon,
      image: PlaceHolderImages.find(img => img.id === "preview-map")?.imageUrl || "",
    },
    {
      label: "AI Studio",
      title: "Greeting Designer",
      desc: "Trilingual blessings in 10 seconds.",
      icon: Send,
      image: PlaceHolderImages.find(img => img.id === "preview-greeting")?.imageUrl || "",
    },
    {
      label: "Selfie Studio",
      title: "Poster Frame AI",
      desc: "Automatic background replacement.",
      icon: Camera,
      image: PlaceHolderImages.find(img => img.id === "preview-selfie")?.imageUrl || "",
    },
    {
      label: "Financial Tool",
      title: "Zakat Calculator",
      desc: "Accurate BDT wealth calculation.",
      icon: Calculator,
      image: PlaceHolderImages.find(img => img.id === "hero-mosque")?.imageUrl || "",
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % previews.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [previews.length])

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white islamic-pattern transition-colors duration-500">
      <Navbar />
      
      <main className="flex-grow pt-20">
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-48 emerald-gradient dark:from-slate-950 dark:to-emerald-950 transition-all duration-1000">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute top-20 right-[15%] animate-float-slow">
               <Moon className="w-48 h-48 text-secondary fill-secondary drop-shadow-[0_0_50px_rgba(233,190,36,0.5)]" />
             </div>
             <div className="absolute bottom-40 left-[5%] animate-float delay-1000">
               <Sparkles className="w-32 h-32 text-secondary/40" />
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/5 rounded-full blur-[120px] animate-slow-gradient"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>The Ultimate Eid Companion for Bangladesh</span>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-[100px] font-black leading-[0.9] tracking-tighter">
                    Spark Your <br />
                    <span className="text-secondary drop-shadow-2xl">Celebration</span>
                  </h1>
                  
                  <p className="text-xl text-white/80 max-w-xl leading-relaxed font-medium">
                    Modern smart tools built for the Muslim community. From trilingual AI greetings to real-time community moon sighting reports.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-6">
                  <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 rounded-[2rem] px-12 h-20 text-2xl font-black shadow-[0_20px_50px_rgba(233,190,36,0.3)] hover:scale-105 transition-all" asChild>
                    <Link href="#tools">Explore Studio <ChevronRight className="ml-2 w-6 h-6" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-[2rem] px-12 h-20 text-2xl font-black border-4 border-white/30 text-white hover:bg-white/10 transition-all backdrop-blur-xl shadow-2xl" asChild>
                    <Link href="/tools/jamaat-finder">Live Map</Link>
                  </Button>
                </div>

                <div className="pt-8 flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="w-14 h-14 rounded-full border-4 border-emerald-900 bg-muted overflow-hidden shadow-2xl transition-transform hover:scale-110 hover:z-20">
                        <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" width={56} height={56} />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-white/70">
                    <span className="text-white block text-2xl font-black tracking-tighter">10,000+ Active Users</span>
                    Trusted across all 8 divisions
                  </div>
                </div>
              </div>

              <div className="relative animate-in fade-in zoom-in duration-1000 delay-300 hidden lg:block">
                <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-[0_64px_128px_-12px_rgba(0,0,0,0.6)] border-[12px] border-white/10 bg-white/5 backdrop-blur-xl aspect-square max-w-lg mx-auto group">
                  {previews.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "absolute inset-0 transition-all duration-1000 ease-in-out",
                        previewIndex === idx ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95 pointer-events-none"
                      )}
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover opacity-80"
                          priority={idx === 0}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
                      <div className="absolute bottom-12 left-10 right-10 p-10 rounded-[3rem] glass-card border-white/20 bg-white/10 backdrop-blur-2xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
                            <item.icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black uppercase tracking-[0.3em] text-secondary">{item.label}</span>
                        </div>
                        <h4 className="text-4xl font-black mb-3">{item.title}</h4>
                        <p className="text-white/70 font-medium text-lg">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-secondary/30 rounded-full blur-[140px] -z-10 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-[140px] -z-10 animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative -mt-16 z-20 px-4">
          <div className="max-w-6xl mx-auto glass-card dark:bg-slate-900/80 rounded-[3rem] p-8 shadow-2xl border-4 border-white/50 dark:border-white/10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col items-center text-center space-y-2 group">
                  <div className="w-12 h-12 rounded-2xl bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary dark:text-secondary group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <p className="text-3xl font-black text-primary dark:text-white">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tools" className="py-32 relative bg-white/50 dark:bg-slate-950/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/5 text-primary dark:text-secondary text-xs font-black uppercase tracking-widest border border-primary/10">
                <Sparkles className="w-4 h-4" />
                <span>Modern Studio Tools</span>
              </div>
              <h2 className="text-5xl lg:text-[80px] font-black text-primary dark:text-white tracking-tighter leading-none">Designed for Eid</h2>
              <p className="text-xl text-muted-foreground font-medium">Everything you need for a blessed celebration in one beautiful place.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {tools.map((tool, index) => (
                <Link key={tool.title} href={tool.href} className="group">
                  <Card className="h-full border-none shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(6,95,70,0.15)] dark:hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-all duration-300 ease-in-out rounded-[3.5rem] overflow-hidden hover:-translate-y-3 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-transparent hover:border-primary/10">
                    <CardHeader className="p-12 pb-0">
                      <div className={cn("w-24 h-24 rounded-[2.5rem] flex items-center justify-center mb-10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-xl", tool.color, tool.darkColor)}>
                        <tool.icon className="w-12 h-12" />
                      </div>
                      <CardTitle className="text-3xl font-black group-hover:text-primary dark:group-hover:text-secondary transition-colors">{tool.title}</CardTitle>
                      <CardDescription className="text-lg mt-6 leading-relaxed font-medium line-clamp-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-12 pt-8 flex justify-end">
                      <div className="w-16 h-16 rounded-full border-2 border-primary/10 dark:border-white/10 flex items-center justify-center text-primary dark:text-white group-hover:bg-primary dark:group-hover:bg-secondary group-hover:text-white dark:group-hover:text-primary group-hover:scale-110 group-hover:translate-x-2 transition-all duration-300">
                        <ArrowRight className="w-8 h-8" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
