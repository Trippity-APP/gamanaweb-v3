import { AlertCircle, RefreshCw } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  hint?: string;
  onRetry?: () => void;
  compact?: boolean;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  hint = "Check your connection and try again.",
  onRetry,
  compact = false,
  className,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div role="alert" className={cn("flex items-start gap-2 rounded-2xl bg-sunset-100 p-3 text-sm text-ink", className)}>
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-sunset-600" aria-hidden />
        <p className="flex-1">{title}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="focus-ring rounded font-semibold text-brand-700 hover:underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div role="alert" className={cn("flex flex-col items-center rounded-3xl bg-white px-6 py-12 text-center shadow-card", className)}>
      <span className="grid h-14 w-14 place-items-center rounded-full bg-sunset-100 text-sunset-600">
        <AlertCircle className="h-6 w-6" aria-hidden />
      </span>
      <p className="mt-4 font-display text-lg font-bold text-ink">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-soft">{hint}</p>}
      {onRetry && (
        <Button type="button" variant="outline" onClick={onRetry} className="mt-5 rounded-full">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
          Try again
        </Button>
      )}
    </div>
  );
}
