import { NextResponse } from "next/server";
import { clearSession, getCurrentSession } from "@/lib/server/auth";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ ok: true });
  }

  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfHeader || csrfHeader !== session.csrfToken) {
    return NextResponse.json({ error: "Invalid CSRF token." }, { status: 403 });
  }

  await clearSession();
  return NextResponse.json({ ok: true });
}
