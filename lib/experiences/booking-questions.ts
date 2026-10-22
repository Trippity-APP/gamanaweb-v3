/**
 * Bókun booking questions: normalize, show/hide, validate and serialize.
 *
 * Validation follows Bókun's question metadata (required, options, maxLength, pattern, min/max).
 * Review against the app's booking_question_validator.dart before launch.
 * Kept free of imports so `node --test` can load it directly.
 */

export type QuestionKind =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "select"
  | "radio"
  | "multiselect"
  | "checkbox"
  | "date"
  | "time"
  | "number";

export type QuestionOption = { value: string; label: string };

export type BookingQuestion = {
  id: string;
  label: string;
  kind: QuestionKind;
  required: boolean;
  help?: string;
  placeholder?: string;
  options: QuestionOption[];
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  unit?: string;
  /** Only shown when the trigger question's answer equals (or includes) `value`. */
  trigger?: { questionId: string; value: string };
};

export type PassengerSlot = { bookingId: string | null; pricingCategoryId: string | null };

export type QuestionGroups = {
  mainContact: BookingQuestion[];
  perBooking: BookingQuestion[];
  perPassenger: BookingQuestion[];
  /** Bókun activity booking id from the backend's `activities[0].booking_id`. */
  activityBookingId?: string | null;
  /** One per passenger Bókun created on the cart; answers are keyed by their `booking_id`. */
  passengers?: PassengerSlot[];
};

export type AnswerValue = string | string[] | boolean;
export type Answers = Record<string, AnswerValue | undefined>;

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown): number | undefined => {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : undefined;
};

function kindOf(raw: Raw, options: QuestionOption[]): QuestionKind {
  const type = String(raw.dataType ?? raw.data_type ?? raw.type ?? "").toUpperCase();
  const multi = raw.selectMultiple === true || raw.select_multiple === true;
  if (options.length > 0 || type === "OPTIONS" || type === "SELECT") {
    if (multi) return "multiselect";
    return options.length > 0 && options.length <= 4 ? "radio" : "select";
  }
  switch (type) {
    case "LONG_TEXT":
    case "TEXTAREA":
      return "textarea";
    case "EMAIL":
    case "EMAIL_ADDRESS":
      return "email";
    case "PHONE_NUMBER":
    case "PHONE":
      return "phone";
    case "CHECKBOX_TOGGLE":
    case "BOOLEAN":
    case "CHECKBOX":
      return "checkbox";
    case "DATE":
    case "DATE_AND_TIME":
      return "date";
    case "TIME":
      return "time";
    case "INT":
    case "DOUBLE":
    case "NUMBER":
    case "INTEGER":
      return "number";
    default:
      return "text";
  }
}

function optionsOf(raw: Raw): QuestionOption[] {
  const list = raw.answerOptions ?? raw.answer_options ?? raw.options ?? raw.values;
  if (!Array.isArray(list)) return [];
  return list
    .map((o): QuestionOption | null => {
      if (typeof o === "string") return { value: o, label: o };
      if (!isRecord(o)) return null;
      const value = str(o.value) ?? str(o.id) ?? str(o.label);
      if (!value) return null;
      return { value, label: str(o.label) ?? str(o.title) ?? value };
    })
    .filter((o): o is QuestionOption => o !== null);
}

function triggerOf(raw: Raw): BookingQuestion["trigger"] {
  const t = raw.trigger ?? raw.triggers ?? raw.condition;
  const first = Array.isArray(t) ? t[0] : t;
  if (!isRecord(first)) return undefined;
  const questionId = str(first.questionId) ?? str(first.question_id);
  const values = first.values ?? first.value ?? first.answer;
  const value = Array.isArray(values) ? str(values[0]) : str(values);
  return questionId && value ? { questionId, value } : undefined;
}

