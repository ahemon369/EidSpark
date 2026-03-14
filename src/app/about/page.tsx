
"use client"

import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Heart, Users, ShieldCheck, Globe, Sparkles } from "lucide-react"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const stats = [
  { label: "Active Users", value: "10K+", icon: Users },
  { label: "Greetings Sent", value: "50K+", icon: Sparkles },
  { label: "Mosques Listed", value: "500+", icon: Globe },
  { label: "Safe & Secure", value: "100%", icon: ShieldCheck },
]

export default function AboutPage() {
  const heroImage = PlaceHolderImages.find(img => img.id === "hero-mosque")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* About Hero */}
        <section className="py-20 bg-primary/5 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                  <Star className="w-3 h-3 fill-primary" />
                  <span>Our Mission</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black text-primary leading-tight">
                  Empowering Eid <br />
                  <span className="text-secondary">With Technology</span>
                </h1>
                <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                  EidSpark was born out of a desire to blend the beautiful traditions of Eid with modern digital convenience. We aim to be the ultimate digital companion for every Bangladeshi family during the festive season.
                </p>
              </div>
              <div className="relative">
                <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white transform rotate-2">
                  <Image 
                    src={heroImage?.imageUrl || ""} 
                    alt="Celebration" 
                    width={800} 
                    height={600} 
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-secondary p-8 rounded-3xl text-primary shadow-xl hidden md:block">
                  <Heart className="w-10 h-10 fill-primary mb-4" />
                  <p className="font-black text-2xl">Made for <br />Bangladesh</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/5 -skew-x-12 transform translate-x-1/2"></div>
        </section>

        {/* Stats Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-none shadow-lg bg-white rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                  <CardContent className="p-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto text-primary group-hover:scale-110 transition-transform">
                      <stat.icon className="w-8 h-8" />
                    </div>
                    <div className="text-4xl font-black text-primary">{stat.value}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-accent/30">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
            <h2 className="text-4xl font-black text-primary">The EidSpark Story</h2>
            <div className="space-y-6 text-lg text-muted-foreground font-medium leading-relaxed">
              <p>
                In the heart of Dhaka, we realized that while our traditions are eternal, the way we manage them could be smarter. Whether it's calculating Zakat precisely, finding the nearest mosque for Eid prayers, or keeping track of the joy (Salami!) shared between generations—we wanted a single, beautiful place for it all.
              </p>
              <p>
                Today, EidSpark serves thousands of users across all divisions of Bangladesh. We use AI to help you craft the perfect message and smart tracking to help you manage your blessings.
              </p>
            </div>
            <div className="pt-8">
              <div className="inline-block p-1 rounded-full bg-white shadow-xl">
                 <div className="flex -space-x-4">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className="w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-muted">
                        <Image src={`https://picsum.photos/seed/team-${i}/100/100`} alt="User" width={64} height={64} />
                      </div>
                    ))}
                 </div>
              </div>
              <p className="mt-6 text-primary font-black">Trusted by the community</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
