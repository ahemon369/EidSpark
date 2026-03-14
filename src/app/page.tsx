
import Image from "next/image"
import Link from "next/link"
import { 
  Calculator, 
  Send, 
  Wallet, 
  Timer, 
  MapPin, 
  ArrowRight,
  Star
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { cn } from "@/lib/utils"

const tools = [
  {
    title: "Zakat Calculator",
    description: "Calculate your zakat obligation quickly and accurately with our modern tool.",
    icon: Calculator,
    href: "/tools/zakat",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    title: "Greeting Generator",
    description: "Create beautiful, AI-powered Eid cards to share with your loved ones.",
    icon: Send,
    href: "/tools/greeting",
    color: "bg-amber-100 text-amber-700"
  },
  {
    title: "Salami Tracker",
    description: "Keep track of your Eid gifts and see how you rank on the leaderboard.",
    icon: Wallet,
    href: "/tools/salami",
    color: "bg-blue-100 text-blue-700"
  },
  {
    title: "Eid Countdown",
    description: "Stay excited with our beautiful animated countdown to the big day.",
    icon: Timer,
    href: "/tools/countdown",
    color: "bg-purple-100 text-purple-700"
  },
  {
    title: "Mosque Finder",
    description: "Locate mosques near you for Eid prayers and community gatherings.",
    icon: MapPin,
    href: "/tools/mosque",
    color: "bg-rose-100 text-rose-700"
  }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-mosque")
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-20 lg:pt-32 lg:pb-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-in fade-in slide-in-from-left duration-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-primary/20 text-primary text-sm font-medium">
                  <Star className="w-4 h-4 fill-secondary text-secondary" />
                  <span>Your Festive Celebration Companion</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-bold font-headline leading-tight tracking-tight text-primary">
                  EidSpark – <span className="text-secondary">Spark</span> Your Eid Celebration
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                  The all-in-one platform for your Eid essentials. From Zakat calculations to personalized greetings, we help you celebrate better.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="emerald-gradient text-white rounded-full px-8" asChild>
                    <Link href="#tools">Explore Tools</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full px-8 border-primary/20 text-primary hover:bg-accent/30" asChild>
                    <Link href="/tools/greeting">Create Eid Greeting</Link>
                  </Button>
                </div>
              </div>

              <div className="relative animate-in fade-in slide-in-from-right duration-1000">
                <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 animate-float">
                  <Image
                    src={heroImage?.imageUrl || ""}
                    alt="Eid Celebration Mosque"
                    width={1200}
                    height={800}
                    className="object-cover"
                    priority
                    data-ai-hint="mosque moon"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white glass p-4 rounded-2xl max-w-xs">
                    <p className="font-medium">"Everything I needed for Eid in one beautiful place."</p>
                    <p className="text-sm opacity-80 mt-1">— Ahmed, Power User</p>
                  </div>
                </div>
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl -z-10"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="tools" className="py-20 bg-accent/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-bold font-headline text-primary">Smart Tools for a Better Eid</h2>
              <p className="text-muted-foreground">Modern solutions for age-old traditions. Choose a tool below to get started.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tools.map((tool, index) => (
                <Link key={tool.title} href={tool.href}>
                  <Card className="h-full group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/50 overflow-hidden">
                    <CardHeader>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", tool.color)}>
                        <tool.icon className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">{tool.title}</CardTitle>
                      <CardDescription className="text-base mt-2">{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-end">
                      <div className="text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-[2.5rem] bg-primary p-12 lg:p-16 relative overflow-hidden text-center text-white">
              <div className="relative z-10 space-y-6">
                <h2 className="text-4xl lg:text-5xl font-bold font-headline">Ready to spark your celebration?</h2>
                <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
                  Join thousands of families using EidSpark to simplify their traditions and focus on what matters most.
                </p>
                <div className="pt-4 flex justify-center gap-4">
                  <Button size="lg" className="gold-gradient text-primary font-bold px-10 rounded-full hover:scale-105 transition-transform">
                    Sign Up Free
                  </Button>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 overflow-hidden rounded-lg border border-primary/10 transition-transform group-hover:scale-110">
                <Image 
                  src={logo?.imageUrl || ""} 
                  alt="EidSpark Logo" 
                  fill 
                  className="object-cover"
                  data-ai-hint="eid moon mosque"
                />
              </div>
              <span className="text-xl font-bold font-headline text-primary tracking-tight">EidSpark</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-primary">Terms</Link>
              <Link href="#" className="hover:text-primary">Privacy</Link>
              <Link href="#" className="hover:text-primary">Help</Link>
              <Link href="#" className="hover:text-primary">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} EidSpark. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