export function normalizeQuestion(raw: unknown): BookingQuestion | null {
  if (!isRecord(raw)) return null;
  const id = str(raw.questionId) ?? str(raw.question_id) ?? str(raw.id) ?? str(raw.key);
  if (!id) return null;
  const options = optionsOf(raw);
  return {
    id,
    label: str(raw.label) ?? str(raw.title) ?? str(raw.question) ?? id,
    kind: kindOf(raw, options),
    required: raw.required === true || raw.is_required === true,
    help: str(raw.help) ?? str(raw.helpText) ?? str(raw.help_text) ?? str(raw.description),
    placeholder: str(raw.placeholder),
    options,
    maxLength: num(raw.maxLength ?? raw.max_length),
    pattern: str(raw.pattern) ?? str(raw.regex),
    min: num(raw.min ?? raw.minValue ?? raw.min_value),
    max: num(raw.max ?? raw.maxValue ?? raw.max_value),
    unit: str(raw.unit),
    trigger: triggerOf(raw),
  };
}

function listOf(raw: unknown): BookingQuestion[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw
    .map(normalizeQuestion)
    .filter((q): q is BookingQuestion => q !== null && !seen.has(q.id) && (seen.add(q.id), true));
}

const idOf = (v: unknown): string | null => (typeof v === "number" ? String(v) : str(v) ?? null);

/**
 * Accepts the backend's mobile shape (`main_contact` + `activities[0].questions/passengers[]`),
 * the flat grouped shape (`per_booking` / `per_passenger`), or Bókun's raw
 * `mainContactDetails` + `activityBookings[0].questions/passengers`.
 */
export function normalizeQuestionGroups(raw: unknown): QuestionGroups {
  if (!isRecord(raw)) return { mainContact: [], perBooking: [], perPassenger: [] };
  const inner = isRecord(raw.booking_questions) ? raw.booking_questions : raw;
  const activities = inner.activities ?? inner.activityBookings;
  const activity = Array.isArray(activities) && isRecord(activities[0]) ? activities[0] : null;
  const paxList = activity && Array.isArray(activity.passengers) ? activity.passengers.filter(isRecord) : [];
  const firstPassenger = paxList[0] ?? null;
  return {
    mainContact: listOf(inner.main_contact ?? inner.mainContact ?? inner.mainContactDetails),
    perBooking: listOf(inner.per_booking ?? inner.perBooking ?? activity?.questions),
    perPassenger: listOf(
      inner.per_passenger ?? inner.perPassenger ?? firstPassenger?.passengerDetails ?? firstPassenger?.questions,
    ),
    activityBookingId: activity ? idOf(activity.booking_id ?? activity.bookingId) : null,
    passengers: paxList.map((p) => ({
      bookingId: idOf(p.booking_id ?? p.bookingId),
      pricingCategoryId: idOf(p.pricing_category_id ?? p.pricingCategoryId),
    })),
  };
}

function answerIncludes(answer: AnswerValue | undefined, value: string): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.includes(value);
  if (typeof answer === "boolean") return String(answer) === value.toLowerCase();
  return answer === value;
}

export function isVisible(q: BookingQuestion, answers: Answers): boolean {
  if (!q.trigger) return true;
  return answerIncludes(answers[q.trigger.questionId], q.trigger.value);
}

export function visibleQuestions(list: BookingQuestion[], answers: Answers): BookingQuestion[] {
  return list.filter((q) => isVisible(q, answers));
}

