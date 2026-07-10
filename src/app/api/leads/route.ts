import { NextResponse } from "next/server";
import type { LeadRequestBody } from "@/types";

// Phase 4: validate and insert into the leads table.
export async function POST(request: Request) {
  const body: LeadRequestBody = await request.json();
  void body;
  return NextResponse.json(
    { error: "Not implemented — see Phase 4" },
    { status: 501 },
  );
}
