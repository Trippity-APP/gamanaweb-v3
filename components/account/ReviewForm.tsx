"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, Star, Upload, X } from "@/components/icons";
import { fetchReviewTags, submitReview, uploadReviewPhotos, type ReviewTag } from "@/lib/account/bookings";
import { MAX_PHOTO_BYTES, PHOTO_TYPES, resizeImage } from "@/lib/account/image-resize";
import { cn } from "@/lib/utils";

const MAX_TAGS = 10;
const MAX_PHOTOS = 5;
const MAX_TEXT = 2000;

type Props = {
  slug: string;
  onDone: () => void;
};

export function ReviewForm({ slug, onDone }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<ReviewTag[]>([]);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<{ file: Blob; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textId = useId();

  useEffect(() => {
    fetchReviewTags()
      .then((list) => setTags(list.slice(0, 20)))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), [photos]);

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setError("");
    const room = MAX_PHOTOS - photos.length;
    const next: { file: Blob; url: string }[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (!PHOTO_TYPES.includes(file.type) || file.size > MAX_PHOTO_BYTES) {
        setError("Photos must be JPG or PNG, up to 5 MB each.");
        continue;
      }
      const resized = await resizeImage(file, 1600).catch(() => file);
      next.push({ file: resized, url: URL.createObjectURL(resized) });
    }
    setPhotos((p) => [...p, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setError("Choose a star rating.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blobNames = photos.length ? await uploadReviewPhotos(slug, photos.map((p) => p.file)) : [];
      await submitReview(slug, {
        rating,
        review_text: text.trim() || undefined,
        review_text_tags: picked.length ? picked : undefined,
        would_recommend: recommend ?? undefined,
        photo_blob_names: blobNames.length ? blobNames : undefined,
      });
      setDone(true);
      onDone();
    } catch {
      setError("We couldn't send your review. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-5 text-brand-800" role="status">
        <Check className="h-6 w-6 shrink-0" aria-hidden />
        <p className="font-semibold">Thanks for your review! It helps other travellers choose.</p>
      </div>
    );
  }

  const shown = hover || rating;

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <fieldset>
        <legend className="text-sm font-medium text-ink">
          Your rating <span aria-hidden>*</span>
        </legend>
        <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n === 1 ? "" : "s"}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="focus-ring grid h-11 w-11 place-items-center rounded-full"
            >
              <Star className={cn("h-7 w-7", n <= shown ? "fill-sunset-400 text-sunset-400" : "text-sand-300")} aria-hidden />
            </button>
          ))}
        </div>
      </fieldset>

      {tags.length > 0 && (
        <fieldset>
          <legend className="text-sm font-medium text-ink">
            What stood out? <span className="font-normal text-ink-muted">(up to {MAX_TAGS})</span>
          </legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => {
              const on = picked.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && picked.length >= MAX_TAGS}
                  onClick={() => setPicked((p) => (on ? p.filter((t) => t !== tag.id) : [...p, tag.id]))}
                  className={cn(
                    "focus-ring min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors disabled:opacity-50",
                    on ? "border-brand-700 bg-brand-50 text-brand-800" : "border-sand-200 bg-white text-ink hover:border-brand-300",
                  )}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="space-y-1.5">
        <Label htmlFor={textId} className="text-sm font-medium text-ink">
          Tell others about it <span className="font-normal text-ink-muted">(optional)</span>
        </Label>
        <Textarea id={textId} value={text} maxLength={MAX_TEXT} rows={4} onChange={(e) => setText(e.target.value)} className="rounded-xl" />
        <p className="text-right text-xs text-ink-muted">
          {text.length}/{MAX_TEXT}
        </p>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Would you recommend it?</legend>
        <div className="mt-2 flex gap-2">
          {[
            [true, "Yes"],
            [false, "No"],
          ].map(([value, label]) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={recommend === value}
              onClick={() => setRecommend(value as boolean)}
              className={cn(
                "focus-ring min-h-[44px] rounded-full border px-6 text-sm font-medium",
                recommend === value ? "border-brand-700 bg-brand-50 text-brand-800" : "border-sand-200 bg-white text-ink",
              )}
            >
              {label as string}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <p className="text-sm font-medium text-ink">
          Photos <span className="font-normal text-ink-muted">(up to {MAX_PHOTOS})</span>
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          {photos.map((p, i) => (
            <div key={p.url} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className="h-20 w-20 rounded-2xl object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => setPhotos((list) => list.filter((x) => x !== p))}
                className="focus-ring absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-ink text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="focus-ring grid h-20 w-20 place-items-center rounded-2xl border-2 border-dashed border-sand-300 text-ink-soft hover:border-brand-400"
                aria-label="Add photos"
              >
                <Upload className="h-6 w-6" aria-hidden />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept={PHOTO_TYPES.join(",")}
                multiple
                className="sr-only"
                tabIndex={-1}
                onChange={(e) => void addPhotos(e.target.files)}
              />
            </>
          )}
        </div>
      </div>

      <p aria-live="polite" className="min-h-[1.25rem] text-sm text-red-700">
        {error}
      </p>
      <Button type="submit" disabled={busy} className="h-11 rounded-full px-6">
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Submit review
      </Button>
    </form>
  );
}
