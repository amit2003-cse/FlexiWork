"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBriefcase as FiPoster, FiUser, FiCheckCircle, FiXCircle, FiClock, FiChevronDown, FiChevronUp, FiPlus, FiExternalLink, FiTrash2, FiAlertCircle } from "react-icons/fi";
import { generateWhatsAppLink } from "@/lib/utils";
import { deleteJob, reportNoShow } from "@/app/actions/jobActions";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/applications");
      const json = await res.json();
      if (json.success) {
        setApplications(json.applications || []);
        setMyJobs(json.jobs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated") {
      if (!userRole) {
        router.push("/profile");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, userRole, router]);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    if (newStatus === 'no_show') {
      const confirmNoShow = window.confirm("Report this person as a No-Show? This will decrease their trust rating platform-wide.");
      if (!confirmNoShow) return;
      
      const res = await reportNoShow(appId);
      if (res.success) {
        toast.success("No-show reported successfully.");
        fetchDashboardData();
      } else {
        toast.error(res.error || "Failed to report no-show.");
      }
      return;
    }

    try {
      const res = await fetch("/api/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Application ${newStatus}`);
        fetchDashboardData();
      } else {
        toast.error("Failed to update application status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;
    
    const res = await deleteJob(jobId);
    if (res.success) {
      toast.success("Job post deleted successfully.");
      fetchDashboardData();
    } else {
      toast.error(res.error || "Failed to delete job.");
    }
  };

  if (status === "loading" || loading) return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <DashboardSkeleton />
      </div>
    </div>
  );

  const role = (session?.user as any)?.role;

  // --- SEEKER VIEW ---
  const SeekerDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">My Applications</h2>
          <p className="text-neutral-500 text-sm">Track the status of jobs you've applied to.</p>
        </div>
        <Link href="/jobs" className="text-blue-400 hover:text-blue-300 text-sm font-bold flex items-center gap-1 transition-colors">
          Browse More Jobs <FiExternalLink />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center border-dashed">
          <div className="text-4xl mb-4 opacity-30">📪</div>
          <h3 className="text-xl font-bold mb-2">No applications yet</h3>
          <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm">You haven't applied to any part-time jobs. Start exploring today!</p>
          <Link href="/jobs" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all inline-block">Explore Jobs</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map((app) => (
            <div key={app._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded text-[10px] uppercase font-bold tracking-wider">{app.jobId?.category}</span>
                  <span className="text-xs text-neutral-500 font-medium tracking-tighter uppercase"><FiClock className="inline mr-1" /> Applied {new Date(app.appliedAt).toLocaleDateString()}</span>
                </div>
                <h4 className="text-xl font-bold text-white">{app.jobId?.title}</h4>
                <div className="text-sm text-emerald-400 font-bold mt-1">₹{app.jobId?.payPerHour || app.jobId?.payPerDay} {app.jobId?.payPerHour ? '/hr' : '/day'}</div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border
                  ${app.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                    app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'}`}
                >
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // --- POSTER VIEW ---
  const PosterDashboard = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Managed Jobs</h2>
          <p className="text-neutral-500 text-sm">Only showing jobs you created.</p>
        </div>
        <Link href="/jobs/post" className="px-6 py-2 bg-white text-black text-xs font-bold rounded-xl hover:scale-105 transition-all flex items-center gap-2 shadow-xl shadow-white/10">
          <FiPlus /> POST NEW JOB
        </Link>
      </div>

      {myJobs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 p-12 rounded-3xl text-center border-dashed">
          <div className="text-4xl mb-4 opacity-30">💼</div>
          <h3 className="text-xl font-bold mb-2">No jobs posted yet</h3>
          <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm">Start hiring part-time talent in Dhanbad by posting your first job.</p>
          <Link href="/jobs/post" className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-all inline-block">Post Initial Job</Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {myJobs.map((job) => {
            const jobApplicants = applications.filter(a => a.jobId?._id === job._id);
            const isExpanded = expandedJob === job._id;

            return (
              <div key={job._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all">
                <div 
                  onClick={() => setExpandedJob(isExpanded ? null : job._id)}
                  className={`p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer hover:bg-white/[0.03] transition-colors ${isExpanded ? 'bg-white/[0.03] border-b border-white/5' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] uppercase font-bold tracking-wider">{job.category}</span>
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">{job.location}</span>
                    </div>
                    <h4 className="text-xl font-bold text-white">{job.title}</h4>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{jobApplicants.length}</div>
                      <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Applicants</div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); handleDeleteJob(job._id); }}
                         className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                         title="Delete Job"
                       >
                         <FiTrash2 />
                       </button>
                       <div className="p-2 rounded-lg bg-white/5 text-neutral-400">
                         {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                       </div>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-6 bg-black/20 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {jobApplicants.length === 0 ? (
                      <div className="py-8 text-center text-neutral-500 text-sm font-medium italic">No applications for this job yet.</div>
                    ) : (
                      <div className="grid gap-3">
                        {jobApplicants.map((app) => (
                          <div key={app._id} className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                               <h5 className="font-bold text-white text-lg">{app.employeeId?.name}</h5>
                               <div className="text-xs text-neutral-500 font-medium">📧 {app.employeeId?.email} &nbsp;|&nbsp; 📞 {app.employeeId?.contact}</div>
                               <div className="mt-2 flex gap-2">
                                  {app.employeeId?.skills?.map((s: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-white/5 text-neutral-400 text-[9px] rounded font-bold uppercase tracking-tighter">{s}</span>
                                  ))}
                               </div>
                            </div>
                            <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
                               {app.status === 'pending' ? (
                                   <div className="flex gap-2">
                                     <button onClick={() => handleUpdateStatus(app._id, 'accepted')} className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"><FiCheckCircle/> Accept</button>
                                     <button onClick={() => handleUpdateStatus(app._id, 'rejected')} className="px-4 py-1.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all flex items-center gap-1.5"><FiXCircle/> Reject</button>
                                  </div>
                               ) : (
                                  <div className="flex flex-col md:items-end gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status === 'accepted' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : app.status === 'no_show' ? 'text-red-500 border-red-500/40 bg-red-500/10' : 'text-neutral-500 border-white/10 bg-white/5'}`}>{app.status}</span>
                                      {app.status === 'accepted' && (
                                        <button 
                                          onClick={() => handleUpdateStatus(app._id, 'no_show')}
                                          className="p-1 px-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-[9px] font-bold flex items-center gap-1"
                                          title="Report No-Show"
                                        >
                                          <FiAlertCircle /> REPORT NO-SHOW
                                        </button>
                                      )}
                                    </div>
                                    {app.status === 'accepted' && app.employeeId?.contact && (
                                       <a 
                                         href={generateWhatsAppLink(app.employeeId.contact, app.employeeId.name, job.title)}
                                         target="_blank"
                                         className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                                       >
                                         Message on WhatsApp
                                       </a>
                                    )}
                                  </div>
                               )}
                               {app.employeeId?.resume && (
                                  <a href={app.employeeId.resume} target="_blank" className="text-[10px] font-bold text-blue-400 hover:underline flex items-center gap-1">VIEW RESUME <FiExternalLink/></a>
                               )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-lg shadow-xl shadow-blue-500/20 text-white">
                {role === "employer" ? <FiPoster /> : <FiUser />}
              </div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">
                 {role === "employer" ? "Hiring" : "Career"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 font-black italic">Dashboard</span>
              </h1>
            </div>
            <p className="text-neutral-500 font-medium tracking-tight">Viewing your dashboard as a <span className="text-violet-400 font-bold uppercase text-[10px] bg-violet-500/10 px-2 py-0.5 rounded ml-1">{role === 'employer' ? 'Job Poster' : 'Job Seeker'}</span></p>
          </div>
          
          <button
            onClick={async () => {
              const newRole = role === "employer" ? "employee" : "employer";
              const res = await fetch("/api/profile/switch-role", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
              });
              if (res.ok) {
                await (update as any)({ role: newRole });
                toast.success(`Switched to ${newRole === 'employer' ? 'Hiring Mode' : 'Seeking Work'}`);
                setTimeout(() => window.location.reload(), 500);
              }
            }}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-neutral-400 text-xs font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 w-fit"
          >
             <span>Switch to {role === 'employer' ? 'Job Seeker' : 'Job Poster'}</span>
          </button>
        </header>

        {role === "employer" ? <PosterDashboard /> : <SeekerDashboard />}
      </div>
    </div>
  );
}
