import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  const { name, email, password } = await request.json();

  // check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    return new NextResponse(
      JSON.stringify({ message: "User already exists" }),
      { status: 400 },
    );
  }

  // hash the password before storing it in the database
  const hashedPassword = await bcrypt.hash(password, 10);

  // create the user in the database
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "MEMBER",
    },
  });

  return new NextResponse(
    JSON.stringify({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }),
    { status: 201 },
  );
}
