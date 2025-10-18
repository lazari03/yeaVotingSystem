// src/app/api/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { login } from "@/lib/db/login";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const token = await login(email, password);
  return NextResponse.json({ token });
}
