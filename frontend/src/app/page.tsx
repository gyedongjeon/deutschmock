"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, PlayCircle, Clock, Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [savedLang, setSavedLang] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const name = localStorage.getItem('user_name');
    const localLang = localStorage.getItem('user_language');

    if (token) {
      setIsLoggedIn(true);
      if (name) setUserName(name);
      if (localLang) setSavedLang(localLang);

      // Update user info (to retrieve language settings)
      fetch('http://localhost:3001/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(user => {
          if (user && user.language) {
            setSavedLang(user.language);
            localStorage.setItem('user_language', user.language);
          }
        })
        .catch(err => console.error("Failed to fetch profile", err));
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          {/* Logo */}
          {/* Logo */}
          <div className="mx-auto w-24 h-24 flex items-center justify-center mb-4">
            <Image
              src="/logo.png"
              alt="DeutschMock Logo"
              width={120}
              height={120}
              className="object-contain"
              priority
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">DeutschMock</CardTitle>
          <CardDescription>
            {isLoggedIn ? `Welcome back, ${userName}!` : (
              <>
                German Writing Exam Preparation
                <br />
                Start your journey to fluency today.
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoggedIn ? (
              <>
                <Link href={savedLang ? `/test?lang=${savedLang}` : "/language"} className="w-full block">
                  <Button className="w-full h-12 text-base font-medium" size="lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start New Test
                  </Button>
                </Link>

                <Link href={`/history?lang=${savedLang || 'en'}`} className="w-full block">
                  <Button variant="outline" className="w-full h-12 text-base font-medium">
                    <Clock className="mr-2 h-5 w-5" />
                    Exam History
                  </Button>
                </Link>

                <Link href="/settings" className="w-full block">
                  <Button variant="outline" className="w-full h-12 text-base font-medium">
                    <Settings className="mr-2 h-5 w-5" />
                    Settings
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  className="w-full h-12 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user_name');
                    localStorage.removeItem('user_email');
                    localStorage.removeItem('user_picture');
                    window.location.reload();
                  }}
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/language" className="w-full block">
                  <Button className="w-full h-12 text-base font-medium" size="lg">
                    Try Without Login
                  </Button>
                </Link>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-12" asChild>
                  <a href="http://localhost:3001/auth/google">
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                    </svg>
                    Continue with Google
                  </a>
                </Button>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} DeutschMock. All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
