'use client';

import { useState, type ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle2, Send } from '@/components/icons';

interface FormData {
  companyName: string;
  companyType: string;
  city: string;
  country: string;
  businessNature: string;
  partnershipDescription: string;
  email: string;
  websiteUrl: string;
  contactNumber: string;
}

const EMPTY: FormData = {
  companyName: '',
  companyType: '',
  city: '',
  country: '',
  businessNature: '',
  partnershipDescription: '',
  email: '',
  websiteUrl: '',
  contactNumber: '',
};

const fieldClass =
  'block w-full rounded-2xl border border-ink/15 bg-white px-4 py-3.5 text-ink outline-none transition-all duration-300 placeholder:text-ink-muted/70 hover:border-ink/30 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15';

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required && ' *'}
      </label>
      {children}
    </div>
  );
}

export default function PartnerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success'>('idle');
  const [formData, setFormData] = useState<FormData>(EMPTY);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Simulate form submission for static site
    setTimeout(() => {
      setSubmitStatus('success');
      setFormData(EMPTY);
      setIsSubmitting(false);
    }, 1000);
  };

  const input = (name: keyof FormData) => ({
    id: name,
    name,
    value: formData[name],
    onChange: handleInputChange,
    className: fieldClass,
  });

  if (submitStatus === 'success') {
    return (
      <div className="mx-auto max-w-2xl rounded-4xl border border-ink/5 bg-white p-10 text-center shadow-card" role="status">
        <span className="relative mx-auto grid h-20 w-20 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/30 [animation-iteration-count:2]" aria-hidden />
          <span className="relative grid h-20 w-20 animate-pop place-items-center rounded-full bg-brand-600 text-white shadow-lift">
            <CheckCircle2 className="h-10 w-10" aria-hidden />
          </span>
        </span>
        <h3 className="text-h3 mt-8 text-ink">Application Submitted!</h3>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Thank you for your interest in partnering with Gamana. Our team will review your application and get back to you within 2-3 business days.
        </p>
        <button
          type="button"
          onClick={() => setSubmitStatus('idle')}
          className="focus-ring mt-8 rounded-full bg-brand-600 px-7 py-3 font-semibold text-white transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:scale-95"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl rounded-4xl border border-ink/5 bg-white p-6 shadow-card sm:p-10">
      <h3 className="text-h3 text-ink">Partner Application Form</h3>
      <p className="mt-2 text-ink-soft">
        Fill out the form below to express your interest in partnering with Gamana. We&apos;ll review your application and reach out soon.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="companyName" label="Company Name" required>
            <input {...input('companyName')} placeholder="Your Company Name" required />
          </Field>
          <Field id="companyType" label="Type of Company" required>
            <input {...input('companyType')} placeholder="e.g., Tour Operator, Hotel, Restaurant" required />
          </Field>
          <Field id="city" label="City" required>
            <input {...input('city')} placeholder="City" required />
          </Field>
          <Field id="country" label="Country" required>
            <input {...input('country')} placeholder="Country" required />
          </Field>
        </div>

        <Field id="businessNature" label="Nature of Business" required>
          <Select
            value={formData.businessNature}
            onValueChange={(value) => handleSelectChange('businessNature', value)}
            required
          >
            <SelectTrigger
              id="businessNature"
              className="h-auto rounded-2xl border-ink/15 px-4 py-3.5 text-base text-ink transition-all duration-300 hover:border-ink/30 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/15 focus:ring-offset-0"
            >
              <SelectValue placeholder="Select business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tour-operator">Tour Operator</SelectItem>
              <SelectItem value="accommodation">Accommodation (Hotel/Hostel/Guesthouse)</SelectItem>
              <SelectItem value="restaurant">Restaurant/Cafe</SelectItem>
              <SelectItem value="transport">Transportation Services</SelectItem>
              <SelectItem value="attraction">Tourist Attraction/Museum</SelectItem>
              <SelectItem value="local-guide">Local Guide/Expert</SelectItem>
              <SelectItem value="content-creator">Content Creator/Narrator</SelectItem>
              <SelectItem value="event-organizer">Event/Festival Organizer</SelectItem>
              <SelectItem value="retail">Retail/Souvenir Shop</SelectItem>
              <SelectItem value="technology">Technology Provider</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field id="partnershipDescription" label="Partnership Description" required>
          <textarea
            {...input('partnershipDescription')}
            placeholder="Describe the kind of partnership you're looking for and how you envision working with Gamana..."
            rows={5}
            required
            className={`${fieldClass} resize-none`}
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field id="email" label="Email Address" required>
            <input {...input('email')} type="email" autoComplete="email" placeholder="your@email.com" required />
          </Field>
          <Field id="contactNumber" label="Contact Number" required>
            <input {...input('contactNumber')} type="tel" autoComplete="tel" placeholder="+1 (555) 123-4567" required />
          </Field>
        </div>

        <Field id="websiteUrl" label="Website URL">
          <input {...input('websiteUrl')} type="url" placeholder="https://yourwebsite.com" />
        </Field>

        <button
          type="submit"
          disabled={isSubmitting}
          className="focus-ring group inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lift transition-all duration-300 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Submitting...
            </>
          ) : (
            <>
              Submit Application
              <Send className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" aria-hidden />
            </>
          )}
        </button>

        <p className="text-center text-sm text-ink-muted">* Required fields</p>
      </form>
    </div>
  );
}
