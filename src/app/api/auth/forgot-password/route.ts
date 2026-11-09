import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { generateToken, hashToken } from "@/lib/server/auth";

type ForgotPasswordPayload = {
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ForgotPasswordPayload;
  const email = body.email?.trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email } });
  let resetToken: string | null = null;

  if (user) {
    resetToken = generateToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({
    message: "If an account exists for that email, password reset instructions have been generated.",
    resetToken: process.env.NODE_ENV === "development" ? resetToken : null,
  });
}
