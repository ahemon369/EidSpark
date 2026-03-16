
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, ChevronRight, Trophy, Sparkles, Star } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { doc } from "firebase/firestore"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Fun Zone", href: "/fun-zone", icon: Sparkles },
  { name: "Jamaat Finder", href: "/tools/jamaat-finder" },
  { name: "Zakat", href: "/tools/zakat" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const { toast } = useToast()
  
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  
  const { data: userData } = useDoc(userDocRef)
  const totalPoints = userData?.totalPoints || 0

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({ title: "Signed Out", description: "Come back soon!" })
      router.push("/")
    } catch (error) {}
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-[70px] flex items-center",
      scrolled 
        ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.05)]" 
        : "bg-white border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group z-50">
            <div className="relative h-8 w-8 transition-transform group-hover:scale-110">
               {logo?.imageUrl && (
                 <Image 
                  src={logo.imageUrl} 
                  alt="EidSpark Logo" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                  priority
                 />
               )}
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              EidSpark
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-slate-600 hover:text-primary hover:bg-slate-50"
                )}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-4 z-50">
            {user && !loading && (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 shadow-sm">
                <Star className="w-4 h-4 text-secondary fill-secondary animate-pulse" />
                <span className="text-xs font-black text-primary tracking-tighter">
                  {totalPoints} <span className="text-[10px] text-muted-foreground font-bold uppercase ml-0.5">Points</span>
                </span>
              </div>
            )}

            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 hover:ring-primary/30 transition-all p-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || ""} />
                      <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.[0]}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2 rounded-2xl mt-2" align="end">
                  <DropdownMenuLabel className="font-bold p-4 text-slate-900">
                    <p className="text-sm font-black text-primary">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="rounded-xl font-bold"><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive font-bold rounded-xl focus:text-destructive">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="emerald-gradient text-white rounded-full font-black px-8 h-11 shadow-xl shadow-emerald-200 hover:scale-105 transition-all">
                <Link href="/login">Get Started <ChevronRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="lg:hidden flex items-center gap-2 z-50">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-primary bg-primary/5"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <div className={cn(
        "fixed inset-0 bg-white lg:hidden transition-all duration-500 ease-in-out z-[60] flex flex-col items-center justify-center",
        isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-xl text-primary bg-primary/5"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="space-y-6 w-full max-w-xs text-center">
          {user && (
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-secondary/10 border-2 border-secondary/20 mb-8">
              <Star className="w-6 h-6 text-secondary fill-secondary" />
              <span className="text-2xl font-black text-primary">{totalPoints} XP</span>
            </div>
          )}
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "block py-3 rounded-2xl text-2xl font-black transition-all flex items-center justify-center gap-3",
                pathname === item.href ? "text-primary bg-primary/5" : "text-slate-600 hover:text-primary"
              )}
            >
              {item.icon && <item.icon className="w-6 h-6" />}
              {item.name}
            </Link>
          ))}
          <div className="pt-8">
            {user ? (
              <Button asChild className="w-full h-14 rounded-2xl font-black text-lg emerald-gradient shadow-xl" onClick={() => setIsOpen(false)}>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button asChild className="w-full h-14 rounded-2xl font-black text-lg emerald-gradient shadow-xl" onClick={() => setIsOpen(false)}>
                <Link href="/login">Join EidSpark</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
