"use client";

import { apiMocksEnabled } from "@/lib/flags";

/** Fixed pill shown only in mock mode, so mocked data is never mistaken for real data. */
export function MockApiBadge() {
  if (!apiMocksEnabled) return null;
  return (
    <div className="fixed bottom-3 left-3 z-[60] flex items-center gap-2 rounded-full bg-sunset-600 py-1 pl-3 pr-1 text-xs font-semibold text-white shadow-lift">
      <span>Mock API · OTP 123456</span>
      <button
        type="button"
        onClick={async () => {
          const { resetDb } = await import("@/lib/api/mock/db");
          resetDb();
          window.localStorage.removeItem("gmn_session_hint");
          window.location.reload();
        }}
        className="focus-ring min-h-[28px] rounded-full bg-white/20 px-2.5 hover:bg-white/30"
      >
        Reset
      </button>
    </div>
  );
}
