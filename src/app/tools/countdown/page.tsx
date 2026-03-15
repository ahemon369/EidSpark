
"use client"

import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Star, Sparkles, MapPin, CalendarDays, Volume2, VolumeX, Facebook, MessageCircle, Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

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
    <div className="min-h-screen bg-emerald-950 text-white selection:bg-secondary selection:text-emerald-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 relative overflow-hidden min-h-[calc(100vh-64px)] flex items-center justify-center">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>

        <div className="flex flex-col items-center text-center space-y-16 relative z-10 w-full">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-secondary font-black text-sm tracking-[0.2em] uppercase">
              <Sparkles className="w-5 h-5" />
              <span>Eid-ul-Fitr Countdown</span>
              <div className="w-1 h-1 rounded-full bg-white/30"></div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>Bangladesh Time</span>
              </div>
            </div>
            <h1 className="text-6xl lg:text-9xl font-black tracking-tight text-white leading-tight">
              The Magic of Eid is <br />
              <span className="text-secondary drop-shadow-[0_0_30px_rgba(233,190,36,0.3)]">Almost Here</span>
            </h1>
          </div>

          {/* Moon Animation Container */}
          <div className="relative py-10">
            <div className="w-72 h-72 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-secondary via-amber-300 to-amber-600 shadow-[0_0_120px_rgba(233,190,36,0.4)] animate-float flex items-center justify-center group overflow-hidden border-4 border-white/20">
               {/* Crescent part overlay */}
               <div className="absolute top-0 right-0 w-[85%] h-full bg-emerald-950 rounded-full translate-x-6 -translate-y-4 group-hover:translate-x-10 transition-transform duration-1000"></div>
               
               {/* Lantern Silhouette */}
               <div className="absolute bottom-10 left-10 opacity-40">
                  <div className="w-8 h-12 bg-white/20 rounded-md"></div>
               </div>
            </div>
            <Star className="absolute -top-10 -left-10 w-12 h-12 text-secondary animate-pulse" />
            <Star className="absolute top-1/2 -right-20 w-8 h-8 text-white/60 animate-pulse delay-300" />
            <Star className="absolute -bottom-16 left-1/2 w-6 h-6 text-white/40 animate-pulse delay-700" />
            <Star className="absolute top-1/4 right-0 w-4 h-4 text-secondary/50 animate-pulse delay-500" />
          </div>

          <div className="space-y-8 w-full max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 perspective-1000">
              {Object.entries(timeLeft).map(([label, value]) => (
                <Card key={label} className="bg-white/5 border-white/10 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group hover:bg-white/10 transition-all duration-500 hover:scale-105 border-2">
                  <CardContent className="p-10 text-center">
                    <div key={value} className="text-6xl lg:text-8xl font-black text-white group-hover:text-secondary transition-colors duration-500 drop-shadow-md animate-flip-number">
                      {value.toString().padStart(2, "0")}
                    </div>
                    <div className="text-xs lg:sm font-black text-white/40 uppercase tracking-[0.3em] mt-4">{label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex flex-col items-center gap-8">
              <div className="space-y-4 flex flex-col items-center">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-secondary text-xs font-black uppercase tracking-widest backdrop-blur-md">
                  <CalendarDays className="w-4 h-4" />
                  <span>Expected Eid-ul-Fitr Date: March 20, 2026 (Bangladesh)</span>
                </div>

                <Button 
                  onClick={toggleTakbir}
                  variant="outline"
                  className={cn(
                    "rounded-full h-14 px-10 font-black text-lg gap-3 transition-all border-2 shadow-2xl",
                    isPlayingTakbir ? "bg-white text-emerald-950 border-white scale-105" : "text-white border-white/20 hover:bg-white/10"
                  )}
                >
                  {isPlayingTakbir ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  {isPlayingTakbir ? "Stop Takbir" : "Play Eid Takbir"}
                </Button>
              </div>

              {/* Social Share Group */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Spread the Eid Spirit</p>
                <div className="flex items-center justify-center gap-4">
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/10 font-black gap-2"
                    onClick={() => shareCountdown('facebook')}
                  >
                    <Facebook className="w-5 h-5 fill-current" /> Facebook
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/10 font-black gap-2"
                    onClick={() => shareCountdown('whatsapp')}
                  >
                    <MessageCircle className="w-5 h-5" /> WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="rounded-2xl h-14 px-8 border-white/10 hover:bg-white/10 font-black gap-2"
                    onClick={() => shareCountdown('twitter')}
                  >
                    <Twitter className="w-5 h-5 fill-current" /> Twitter
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto space-y-8 pt-12 pb-20">
            <h3 className="text-3xl font-black italic text-white/90">"Eid-ul-Fitr celebrates the end of a month of fasting, prayer, and reflection."</h3>
            <div className="h-1 w-24 bg-secondary mx-auto rounded-full"></div>
            <p className="text-white/60 font-bold tracking-widest uppercase">Stay Blessed • Stay Excited</p>
          </div>
        </div>
      </div>
    </div>
  )
}
