"use client";

import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Mail, MapPin, Phone, Send, CheckCircle2, Clock, Loader2 } from "@/components/icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HeroHeader from "@/components/navigation/hero-header";
import Footer from "@/components/navigation/footer";
import { PageHero } from "@/components/site/PageHero";
import { StoreBadges } from "@/components/site/StoreBadges";
import { HERITAGE_BADGE_LABELS } from "@/lib/data/nav-config";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/contact-api";
import { COMPANY } from "@/lib/data/company";
import { getPhoto } from "@/lib/images";
import { cn } from "@/lib/utils";

import { IconTile, toneFor } from "@/components/icons/IconTile";
type FormData = {
  name: string;
  email: string;
  subject: string;
  inquiryType: string;
  message: string;
};
type Field = keyof FormData;

const EMPTY: FormData = { name: "", email: "", subject: "", inquiryType: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(data: FormData): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (!data.name.trim()) errors.name = "Please tell us your name.";
  if (!data.email.trim()) errors.email = "We need an email to reply to.";
  else if (!EMAIL_RE.test(data.email.trim())) errors.email = "That email doesn't look quite right.";
  if (!data.inquiryType) errors.inquiryType = "Please select an inquiry type.";
  if (!data.subject.trim()) errors.subject = "Add a short subject.";
  if (!data.message.trim()) errors.message = "Tell us a little about your inquiry.";
  return errors;
}

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    content: "support@gamana.app",
    link: "mailto:support@gamana.app",
  },
  {
    icon: Phone,
    title: "Call Us",
    content: "+1 (203) 405-0700",
    link: "tel:+12034050700",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    content: COMPANY.india.address,
    link: "https://www.google.com/maps/search/?api=1&query=48+Church+St+Ashok+Nagar+Bengaluru+Karnataka+560001",
    external: true,
  },
];

function FloatingField({
  id,
  label,
  error,
  children,
}: {
  id: Field;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="relative">
        {children}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 origin-left -translate-y-1/2 text-ink-muted transition-all duration-300 ease-out-expo",
            "peer-focus:top-3 peer-focus:translate-y-0 peer-focus:scale-[0.8] peer-focus:text-brand-700",
            "peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:scale-[0.8]",
            id === "message" && "top-6",
            error && "text-red-600 peer-focus:text-red-600"
          )}
        >
          {label} <span aria-hidden>*</span>
        </label>
      </div>
      <p
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        className={cn(
          "grid text-sm text-red-600 transition-[grid-template-rows,opacity] duration-300",
          error ? "mt-1.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <span className="overflow-hidden">{error}</span>
      </p>
    </div>
  );
}

