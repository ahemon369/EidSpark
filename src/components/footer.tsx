
"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Mail, ShieldCheck, Heart, Facebook, Twitter, Send } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  return (
    <footer className="bg-[#f8fafc] border-t border-slate-200/60 py-24 transition-colors duration-500 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Column 1 — Brand */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 transition-transform group-hover:scale-110">
                {logo?.imageUrl && (
                  <Image 
                    src={logo.imageUrl} 
                    alt="EidSpark Logo" 
                    width={48} 
                    height={48} 
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-2xl font-black tracking-tighter text-slate-900">EidSpark</span>
            </Link>
            <p className="text-slate-500 font-medium text-base leading-relaxed">
              Empowering Eid celebrations with modern technology. Built for the Muslim community.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Github, href: "https://github.com", label: "GitHub" },
                { icon: Mail, href: "mailto:hello@eidspark.com", label: "Email" }
              ].map((social, i) => (
                <Link 
                  key={i} 
                  href={social.href} 
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary hover:shadow-sm transition-all"
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>
          
          {/* Column 2 — Studio Tools */}
          <div className="space-y-8">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] pb-2 border-b border-slate-200 w-fit">Studio Tools</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link href="/tools/jamaat-finder" className="hover:text-primary transition-colors flex items-center gap-2">Jamaat Finder</Link></li>
              <li><Link href="/tools/zakat" className="hover:text-primary transition-colors flex items-center gap-2">Zakat Assistant</Link></li>
              <li><Link href="/tools/greeting" className="hover:text-primary transition-colors flex items-center gap-2">Greeting Designer</Link></li>
              <li><Link href="/tools/selfie" className="hover:text-primary transition-colors flex items-center gap-2">Selfie Frame AI</Link></li>
            </ul>
          </div>

          {/* Column 3 — Platform Features */}
          <div className="space-y-8">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] pb-2 border-b border-slate-200 w-fit">Platform Features</h4>
            <ul className="space-y-4 text-slate-500 font-bold text-sm">
              <li><Link href="/tools/salami-calculator" className="hover:text-primary transition-colors">Salami Guide</Link></li>
              <li><Link href="/tools/moon-sighting" className="hover:text-primary transition-colors">Moon Sight Tracker</Link></li>
              <li><Link href="/tools/salami" className="hover:text-primary transition-colors">Salami Center</Link></li>
              <li><Link href="/tools/countdown" className="hover:text-primary transition-colors">Live Countdown</Link></li>
            </ul>
          </div>

          {/* Column 4 — Community & Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] pb-2 border-b border-slate-200 w-fit mb-6">Community</h4>
              <ul className="space-y-4 text-slate-500 font-bold text-sm mb-10">
                <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Hall of Fame</Link></li>
                <li><Link href="/fun-zone" className="hover:text-primary transition-colors">Fun Hub</Link></li>
                <li><Link href="/dashboard" className="hover:text-primary transition-colors">Community Feed</Link></li>
              </ul>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200">
              <p className="text-slate-900 font-black text-xs uppercase tracking-widest">Weekly Spark</p>
              <p className="text-slate-500 text-xs font-medium">Get Eid updates and new features.</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email address" 
                  className="h-11 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-primary/10" 
                />
                <Button size="icon" className="h-11 w-11 rounded-xl emerald-gradient text-white shrink-0 shadow-lg shadow-emerald-200">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-12 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 font-bold text-xs tracking-tight">
            © 2026 EidSpark Bangladesh. Crafted with <Heart className="w-3 h-3 inline fill-rose-500 text-rose-500 mx-1" /> for the community.
          </p>
          <div className="flex items-center gap-4 text-emerald-600/40 font-black uppercase tracking-[0.2em] text-[9px]">
            <ShieldCheck className="w-4 h-4" /> Secured by Firebase Cloud
          </div>
        </div>
      </div>
    </footer>
  )
}
