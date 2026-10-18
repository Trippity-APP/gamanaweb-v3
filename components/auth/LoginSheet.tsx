"use client";

import { useEffect, useState } from "react";
import { ResponsiveSheet } from "@/components/common/ResponsiveSheet";
import { LOGIN_COPY, LoginFlow, type LoginScreen } from "@/components/auth/LoginFlow";
import { useAuth } from "@/lib/auth/auth-context";

/** The one login sheet, opened from anywhere via `openLogin()` / `requireAuth()`. */
export default function LoginSheet() {
  const { loginRequest, closeLogin } = useAuth();
  const [screen, setScreen] = useState<LoginScreen>("method");
  const open = loginRequest !== null;
  const copy = LOGIN_COPY[screen];

  useEffect(() => {
    if (open) setScreen("method");
  }, [open]);

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeLogin();
      }}
      title={copy.title}
      description={screen === "otp" ? undefined : copy.description}
    >
      {open && <LoginFlow reason={loginRequest?.reason} onScreenChange={setScreen} />}
    </ResponsiveSheet>
  );
}
