import { NextResponse } from "next/server";

// Phase 2: accept FormData file, extract text, chunk, embed, and store.
export async function POST(request: Request) {
  const formData = await request.formData();
  void formData;
  return NextResponse.json(
    { error: "Not implemented — see Phase 2" },
    { status: 501 },
  );
}

export async function GET() {
  return NextResponse.json(
    { error: "Not implemented — see Phase 2" },
    { status: 501 },
  );
}
