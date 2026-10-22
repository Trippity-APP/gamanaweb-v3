export type DialCode = { iso: string; name: string; code: string };

export const DIAL_CODES: DialCode[] = [
  { iso: "IN", name: "India", code: "+91" },
  { iso: "US", name: "United States", code: "+1" },
  { iso: "GB", name: "United Kingdom", code: "+44" },
  { iso: "AE", name: "United Arab Emirates", code: "+971" },
  { iso: "AU", name: "Australia", code: "+61" },
  { iso: "CA", name: "Canada", code: "+1" },
  { iso: "SG", name: "Singapore", code: "+65" },
  { iso: "DE", name: "Germany", code: "+49" },
  { iso: "FR", name: "France", code: "+33" },
  { iso: "IT", name: "Italy", code: "+39" },
  { iso: "ES", name: "Spain", code: "+34" },
  { iso: "PT", name: "Portugal", code: "+351" },
  { iso: "NL", name: "Netherlands", code: "+31" },
  { iso: "BE", name: "Belgium", code: "+32" },
  { iso: "CH", name: "Switzerland", code: "+41" },
  { iso: "AT", name: "Austria", code: "+43" },
  { iso: "IE", name: "Ireland", code: "+353" },
  { iso: "SE", name: "Sweden", code: "+46" },
  { iso: "NO", name: "Norway", code: "+47" },
  { iso: "DK", name: "Denmark", code: "+45" },
  { iso: "FI", name: "Finland", code: "+358" },
  { iso: "PL", name: "Poland", code: "+48" },
  { iso: "GR", name: "Greece", code: "+30" },
  { iso: "TR", name: "Turkey", code: "+90" },
  { iso: "IL", name: "Israel", code: "+972" },
  { iso: "SA", name: "Saudi Arabia", code: "+966" },
  { iso: "QA", name: "Qatar", code: "+974" },
  { iso: "KW", name: "Kuwait", code: "+965" },
  { iso: "OM", name: "Oman", code: "+968" },
  { iso: "BH", name: "Bahrain", code: "+973" },
  { iso: "EG", name: "Egypt", code: "+20" },
  { iso: "ZA", name: "South Africa", code: "+27" },
  { iso: "KE", name: "Kenya", code: "+254" },
  { iso: "NG", name: "Nigeria", code: "+234" },
  { iso: "BR", name: "Brazil", code: "+55" },
  { iso: "MX", name: "Mexico", code: "+52" },
  { iso: "AR", name: "Argentina", code: "+54" },
  { iso: "CL", name: "Chile", code: "+56" },
  { iso: "CO", name: "Colombia", code: "+57" },
  { iso: "PE", name: "Peru", code: "+51" },
  { iso: "JP", name: "Japan", code: "+81" },
  { iso: "KR", name: "South Korea", code: "+82" },
  { iso: "CN", name: "China", code: "+86" },
  { iso: "HK", name: "Hong Kong", code: "+852" },
  { iso: "TW", name: "Taiwan", code: "+886" },
  { iso: "TH", name: "Thailand", code: "+66" },
  { iso: "MY", name: "Malaysia", code: "+60" },
  { iso: "ID", name: "Indonesia", code: "+62" },
  { iso: "PH", name: "Philippines", code: "+63" },
  { iso: "VN", name: "Vietnam", code: "+84" },
  { iso: "LK", name: "Sri Lanka", code: "+94" },
  { iso: "NP", name: "Nepal", code: "+977" },
  { iso: "BD", name: "Bangladesh", code: "+880" },
  { iso: "PK", name: "Pakistan", code: "+92" },
  { iso: "MV", name: "Maldives", code: "+960" },
  { iso: "NZ", name: "New Zealand", code: "+64" },
];

/** Default country for the phone field: India for INR visitors, else the browser's region. */
export function defaultDialCode(preferIndia: boolean): DialCode {
  if (preferIndia) return DIAL_CODES[0];
  if (typeof navigator !== "undefined") {
    const region = (navigator.language || "").split("-")[1]?.toUpperCase();
    const match = DIAL_CODES.find((d) => d.iso === region);
    if (match) return match;
  }
  return DIAL_CODES[0];
}

/** "+91 98••• ••210" */
export function maskPhone(code: string, phone: string): string {
  if (phone.length < 6) return `${code} ${phone}`;
  const head = phone.slice(0, 2);
  const tail = phone.slice(-3);
  const hidden = "•".repeat(Math.max(phone.length - 5, 1));
  return `${code} ${head}${hidden.slice(0, 3)} ${hidden.slice(3)}${tail}`;
}
