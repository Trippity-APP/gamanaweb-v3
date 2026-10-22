import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildBookingAnswers,
  contactField,
  normalizeQuestion,
  normalizeQuestionGroups,
  serializeAnswers,
  validateAnswer,
  validateAnswers,
  visibleQuestions,
} from "../lib/experiences/booking-questions.ts";

test("normalizeQuestion maps Bókun data types to input kinds", () => {
  assert.equal(normalizeQuestion({ questionId: "e", dataType: "EMAIL_ADDRESS" }).kind, "email");
  assert.equal(normalizeQuestion({ questionId: "p", dataType: "PHONE_NUMBER" }).kind, "phone");
  assert.equal(normalizeQuestion({ questionId: "c", dataType: "CHECKBOX_TOGGLE" }).kind, "checkbox");
  assert.equal(normalizeQuestion({ questionId: "n", dataType: "INT" }).kind, "number");
  assert.equal(normalizeQuestion({ questionId: "t" }).kind, "text");
  assert.equal(normalizeQuestion({ questionId: "r", answerOptions: ["a", "b"] }).kind, "radio");
  assert.equal(normalizeQuestion({ questionId: "s", answerOptions: ["a", "b", "c", "d", "e"] }).kind, "select");
  assert.equal(normalizeQuestion({ questionId: "m", answerOptions: ["a"], selectMultiple: true }).kind, "multiselect");
  assert.equal(normalizeQuestion({ label: "no id" }), null);
  assert.equal(normalizeQuestion("nope"), null);
});

test("normalizeQuestion reads labels, required, limits and triggers", () => {
  const q = normalizeQuestion({
    question_id: "weight",
    title: "Weight",
    is_required: true,
    data_type: "NUMBER",
    min_value: "30",
    max: 120,
    unit: "kg",
    trigger: { questionId: "zipline", values: ["yes"] },
  });
  assert.equal(q.id, "weight");
  assert.equal(q.label, "Weight");
  assert.equal(q.required, true);
  assert.equal(q.min, 30);
  assert.equal(q.max, 120);
  assert.deepEqual(q.trigger, { questionId: "zipline", value: "yes" });
});

test("normalizeQuestionGroups accepts grouped and raw Bókun shapes, de-duplicating ids", () => {
  const grouped = normalizeQuestionGroups({
    booking_questions: { main_contact: [{ id: "a" }, { id: "a" }], per_booking: [{ id: "b" }], per_passenger: [] },
  });
  assert.deepEqual(grouped.mainContact.map((q) => q.id), ["a"]);
  assert.deepEqual(grouped.perBooking.map((q) => q.id), ["b"]);

  const raw = normalizeQuestionGroups({
    mainContactDetails: [{ questionId: "firstName" }],
    activityBookings: [{ questions: [{ questionId: "diet" }], passengers: [{ passengerDetails: [{ questionId: "age" }] }] }],
  });
  assert.deepEqual(raw.mainContact.map((q) => q.id), ["firstName"]);
  assert.deepEqual(raw.perBooking.map((q) => q.id), ["diet"]);
  assert.deepEqual(raw.perPassenger.map((q) => q.id), ["age"]);

  assert.deepEqual(normalizeQuestionGroups(null), { mainContact: [], perBooking: [], perPassenger: [] });
});

test("validateAnswer enforces required, formats and ranges", () => {
  const req = normalizeQuestion({ id: "x", required: true });
  assert.equal(validateAnswer(req, "  "), "This field is required.");
  assert.equal(validateAnswer(req, "ok"), null);

  const email = normalizeQuestion({ id: "e", dataType: "EMAIL" });
  assert.equal(validateAnswer(email, "nope"), "Enter a valid email address.");
  assert.equal(validateAnswer(email, "a@b.co"), null);
  assert.equal(validateAnswer(email, ""), null);

  const phone = normalizeQuestion({ id: "p", dataType: "PHONE" });
  assert.equal(validateAnswer(phone, "+91 98765 43210"), null);
  assert.equal(validateAnswer(phone, "abc"), "Enter a valid phone number.");

  const num = normalizeQuestion({ id: "n", dataType: "NUMBER", min: 1, max: 10, unit: "kg" });
  assert.equal(validateAnswer(num, "0"), "Must be at least 1 kg.");
  assert.equal(validateAnswer(num, "11"), "Must be at most 10 kg.");
  assert.equal(validateAnswer(num, "x"), "Enter a number.");

  const radio = normalizeQuestion({ id: "r", answerOptions: ["a", "b"] });
  assert.equal(validateAnswer(radio, "c"), "Choose one of the options.");

  const box = normalizeQuestion({ id: "c", dataType: "CHECKBOX", required: true });
  assert.equal(validateAnswer(box, false), "Please confirm to continue.");
  assert.equal(validateAnswer(box, true), null);

  const limited = normalizeQuestion({ id: "l", maxLength: 3, pattern: "^[a-z]+$" });
  assert.equal(validateAnswer(limited, "abcd"), "Keep it under 3 characters.");
  assert.equal(validateAnswer(limited, "AB"), "Check the format of this answer.");
});

