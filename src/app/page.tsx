
import Image from "next/image"
import Link from "next/link"
import { 
  Calculator, 
  Send, 
  Wallet, 
  Timer, 
  MapPin, 
  ArrowRight,
  Star,
  Sparkles,
  ChevronRight,
  Camera,
  Moon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const tools = [
  {
    title: "Zakat Calculator",
    description: "Calculate your zakat obligation in BDT accurately with our modern tool.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "Greeting Generator",
    description: "Create AI-powered Eid cards with traditional Bangladeshi motifs.",
    icon: Send,
    href: "/tools/greeting",
    color: "bg-amber-100 text-amber-700"
  },
  {
    title: "Selfie Frame",
    description: "Decorate your Eid selfies with beautiful themed frames and share.",
    icon: Camera,
    href: "/tools/selfie",
    color: "bg-orange-100 text-orange-700"
  },
  {
    title: "Salami Tracker",
    description: "Keep track of your Eid Eidi/Salami and join the national leaderboard.",
    icon: Wallet,
    href: "/tools/salami",
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Eid Countdown",
    description: "Animated countdown to Eid-ul-Fitr and Eid-ul-Adha for Bangladesh.",
    icon: Timer,
    href: "/tools/countdown",
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "Mosque & Prayer",
    description: "Find mosques near you and stay on track with accurate prayer times.",
    icon: MapPin,
    href: "/tools/mosque",
    color: "bg-rose-100 text-rose-700"
  }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-mosque")
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-white islamic-pattern">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-40 emerald-gradient">
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             <div className="absolute top-20 right-[10%] animate-float">
               <Moon className="w-32 h-32 text-secondary fill-secondary" />
             </div>
             <div className="absolute bottom-20 left-[5%] animate-float delay-700">
               <Sparkles className="w-24 h-24 text-secondary/40" />
             </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-white">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-10 animate-in fade-in slide-in-from-left duration-1000">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold tracking-wide backdrop-blur-md">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>The Ultimate Eid Companion for Bangladesh</span>
                </div>
                
                <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] tracking-tight">
                  EidSpark – <span className="text-secondary drop-shadow-lg">Spark</span> Your Celebration
                </h1>
                
                <p className="text-xl text-white/80 max-w-lg leading-relaxed font-medium">
                  Smart tools for everyone in Bangladesh. From precise Zakat calculations to personalized AI greetings and mosque finding.
                </p>
                
                <div className="flex flex-wrap gap-5">
                  <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 rounded-2xl px-10 h-16 text-lg font-bold shadow-2xl hover:scale-105 transition-all" asChild>
                    <Link href="#tools">Explore Tools <ChevronRight className="ml-2 w-5 h-5" /></Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-2xl px-10 h-16 text-lg font-bold border-2 border-white/30 text-white hover:bg-white/10 transition-all backdrop-blur-sm" asChild>
                    <Link href="/tools/greeting">Create Eid Greeting</Link>
                  </Button>
                </div>

                <div className="flex items-center gap-8 pt-4">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-12 h-12 rounded-full border-4 border-white/20 bg-muted overflow-hidden">
                        <Image src={`https://picsum.photos/seed/user-${i}/100/100`} alt="User" width={48} height={48} />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-bold text-white/70">
                    <span className="text-white block text-lg">10,000+</span>
                    Users across Bangladesh
                  </div>
                </div>
              </div>

              <div className="relative animate-in fade-in zoom-in duration-1000 delay-200">
                <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] border-8 border-white/10 animate-float bg-white/5 backdrop-blur-md">
                  <Image
                    src={heroImage?.imageUrl || ""}
                    alt="Baitul Mukarram National Mosque"
                    width={1200}
                    height={800}
                    className="object-cover opacity-90"
                    priority
                    data-ai-hint="mosque twilight"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10 text-white glass-card p-6 rounded-3xl border-white/20 bg-white/10">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-secondary fill-secondary" />
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Now Trending</span>
                    </div>
                    <p className="text-2xl font-bold italic leading-tight">"Celebrating Eid with tradition and technology combined."</p>
                  </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute -top-12 -right-12 w-72 h-72 bg-secondary/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
                <div className="absolute -bottom-12 -left-12 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse delay-700"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Tools Section */}
        <section id="tools" className="py-32 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
              <h2 className="text-4xl lg:text-6xl font-black text-primary tracking-tight">Powerful Tools for Your Eid</h2>
              <p className="text-xl text-muted-foreground font-medium">Everything you need for a blessed celebration in one beautiful place.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {tools.map((tool, index) => (
                <Link key={tool.title} href={tool.href} className="group">
                  <Card className="h-full border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(6,95,70,0.15)] transition-all duration-500 rounded-[2.5rem] overflow-hidden group-hover:-translate-y-2 glow-hover">
                    <CardHeader className="p-10 pb-0">
                      <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm", tool.color)}>
                        <tool.icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                      <CardDescription className="text-lg mt-4 leading-relaxed font-medium">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-10 pt-6 flex justify-end">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <ArrowRight className="w-6 h-6" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="emerald-gradient rounded-[4rem] p-16 lg:p-24 relative overflow-hidden shadow-2xl">
              <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center text-white">
                <div className="space-y-8 text-center lg:text-left">
                  <h2 className="text-4xl lg:text-6xl font-black leading-tight">Ready to Spark Your Eid?</h2>
                  <p className="text-white/80 text-xl font-medium max-w-md mx-auto lg:mx-0">
                    Join thousands of Bangladeshi families making their Eid more organized and joyful.
                  </p>
                  <Button size="lg" className="bg-secondary text-primary font-black px-12 h-16 rounded-2xl text-xl hover:scale-105 transition-transform shadow-xl">
                    Get Started Free
                  </Button>
                </div>
                <div className="hidden lg:block">
                   <div className="relative aspect-square w-full max-w-sm mx-auto">
                     <div className="absolute inset-0 bg-white/5 rounded-full animate-pulse blur-3xl"></div>
                     <Star className="absolute top-0 right-0 w-24 h-24 text-secondary fill-secondary animate-float" />
                     <Star className="absolute bottom-12 left-0 w-16 h-16 text-secondary/30 fill-secondary/30 animate-float delay-700" />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 rounded-full border-8 border-white/10 flex items-center justify-center animate-spin-slow">
                           <Sparkles className="w-20 h-20 text-secondary/40" />
                        </div>
                     </div>
                   </div>
                </div>
              </div>
              
              {/* Patterns */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 space-y-6">
              <Link href="/" className="flex items-center gap-3">
                <div className="relative w-12 h-12 overflow-hidden flex items-center justify-center">
                  <Image 
                    src={logo?.imageUrl || ""} 
                    alt="EidSpark Official Logo" 
                    width={48} 
                    height={48} 
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-black tracking-tight text-primary">EidSpark</span>
              </Link>
              <p className="text-muted-foreground font-medium leading-relaxed">
                Empowering the Bangladeshi community with smart Eid tools. Celebrating tradition with modern technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-primary mb-6">Tools</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="/tools/zakat" className="hover:text-primary transition-colors">Zakat Calculator</Link></li>
                <li><Link href="/tools/greeting" className="hover:text-primary transition-colors">Greeting Generator</Link></li>
                <li><Link href="/tools/salami" className="hover:text-primary transition-colors">Salami Tracker</Link></li>
                <li><Link href="/tools/selfie" className="hover:text-primary transition-colors">Selfie Frame</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-primary mb-6">Platform</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li><Link href="/tools/countdown" className="hover:text-primary transition-colors">Eid Countdown</Link></li>
                <li><Link href="/tools/mosque" className="hover:text-primary transition-colors">Mosque & Prayer</Link></li>
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-primary mb-6">Contact</h4>
              <ul className="space-y-4 text-muted-foreground font-medium">
                <li>Dhaka, Bangladesh</li>
                <li>hello@eidspark.bd</li>
                <li>+880 123 456 789</li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-muted-foreground font-medium text-sm">
              © {new Date().getFullYear()} EidSpark Bangladesh. All rights reserved.
            </p>
            <div className="flex gap-8 text-sm font-bold text-primary">
              <Link href="#" className="hover:opacity-70">Privacy Policy</Link>
              <Link href="#" className="hover:opacity-70">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
