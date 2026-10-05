import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "taskflow-nextjs",
    runtime: "Next.js Route Handler",
    checkedAt: new Date().toISOString()
  });
}
