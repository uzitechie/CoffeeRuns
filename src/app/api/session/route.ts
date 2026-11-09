import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/server/auth";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ user: null, csrfToken: "" });
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      username: session.user.username,
      email: session.user.email,
    },
    csrfToken: session.csrfToken,
  });
}
