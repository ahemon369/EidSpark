
"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth, useUser } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { LogIn, Star, Sparkles, ArrowRight, AlertCircle, ExternalLink, Mail, Lock, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LoginPage() {
  const { user, isUserLoading: loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [configError, setConfigError] = useState(false)
  
  // Email/Password states
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && !auth) {
      setConfigError(true)
    }
  }, [auth, loading])

  const handleGoogleLogin = async () => {
    if (!auth) return
    setIsProcessing(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Welcome to EidSpark!",
        description: "Successfully signed in with Google.",
      })
    } catch (error: any) {
      console.error("Login Error:", error)
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: error.message || "An unexpected error occurred.",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEmailAuth = async (mode: "signin" | "signup") => {
    if (!auth) return
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter both email and password.",
      })
      return
    }

    setIsProcessing(true)
    try {
      if (mode === "signin") {
        await signInWithEmailAndPassword(auth, email, password)
        toast({
          title: "Welcome back!",
          description: "Successfully signed in.",
        })
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
        toast({
          title: "Account created!",
          description: "Welcome to the EidSpark community.",
        })
      }
    } catch (error: any) {
      console.error("Auth Error:", error)
      let message = "An error occurred during authentication."
      if (error.code === 'auth/user-not-found') message = "No user found with this email."
      if (error.code === 'auth/wrong-password') message = "Incorrect password."
      if (error.code === 'auth/email-already-in-use') message = "This email is already registered."
      if (error.code === 'auth/weak-password') message = "Password should be at least 6 characters."
      
      toast({
        variant: "destructive",
        title: mode === "signin" ? "Sign-In Failed" : "Sign-Up Failed",
        description: message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="relative w-full max-w-lg">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse delay-700"></div>

          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(6,95,70,0.15)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
            <CardHeader className="emerald-gradient p-10 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Star className="w-20 h-20 fill-white" />
              </div>
              <div className="relative z-10 space-y-3">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
                  <Sparkles className="w-7 h-7 text-secondary fill-secondary" />
                </div>
                <CardTitle className="text-3xl font-black tracking-tight">Welcome to EidSpark</CardTitle>
                <CardDescription className="text-white/80 font-medium text-base">
                  Celebrate, calculate, and connect with your community.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              {configError && (
                <Alert variant="destructive" className="rounded-2xl border-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription className="space-y-4">
                    <p>Firebase Authentication needs to be properly configured in your project.</p>
                    <Link 
                      href="https://console.firebase.google.com/" 
                      target="_blank"
                      className="inline-flex items-center text-xs font-bold underline gap-1"
                    >
                      Open Firebase Console <ExternalLink className="w-3 h-3" />
                    </Link>
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-accent/50 p-1">
                  <TabsTrigger value="signin" className="rounded-lg font-bold">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" className="rounded-lg font-bold">Sign Up</TabsTrigger>
                </TabsList>
                
                {["signin", "signup"].map((mode) => (
                  <TabsContent key={mode} value={mode} className="space-y-4 animate-in fade-in duration-300">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`${mode}-email`} className="text-primary font-bold ml-1">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input 
                            id={`${mode}-email`}
                            type="email" 
                            placeholder="name@example.com" 
                            className="h-12 pl-12 rounded-xl border-2 border-primary/10 focus:border-primary/30"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`${mode}-password`} className="text-primary font-bold ml-1">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input 
                            id={`${mode}-password`}
                            type="password" 
                            placeholder="••••••••" 
                            className="h-12 pl-12 rounded-xl border-2 border-primary/10 focus:border-primary/30"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => handleEmailAuth(mode as "signin" | "signup")}
                        disabled={isProcessing || configError}
                        className="w-full h-14 rounded-xl emerald-gradient text-white font-black text-lg shadow-lg hover:scale-[1.02] transition-transform active:scale-95"
                      >
                        {isProcessing ? "Processing..." : (mode === "signin" ? "Sign In" : "Create Account")}
                        {mode === "signin" ? <LogIn className="ml-2 w-5 h-5" /> : <UserPlus className="ml-2 w-5 h-5" />}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">Or continue with</span>
                </div>
              </div>

              <Button 
                onClick={handleGoogleLogin} 
                disabled={isProcessing || configError}
                variant="outline"
                className="w-full h-14 rounded-xl border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary font-black text-base shadow-sm transition-all group active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      style={{ fill: '#4285F4' }}
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      style={{ fill: '#34A853' }}
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      style={{ fill: '#FBBC05' }}
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      style={{ fill: '#EA4335' }}
                    />
                  </svg>
                  {isProcessing ? "Connecting..." : "Google Account"}
                </div>
              </Button>

              <p className="text-center text-xs text-muted-foreground font-medium">
                By signing in, you agree to our <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
              </p>

              <Button variant="ghost" className="w-full h-10 rounded-lg text-primary font-bold hover:bg-primary/5" asChild>
                <Link href="/">
                  <ArrowRight className="mr-2 w-4 h-4 rotate-180" /> Back to Homepage
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
