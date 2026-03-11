import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  loginUser,
  generateAccessToken,
  generateRefreshToken,
} from "@/server/services/auth.service";
import { setRefreshTokenCookie, setAccessTokenCookie } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await loginUser(email, password);
    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    const response = NextResponse.json({ user, accessToken }, { status: 200 });
    setAccessTokenCookie(response, accessToken);
    setRefreshTokenCookie(response, refreshToken);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    const status = message === "Invalid credentials" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
