// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  registerUser,
  generateAccessToken,
  generateRefreshToken,
} from "@/server/services/auth.service";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/auth";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    const user = await registerUser(email, password, name);
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.json({ user, accessToken }, { status: 201 });
    setAccessTokenCookie(response, accessToken);
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
