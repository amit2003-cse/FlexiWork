"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { formatTimeAgo } from "@/lib/utils";
import JobModal from "@/components/JobModal";

import { JobFeedSkeleton } from "@/components/LoadingSkeleton";

export default function JobsList() {
  const { data: session } = useSession();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const url = categoryFilter ? `/api/jobs?category=${categoryFilter}` : "/api/jobs";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [categoryFilter]);

  const categories = ["All", "Delivery", "Event Helper", "Technician", "Tutor", "Other"];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 px-4 py-8 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Modal Overlay */}
        {selectedJob && (
          <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold mb-2 text-white">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500">Opportunities</span></h1>
            <p className="text-neutral-400">Discover and apply for part-time gigs near you.</p>
          </div>
          
          <div className="flex gap-4">
            {session && (session.user as any).role === "employer" && (
              <Link href="/jobs/post" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all text-sm flex items-center gap-2">
                <span>➕</span> Post a Job
              </Link>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat === "All" ? "" : cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full border transition-all text-sm font-semibold ${
                (categoryFilter === cat || (cat === "All" && !categoryFilter)) 
                ? "bg-white text-black border-white shadow-lg shadow-white/20" 
                : "border-white/10 text-neutral-400 hover:bg-white/5 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Job Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full">
              <JobFeedSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="col-span-full py-20 text-center text-neutral-400 bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <div className="text-4xl mb-4 opacity-50">🔭</div>
              <p className="text-lg">No jobs found in this category.</p>
              <p className="text-sm opacity-50 mt-1">Check back later or try a different filter.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div 
                onClick={() => setSelectedJob(job)}
                key={job._id} 
                className={`group relative bg-white/5 border rounded-2xl p-6 transition-all cursor-pointer backdrop-blur-sm overflow-hidden flex flex-col items-start h-full hvr-grow
                  ${job.urgency === 'immediate' ? 'border-red-500/50 hover:border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 
                    job.urgency === '24h' ? 'border-orange-500/50 hover:border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 
                    'border-white/10 hover:border-violet-500/50 hover:bg-white/10'}`}
              >
                {/* Urgency Badge */}
                {job.urgency !== 'normal' && (
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest z-10 animate-pulse
                    ${job.urgency === 'immediate' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {job.urgency === 'immediate' ? '🚨 IMMEDIATE' : '⚡ 24h'}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <h3 className="text-xl font-bold mb-1 group-hover:text-blue-400 transition-colors line-clamp-1 pr-12">{job.title}</h3>
                <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-bold uppercase tracking-tighter mb-4">
                  <span className="text-blue-500 font-normal">📍</span> {job.location || 'Remote'}
                </div>
                
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                   Posted {formatTimeAgo(job.createdAt)}
                </div>
                
                <p className="text-neutral-400 text-sm mb-6 line-clamp-2 leading-relaxed">{job.description}</p>
                
                <div className="mt-auto pt-4 border-t border-white/5 w-full flex justify-between items-center text-sm">
                  <div className="font-bold text-emerald-400 text-lg">
                    {job.payPerHour ? `₹${job.payPerHour}/hr` : job.payPerDay ? `₹${job.payPerDay}/day` : 'Variable'}
                  </div>
                  <button className="text-[10px] font-bold py-2 px-4 rounded-lg bg-white/5 text-white underline-offset-4 decoration-violet-500 border border-white/5 hover:bg-white/10 uppercase tracking-widest transition-colors group-hover:bg-white/10 group-hover:border-white/20">
                    Apply Now
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
