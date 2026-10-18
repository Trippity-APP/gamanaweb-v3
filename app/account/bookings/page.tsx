"use client";

import { BookingsList } from "@/components/account/BookingsList";

export default function BookingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-display text-h2 font-bold text-ink">Bookings</h1>
      <BookingsList />
    </div>
  );
}
