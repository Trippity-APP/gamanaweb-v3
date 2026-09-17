"use client";

import { useState } from "react";
import { Loader2, LogIn, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccount } from "@/lib/account-context";
import { loginWithPassword, requestOtp, verifyOtp } from "@/lib/auth-api";
import { useToast } from "@/hooks/use-toast";

type LoginMode = "choose" | "otp-phone" | "otp-code" | "password";

type LoginDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
};

export function LoginDialog({
  open,
  onOpenChange,
  onSuccess,
  title = "Log in to Gamana",
  description = "Use the same phone OTP or email login as the Gamana app.",
}: LoginDialogProps) {
  const { setAuthSession } = useAccount();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>("choose");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setMode("choose");
    setOtp("");
    setPassword("");
    setError(null);
    setBusy(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const finish = () => {
    toast({
      title: "Logged in",
      description: "You're signed in with your Gamana account.",
    });
    handleOpenChange(false);
    onSuccess?.();
  };

  const sendOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Enter a valid phone number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await requestOtp(digits, countryCode.trim() || "+91");
      setMode("otp-code");
      toast({
        title: "OTP sent",
        description: "Check your phone for the verification code.",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP.");
    } finally {
      setBusy(false);
    }
  };

  const confirmOtp = async () => {
    if (!otp.trim()) {
      setError("Enter the OTP.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await verifyOtp(phone.replace(/\D/g, ""), otp, countryCode.trim() || "+91");
      setAuthSession(session);
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "OTP verification failed.");
    } finally {
      setBusy(false);
    }
  };

  const confirmPassword = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const session = await loginWithPassword(email, password);
      setAuthSession(session);
      finish();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {mode === "choose" && (
          <div className="grid gap-2">
            <Button
              type="button"
              className="h-11 justify-start gap-3 bg-[#159895] text-white hover:bg-[#128a86]"
              onClick={() => setMode("otp-phone")}
            >
              <Smartphone className="h-4 w-4" />
              Continue with phone OTP
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 justify-start gap-3"
              onClick={() => setMode("password")}
            >
              <LogIn className="h-4 w-4" />
              Continue with email & password
            </Button>
          </div>
        )}

        {mode === "otp-phone" && (
          <div className="space-y-4">
            <div className="grid grid-cols-[88px_1fr] gap-2">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Code</Label>
                <Input
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  placeholder="+91"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  inputMode="numeric"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#159895] hover:bg-[#128a86]"
                disabled={busy}
                onClick={() => void sendOtp()}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send OTP"}
              </Button>
            </div>
          </div>
        )}

        {mode === "otp-code" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the code sent to {countryCode} {phone.replace(/\D/g, "")}.
            </p>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP</Label>
              <Input
                id="otp"
                inputMode="numeric"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("otp-phone")}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#159895] hover:bg-[#128a86]"
                disabled={busy}
                onClick={() => void confirmOtp()}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & log in"}
              </Button>
            </div>
          </div>
        )}

        {mode === "password" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email or username</Label>
              <Input
                id="email"
                type="text"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setMode("choose")}>
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 bg-[#159895] hover:bg-[#128a86]"
                disabled={busy}
                onClick={() => void confirmPassword()}
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Log in"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
