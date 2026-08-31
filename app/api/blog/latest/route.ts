import { NextResponse } from "next/server";

import { getLatestPostSummaries } from "@/lib/blog";

export const dynamic = "force-static";

export async function GET() {
  try {
    const stories = await getLatestPostSummaries(3);

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Failed to load blog summaries:", error);
    return NextResponse.json({ stories: [] }, { status: 200 });
  }
}

