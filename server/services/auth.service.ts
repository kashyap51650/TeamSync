// src/server/services/auth.service.ts
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import type { AuthUser, JWTPayload } from "@/types";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "super-secret-jwt-key-change-in-production",
);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET ?? "super-secret-refresh-key-change-in-production",
);

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

// ── Token Generation ─────────────────────────────────────────────────────────

export async function generateAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(JWT_SECRET);
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as unknown as JWTPayload;
}

// ── Auth Operations ──────────────────────────────────────────────────────────

export async function registerUser(
  email: string,
  password: string,
  name: string,
) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, name },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  };
}

export async function rotateRefreshToken(oldToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new Error("Invalid or expired refresh token");
  }

  // Delete old token (rotation)
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const user: AuthUser = {
    id: stored.user.id,
    email: stored.user.email,
    name: stored.user.name,
    avatarUrl: stored.user.avatarUrl,
  };

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

// ── Session Validation ───────────────────────────────────────────────────────

export async function getCurrentUser(
  accessToken: string,
): Promise<AuthUser | null> {
  try {
    const payload = await verifyAccessToken(accessToken);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });
    return user;
  } catch {
    return null;
  }
}
