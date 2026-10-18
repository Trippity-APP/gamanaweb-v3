"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AnswerValue, BookingQuestion } from "@/lib/experiences/booking-questions";
import { cn } from "@/lib/utils";

export const FIELD_INPUT = "h-11 rounded-xl";
export const FIELD_SELECT =
  "focus-ring h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-ink disabled:opacity-60";

type Props = {
  question: BookingQuestion;
  /** Prefix keeping ids unique when the same question repeats per traveller. */
  idPrefix: string;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
};

export function QuestionField({ question: q, idPrefix, value, error, onChange }: Props) {
  const id = `${idPrefix}-${q.id}`;
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const describedBy = [q.help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;
  const text = typeof value === "string" ? value : "";
  const common = {
    id,
    "aria-invalid": Boolean(error) || undefined,
    "aria-describedby": describedBy,
    "aria-required": q.required || undefined,
  };

  const label = (
    <Label htmlFor={id} className="text-sm font-medium text-ink">
      {q.label}
      {q.required ? <span aria-hidden> *</span> : <span className="font-normal text-ink-muted"> (optional)</span>}
    </Label>
  );

  let control: React.ReactNode;
  switch (q.kind) {
    case "textarea":
      control = (
        <Textarea
          {...common}
          value={text}
          maxLength={q.maxLength}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl"
        />
      );
      break;
    case "select":
      control = (
        <select {...common} value={text} onChange={(e) => onChange(e.target.value)} className={FIELD_SELECT}>
          <option value="">Choose…</option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "radio":
      return (
        <fieldset className="space-y-2" aria-describedby={describedBy} aria-invalid={Boolean(error) || undefined}>
          <legend className="text-sm font-medium text-ink">
            {q.label}
            {q.required ? <span aria-hidden> *</span> : <span className="font-normal text-ink-muted"> (optional)</span>}
          </legend>
          {q.help && (
            <p id={helpId} className="text-xs text-ink-muted">
              {q.help}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {q.options.map((o) => {
              const checked = text === o.value;
              return (
                <label
                  key={o.value}
                  className={cn(
                    "flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2",
                    checked ? "border-brand-700 bg-brand-50 text-brand-800" : "border-sand-200 bg-white text-ink hover:border-brand-300",
                  )}
                >
                  <input
                    type="radio"
                    name={id}
                    value={o.value}
                    checked={checked}
                    onChange={() => onChange(o.value)}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
          <FieldError id={errorId} error={error} />
        </fieldset>
      );
    case "multiselect": {
      const picked = Array.isArray(value) ? value : [];
      return (
        <fieldset className="space-y-2" aria-describedby={describedBy}>
          <legend className="text-sm font-medium text-ink">
            {q.label}
            {q.required ? <span aria-hidden> *</span> : <span className="font-normal text-ink-muted"> (optional)</span>}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => (
              <label key={o.value} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-sand-200 px-3 text-sm">
                <Checkbox
                  checked={picked.includes(o.value)}
                  onCheckedChange={(c) => onChange(c ? [...picked, o.value] : picked.filter((p) => p !== o.value))}
                />
                {o.label}
              </label>
            ))}
          </div>
          <FieldError id={errorId} error={error} />
        </fieldset>
      );
    }
    case "checkbox":
      return (
        <div className="space-y-1">
          <label htmlFor={id} className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-ink">
            <Checkbox
              id={id}
              checked={value === true}
              onCheckedChange={(c) => onChange(c === true)}
              aria-invalid={Boolean(error) || undefined}
              aria-describedby={describedBy}
              className="mt-0.5"
            />
            <span>
              {q.label}
              {q.required && <span aria-hidden> *</span>}
            </span>
          </label>
          {q.help && (
            <p id={helpId} className="pl-7 text-xs text-ink-muted">
              {q.help}
            </p>
          )}
          <FieldError id={errorId} error={error} />
        </div>
      );
    case "number":
      control = (
        <div className="flex items-center gap-2">
          <Input
            {...common}
            type="number"
            inputMode="numeric"
            value={text}
            min={q.min}
            max={q.max}
            onChange={(e) => onChange(e.target.value)}
            className={cn(FIELD_INPUT, "max-w-[10rem]")}
          />
          {q.unit && <span className="text-sm text-ink-soft">{q.unit}</span>}
        </div>
      );
      break;
    default:
      control = (
        <Input
          {...common}
          type={q.kind === "email" ? "email" : q.kind === "phone" ? "tel" : q.kind === "date" ? "date" : q.kind === "time" ? "time" : "text"}
          autoComplete={q.kind === "email" ? "email" : q.kind === "phone" ? "tel" : "off"}
          value={text}
          maxLength={q.maxLength}
          placeholder={q.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={FIELD_INPUT}
        />
      );
  }

  return (
    <div className="space-y-1.5">
      {label}
      {control}
      {q.help && (
        <p id={helpId} className="text-xs text-ink-muted">
          {q.help}
        </p>
      )}
      <FieldError id={errorId} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="text-sm text-red-700">
      {error}
    </p>
  );
}
