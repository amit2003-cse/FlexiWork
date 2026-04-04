import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { role, contact, skills, resume } = data;

    await dbConnect();

    // Use token/session id if possible, otherwise email
    const email = session.user.email;
    const updateData: any = {};
    if (role) updateData.role = role;
    if (contact) updateData.contact = contact;
    if (skills) updateData.skills = skills;
    if (resume) updateData.resume = resume;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
