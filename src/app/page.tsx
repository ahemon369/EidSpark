
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Smartphone,
  Check,
  TrendingUp,
  Clock,
  Heart,
  Calendar
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
    description: "Discover nearby mosques and real-time community verified Eid prayer times.",
    icon: MapIcon,
    href: "/tools/jamaat-finder",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-500",
    tag: "Crowd-Powered"
  },
  {
    title: "Zakat Assistant",
    description: "Calculate your mandatory zakat obligation in BDT with modern precision.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-500",
    tag: "Financial"
  },
  {
    title: "Greeting Studio",
    description: "Create trilingual AI-powered Eid cards with beautiful traditional motifs.",
    icon: Send,
    href: "/tools/greeting",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-500",
    tag: "AI Powered"
  },
  {
    title: "Selfie Frame AI",
    description: "Decorate your Eid selfies with professional AI-themed backdrops and frames.",
    icon: Camera,
    href: "/tools/selfie",
    color: "from-rose-500/20 to-rose-500/5",
    iconColor: "text-rose-500",
    tag: "Viral Tool"
  },
  {
    title: "Salami Registry",
    description: "The official funny guide to Eid Salami rates for 2026. Don't be stingy!",
    icon: Laugh,
    href: "/tools/salami-calculator",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-500",
    tag: "Fun Zone"
  },
  {
    title: "QR Salami System",
    description: "Manage your Eid Eidi collection and share unique personal digital QR pages.",
    icon: Wallet,
    href: "/tools/qr-salami",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-500",
    tag: "Social"
  }
]

const stats = [
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Mosques Verified", value: "500+", icon: CheckCircle2 },
  { label: "Greetings Sent", value: "50K+", icon: Sparkles },
  { label: "Community Reports", value: "1.2K+", icon: MessageCircle },
]