const inputClass = (error?: string) =>
  cn(
    "peer block w-full rounded-2xl border bg-white px-4 pb-2.5 pt-6 text-ink outline-none transition-all duration-300 placeholder:text-transparent",
    "focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15",
    error ? "border-red-400 focus:border-red-500 focus:ring-red-500/15" : "border-ink/15 hover:border-ink/30"
  );

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const errors = validate(formData);
  const showError = (field: Field) => (touched[field] ? errors[field] : undefined);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (Object.keys(errors).length) {
      setTouched({ name: true, email: true, subject: true, inquiryType: true, message: true });
      if (errors.inquiryType) {
        toast({ title: "Please select an inquiry type", variant: "destructive" });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitContactForm(formData);

      toast({
        title: "Message sent successfully!",
        description: result.message,
      });

      setFormData(EMPTY);
      setTouched({});
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Could not send message",
        description: error instanceof Error ? error.message : "Please email support@gamana.app directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const blur = (field: Field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const fieldProps = (field: Field) => ({
    id: field,
    name: field,
    value: formData[field],
    onChange: handleChange,
    onBlur: blur(field),
    placeholder: " ",
    required: true,
    "aria-invalid": Boolean(showError(field)),
    "aria-describedby": `${field}-error`,
    className: inputClass(showError(field)),
  });

  return (
    <>
      <HeroHeader transparent />
      <main>
        <PageHero
          className="pb-28 sm:pb-32"
          image={getPhoto("hero-contact")}
          imageAlt=""
          breadcrumbs={[{ label: "Contact", href: "/contact/" }]}
          heading="Get in Touch"
          subtitle="Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        >
          <StoreBadges source="contact_hero" labels={HERITAGE_BADGE_LABELS} size="lg" priority />
        </PageHero>

        <section className="relative z-10 -mt-16 sm:-mt-20">
          <div className="container-site">
            <ul className="grid gap-4 rounded-4xl border border-ink/5 bg-white p-4 shadow-lift sm:grid-cols-3 sm:p-5">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <li key={info.title}>
                    <a
                      href={info.link}
                      {...(info.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="focus-ring group flex h-full items-start gap-4 rounded-3xl p-4 transition-colors duration-300 hover:bg-sand-50"
                    >
                      <IconTile icon={Icon} tone={toneFor(i)} className="transition-all duration-500 ease-spring group-hover:-rotate-6 group-hover:scale-110" />
                      <span>
                        <span className="block font-semibold text-ink">{info.title}</span>
                        <span className="mt-0.5 block text-sm leading-snug text-ink-soft">{info.content}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="section bg-sand-50/60">
          <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-4xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 p-8 text-white shadow-lift">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
                  <CheckCircle2 className="h-7 w-7" aria-hidden />
                </span>
                <h3 className="text-h3 mt-6">What happens next?</h3>
                <p className="mt-3 leading-relaxed text-white/85">
                  Once you submit your message, our team will review it and get back to you within 24 hours. For urgent
                  matters, please call us directly at the number listed above.
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-3xl border border-ink/5 bg-white p-6 shadow-card">
                <IconTile icon={Clock} tone="sunset" />
                <p className="text-sm leading-relaxed text-ink-soft">
                  Prefer email? Write to{" "}
                  <a href="mailto:support@gamana.app" className="font-semibold text-brand-700 hover:underline">
                    support@gamana.app
                  </a>
                  .
                </p>
              </div>
            </aside>

            <div className="rounded-4xl border border-ink/5 bg-white p-6 shadow-card sm:p-10">
              <h2 className="text-h2 text-ink">Send Us a Message</h2>
              {isSubmitted ? (
                <div className="flex flex-col items-center py-12 text-center" role="status">
                  <span className="relative grid h-20 w-20 place-items-center">
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/30 [animation-iteration-count:2]" aria-hidden />
                    <span className="relative grid h-20 w-20 animate-pop place-items-center rounded-full bg-brand-600 text-white shadow-lift">
                      <CheckCircle2 className="h-10 w-10" aria-hidden />
                    </span>
                  </span>
                  <p className="mt-8 max-w-md text-lg text-ink-soft">
                    Thanks for reaching out. Our team at{" "}
                    <a href="mailto:support@gamana.app" className="font-semibold text-brand-700 hover:underline">
                      support@gamana.app
                    </a>{" "}
                    will reply within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="focus-ring mt-8 rounded-full border border-ink/15 px-6 py-3 font-semibold text-ink transition-colors duration-300 hover:border-brand-600 hover:text-brand-700"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <FloatingField id="name" label="Full Name" error={showError("name")}>
                      <input type="text" autoComplete="name" {...fieldProps("name")} />
                    </FloatingField>
                    <FloatingField id="email" label="Email Address" error={showError("email")}>
                      <input type="email" autoComplete="email" {...fieldProps("email")} />
                    </FloatingField>
                  </div>

                  <div>
                    <Select
                      value={formData.inquiryType}
                      onValueChange={(value) => {
                        setFormData({ ...formData, inquiryType: value });
                        setTouched((t) => ({ ...t, inquiryType: true }));
                      }}
                      required
                    >
                      <SelectTrigger
                        id="inquiryType"
                        aria-label="Inquiry Type"
                        aria-invalid={Boolean(showError("inquiryType"))}
                        aria-describedby="inquiryType-error"
                        onBlur={blur("inquiryType")}
                        className={cn(
                          "relative h-auto rounded-2xl bg-white px-4 pb-2.5 pt-7 text-left text-base text-ink transition-all duration-300 focus:ring-4 focus:ring-brand-600/15 focus:ring-offset-0",
                          showError("inquiryType") ? "border-red-400" : "border-ink/15 hover:border-ink/30 focus:border-brand-600"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none absolute left-4 top-2 origin-left scale-[0.8] text-ink-muted",
                            showError("inquiryType") && "text-red-600"
                          )}
                          aria-hidden
                        >
                          Inquiry Type *
                        </span>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="partner">Become a Partner</SelectItem>
                        <SelectItem value="support">Technical Support</SelectItem>
                        <SelectItem value="press">Press & Media</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p
                      id="inquiryType-error"
                      role={showError("inquiryType") ? "alert" : undefined}
                      className={cn("text-sm text-red-600", showError("inquiryType") ? "mt-1.5" : "sr-only")}
                    >
                      {showError("inquiryType")}
                    </p>
                  </div>

                  <FloatingField id="subject" label="Subject" error={showError("subject")}>
                    <input type="text" {...fieldProps("subject")} />
                  </FloatingField>

                  <FloatingField id="message" label="Message" error={showError("message")}>
                    <textarea rows={6} {...fieldProps("message")} className={cn(fieldProps("message").className, "resize-none pt-8")} />
                  </FloatingField>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="focus-ring group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lift transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" aria-hidden />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
