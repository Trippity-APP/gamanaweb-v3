import { NextResponse } from "next/server";

import { fetchPublicTours } from "@/lib/marketplace-api";
import { toSearchTour } from "@/lib/marketplace-data";

export const dynamic = "force-static";

export async function GET() {
  try {
    const tours = await fetchPublicTours();
    return NextResponse.json(tours.map(toSearchTour));
  } catch (error) {
    console.error("Failed to build search catalog:", error);
    return NextResponse.json([]);
  }
}
