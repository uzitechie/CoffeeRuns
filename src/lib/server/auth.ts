import { randomBytes, pbkdf2Sync, timingSafeEqual, createHash } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/server/db";

const SESSION_COOKIE = "coffee_runs_session";
const SESSION_TTL_DAYS = 14;

const PBKDF2_ITERATIONS = 390_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;

export function hashPassword(password: string) {
  const salt = randomBytes(SALT_BYTES);
  const hash = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_BYTES, "sha256");
  return {
    salt: salt.toString("base64"),
    hash: hash.toString("base64"),
  };
}

export function verifyPassword(password: string, saltBase64: string, expectedHashBase64: string) {
  const salt = Buffer.from(saltBase64, "base64");
  const expected = Buffer.from(expectedHashBase64, "base64");
  const actual = pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, HASH_BYTES, "sha256");
  return timingSafeEqual(actual, expected);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(bytes = 24) {
  return randomBytes(bytes).toString("hex");
}

export async function createSession(userId: string) {
  const sessionToken = generateToken(32);
  const csrfToken = generateToken(24);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.session.create({
    data: {
      id: sessionToken,
      userId,
      csrfToken,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });

  return { csrfToken, sessionToken };
}

export async function clearSession() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value;
  if (sessionToken) {
    await db.session.deleteMany({ where: { id: sessionToken } });
  }
  store.delete(SESSION_COOKIE);
}

export async function getCurrentSession() {
  const store = await cookies();
  const sessionToken = store.get(SESSION_COOKIE)?.value;
  if (!sessionToken) {
    return null;
  }

  const session = await db.session.findUnique({
    where: { id: sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt <= new Date()) {
    await db.session.deleteMany({ where: { id: sessionToken } });
    store.delete(SESSION_COOKIE);
    return null;
  }

  return session;
}
