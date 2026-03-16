"use client"

import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Star, Sparkles, MapPin, CalendarDays, Volume2, VolumeX, Facebook, MessageCircle, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/back-button"

export default function EidCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isPlayingTakbir, setIsPlayingTakbir] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Expected Eid-ul-Fitr Date: March 20, 2026
    const targetDate = new Date("2026-03-20T00:00:00")

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const difference = targetDate.getTime() - now

      if (difference <= 0) {
        clearInterval(timer)
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleTakbir = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("https://www.islamicfinder.org/takbeer/Eid_Takbeer.mp3")
      audioRef.current.onended = () => setIsPlayingTakbir(false)
    }
    
    if (isPlayingTakbir) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlayingTakbir(!isPlayingTakbir)
  }

  const shareCountdown = (platform: 'facebook' | 'whatsapp' | 'twitter') => {
    const url = encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '');
    const text = encodeURIComponent("The magic of Eid is almost here! Check out the live Eid-ul-Fitr countdown on EidSpark! 🌙 #EidSpark #EidMubarak");
    
    const shares = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`
    };
    
    window.open(shares[platform], '_blank');
  };

  return (
    <div className="min-h-screen animate-slow-gradient bg-gradient-to-br from-emerald-950 via-emerald-900 to-black text-white selection:bg-secondary selection:text-emerald-950 relative overflow-hidden">
      <Navbar />
      
      {/* Immersive Islamic Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none islamic-pattern"></div>

      <div className="relative pt-[80px]">
        <BackButton />
        
        <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative z-10 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
          
          {/* Animated Background Atmosphere */}
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] animate-pulse delay-1000"></div>

          <div className="flex flex-col items-center text-center space-y-16 w-full">
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-1000">
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-secondary font-black text-sm tracking-[0.25em] uppercase shadow-2xl">
                <Sparkles className="w-5 h-5 animate-twinkle" />
                <span>Eid-ul-Fitr Countdown</span>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Bangladesh</span>
                </div>
              </div>
              <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
                The Magic of Eid is <br />
                <span className="text-secondary drop-shadow-[0_0_40px_rgba(233,190,36,0.4)]">Almost Here</span>
              </h1>
            </div>

            {/* Premium Moon & Stars Container */}
            <div className="relative py-16">
              <div className="w-72 h-72 lg:w-[450px] lg:h-[450px] rounded-full bg-gradient-to-br from-secondary via-amber-400 to-amber-700 shadow-[0_0_150px_rgba(233,190,36,0.3)] animate-float flex items-center justify-center group overflow-hidden border-8 border-white/10 relative">
                 {/* Crescent shape creation */}
                 <div className="absolute top-0 right-0 w-[88%] h-full bg-emerald-950 rounded-full translate-x-10 -translate-y-6 group-hover:translate-x-14 group-hover:-translate-y-8 transition-transform duration-1000"></div>
                 
                 {/* Inner Glow */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                 
                 <Moon className="w-32 h-32 text-secondary/20 absolute bottom-20 left-20 animate-pulse" />
              </div>

              {/* Twinkling Stars */}
              <Star className="absolute -top-10 -left-10 w-14 h-14 text-secondary animate-twinkle shadow-secondary" />
              <Star className="absolute top-1/2 -right-24 w-8 h-8 text-white/60 animate-twinkle delay-300" />
              <Star className="absolute -bottom-20 left-1/2 w-6 h-6 text-white/40 animate-twinkle delay-700" />
              <Star className="absolute top-1/4 -right-10 w-4 h-4 text-secondary/50 animate-twinkle delay-500" />
              <Star className="absolute bottom-10 -left-20 w-5 h-5 text-white/30 animate-twinkle delay-1000" />
              
              {/* Focal Glow */}
              <div className="absolute inset-0 bg-secondary/10 rounded-full blur-[120px] -z-10 scale-150"></div>
            </div>

            <div className="space-y-12 w-full max-w-6xl">
              {/* Glassmorphism Countdown Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 perspective-1000">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds }
                ].map(({ label, value }) => (
                  <Card key={label} className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] overflow-hidden group hover:bg-white/10 transition-all duration-500 hover:-translate-y-3 border-2 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                    <CardContent className="p-10 lg:p-14 text-center relative">
                      <div key={value} className="text-7xl lg:text-9xl font-black text-white group-hover:text-secondary transition-all duration-500 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] animate-flip-number tabular-nums">
                        {value.toString().padStart(2, "0")}
                      </div>
                      <div className="text-xs lg:text-sm font-black text-white/40 uppercase tracking-[0.4em] mt-6 group-hover:text-white/60 transition-colors">{label}</div>
                      
                      {/* Subtle Internal Glow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white/10 rounded-full blur-sm"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex flex-col items-center gap-10 animate-in fade-in duration-1000 delay-500">
                <div className="space-y-6 flex flex-col items-center">
                  <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-secondary text-sm font-black uppercase tracking-widest backdrop-blur-md shadow-xl">
                    <CalendarDays className="w-5 h-5" />
                    <span>Expected Eid-ul-Fitr: March 20, 2026 (Bangladesh)</span>
                  </div>

                  <Button 
                    onClick={toggleTakbir}
                    variant="outline"
                    className={cn(
                      "rounded-[2rem] h-20 px-14 font-black text-xl gap-4 transition-all duration-500 border-2 shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:scale-105",
                      isPlayingTakbir ? "bg-white text-emerald-950 border-white" : "text-white border-white/20 hover:bg-white/10"
                    )}
                  >
                    {isPlayingTakbir ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                    {isPlayingTakbir ? "Stop Takbir" : "Play Eid Takbir"}
                  </Button>
                </div>

                {/* Social Share Group */}
                <div className="space-y-6">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-white/30 text-center">Spread the Eid Spirit</p>
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <Button 
                      variant="outline" 
                      className="rounded-2xl h-16 px-10 border-white/10 hover:bg-white/10 font-black text-base gap-3 shadow-xl transition-transform hover:-translate-y-1"
                      onClick={() => shareCountdown('facebook')}
                    >
                      <Facebook className="w-6 h-6 fill-current" /> Facebook
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-2xl h-16 px-10 border-white/10 hover:bg-white/10 font-black text-base gap-3 shadow-xl transition-transform hover:-translate-y-1"
                      onClick={() => shareCountdown('whatsapp')}
                    >
                      <MessageCircle className="w-6 h-6" /> WhatsApp
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-2xl h-16 px-10 border-white/10 hover:bg-white/10 font-black text-base gap-3 shadow-xl transition-transform hover:-translate-y-1"
                      onClick={() => shareCountdown('twitter')}
                    >
                      <Twitter className="w-6 h-6 fill-current" /> Twitter
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-3xl mx-auto space-y-10 pt-20 pb-32">
              <h3 className="text-3xl lg:text-5xl font-black italic text-white/90 leading-tight">
                "Eid-ul-Fitr is a time of joy, gratitude, and community."
              </h3>
              <div className="h-1.5 w-32 bg-secondary mx-auto rounded-full shadow-[0_0_20px_rgba(233,190,36,0.5)]"></div>
              <p className="text-white/40 font-black tracking-[0.5em] uppercase text-sm">Stay Blessed • Stay Excited</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
