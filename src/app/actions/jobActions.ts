"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Application from "@/models/Application";
import Job from "@/models/Job";
import { revalidatePath } from "next/cache";

export async function applyForJob(jobId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "employee") {
      return { error: "Unauthorized. Please login as a Job Seeker." };
    }

    const userId = (session.user as any).id;

    await dbConnect();

    // 1. Prevent self-applying (redundant check but good for safety)
    const job = await Job.findById(jobId);
    if (!job) return { error: "Job not found." };
    if (job.employerId.toString() === userId) {
      return { error: "You cannot apply to your own job." };
    }

    // 2. Daily Rate Limiting (Max 5 per day)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const dailyAppCount = await Application.countDocuments({
      employeeId: userId,
      appliedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    if (dailyAppCount >= 5) {
      return { error: "Daily limit reached. You can only apply to 5 jobs per day." };
    }

    // 3. Prevent Duplicate Applications
    const existing = await Application.findOne({ jobId, employeeId: userId });
    if (existing) {
      return { error: "You have already applied for this job." };
    }

    // 4. Create Application
    await Application.create({
      jobId,
      employeeId: userId,
      employerId: job.employerId,
      status: "pending"
    });

    revalidatePath("/dashboard");
    revalidatePath("/jobs");

    return { success: true };
  } catch (error) {
    console.error("Apply job error:", error);
    return { error: "Internal Server Error. Please try again later." };
  }
}

export async function deleteJob(jobId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "employer") {
      return { error: "Unauthorized." };
    }

    await dbConnect();
    const job = await Job.findById(jobId);
    if (!job) return { error: "Job not found." };
    if (job.employerId.toString() !== (session.user as any).id) {
      return { error: "You don't own this job." };
    }

    // Delete job and its applications
    await Job.findByIdAndDelete(jobId);
    await Application.deleteMany({ jobId });

    revalidatePath("/dashboard");
    revalidatePath("/jobs");
    return { success: true };
  } catch (error) {
    console.error("Delete job error:", error);
    return { error: "Internal Server Error." };
  }
}

export async function reportNoShow(applicationId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "employer") {
      return { error: "Unauthorized." };
    }

    await dbConnect();
    const application = await Application.findById(applicationId).populate("jobId");
    if (!application) return { error: "Application not found." };

    const job = application.jobId as any;
    if (job.employerId.toString() !== (session.user as any).id) {
      return { error: "Unauthorized." };
    }

    // Penalty logic: Apply to User profile
    const User = (await import("@/models/User")).default;
    await User.findByIdAndUpdate(application.employeeId, {
      $inc: { noShows: 1, rating: -1 } 
    });

    application.status = "no_show";
    await application.save();

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Report no-show error:", error);
    return { error: "Internal Server Error." };
  }
}
