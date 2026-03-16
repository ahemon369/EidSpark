"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Mail, ShieldCheck, ChevronRight, Heart, Facebook, Instagram, Twitter, Send } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-32 transition-colors duration-500 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-100 to-transparent"></div>
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-20 mb-24">
          
          <div className="lg:col-span-4 space-y-10">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-14 h-14 transition-transform group-hover:scale-110">
                {logo?.imageUrl && (
                  <Image 
                    src={logo.imageUrl} 
                    alt="EidSpark Logo" 
                    width={56} 
                    height={56} 
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-3xl font-black tracking-tighter text-slate-900">EidSpark</span>
            </Link>
            <div className="space-y-8">
              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm">
                Empowering Eid celebrations with modern technology. Built for the community, by the community.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, href: "#" },
                  { icon: Instagram, href: "#" },
                  { icon: Twitter, href: "#" },
                  { icon: Github, href: "https://github.com/ahemon369" }
                ].map((social, i) => (
                  <Link key={i} href={social.href} className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all">
                    <social.icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] mb-8">Studio Tools</h4>
            <ul className="space-y-5 text-slate-500 font-bold">
              <li><Link href="/tools/jamaat-finder" className="hover:text-primary transition-colors">Jamaat Finder</Link></li>
              <li><Link href="/tools/zakat" className="hover:text-primary transition-colors">Zakat Assistant</Link></li>
              <li><Link href="/tools/greeting" className="hover:text-primary transition-colors">Greeting Designer</Link></li>
              <li><Link href="/tools/selfie" className="hover:text-primary transition-colors">Selfie Frame AI</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] mb-8">Community</h4>
            <ul className="space-y-5 text-slate-500 font-bold">
              <li><Link href="/leaderboard" className="hover:text-primary transition-colors">Hall of Fame</Link></li>
              <li><Link href="/fun-zone" className="hover:text-primary transition-colors">Fun Hub</Link></li>
              <li><Link href="/tools/moon-sighting" className="hover:text-primary transition-colors">Moon Tracker</Link></li>
              <li><Link href="/tools/countdown" className="hover:text-primary transition-colors">Countdown</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] mb-2">Weekly Spark</h4>
            <p className="text-slate-500 font-medium text-sm">Join 5,000+ subscribers for Eid tips and viral updates.</p>
            <div className="flex gap-2">
              <Input placeholder="name@example.com" className="h-14 rounded-xl bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-primary" />
              <Button className="h-14 w-14 rounded-xl emerald-gradient text-white shrink-0"><Send className="w-5 h-5" /></Button>
            </div>
          </div>
        </div>
        
        <div className="pt-16 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-400 font-bold text-sm">
            © 2026 EidSpark Bangladesh. Crafted with <Heart className="w-4 h-4 inline fill-rose-500 text-rose-500" /> for the community.
          </p>
          <div className="flex items-center gap-4 text-emerald-600/60 font-black uppercase tracking-widest text-[10px]">
            <ShieldCheck className="w-5 h-5" /> Verified Secure by Firebase
          </div>
        </div>
      </div>
    </footer>
  )
}