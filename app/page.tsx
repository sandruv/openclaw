"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { useToast } from '@/components/ui/toast-provider'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from 'next/navigation';
import { logger } from '@/lib/logger';
import { LoadingDots } from '@/components/custom/loading-dots';

const MicrosoftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAuthProcessing = searchParams?.get('authProcessing') === 'true'
  const [email, setEmail] = useState('admin@yanceyworks.com')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, loginViaMicrosoft, isLoading: authLoading } = useAuth()
  const [error, setError] = useState('');
  const { showToast } = useToast()

  // Clean up URL parameter after detecting it
  useEffect(() => {
    if (isAuthProcessing) {
      router.replace('/', { scroll: false })
    }
  }, [isAuthProcessing, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password)
      router.push('/dashboard'); // Redirect to dashboard after successful login
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : 'Login failed');
      showToast({
        type: 'error',
        title: 'Login Failed',
        description: 'Invalid email or password. Please try again.',
        duration: 5000
      })
    } finally {
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      setIsLoading(true);
      const authUrl = await loginViaMicrosoft();
      window.location.href = authUrl;
    } 
    catch (err) {
      console.error(err);
      showToast({
        type: 'error',
        title: 'Microsoft Login Failed',
        description: 'Unable to initiate Microsoft login. Please try again.',
        duration: 5000
      });
    } 
  };

  const getLoadingMessage = () => {
    if (isLoading) return "Signing you in";
    if (isAuthProcessing) return "Redirecting";
    return "Initializing";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative transition-colors">
      {(authLoading || isAuthProcessing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white dark:bg-gray-800 rounded-lg py-2 px-4 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 border-1 border-black dark:border-gray-700">
            <div className="flex items-center gap-1">
              <div className="relative w-[45px] h-[45px] flex items-center justify-center">
                <div className="absolute w-[40px] h-[40px] rounded-full border-[3px] border-lime-500/5 border-t-lime-500 animate-spin" />
                <Image
                  src="/yw-logo_only.png"
                  alt="YW Logo"
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex items-center justify-center w-[110px]">
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{getLoadingMessage()}</p>
                <LoadingDots className="mt-2" />
              </div>
            </div>
          </div>
        </div>
      )}
      <Card className="w-full max-w-md overflow-hidden shadow-xl dark:shadow-2xl border-0 dark:border dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 pb-2 dark:border-gray-800">
          <div className="flex flex-col justify-center items-center pt-6">
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_PATH || "/yw-logo-light.png"}
              alt="YW Portal Logo"
              width={240}
              height={80}
              priority
              className="dark:brightness-0 dark:invert"
            />
            
          </div>
        </CardHeader>
        <CardContent className="text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800">
          <form data-testid="signin-form" onSubmit={handleSubmit}>
            <Button 
              type="button" 
              variant="outline"
              size="lg"
              onClick={handleMicrosoftLogin} 
              className={cn(
                "bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600",
                "text-black dark:text-white font-semibold w-full mt-6 flex items-center justify-center gap-2 h-[50px]",
                "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
                "transition-all duration-200"
              )} 
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MicrosoftIcon />
              )}
              Sign in with Microsoft
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center bg-white dark:bg-gray-800 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account? Contact your administrators
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}