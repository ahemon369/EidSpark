
"use client"

import Link from "next/link"
import Image from "next/image"
import { Github, Mail, ShieldCheck, ChevronRight, Heart } from "lucide-react"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function Footer() {
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-border py-32 transition-colors duration-500 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 emerald-gradient opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-20 mb-24">
          <div className="col-span-1 space-y-10">
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative w-16 h-16 transition-transform group-hover:scale-110">
                {logo?.imageUrl && (
                  <Image 
                    src={logo.imageUrl} 
                    alt="EidSpark Logo" 
                    width={64} 
                    height={64} 
                    className="object-contain"
                  />
                )}
              </div>
              <span className="text-4xl font-black tracking-tighter text-primary dark:text-secondary">EidSpark</span>
            </Link>
            <div className="space-y-6">
              <p className="text-muted-foreground font-medium text-lg leading-relaxed">
                Empowering Eid celebrations with modern technology. Built for the community, by the community.
              </p>
              <div className="flex gap-6">
                <Link href="https://github.com/ahemon369" target="_blank" className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary dark:text-secondary hover:bg-primary hover:text-white dark:hover:bg-secondary dark:hover:text-primary transition-all shadow-xl">
                  <Github className="w-7 h-7" />
                </Link>
                <Link href="mailto:ahemon0156@gmail.com" className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-white/5 flex items-center justify-center text-primary dark:text-secondary hover:bg-primary hover:text-white dark:hover:bg-secondary dark:hover:text-primary transition-all shadow-xl">
                  <Mail className="w-7 h-7" />
                </Link>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-black text-primary dark:text-secondary uppercase tracking-[0.2em] text-xs mb-10">Studio Tools</h4>
            <ul className="space-y-6 text-muted-foreground font-bold text-lg">
              <li><Link href="/tools/jamaat-finder" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Jamaat Finder</Link></li>
              <li><Link href="/tools/zakat" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Zakat Assistant</Link></li>
              <li><Link href="/tools/greeting" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Greeting Designer</Link></li>
              <li><Link href="/tools/selfie" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Selfie Frame AI</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-primary dark:text-secondary uppercase tracking-[0.2em] text-xs mb-10">Platform</h4>
            <ul className="space-y-6 text-muted-foreground font-bold text-lg">
              <li><Link href="/tools/salami-calculator" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Salami Guide</Link></li>
              <li><Link href="/tools/moon-sighting" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Moon Sight Tracker</Link></li>
              <li><Link href="/tools/salami" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Salami Center</Link></li>
              <li><Link href="/tools/countdown" className="hover:text-primary dark:hover:text-secondary transition-colors flex items-center gap-2 group"><ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-6 group-hover:ml-0" /> Live Countdown</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-primary dark:text-secondary uppercase tracking-[0.2em] text-xs mb-10">Legal</h4>
            <ul className="space-y-6 text-muted-foreground font-bold text-lg">
              <li><Link href="#" className="hover:text-primary dark:hover:text-secondary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary dark:hover:text-secondary transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-primary dark:hover:text-secondary transition-colors">Cookie Policy</Link></li>
              <li><Link href="#" className="hover:text-primary dark:hover:text-secondary transition-colors">Community Rules</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-16 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-muted-foreground font-bold text-sm">
            © 2026 EidSpark Bangladesh. Crafted with <Heart className="w-4 h-4 inline fill-rose-500 text-rose-500" /> for the community.
          </p>
          <div className="flex items-center gap-4 text-primary dark:text-secondary font-black uppercase tracking-widest text-xs">
            <ShieldCheck className="w-5 h-5" /> Secured by Firebase Cloud
          </div>
        </div>
      </div>
    </footer>
  )
}
