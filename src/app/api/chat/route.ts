import { NextResponse } from "next/server";
import type { ChatRequestBody } from "@/types";

// Phase 3: embed message, retrieve context, stream gpt-4o-mini response as SSE.
export async function POST(request: Request) {
  const body: ChatRequestBody = await request.json();
  void body;
  return NextResponse.json(
    { error: "Not implemented — see Phase 3" },
    { status: 501 },
  );
}
