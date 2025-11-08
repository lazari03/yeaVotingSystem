// src/app/api/users/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { register } from "@/lib/db/register";
import { Role } from "@/utils/Roles";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role } = body;

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Register the user
    const result = await register(email, password, fullName, role as Role);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Registration failed" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        uid: result.uid,
        message: "User registered successfully" 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
