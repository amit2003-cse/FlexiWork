import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role } = await req.json();
    if (!role || (role !== "employer" && role !== "employee")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await dbConnect();
    const userId = (session.user as any).id;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      role: updatedUser?.role 
    });
  } catch (error) {
    console.error("Switch role error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
