import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { createSession, hashPassword } from "@/lib/server/auth";

type RegisterPayload = {
  username?: string;
  email?: string;
  password?: string;
  gdprConsent?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RegisterPayload;
  const username = body.username?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!username || username.length < 3 || !email || !email.includes("@") || password.length < 8 || !body.gdprConsent) {
    return NextResponse.json(
      { error: "Username, email, password, and GDPR consent are required." },
      { status: 400 },
    );
  }

  const exists = await db.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
    select: { id: true },
  });

  if (exists) {
    return NextResponse.json({ error: "Username or email already exists." }, { status: 409 });
  }

  const { salt, hash } = hashPassword(password);
  const user = await db.user.create({
    data: {
      username,
      email,
      passwordSalt: salt,
      passwordHash: hash,
      gdprConsentAt: new Date(),
    },
  });

  const { csrfToken } = await createSession(user.id);
  return NextResponse.json({
    user: { id: user.id, username: user.username, email: user.email },
    csrfToken,
  });
}
