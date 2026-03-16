
"use client"

import { useEffect, useState, useRef } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Moon, Star, Sparkles, MapPin, CalendarDays, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { BackButton } from "@/components/back-button"

export default function EidCountdownPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isPlayingTakbir, setIsPlayingTakbir] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const targetDate = new Date("2026-03-20T00:00:00")
    const timer = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime()
      if (difference <= 0) { clearInterval(timer); return }
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
    isPlayingTakbir ? audioRef.current.pause() : audioRef.current.play()
    setIsPlayingTakbir(!isPlayingTakbir)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-black text-white selection:bg-secondary selection:text-emerald-950 relative overflow-hidden flex flex-col transition-all duration-300">
      <Navbar />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none islamic-pattern"></div>

      <div className="pt-[100px] flex flex-col flex-grow">
        <BackButton />
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 flex-grow flex flex-col items-center justify-center text-center">
          <div className="space-y-6 mb-16">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-secondary font-black text-xs tracking-[0.25em] uppercase shadow-2xl">
              <Sparkles className="w-4 h-4 animate-twinkle" />
              <span>Eid-ul-Fitr 2026 Countdown</span>
              <div className="flex items-center gap-1.5 ml-2 border-l border-white/10 pl-3">
                <MapPin className="w-3 h-3" />
                <span>Bangladesh</span>
              </div>
            </div>
            <h1 className="text-6xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9] drop-shadow-2xl">
              The Magic is <br />
              <span className="text-secondary drop-shadow-[0_0_40px_rgba(233,190,36,0.4)]">Almost Here</span>
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8 w-full max-w-6xl mb-16">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds }
            ].map(({ label, value }) => (
              <Card key={label} className="bg-white/5 border-white/10 backdrop-blur-2xl rounded-[3rem] group hover:bg-white/10 transition-all duration-500 border-2 shadow-2xl">
                <CardContent className="p-10 lg:p-14 text-center">
                  <div className="text-7xl lg:text-9xl font-black text-white group-hover:text-secondary transition-all tabular-nums leading-none">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs lg:text-sm font-black text-white/40 uppercase tracking-[0.4em] mt-8 group-hover:text-white/60">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <div className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/5 border border-white/10 text-secondary text-sm font-bold uppercase tracking-widest backdrop-blur-md">
              <CalendarDays className="w-5 h-5" />
              <span>Expected Date: March 20, 2026</span>
            </div>
            <Button 
              onClick={toggleTakbir}
              variant="outline"
              className={cn(
                "rounded-[2rem] h-20 px-14 font-black text-xl gap-4 transition-all duration-500 border-2 shadow-2xl",
                isPlayingTakbir ? "bg-white text-emerald-950 border-white" : "text-white border-white/20 hover:bg-white/10"
              )}
            >
              {isPlayingTakbir ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
              {isPlayingTakbir ? "Stop Takbir" : "Play Eid Takbir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
