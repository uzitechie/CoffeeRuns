import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { createSession, verifyPassword } from "@/lib/server/auth";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const username = body.username?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!username || !password) {
    return NextResponse.json({ error: "Username/email and password are required." }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: {
      OR: [{ username }, { email: username }],
    },
  });

  if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const { csrfToken } = await createSession(user.id);
  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
    csrfToken,
  });
}
