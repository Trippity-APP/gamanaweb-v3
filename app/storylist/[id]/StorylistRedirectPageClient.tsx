"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  QrCode, 
  ArrowRight,
  RefreshCw,
  Globe
} from "lucide-react";

interface StorylistRedirectPageClientProps {
  id: string;
}

export default function StorylistRedirectPageClient({ id }: StorylistRedirectPageClientProps) {
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "loading">("loading");
  const [isValidId, setIsValidId] = useState<boolean | null>(null);
  const [countdown, setCountdown] = useState(2);
  const [attemptedRedirect, setAttemptedRedirect] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // Environment-aware configurations with robust fallback production URLs
  const APP_STORE_URL = process.env.NEXT_PUBLIC_APP_STORE_URL || "https://apps.apple.com/in/app/gamana-ai/id6748155654";
  const PLAY_STORE_URL = process.env.NEXT_PUBLIC_PLAY_STORE_URL || "https://play.google.com/store/apps/details?id=com.agent.gamana.ai";

  // Production-grade analytics observability framework
  const logAnalyticsEvent = (eventName: string, params: Record<string, any> = {}) => {
    const logPayload = {
      event: eventName,
      properties: {
        ...params,
        token_id: id,
        timestamp: new Date().toISOString(),
      }
    };
    
    // Console logging in development
    console.log(`📊 [Analytics Log]`, logPayload);
  };

  // Validate ID format
  useEffect(() => {
    if (id) {
      const safeRegex = /^[a-zA-Z0-9_-]+$/;
      const isValid = safeRegex.test(id);
      setIsValidId(isValid);
      
      if (!isValid) {
        logAnalyticsEvent("invalid_token_blocked", { raw_input: id });
      }
    } else {
      setIsValidId(false);
    }
  }, [id]);

  // Handle platform detection and capture current URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);

      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      let detectedPlatform: "ios" | "android" | "desktop" = "desktop";
      
      if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
        detectedPlatform = "ios";
      } else if (/android/i.test(userAgent)) {
        detectedPlatform = "android";
      }
      
      setPlatform(detectedPlatform);
      
      // Track mount and initial discovery details
      logAnalyticsEvent("deep_link_opened", { 
        detected_platform: detectedPlatform,
        user_agent: userAgent
      });
    }
  }, []);

  // Handle countdown and auto-redirection
  useEffect(() => {
    if (isValidId === false || platform === "desktop" || platform === "loading") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && !attemptedRedirect) {
      setAttemptedRedirect(true);
      triggerRedirect("auto");
    }
  }, [countdown, platform, isValidId, attemptedRedirect]);

  // Track QR views
  useEffect(() => {
    if (platform === "desktop" && shareUrl) {
      logAnalyticsEvent("qr_viewed", { share_url: shareUrl });
    }
  }, [platform, shareUrl]);

  const triggerRedirect = (triggerType: "auto" | "manual") => {
    const targetUrl = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
    
    // Log redirection activity
    logAnalyticsEvent("app_store_redirected", { 
      platform,
      trigger_type: triggerType,
      redirect_url: targetUrl 
    });
    
    window.location.href = targetUrl;
  };

  const handleManualTrigger = () => {
    logAnalyticsEvent("app_launch_attempted", { platform });
    triggerRedirect("manual");
  };

  // 1. Loading State
  if (isValidId === null || platform === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#1A5F7A]/20 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-[#159895]/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-[#1A5F7A]/10 rounded-full blur-3xl animate-pulse" />
        </div>
        <Card className="max-w-md w-full bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <CardContent className="p-0 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#159895] to-[#1A5F7A] p-[1px] flex items-center justify-center animate-spin mb-6">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-[#57C5B6]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connecting to Gamana</h2>
            <p className="text-gray-400 text-sm">Preparing secure routing...</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  // 2. Invalid Link / Security Violation State
  if (!isValidId) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950/10 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-red-500/5 rounded-full blur-3xl" />
        </div>
        <Card className="max-w-md w-full bg-slate-950/40 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 text-center shadow-2xl relative z-10">
          <CardContent className="p-0 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Invalid Link Format</h2>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              This link is malformed or violates security guidelines. Please request a new, secure storylist link from the sharing user.
            </p>
            <Button asChild className="bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white font-semibold rounded-2xl w-full py-6">
              <Link href="/">Go to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  // 3. Desktop View (Show QR Code and Mockup Frame)
  if (platform === "desktop") {
    // Append campaign parameters to enable deep-link source analytics attribution
    const qrTargetUrl = `${shareUrl}${shareUrl.includes("?") ? "&" : "?"}source=qr_desktop`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&color=159895&bgcolor=020617&data=${encodeURIComponent(qrTargetUrl)}`;

    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#1A5F7A]/20 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Sleek animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#159895]/10 rounded-full blur-3xl animate-pulse animation-duration-[6s]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1A5F7A]/10 rounded-full blur-3xl animate-pulse animation-duration-[8s]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-slate-950/50 rounded-full border border-white/5" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="mb-12 hover:scale-105 transition-transform duration-300">
            <img src="/gamana-logo.svg" alt="Gamana Logo" className="logo-white h-12 w-auto drop-shadow-2xl" />
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            {/* Left Column: Premium Interactive scan area */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#159895]/20 to-[#1A5F7A]/20 border border-[#159895]/30 px-4 py-2 rounded-full text-white/90 text-sm font-semibold">
                <Compass className="h-4 w-4 text-[#57C5B6] animate-spin" style={{ animationDuration: "8s" }} />
                <span>Mobile Audio Exploration</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                Gamana is a <span className="bg-gradient-to-r from-[#57C5B6] to-[#159895] bg-clip-text text-transparent">Mobile-Only Experience</span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed font-medium">
                Gamana is built for your phone. Scan to download and start listening. Scan the code to instantly download the app and begin exploring audio storylists around you.
              </p>

              {/* Store links */}
              <div className="flex gap-4 pt-4 flex-wrap justify-center lg:justify-start">
                <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="h-14 w-auto drop-shadow-xl" />
                </a>
                <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform duration-300">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" className="h-14 w-auto drop-shadow-xl" />
                </a>
              </div>

              {/* Secondary fallback link for desktop user conversion */}
              <div className="pt-2">
                <Button asChild variant="link" className="text-gray-400 hover:text-white flex items-center gap-1.5 p-0">
                  <Link href="/">
                    <Globe className="h-4 w-4 text-[#57C5B6]" />
                    <span>Continue on Gamana Web portal</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right Column: Premium Glowing QR Code card */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative group">
                {/* Glow ring */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#159895] to-[#1A5F7A] rounded-[36px] blur-xl opacity-50 group-hover:opacity-75 transition duration-500" />
                
                <Card className="relative bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 text-center max-w-sm w-full shadow-2xl">
                  <CardContent className="p-0 flex flex-col items-center">
                    {/* Glowing QR frame */}
                    <div className="relative bg-slate-900 border border-white/5 rounded-2xl p-4 mb-6 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                      <img 
                        src={qrCodeUrl} 
                        alt="Scan QR Code to open in App" 
                        className="w-[200px] h-[200px] block rounded-lg select-none" 
                      />
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#159895]" />
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#159895]" />
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#159895]" />
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#159895]" />
                    </div>

                    <div className="flex items-center gap-2 mb-2 justify-center">
                      <QrCode className="h-5 w-5 text-[#57C5B6]" />
                      <span className="text-white font-bold text-lg">Scan to Explore</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto font-medium">
                      Point your phone&apos;s camera at the screen to open the storylist inside the Gamana app.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 4. Mobile Redirection Views (iOS & Android)
  const isIos = platform === "ios";
  const storeName = isIos ? "Apple App Store" : "Google Play Store";

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-[#1A5F7A]/20 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-[#159895]/15 rounded-full blur-3xl animate-pulse animation-duration-[5s]" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-[#1A5F7A]/15 rounded-full blur-3xl animate-pulse animation-duration-[7s]" />
      </div>

      <Card className="max-w-md w-full bg-slate-950/50 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 text-center shadow-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#57C5B6] to-[#1A5F7A]" />
        
        <CardContent className="p-0 flex flex-col items-center">
          {/* pulsating loader ring */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-[#159895]/20 rounded-full blur-lg animate-ping" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#159895] to-[#1A5F7A] flex items-center justify-center border border-[#57C5B6]/20 relative z-10 shadow-lg animate-pulse">
              <Smartphone className="h-7 w-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Launching Gamana</h2>
          
          {countdown > 0 ? (
            <p className="text-[#57C5B6] text-sm font-semibold mb-6 flex items-center gap-1.5 justify-center">
              <span>Redirecting to {storeName} in {countdown}s...</span>
            </p>
          ) : (
            <p className="text-[#57C5B6] text-sm font-semibold mb-6 flex items-center gap-1.5 justify-center">
              <span>Redirection triggered.</span>
            </p>
          )}

          <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed font-medium">
            If the App is not installed, the page will route you to the store. If the store page does not open automatically, click the button below.
          </p>

          <Button 
            onClick={handleManualTrigger} 
            className="relative group bg-gradient-to-r from-[#159895] to-[#1A5F7A] hover:from-[#159895] hover:to-[#1A5F7A] text-white font-bold rounded-2xl w-full py-6 flex items-center justify-center gap-2 overflow-hidden shadow-lg transition-transform active:scale-[0.98]"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#57C5B6] to-[#159895] rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500" />
            <span className="relative z-10 flex items-center gap-2">
              Open {isIos ? "App Store" : "Play Store"}
              <ArrowRight className="h-5 w-5 animate-pulse" />
            </span>
          </Button>

          {/* Fallback secondary action allowing users to continue on the web app */}
          <div className="mt-5 w-full border-t border-white/5 pt-4">
            <Button asChild variant="ghost" className="text-gray-400 hover:text-white text-xs font-semibold w-full">
              <Link href="/">
                Continue on Web
              </Link>
            </Button>
          </div>

          <div className="mt-4">
            <span className="text-xs text-gray-500 font-medium">Gamana Heritage Audio Tours</span>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
