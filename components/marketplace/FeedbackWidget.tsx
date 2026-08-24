'use client';

import { useState } from 'react';
import { MessageSquarePlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useAccount } from '@/lib/account-context';

type Category = 'destination' | 'bug' | 'idea' | 'other';

const categories: { id: Category; label: string }[] = [
  { id: 'destination', label: 'Missing a destination' },
  { id: 'bug', label: 'Something\'s broken' },
  { id: 'idea', label: 'An idea' },
  { id: 'other', label: 'Something else' },
];

const FEEDBACK_KEY = 'gamanaFeedback';

/**
 * Shown to every visitor on /marketplace and /marketplace-redesign, signed in or not —
 * see the note in the component body for why it isn't login-gated. Stores submissions to
 * localStorage (prototype stand-in — a real backend would route these to the team).
 * Anchored to the right edge at mid-height so it stays clear of the Audio Tours /
 * Experiences cart buttons in the bottom-right.
 */
export function FeedbackWidget() {
  const { account } = useAccount();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Deliberately NOT gated on login. Signed-out visitors are the ones most likely to
  // bounce over a missing destination or a confusing flow, so they're exactly the input
  // worth capturing — gating this behind an account filtered out the most
  // decision-relevant feedback. account?.email is still attached when it's available.
  const reset = () => {
    setCategory(null);
    setMessage('');
    setSubmitted(false);
  };

  const submit = () => {
    if (!message.trim()) return;
    try {
      const raw = window.localStorage.getItem(FEEDBACK_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      existing.unshift({
        category,
        message: message.trim(),
        email: account?.email,
        submittedAt: new Date().toISOString(),
      });
      window.localStorage.setItem(FEEDBACK_KEY, JSON.stringify(existing));
    } catch {
      // ignore
    }
    setSubmitted(true);
  };

  return (
    <>
      {/* Rendered inline — the right-edge rail (components/side-rail.tsx) owns the
          positioning, anchoring this at a fixed offset below centre so it holds still
          whether or not the Get App panel is on screen. */}
      <Button
        onClick={() => setOpen(true)}
        aria-label="Give feedback"
        className="rounded-l-xl rounded-r-none bg-gradient-to-r from-[#159895] to-[#1A5F7A] text-white shadow-lg gap-2 h-11 px-4 hover:opacity-95"
      >
        <MessageSquarePlus className="h-4 w-4" />
        Feedback
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) reset();
        }}
      >
        <DialogContent className="sm:max-w-md">
          {!submitted ? (
            <>
              <DialogHeader>
                <DialogTitle>What would make Gamana better for you?</DialogTitle>
              </DialogHeader>
              <div className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(category === c.id ? null : c.id)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-medium transition-all ${
                      category === c.id
                        ? 'border-[#159895] bg-[#159895] text-white'
                        : 'border-gray-200 text-gray-700 hover:border-[#159895]/40'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="A destination we're missing, something confusing, an idea for the marketplace — anything."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
              <Button
                onClick={submit}
                disabled={!message.trim()}
                className="w-full bg-gradient-to-r from-[#159895] to-[#1A5F7A]"
              >
                Send feedback
              </Button>
              <p className="text-[11px] text-gray-400 text-center">
                Prototype note: this is saved locally, not sent to the Gamana team yet.
              </p>
            </>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#159895]/10 flex items-center justify-center mx-auto">
                <Check className="h-7 w-7 text-[#159895]" />
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Thanks for the note</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-gray-600">
                We read every submission — this genuinely shapes what we build next.
              </p>
              <Button onClick={() => setOpen(false)} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
