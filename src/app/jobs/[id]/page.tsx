"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { formatTimeAgo } from "@/lib/utils";

export default function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${resolvedParams.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setJob(data.job);
        setLoading(false);
      });
  }, [resolvedParams.id]);

  const handleApply = async () => {
    if (!session) return router.push("/");
    if ((session.user as any)?.role !== "employee") return alert("Only job seekers can apply.");

    setApplying(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job._id }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Applied successfully!");
        router.push("/dashboard");
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (err) {
      console.error(err);
      alert("Error applying");
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Loading job details...</div>;
  if (!job) return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">Job not found</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 px-4 py-12 relative">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/jobs" className="text-neutral-400 hover:text-white mb-8 inline-block transition-colors font-medium">
          &larr; Back to jobs
        </Link>
        
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <span className="px-4 py-1.5 bg-violet-500/20 text-violet-300 font-semibold rounded-lg text-sm mb-4 inline-block">
                {job.category}
              </span>
              <span className="ml-3 text-xs text-neutral-500 uppercase tracking-widest font-bold">
                 • Posted {formatTimeAgo(job.createdAt)}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-4">{job.title}</h1>
              <p className="text-neutral-400 font-medium">Posted by <span className="text-white">{job.employerId?.name || "Verified Employer"}</span></p>
            </div>
            
            <div className="text-right flex flex-col items-start md:items-end bg-black/30 p-6 rounded-2xl border border-white/5">
              <span className="text-neutral-400 text-sm font-medium mb-1">Compensation</span>
              <span className="text-3xl font-bold text-emerald-400">
                {job.payPerHour ? `₹${job.payPerHour} / hr` : job.payPerDay ? `₹${job.payPerDay} / day` : "Variable"}
              </span>
              <span className="text-neutral-500 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-500"></span> {job.duration}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 my-8"></div>

          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Job Description</h2>
            <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap text-lg">
              {job.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/5 p-6 rounded-2xl border border-white/5">
            <p className="text-sm text-neutral-400">Looking for this kind of part-time work?</p>
            <button 
              onClick={handleApply}
              disabled={applying || Boolean(session && (session.user as any)?.role === "employer")}
              className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold tracking-wide shadow-lg shadow-blue-500/20 hover:scale-[1.05] transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {applying ? "Applying..." : session ? "Apply Now" : "Sign in to Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
