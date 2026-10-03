import { Building2, MapPin } from "@/components/icons";
import { COMPANY, ENTITY_STATEMENT } from "@/lib/data/company";

/** "Who we are" box shown at the top of every policy page. */
export function EntityNotice() {
  return (
    <aside aria-label="Who we are" className="not-prose rounded-3xl border border-brand-100 bg-brand-50/60 p-6 sm:p-8">
      <p className="eyebrow">Who we are</p>
      <p className="mt-3 leading-relaxed text-ink-soft">{ENTITY_STATEMENT}</p>
      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
          <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
          <div className="text-sm">
            <dt className="font-semibold text-ink">{COMPANY.parent.name}</dt>
            <dd className="text-ink-muted">Parent company, United States</dd>
            <dd className="mt-1 text-ink-soft">{COMPANY.parent.address}</dd>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
          <div className="text-sm">
            <dt className="font-semibold text-ink">{COMPANY.india.name}</dt>
            <dd className="text-ink-muted">Subsidiary, India (LLPIN {COMPANY.india.llpin})</dd>
            <dd className="mt-1 text-ink-soft">{COMPANY.india.short}</dd>
          </div>
        </div>
      </dl>
    </aside>
  );
}
