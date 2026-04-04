import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/models/Application";
import Job from "@/models/Job";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    await dbConnect();

    if (role === "employee") {
      const applications = await Application.find({ employeeId: userId })
        .populate("jobId")
        .sort({ appliedAt: -1 });
      return NextResponse.json({ success: true, applications });
    } else if (role === "employer") {
      // Find all jobs posted by this employer
      const employerJobs = await Job.find({ employerId: userId }).sort({ createdAt: -1 });
      const jobIds = employerJobs.map(j => j._id);

      // Find all applications for those jobs
      const applications = await Application.find({ jobId: { $in: jobIds as any } })
        .populate("employeeId", "name email contact skills resume")
        .populate("jobId", "title")
        .sort({ appliedAt: -1 });

      return NextResponse.json({ success: true, jobs: employerJobs, applications });
    }

    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  } catch (error) {
    console.error("Fetch applications error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { jobId } = await req.json();
    await dbConnect();
    const userId = (session.user as any).id;

    // Check if job exists and get employerId
    const targetJob = await Job.findById(jobId);
    if (!targetJob) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Prevent self-applying
    if (targetJob.employerId.toString() === userId) {
      return NextResponse.json({ error: "You cannot apply to your own job." }, { status: 403 });
    }

    // Check if already applied
    const existing = await Application.findOne({ jobId, employeeId: userId });
    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 400 });
    }

    const application = await Application.create({
      jobId,
      employeeId: userId,
      employerId: targetJob.employerId,
      status: "pending"
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Apply job error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "employer") {
      return NextResponse.json({ error: "Only employers can update status" }, { status: 403 });
    }

    const { applicationId, status } = await req.json();
    await dbConnect();

    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // Verify the employer owns the job
    const job = application.jobId as any;
    if (job.employerId.toString() !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (status === "no_show") {
      // Penalty logic
      await User.findByIdAndUpdate(application.employeeId, {
        $inc: { noShows: 1, rating: -1 }
      });
    }
    
    application.status = status;
    await application.save();
    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Update applications error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
