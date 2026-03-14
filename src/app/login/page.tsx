"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth, useUser } from "@/firebase"
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import { LogIn, Star, Sparkles, ArrowRight, AlertCircle, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const { user, isUserLoading: loading } = useUser()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [configError, setConfigError] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!loading && !auth) {
      setConfigError(true)
    }
  }, [auth, loading])

  const handleLogin = async () => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Firebase is not configured correctly. Please check your setup.",
      })
      return
    }

    setIsSigningIn(true)
    const provider = new GoogleAuthProvider()
    // Optional: Add custom parameters if needed
    // provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider)
      toast({
        title: "Welcome to EidSpark!",
        description: "Successfully signed in with Google.",
      })
    } catch (error: any) {
      console.error("Login Error:", error)
      let message = "An unexpected error occurred."
      
      if (error.code === 'auth/popup-blocked') {
        message = "The sign-in popup was blocked. Please allow popups."
      } else if (error.code === 'auth/operation-not-allowed') {
        message = "Google Sign-In is not enabled. Go to Firebase Console > Authentication > Sign-in method."
      } else if (error.code === 'auth/configuration-not-found') {
        message = "Check your Firebase project configuration."
      } else if (error.code === 'auth/internal-error') {
        message = "Internal authentication error. Please ensure Google Sign-In is enabled in the Firebase Console."
      }
      
      toast({
        variant: "destructive",
        title: "Sign-In Failed",
        description: message,
      })
    } finally {
      setIsSigningIn(false)
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
      
      <main className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="relative w-full max-w-md">
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse delay-700"></div>

          <Card className="border-none shadow-[0_32px_64px_-12px_rgba(6,95,70,0.15)] rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
            <CardHeader className="emerald-gradient p-12 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Star className="w-20 h-20 fill-white" />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-md">
                  <Sparkles className="w-8 h-8 text-secondary fill-secondary" />
                </div>
                <CardTitle className="text-4xl font-black tracking-tight">Join EidSpark</CardTitle>
                <CardDescription className="text-white/80 font-medium text-lg">
                  Save your greetings, track your Salami, and celebrate with the community.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-8">
              {configError && (
                <Alert variant="destructive" className="rounded-2xl border-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Configuration Required</AlertTitle>
                  <AlertDescription className="space-y-4">
                    <p>Google Sign-In needs to be enabled in your Firebase Console.</p>
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

              <div className="space-y-4">
                <Button 
                  onClick={handleLogin} 
                  disabled={isSigningIn || configError}
                  className="w-full h-16 rounded-2xl bg-white border-2 border-primary/10 hover:border-primary/30 hover:bg-primary/5 text-primary font-black text-lg shadow-sm transition-all group active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                    {isSigningIn ? "Connecting..." : "Continue with Google"}
                  </div>
                </Button>
                <p className="text-center text-xs text-muted-foreground font-medium px-6">
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-primary/10"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-muted-foreground font-bold tracking-widest">Or</span>
                </div>
              </div>

              <Button variant="ghost" className="w-full h-12 rounded-xl text-primary font-bold hover:bg-primary/5" asChild>
                <Link href="/">
                  Back to Homepage <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
