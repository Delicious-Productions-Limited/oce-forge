import { NextResponse } from "next/server";
import { getMetrics } from "@/lib/stripe";

export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const metrics = await getMetrics();
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Metrics fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
