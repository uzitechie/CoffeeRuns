import { NextResponse } from "next/server";
import { db } from "@/lib/server/db";
import { hashPassword, hashToken } from "@/lib/server/auth";

type ResetPasswordPayload = {
  token?: string;
  newPassword?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ResetPasswordPayload;
  const token = body.token?.trim();
  const newPassword = body.newPassword ?? "";

  if (!token || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Token and a new password with at least 8 characters are required." },
      { status: 400 },
    );
  }

  const tokenHash = hashToken(token);
  const resetRecord = await db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetRecord) {
    return NextResponse.json({ error: "Invalid or expired reset token." }, { status: 400 });
  }

  const { salt, hash } = hashPassword(newPassword);
  await db.$transaction([
    db.user.update({
      where: { id: resetRecord.userId },
      data: {
        passwordSalt: salt,
        passwordHash: hash,
      },
    }),
    db.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: {
        usedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ message: "Password updated successfully." });
}
