"use client";

/**
 * Shared with the Start Your Gamana Journey wizard and the /account Personalization
 * editor — one chip look across both surfaces.
 */
export function Chip({
  label,
  selected,
  onClick,
  disabled,
  small,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full font-medium border-2 transition-all ${
        small ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"
      } ${
        selected
          ? "border-[#159895] bg-[#159895] text-white"
          : disabled
          ? "border-gray-100 text-gray-300 cursor-not-allowed"
          : "border-gray-200 text-gray-700 hover:border-[#159895]/40"
      }`}
    >
      {label}
    </button>
  );
}