const activityFeed = [
  { user: "Rafi A.", action: "added a mosque in Dhaka", time: "2m ago", icon: MapPin, color: "text-emerald-500" },
  { user: "Tanvir H.", action: "received ৳500 Salami", time: "5m ago", icon: Wallet, color: "text-amber-500" },
  { user: "Ayesha S.", action: "created a Royal Greeting", time: "12m ago", icon: Sparkles, color: "text-blue-500" },
  { user: "Emon K.", action: "reported a Moon Sighting", time: "18m ago", icon: Moon, color: "text-rose-500" },
  { user: "Sara J.", action: "won 'Eid Star' badge", time: "25m ago", icon: Star, color: "text-secondary" },
]

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  
  useEffect(() => {
    const targetDate = new Date("2026-03-20T00:00:00")
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetDate.getTime() - now
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-primary selection:text-white transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <main className="flex-grow pt-[80px]">
        {/* SaaS Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32 lg:pt-40 lg:pb-52">
          {/* Background Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950"></div>
            <div className="absolute inset-0 opacity-[0.03] islamic-pattern"></div>
            
            {/* Floating Celestial Icons */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-[15%] hidden lg:block"
            >
              <Moon className="w-32 h-32 text-secondary/40 fill-secondary/10 drop-shadow-[0_0_50px_rgba(233,190,36,0.3)]" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-40 left-[10%] hidden lg:block"
            >
              <Sparkles className="w-24 h-24 text-primary/30" />
            </motion.div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-10"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] backdrop-blur-xl shadow-2xl">
                  <Star className="w-4 h-4 fill-emerald-400" />
                  <span>The Ultimate Eid Companion 2026</span>
                </div>
                
                <div className="space-y-6">
                  <h1 className="text-6xl lg:text-[110px] font-black leading-[0.85] tracking-tighter text-white">
                    Spark Your <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-secondary to-amber-500 drop-shadow-2xl">Celebration</span>
                  </h1>
                  
                  <p className="text-xl text-slate-400 max-w-xl leading-relaxed font-medium">
                    Modern smart tools built for the Muslim community. From trilingual AI greetings to real-time crowd-powered prayer maps.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-4">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-emerald-600 font-black text-lg shadow-[0_20px_50px_rgba(6,95,70,0.3)] group" asChild>
                    <Link href="/tools/greeting">
                      Explore Studio <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white/10 font-black text-lg backdrop-blur-md" asChild>
                    <Link href="/tools/jamaat-finder">Live Map</Link>
                  </Button>
                </div>

                {/* Trust Proof */}
                <div className="pt-8 flex items-center gap-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden shadow-2xl">
                        <Image src={`https://picsum.photos/seed/u${i}/100/100`} alt="User" width={48} height={48} />
                      </div>
                    ))}
                    <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-emerald-500 flex items-center justify-center text-white text-xs font-black">+10k</div>
                  </div>
                  <div className="text-sm font-bold text-slate-500">
                    <span className="text-white block font-black text-lg leading-tight">10,000+ Active Users</span>
                    Trusted across Bangladesh
                  </div>
                </div>
              </motion.div>

              {/* Hero Right: Floating UI Preview */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <div className="relative z-10 w-[450px] aspect-[9/16] mx-auto rounded-[3.5rem] border-[12px] border-slate-800 bg-slate-900 shadow-[0_64px_128px_-12px_rgba(0,0,0,0.8)] overflow-hidden group">
                  {/* Mockup UI Content */}
                  <div className="absolute inset-0 bg-slate-900 flex flex-col">
                    <div className="h-16 bg-emerald-950 flex items-center justify-center border-b border-white/5">
                      <div className="w-20 h-1.5 bg-white/10 rounded-full"></div>
                    </div>
                    <div className="flex-grow p-6 space-y-6">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500"><MapIcon className="w-5 h-5" /></div>
                          <div className="space-y-1"><div className="w-24 h-2 bg-white/20 rounded-full"></div><div className="w-16 h-1.5 bg-white/10 rounded-full"></div></div>
                        </div>
                        <div className="aspect-square bg-white/5 rounded-xl border border-white/5 flex items-center justify-center overflow-hidden">
                           <Image src={PlaceHolderImages.find(img => img.id === "preview-map")?.imageUrl || ""} alt="Map" fill className="object-cover opacity-40 group-hover:scale-110 transition-transform duration-[3s]" />
                           <MapPin className="w-12 h-12 text-emerald-500 relative z-10 drop-shadow-lg animate-bounce" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                          <Sparkles className="w-6 h-6 text-secondary" />
                          <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                        <div className="h-24 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-2">
                          <Wallet className="w-6 h-6 text-emerald-500" />
                          <div className="w-12 h-1.5 bg-white/10 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none"></div>
                </div>
                
                {/* Decorative Blobs */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse delay-700"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Countdown Section */}
        <section className="relative -mt-24 z-20 px-4">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto glass-card rounded-[3.5rem] p-12 lg:p-16 shadow-[0_48px_96px_-12px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-3xl -z-10"></div>
            <div className="absolute top-0 right-0 p-8 opacity-10"><Clock className="w-48 h-48" /></div>
            
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center gap-3 text-secondary font-black uppercase tracking-[0.3em] text-xs">
                  <Calendar className="w-4 h-4 animate-pulse" />
                  <span>The Grand Countdown</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Eid-ul-Fitr 2026 is <br /> Almost Here
                </h2>
                <p className="text-slate-400 font-medium leading-relaxed">
                  Join thousands of users preparing for the most blessed celebration of the year.
                </p>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-3 gap-6 text-center">
                {[
                  { label: "Days", val: timeLeft.days },
                  { label: "Hours", val: timeLeft.hours },
                  { label: "Minutes", val: timeLeft.minutes }
                ].map(item => (
                  <div key={item.label} className="space-y-3">
                    <div className="text-6xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                      {item.val.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/60">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center space-y-4 group p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
                >
                  <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shadow-xl">
                    <s.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-white tracking-tighter">{s.value}</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Hub */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-end gap-10 mb-20">
              <div className="space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
                  <Sparkles className="w-4 h-4" />
                  <span>The Modern Ecosystem</span>
                </div>
                <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none">Designed for <br /> Celebration</h2>
              </div>
              <p className="text-xl text-slate-400 font-medium max-w-xs pb-2 border-l-4 border-secondary pl-6">
                Every tool you need for a blessed Eid in one beautiful place.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, idx) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={tool.href} className="group block h-full">
                    <Card className="h-full bg-white/[0.03] border-white/5 hover:border-emerald-500/30 transition-all duration-500 rounded-[3rem] overflow-hidden group-hover:-translate-y-3 shadow-2xl relative">
                      <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity", tool.color)}></div>
                      <CardHeader className="p-10 pb-0">
                        <div className="flex justify-between items-start mb-10">
                          <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center bg-white/5 shadow-xl transition-all duration-500 group-hover:scale-110", tool.iconColor)}>
                            <tool.icon className="w-10 h-10" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">{tool.tag}</span>
                        </div>
                        <CardTitle className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{tool.title}</CardTitle>
                        <CardDescription className="text-slate-400 text-lg mt-4 leading-relaxed font-medium">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-10 pt-8 flex justify-end">
                        <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white group-hover:bg-primary group-hover:border-primary transition-all">
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works (Steps) */}
        <section className="py-40 bg-slate-900/30">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-24 space-y-4">
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tight">The EidSpark Workflow</h2>
              <p className="text-slate-400 max-w-lg mx-auto text-lg">Simplified digital traditions for every family.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 relative">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent hidden md:block -translate-y-1/2"></div>
              
              {[
                { step: "01", title: "Find Nearby Jamaat", desc: "Use the live map to discover community-verified prayer times.", icon: MapPin },
                { step: "02", title: "Use Smart Tools", desc: "Calculate Zakat, create AI cards, and track your Salami.", icon: Sparkles },
                { step: "03", title: "Share the Joy", desc: "Broadcast your festive moments with the national community.", icon: Heart }
              ].map((item, i) => (
                <div key={i} className="relative z-10 text-center space-y-8 bg-slate-950 p-12 rounded-[3rem] border border-white/5 shadow-2xl group hover:border-emerald-500/20 transition-all">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-500 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div className="space-y-3">
                    <p className="text-secondary font-black text-xs uppercase tracking-widest">Step {item.step}</p>
                    <h3 className="text-2xl font-black text-white">{item.title}</h3>
                    <p className="text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Activity & Map Section */}
        <section className="py-40 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Activity Feed */}
              <div className="lg:col-span-4 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-rose-500" />
                    Live Community
                  </h3>
                  <p className="text-slate-500 font-medium">Real-time pulse of the EidSpark network across divisions.</p>
                </div>
                
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence initial={false}>
                    {activityFeed.map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center gap-5 hover:bg-white/[0.05] transition-all"
                      >
                        <div className={cn("w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 shadow-lg", item.color)}>
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-black text-white">{item.user}</p>
                          <p className="text-xs text-slate-500 font-medium">{item.action}</p>
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-600 shrink-0">{item.time}</div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Map Preview Card */}
              <div className="lg:col-span-8">
                <Card className="rounded-[4rem] overflow-hidden bg-slate-900 border-none shadow-[0_64px_128px_-12px_rgba(0,0,0,0.6)] group h-[600px] relative">
                  <Image 
                    src={PlaceHolderImages.find(img => img.id === "preview-map")?.imageUrl || ""} 
                    alt="Live Map" 
                    fill 
                    className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-[5s]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
                  
                  <div className="absolute bottom-16 left-16 right-16 z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Registry Active
                      </div>
                      <h4 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">Find Your Jamaat</h4>
                      <p className="text-slate-400 max-w-sm font-medium">Join 10,000+ users checking prayer times in real-time.</p>
                    </div>
                    <Button size="lg" className="h-20 px-12 rounded-[2rem] emerald-gradient text-white font-black text-xl shadow-2xl hover:scale-105 transition-transform" asChild>
                      <Link href="/tools/jamaat-finder">Open Full Map Interface</Link>
                    </Button>
                  </div>

                  {/* Marker UI Simulation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }} 
                      transition={{ duration: 3, repeat: Infinity }}
                      className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-white shadow-2xl flex items-center justify-center text-white"
                    >
                      <MapPin className="w-8 h-8" />
                    </motion.div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-12">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="space-y-8 p-20 rounded-[4rem] bg-gradient-to-br from-emerald-900/40 via-emerald-950 to-slate-950 border border-emerald-500/20 shadow-[0_64px_128px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5 islamic-pattern"></div>
              <h2 className="text-5xl lg:text-8xl font-black text-white tracking-tighter leading-[0.85]">
                Ready to <br /> Spark Your Eid?
              </h2>
              <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
                Join the most trusted Eid companion platform in Bangladesh. It's free, secure, and built for you.
              </p>
              <div className="flex flex-wrap justify-center gap-6 pt-6">
                <Button size="lg" className="h-20 px-14 rounded-[2.5rem] bg-secondary text-primary hover:bg-amber-400 font-black text-2xl shadow-2xl shadow-secondary/20 transition-all hover:scale-105 active:scale-95" asChild>
                  <Link href="/login">Get Started Free</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
