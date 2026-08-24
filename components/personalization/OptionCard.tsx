"use client";

import { Check } from "lucide-react";

/**
 * Shared with the Start Your Gamana Journey wizard and the /account Personalization
 * editor — one selectable card look across both surfaces.
 */
export function OptionCard({
  label,
  description,
  selected,
  onClick,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-4 transition-all ${
        selected ? "border-[#159895] bg-[#159895]/5" : "border-gray-200 hover:border-[#159895]/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{label}</span>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-[#159895] flex items-center justify-center shrink-0">
            <Check className="h-3 w-3 text-white" />
          </span>
        )}
      </div>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </button>
  );
}
