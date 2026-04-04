"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiX, FiClock, FiMapPin, FiActivity, FiDollarSign } from "react-icons/fi";
import { formatTimeAgo } from "@/lib/utils";
import toast from "react-hot-toast";

interface JobModalProps {
  job: any;
  onClose: () => void;
}

export default function JobModal({ job, onClose }: JobModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    if (!session) {
      toast.error("Please sign in to apply.");
      return router.push("/");
    }
    
    // Safety check: Posters shouldn't apply
    if ((session.user as any)?.role === "employer") {
      toast.error("Please switch to 'Job Seeker' mode to apply.");
      return;
    }

    setApplying(true);
    try {
      const { applyForJob } = await import("@/app/actions/jobActions");
      const result = await applyForJob(job._id);

      if (result.success) {
        setSuccess(true);
        toast.success("Application sent! Good luck!");
        setTimeout(() => {
          onClose();
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to apply");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error applying. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  if (!job) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[80px] pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 md:p-8 flex justify-between items-start border-b border-white/5 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 font-bold rounded-lg text-xs uppercase tracking-wider">
                {job.category}
              </span>
              {job.urgency && job.urgency !== 'normal' && (
                <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest animate-pulse
                  ${job.urgency === 'immediate' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                  {job.urgency === 'immediate' ? '🚨 IMMEDIATE' : '⚡ 24h'}
                </span>
              )}
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter flex items-center gap-1.5 ml-auto">
                <FiClock /> {formatTimeAgo(job.createdAt)}
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">{job.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8 relative z-10">
          {/* Key Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Pay</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                ₹{job.payPerHour || job.payPerDay}{" "}
                <span className="text-xs text-neutral-500">/ {job.payPerHour ? "hr" : "day"}</span>
              </div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-neutral-500 text-[10px] font-bold uppercase mb-1">Duration</div>
              <div className="text-white font-bold">{job.duration}</div>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 col-span-2 md:col-span-1">
              <div className="text-neutral-500 text-[10px] font-bold uppercase mb-1 flex items-center gap-1"><FiMapPin /> Location</div>
              <div className="text-blue-400 font-bold truncate">{job.location}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Full Job Description</h3>
            <p className="text-neutral-400 leading-relaxed max-h-[200px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
              {job.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="text-sm text-neutral-500">
             Posted by <span className="text-white font-medium">{job.employerId?.name || "Verified Business"}</span>
          </div>
          
          <button 
            onClick={handleApply}
            disabled={applying || success || Boolean(session && (session.user as any)?.role === "employer")}
            className={`w-full sm:w-auto px-10 py-4 rounded-xl font-bold tracking-wide transition-all shadow-xl
              ${success 
                ? "bg-emerald-500 text-white" 
                : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:scale-[1.05] active:scale-95 shadow-blue-500/20 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              }`}
          >
            {success ? "Application Sent! ✅" : applying ? "Processing..." : session ? "Submit Application" : "Log in to Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
