import { NextResponse } from "next/server";
import { trendData } from "@/lib/data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periods = parseInt(searchParams.get("periods") || "8", 10);

  const result = trendData.slice(-periods);
  return NextResponse.json(result);
}
