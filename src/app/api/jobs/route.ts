import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const urgency = searchParams.get("urgency");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5000"; // Default to 5km

    await dbConnect();

    let query: any = {
      expiresAt: { $gt: new Date() } // Only show non-expired jobs
    };

    if (category) query.category = category;
    if (urgency) query.urgency = urgency;

    // Geospatial search
    if (lat && lng) {
      query.geoCoordinates = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    // Exclude current user's jobs if logged in
    if (session && (session.user as any).id) {
       query.employerId = { $ne: (session.user as any).id };
    }

    // Sorting: Immediate priority first, then by date
    const jobs = await Job.find(query)
      .sort({ urgency: -1, createdAt: -1 }) // Sort by urgency (immediate > 24h > normal) then by date
      .limit(50)
      .populate('employerId', 'name email contact rating isVerified');

    return NextResponse.json({ success: true, jobs });
  } catch (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  category: z.string(),
  payRate: z.number().positive("Pay must be positive"),
  payType: z.enum(["hourly", "daily"]),
  urgency: z.enum(["normal", "24h", "immediate"]).default("normal"),
  location: z.string(),
  description: z.string().min(20, "Description must be at least 20 characters"),
  duration: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any).role !== "employer") {
      return NextResponse.json({ error: "Unauthorized. Employers only." }, { status: 403 });
    }

    const body = await req.json();
    
    // Validate with Zod
    const validation = jobSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Validation failed", 
        details: validation.error.format() 
      }, { status: 400 });
    }

    const { title, category, payRate, payType, urgency, lat, lng, location, description, duration } = validation.data;

    await dbConnect();

    // Default expiry based on urgency
    let expiresAt = new Date();
    if (urgency === 'immediate') {
      expiresAt.setDate(expiresAt.getDate() + 1); // 24 hours
    } else if (urgency === '24h') {
      expiresAt.setDate(expiresAt.getDate() + 2); // 48 hours
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days
    }

    const job = await Job.create({
      title,
      category,
      payPerHour: payType === 'hourly' ? payRate : undefined,
      payPerDay: payType === 'daily' ? payRate : undefined,
      duration,
      location,
      urgency,
      expiresAt,
      geoCoordinates: {
        type: "Point",
        coordinates: [lng || 0, lat || 0]
      },
      description,
      employerId: (session.user as any).id
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
