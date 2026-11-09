"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ERRORS: Record<string, string> = {
  wrong: "That password isn't right. Try again.",
  locked: "Too many attempts. Try again in 15 minutes.",
  unavailable: "The brand guidelines aren't available right now.",
};

/** Same rule as the server: only protected same-site paths, so `next` can't redirect off-site. */
function safeNext(raw: string | null) {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return "/guidelines-v1/";
  return /^\/(guidelines-v1|brand|brand-templates|logo)(\/|$|\?)/i.test(raw) ? raw : "/guidelines-v1/";
}

export function UnlockForm() {
  const [next, setNext] = useState("/guidelines-v1/");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get("next")));
    setError(ERRORS[params.get("error") ?? ""] ?? "");
    input.current?.focus();
  }, []);

  return (
    <form
      method="post"
      action="/guidelines-unlock/"
      className="mt-6 space-y-4"
      onSubmit={(e) => {
        if (!input.current?.value) {
          e.preventDefault();
          setError("Enter the password.");
          return;
        }
        setBusy(true);
      }}
    >
      <input type="hidden" name="next" value={next} />
      <div>
        <Label htmlFor="guidelines-password" className="text-sm font-semibold text-ink">
          Password
        </Label>
        <div className="relative mt-2">
          <Input
            ref={input}
            id="guidelines-password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            aria-invalid={Boolean(error) || undefined}
            aria-describedby="guidelines-password-error"
            onChange={() => error && setError("")}
            className="h-12 rounded-xl border-sand-200 pr-12 text-base"
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="focus-ring absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-ink-soft hover:text-ink"
          >
            {visible ? <EyeOff className="h-5 w-5" aria-hidden /> : <Eye className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      <p
        id="guidelines-password-error"
        role="status"
        aria-live="assertive"
        className={cn("text-sm font-medium text-red-700", !error && "sr-only")}
      >
        {error}
      </p>
      <Button
        type="submit"
        disabled={busy}
        className="focus-ring h-12 w-full rounded-full bg-gradient-to-r from-brand-600 to-brand-800 text-base font-semibold text-white hover:from-brand-700 hover:to-brand-800"
      >
        {busy && <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden />}
        Unlock
      </Button>
    </form>
  );
}