test("hidden questions are skipped by validation and serialization", () => {
  const list = [
    normalizeQuestion({ id: "zip", answerOptions: ["yes", "no"] }),
    normalizeQuestion({ id: "weight", required: true, trigger: { questionId: "zip", value: "yes" } }),
  ];
  assert.deepEqual(visibleQuestions(list, { zip: "no" }).map((q) => q.id), ["zip"]);
  assert.deepEqual(validateAnswers(list, { zip: "no" }), {});
  assert.deepEqual(validateAnswers(list, { zip: "yes" }), { weight: "This field is required." });
  assert.deepEqual(serializeAnswers(list, { zip: "no", weight: "70" }), [{ questionId: "zip", values: ["no"] }]);
});

test("buildBookingAnswers produces the app's payload shape", () => {
  const groups = normalizeQuestionGroups({
    main_contact: [{ id: "email", dataType: "EMAIL" }],
    per_booking: [{ id: "terms", dataType: "CHECKBOX" }],
    per_passenger: [{ id: "age" }],
  });
  const payload = buildBookingAnswers({
    groups,
    bookingId: 42,
    mainContact: { email: " a@b.co " },
    perBooking: {},
    passengers: [{ unitId: "adult", answers: { age: "30" } }],
  });
  assert.deepEqual(payload, {
    main_contact: [{ questionId: "email", values: ["a@b.co"] }],
    activities: [
      {
        booking_id: 42,
        answers: [{ questionId: "terms", values: ["false"] }],
        passengers: [{ booking_id: null, pricing_category_id: "adult", answers: [{ questionId: "age", values: ["30"] }] }],
      },
    ],
  });
});

test("buildBookingAnswers keys passengers by the booking_id Bókun created for their category", () => {
  const groups = normalizeQuestionGroups({
    booking_questions: {
      main_contact: [],
      activities: [
        {
          booking_id: 900,
          questions: [],
          passengers: [
            { booking_id: 901, pricing_category_id: "11", questions: [{ question_id: "age" }] },
            { booking_id: 902, pricing_category_id: "22", questions: [{ question_id: "age" }] },
            { booking_id: 903, pricing_category_id: "11", questions: [{ question_id: "age" }] },
          ],
        },
      ],
    },
  });
  assert.equal(groups.activityBookingId, "900");
  assert.deepEqual(groups.perPassenger.map((q) => q.id), ["age"]);

  const payload = buildBookingAnswers({
    groups,
    bookingId: "ignored",
    mainContact: {},
    perBooking: {},
    passengers: [
      { unitId: "22", answers: { age: "9" } },
      { unitId: "11", answers: { age: "40" } },
      { unitId: "11", answers: { age: "38" } },
    ],
  });
  const [activity] = payload.activities;
  assert.equal(activity.booking_id, "900");
  assert.deepEqual(
    activity.passengers.map((p) => [p.booking_id, p.pricing_category_id, p.answers[0].values[0]]),
    [
      ["902", "22", "9"],
      ["901", "11", "40"],
      ["903", "11", "38"],
    ],
  );
});

test("contactField maps main-contact ids to lead traveller fields", () => {
  assert.equal(contactField("firstName"), "firstName");
  assert.equal(contactField("PHONE_NUMBER"), "phone");
  assert.equal(contactField("diet"), null);
});
