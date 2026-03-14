"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogIn, LogOut, User, Star } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
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

const navItems = [
  { name: "Home", href: "/" },
  { name: "Zakat", href: "/tools/zakat" },
  { name: "Greeting", href: "/tools/greeting" },
  { name: "Selfie", href: "/tools/selfie" },
  { name: "Salami", href: "/tools/salami" },
  { name: "Countdown", href: "/tools/countdown" },
  { name: "Mosques", href: "/tools/mosque" },
  { name: "About", href: "/about" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useUser()
  const auth = useAuth()
  const { toast } = useToast()
  
  const logo = PlaceHolderImages.find(img => img.id === "app-logo")

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Firebase is not initialized correctly.",
      })
      return
    }

    const provider = new GoogleAuthProvider()
    // Optional: add scopes if needed
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');

    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in with Google.",
      })
    } catch (error: any) {
      let message = "Please check your network connection."
      
      if (error.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked by your browser. Please allow popups for this site."
      } else if (error.code === 'auth/api-key-not-valid') {
        message = "Firebase API Key is invalid. Please update your environment variables."
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Google Sign-In is not enabled in the Firebase Console."
      }
      
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: message,
      })
    }
  }

  const handleLogout = async () => {
    if (!auth) return
    try {
      await signOut(auth)
      toast({
        title: "Signed Out",
        description: "Come back soon for more Eid celebrations!",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      })
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm backdrop-blur-xl border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 overflow-hidden transition-transform group-hover:scale-110 flex items-center justify-center">
               <Image 
                src={logo?.imageUrl || ""} 
                alt="EidSpark Logo" 
                width={48} 
                height={48} 
                className="object-contain"
                priority
               />
            </div>
            <span className="text-2xl font-black font-headline tracking-tight text-primary">EidSpark</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                  pathname === item.href
                    ? "text-primary bg-primary/5 shadow-inner"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="ml-6 pl-6 border-l border-primary/10">
              {loading ? (
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/10 ring-offset-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || ""} alt={user.displayName || ""} />
                        <AvatarFallback className="bg-primary text-white font-black">{user.displayName?.[0] || <User className="w-5 h-5" />}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-2 rounded-2xl" align="end">
                    <DropdownMenuLabel className="font-normal p-4">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-black leading-none text-primary">{user.displayName}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/tools/salami">My Salami History</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                      <Link href="/tools/selfie">Create Eid Selfie</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive rounded-xl">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="lg" onClick={handleLogin} className="emerald-gradient text-white rounded-2xl font-black px-6 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="lg:hidden glass border-t border-primary/10 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-4 pb-8 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "block px-4 py-3 rounded-2xl text-base font-bold transition-all",
                  pathname === item.href
                    ? "text-primary bg-primary/5 border-l-4 border-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-primary/10">
              {user ? (
                <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl justify-start text-destructive font-bold border-destructive/20 hover:bg-destructive/5">
                  <LogOut className="w-5 h-5 mr-3" />
                  Sign Out
                </Button>
              ) : (
                <Button onClick={handleLogin} className="w-full h-14 rounded-2xl emerald-gradient font-black text-lg">
                  <LogIn className="w-5 h-5 mr-3" />
                  Sign In with Google
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
