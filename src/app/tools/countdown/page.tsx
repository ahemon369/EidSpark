
"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Moon, Star, Sparkles } from "lucide-react"

export default function EidCountdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Set a date for demonstration (e.g. 30 days from now)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 15)
    targetDate.setHours(targetDate.getHours() + 5)

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

  return (
    <div className="min-h-screen bg-[#02180c] text-white selection:bg-secondary selection:text-primary">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="flex flex-col items-center text-center space-y-12 relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-secondary font-bold text-sm tracking-widest uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Coming Soon</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-headline tracking-tight text-white">
              The Magic of Eid is <br />
              <span className="text-secondary">Almost Here</span>
            </h1>
          </div>

          {/* Moon Animation Container */}
          <div className="relative">
            <div className="w-64 h-64 lg:w-80 lg:h-80 rounded-full bg-gradient-to-br from-secondary via-amber-200 to-amber-500 shadow-[0_0_100px_rgba(233,190,36,0.3)] animate-float flex items-center justify-center group overflow-hidden">
               {/* Crescent part overlay */}
               <div className="absolute top-0 right-0 w-3/4 h-full bg-[#02180c] rounded-full translate-x-4 -translate-y-2 group-hover:translate-x-6 transition-transform duration-700"></div>
            </div>
            <Star className="absolute -top-4 -left-4 w-8 h-8 text-secondary animate-pulse" />
            <Star className="absolute top-1/2 -right-12 w-6 h-6 text-white/40 animate-pulse delay-300" />
            <Star className="absolute -bottom-8 left-1/2 w-4 h-4 text-white/60 animate-pulse delay-700" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8 w-full max-w-4xl">
            {Object.entries(timeLeft).map(([label, value]) => (
              <Card key={label} className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden group">
                <CardContent className="p-8 text-center">
                  <div className="text-5xl lg:text-7xl font-bold text-white group-hover:text-secondary transition-colors duration-300">
                    {value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm font-bold text-white/40 uppercase tracking-widest mt-2">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="max-w-xl mx-auto space-y-6 pt-12">
            <h3 className="text-2xl font-bold">"May this Eid bring joy, health, and prosperity to your life."</h3>
            <p className="text-white/60 italic">— Traditional Eid Prayer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
