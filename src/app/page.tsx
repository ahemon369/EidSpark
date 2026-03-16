
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Calculator, 
  Send, 
  Wallet, 
  MapPin, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Camera, 
  Moon, 
  MessageCircle, 
  Map as MapIcon, 
  Users, 
  CheckCircle2, 
  Laugh, 
  Heart, 
  Calendar, 
  Zap,
  Clock,
  TrendingUp
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
    description: "Discover nearby mosques and community verified Eid prayer times in real-time.",
    icon: MapIcon,
    href: "/tools/jamaat-finder",
    color: "text-emerald-600",
    tag: "Crowd-Powered"
  },
  {
    title: "Zakat Assistant",
    description: "Calculate your mandatory zakat obligation in BDT with modern financial precision.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "text-blue-600",
    tag: "Financial"
  },
  {
    title: "Greeting Studio",
    description: "Design professional trilingual AI Eid cards with draggable layers and motifs.",
    icon: Send,
    href: "/tools/greeting",
    color: "text-amber-600",
    tag: "AI Powered"
  },
  {
    title: "Selfie Frame AI",
    description: "Transform your festive selfies with professional AI backdrops and royal frames.",
    icon: Camera,
    href: "/tools/selfie",
    color: "text-rose-600",
    tag: "Viral Tool"
  },
  {
    title: "Salami Guide",
    description: "The 2026 viral guide to Eid Salami rates. Fair pricing for family relative juniors.",
    icon: Laugh,
    href: "/tools/salami-calculator",
    color: "text-purple-600",
    tag: "Fun Hub"
  },
  {
    title: "Salami Center",
    description: "Manage your collection and share unique personal digital QR payment pages.",
    icon: Wallet,
    href: "/tools/qr-salami",
    color: "text-orange-600",
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
  { user: "Rafi A.", action: "added a mosque in Dhaka", time: "2m ago", icon: MapPin, color: "text-emerald-600" },
  { user: "Tanvir H.", action: "received ৳500 Salami", time: "5m ago", icon: Wallet, color: "text-amber-600" },
  { user: "Ayesha S.", action: "created a AI Greeting", time: "12m ago", icon: Sparkles, color: "text-blue-600" },
  { user: "Emon K.", action: "reported a Moon Sighting", time: "18m ago", icon: Moon, color: "text-rose-600" },
  { user: "Sara J.", action: "unlocked 'Eid Star' badge", time: "25m ago", icon: Zap, color: "text-amber-500" },
]

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })
  const mapPreview = PlaceHolderImages.find(img => img.id === "preview-map")
  
  useEffect(() => {
    const targetDate = new Date("2026-03-20T00:00:00")
    const interval = setInterval(() => {
      const now = new Date().getTime()
      const diff = targetDate.getTime() - now
      setTimeLeft({
        days: Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))),
        hours: Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))),
        minutes: Math.max(0, Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)))
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />
      
      <main className="flex-grow pt-[70px]">
        {/* Modern SaaS Hero */}
        <section className="relative overflow-hidden pt-12 pb-24 lg:pt-40 lg:pb-52">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-50 via-white to-white"></div>
            <div className="absolute inset-0 opacity-[0.02] islamic-pattern"></div>
            
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-[15%] hidden lg:block"
            >
              <Moon className="w-32 h-32 text-emerald-600/10 fill-emerald-600/5 drop-shadow-[0_0_50px_rgba(6,95,70,0.1)]" />
            </motion.div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8 lg:space-y-10 text-center lg:text-left"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] shadow-sm">
                  <Zap className="w-4 h-4 fill-emerald-600" />
                  <span>The Ultimate Eid Ecosystem 2026</span>
                </div>
                
                <div className="space-y-4 lg:space-y-6">
                  <h1 className="text-5xl md:text-7xl lg:text-[110px] font-black leading-[0.9] tracking-tighter text-slate-900">
                    Spark Your <br className="hidden lg:block" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 via-secondary to-amber-500">Celebration</span>
                  </h1>
                  
                  <p className="text-lg lg:text-xl text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    Modern smart tools built for the Muslim community. Find Eid Jamaat, calculate Zakat, and celebrate together.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center lg:justify-start pt-4">
                  <Button size="lg" className="h-14 lg:h-16 px-10 rounded-2xl bg-primary text-white hover:bg-emerald-700 font-black text-lg shadow-2xl transition-all group" asChild>
                    <Link href="/tools/greeting">
                      Explore Studio <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 lg:h-16 px-10 rounded-2xl border-2 border-emerald-100 bg-white text-emerald-700 font-black text-lg" asChild>
                    <Link href="/tools/jamaat-finder">Live Jamaat Map</Link>
                  </Button>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                  <div className="flex -space-x-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white bg-slate-100 overflow-hidden shadow-lg">
                        <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" width={48} height={48} />
                      </div>
                    ))}
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border-4 border-white bg-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-lg">+10k</div>
                  </div>
                  <div className="text-sm font-bold text-slate-500 text-center lg:text-left">
                    <span className="text-slate-900 block font-black text-base lg:text-lg leading-tight">10,000+ Active Members</span>
                    Growing across all divisions
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="relative hidden lg:block"
              >
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-full max-w-[450px] aspect-[9/16] mx-auto rounded-[3.5rem] border-[12px] border-slate-900 bg-white shadow-[0_64px_128px_-12px_rgba(0,0,0,0.15)] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-slate-50 flex flex-col">
                    <div className="h-16 bg-white flex items-center justify-center border-b">
                      <div className="w-20 h-1.5 bg-slate-200 rounded-full"></div>
                    </div>
                    <div className="flex-grow p-6 space-y-6">
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><MapIcon className="w-5 h-5" /></div>
                          <div className="space-y-1"><div className="w-24 h-2 bg-slate-100 rounded-full"></div><div className="w-16 h-1.5 bg-slate-100 rounded-full"></div></div>
                        </div>
                        <div className="aspect-square bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center overflow-hidden relative">
                           {mapPreview?.imageUrl && <Image src={mapPreview.imageUrl} alt="Map" fill className="object-cover opacity-20" />}
                           <MapPin className="w-12 h-12 text-emerald-600 relative z-10 drop-shadow-lg animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Live Countdown Section */}
        <section className="relative px-4 -mt-12 lg:-mt-24 z-20">
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto bg-white rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-16 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden relative"
          >
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-5 text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-3 text-secondary font-black uppercase tracking-[0.3em] text-[10px]">
                  <Calendar className="w-4 h-4 animate-pulse" />
                  <span>The Grand Countdown</span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Eid-ul-Fitr 2026 is <br className="hidden lg:block" /> Almost Here
                </h2>
              </div>
              
              <div className="lg:col-span-7 grid grid-cols-3 gap-4 lg:gap-6 text-center">
                {[
                  { label: "Days", val: timeLeft.days },
                  { label: "Hours", val: timeLeft.hours },
                  { label: "Minutes", val: timeLeft.minutes }
                ].map(item => (
                  <div key={item.label} className="space-y-1 lg:space-y-3">
                    <div className="text-4xl md:text-6xl lg:text-8xl font-black text-primary tracking-tighter tabular-nums">
                      {item.val.toString().padStart(2, '0')}
                    </div>
                    <div className="text-[8px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-16 md:py-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {stats.map((s, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center space-y-3 md:space-y-4 p-6 md:p-10 rounded-2xl lg:rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <s.icon className="w-6 h-6 md:w-8 md:h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl md:text-4xl font-black text-slate-900 tracking-tighter">{s.value}</p>
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tool Hub Grid */}
        <section className="py-12 md:py-20 relative">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-10 mb-12 md:mb-20 text-center lg:text-left">
              <div className="space-y-4 lg:space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  <Sparkles className="w-4 h-4" />
                  <span>The Modern Toolkit</span>
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-slate-900 tracking-tighter leading-none">Designed for <br className="hidden lg:block" /> Celebration</h2>
              </div>
              <p className="text-lg md:text-xl text-slate-500 font-medium max-w-xs pb-2 border-l-0 lg:border-l-4 border-secondary lg:pl-6">
                Every tool you need for a blessed Eid in one clean interface.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {tools.map((tool, idx) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={tool.href} className="group block h-full">
                    <Card className="h-full bg-white border border-slate-100 hover:border-emerald-200 transition-all duration-500 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2 shadow-sm hover:shadow-2xl">
                      <CardHeader className="p-8 md:p-10 pb-0">
                        <div className="flex justify-between items-start mb-8 md:mb-10">
                          <div className={cn("w-16 h-16 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center bg-slate-50 transition-all duration-500 group-hover:scale-110", tool.color)}>
                            <tool.icon className="w-8 h-8 md:w-10 md:h-10" />
                          </div>
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">{tool.tag}</span>
                        </div>
                        <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{tool.title}</CardTitle>
                        <CardDescription className="text-slate-500 text-base md:text-lg mt-4 leading-relaxed font-medium">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-8 md:p-10 pt-8 flex justify-end">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all">
                          <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community Activity Feed */}
        <section className="py-20 md:py-40 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              
              {/* Timeline Feed */}
              <div className="lg:col-span-5 space-y-10 text-center lg:text-left">
                <div className="space-y-4">
                  <h3 className="text-3xl md:text-4xl font-black text-slate-900 flex items-center justify-center lg:justify-start gap-3">
                    <TrendingUp className="w-8 h-8 text-emerald-600" />
                    Live Activity
                  </h3>
                  <p className="text-slate-500 font-medium">Real-time pulses from the community network.</p>
                </div>
                
                <div className="space-y-4 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar text-left">
                  {activityFeed.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-white border border-slate-100 flex items-center gap-4 md:gap-5 hover:shadow-md transition-all group"
                    >
                      <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform", item.color)}>
                        <item.icon className="w-5 h-5 md:w-6 md:h-6" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                        <p className="text-xs md:text-sm font-black text-slate-900 truncate">{item.user}</p>
                        <p className="text-[10px] md:text-xs text-slate-500 font-medium truncate">{item.action}</p>
                      </div>
                      <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 shrink-0">{item.time}</div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Map Portal */}
              <div className="lg:col-span-7">
                <Card className="rounded-[2rem] lg:rounded-[3.5rem] overflow-hidden bg-slate-100 border-none shadow-2xl group h-[400px] md:h-[600px] relative">
                  {mapPreview?.imageUrl && <Image src={mapPreview.imageUrl} alt="Map" fill className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-[5s]" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent"></div>
                  
                  <div className="absolute bottom-8 md:bottom-16 left-8 right-8 md:left-16 md:right-16 z-10 flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-10">
                    <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Map Active
                      </div>
                      <h4 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-none">Find Your Jamaat</h4>
                    </div>
                    <Button size="lg" className="h-14 md:h-20 px-8 md:px-12 rounded-2xl md:rounded-[2rem] emerald-gradient text-white font-black text-base md:text-xl shadow-2xl transition-transform active:scale-95" asChild>
                      <Link href="/tools/jamaat-finder">Open Map</Link>
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-40">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="space-y-8 p-10 md:p-20 rounded-[2.5rem] md:rounded-[4rem] bg-emerald-50 border border-emerald-100 shadow-sm relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-5 islamic-pattern"></div>
              <h2 className="text-4xl md:text-6xl lg:text-8xl font-black text-emerald-900 tracking-tighter leading-[0.9]">
                Ready to <br /> Spark Your Eid?
              </h2>
              <p className="text-base md:text-xl text-emerald-700/70 max-w-xl mx-auto leading-relaxed font-medium px-4">
                Join the most trusted Eid companion platform in Bangladesh. Start your journey for free today.
              </p>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 pt-6 relative z-10">
                <Button size="lg" className="h-16 md:h-20 px-10 md:px-14 rounded-2xl md:rounded-[2.5rem] bg-secondary text-primary hover:bg-amber-400 font-black text-lg md:text-2xl shadow-2xl transition-all" asChild>
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
