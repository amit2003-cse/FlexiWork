import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

    await dbConnect();
    const job = await Job.findById(id).populate('employerId', 'name email contact');

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Fetch job error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