function isEmpty(v: AnswerValue | undefined): boolean {
  if (v === undefined) return true;
  if (typeof v === "boolean") return false;
  if (Array.isArray(v)) return v.length === 0;
  return v.trim() === "";
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[0-9 ()-]{6,20}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Returns a user-facing error, or null when valid. Hidden questions are never validated. */
export function validateAnswer(q: BookingQuestion, value: AnswerValue | undefined): string | null {
  if (q.kind === "checkbox") {
    return q.required && value !== true ? "Please confirm to continue." : null;
  }
  if (isEmpty(value)) return q.required ? "This field is required." : null;
  const text = Array.isArray(value) ? "" : String(value).trim();

  switch (q.kind) {
    case "email":
      if (!EMAIL.test(text)) return "Enter a valid email address.";
      break;
    case "phone":
      if (!PHONE.test(text)) return "Enter a valid phone number.";
      break;
    case "date":
      if (!DATE.test(text)) return "Enter a valid date.";
      break;
    case "time":
      if (!TIME.test(text)) return "Enter a valid time.";
      break;
    case "number": {
      const n = Number(text);
      if (!Number.isFinite(n)) return "Enter a number.";
      if (q.min !== undefined && n < q.min) return `Must be at least ${q.min}${q.unit ? ` ${q.unit}` : ""}.`;
      if (q.max !== undefined && n > q.max) return `Must be at most ${q.max}${q.unit ? ` ${q.unit}` : ""}.`;
      break;
    }
    case "select":
    case "radio":
      if (q.options.length && !q.options.some((o) => o.value === text)) return "Choose one of the options.";
      break;
    case "multiselect": {
      const picked = Array.isArray(value) ? value : [text];
      if (q.options.length && picked.some((p) => !q.options.some((o) => o.value === p))) return "Choose from the options.";
      break;
    }
    default:
      break;
  }
  if (q.maxLength !== undefined && text.length > q.maxLength) return `Keep it under ${q.maxLength} characters.`;
  if (q.pattern && text) {
    try {
      if (!new RegExp(q.pattern).test(text)) return "Check the format of this answer.";
    } catch {
      // Ignore patterns the browser can't compile.
    }
  }
  return null;
}

/** Errors keyed by question id, for visible questions only. */
export function validateAnswers(list: BookingQuestion[], answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const q of visibleQuestions(list, answers)) {
    const error = validateAnswer(q, answers[q.id]);
    if (error) errors[q.id] = error;
  }
  return errors;
}

export type SerializedAnswer = { questionId: string; values: string[] };

export function serializeAnswers(list: BookingQuestion[], answers: Answers): SerializedAnswer[] {
  return visibleQuestions(list, answers).flatMap((q) => {
    const v = answers[q.id];
    if (q.kind === "checkbox") return [{ questionId: q.id, values: [v === true ? "true" : "false"] }];
    if (isEmpty(v)) return [];
    const values = Array.isArray(v) ? v : [String(v).trim()];
    return [{ questionId: q.id, values }];
  });
}

export type PassengerAnswers = { unitId: string; answers: Answers };

/** The mobile app's `buildBookingAnswers()` shape: `{ main_contact, activities: [{ booking_id, answers, passengers }] }`. */
export function buildBookingAnswers(input: {
  groups: QuestionGroups;
  bookingId: string | number | null | undefined;
  mainContact: Answers;
  perBooking: Answers;
  passengers: PassengerAnswers[];
}) {
  const { groups } = input;
  const slots = groups.passengers ?? [];
  const used = new Set<number>();
  /** Same pricing category first, then whatever slot is left, so each traveller gets one Bókun passenger. */
  const slotFor = (unitId: string, index: number): PassengerSlot | undefined => {
    let i = slots.findIndex((s, n) => !used.has(n) && s.pricingCategoryId === unitId);
    if (i < 0) i = used.has(index) || index >= slots.length ? slots.findIndex((_, n) => !used.has(n)) : index;
    if (i < 0) return undefined;
    used.add(i);
    return slots[i];
  };
  return {
    main_contact: serializeAnswers(groups.mainContact, input.mainContact),
    activities: [
      {
        booking_id: groups.activityBookingId ?? input.bookingId ?? null,
        answers: serializeAnswers(groups.perBooking, input.perBooking),
        passengers: input.passengers.map((p, i) => {
          const slot = slotFor(p.unitId, i);
          return {
            booking_id: slot?.bookingId ?? null,
            pricing_category_id: slot?.pricingCategoryId ?? p.unitId,
            answers: serializeAnswers(groups.perPassenger, p.answers),
          };
        }),
      },
    ],
  };
}

const CONTACT_KEYS: Record<string, "firstName" | "lastName" | "email" | "phone"> = {
  firstname: "firstName",
  first_name: "firstName",
  lastname: "lastName",
  last_name: "lastName",
  email: "email",
  emailaddress: "email",
  phonenumber: "phone",
  phone_number: "phone",
  phone: "phone",
};

/** Lead-traveller fields that answer a main-contact question, so the form doesn't ask twice. */
export function contactField(questionId: string): "firstName" | "lastName" | "email" | "phone" | null {
  return CONTACT_KEYS[questionId.toLowerCase()] ?? null;
}
