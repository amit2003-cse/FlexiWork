"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function PostJob() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    category: "Delivery",
    payRate: "",
    payType: "daily",
    urgency: "normal",
    duration: "",
    location: "Dhanbad, Jharkhand",
    description: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "employer") {
      router.push("/jobs");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const jobData: any = {
      title: form.title,
      category: form.category,
      payRate: Number(form.payRate),
      payType: form.payType,
      urgency: form.urgency,
      duration: form.duration,
      location: form.location,
      description: form.description,
      lat: 23.7957,
      lng: 86.4304
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });

      if (res.ok) {
        toast.success("Job posted successfully!");
        router.push("/dashboard");
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to post job");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error posting job");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  if (status === "loading") return <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center font-bold">Loading mission control...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-12 relative overflow-hidden">
      <div className="max-w-3xl mx-auto relative z-10">
        <Link href="/dashboard" className="text-neutral-400 hover:text-white mb-8 inline-block transition-colors font-bold text-sm">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold mb-8 tracking-tight">Post a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 italic">New Job</span></h1>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Job Title</label>
            <input 
              required
              name="title"
              value={form.title}
              onChange={handleChange}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. Needs help moving furniture"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="Delivery">Delivery</option>
                <option value="Event Helper">Event Helper</option>
                <option value="Technician">Technician</option>
                <option value="Tutor">Tutor</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Urgency</label>
              <select
                name="urgency"
                value={form.urgency}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="normal">🕒 Normal</option>
                <option value="24h">⏳ Within 24h</option>
                <option value="immediate">🚨 Immediate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Pay Rate (₹)</label>
              <input 
                required
                type="number"
                name="payRate"
                value={form.payRate}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. 500"
              />
            </div>
            <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Pay Type</label>
              <select
                name="payType"
                value={form.payType}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="daily">Per Day</option>
                <option value="hourly">Per Hour</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Location (Dhanbad)</label>
              <input 
                required
                name="location"
                value={form.location}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. Bank More, Steel Gate"
              />
            </div>
            <div className="flex flex-col gap-2 text-start">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Duration</label>
              <input 
                required
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="e.g. 4 hours, 2 days"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-start">
            <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest text-start">Job Description</label>
            <textarea 
              required
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
              placeholder="Describe the tasks and any specific requirements..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold tracking-widest shadow-lg shadow-blue-500/20 hover:scale-[1.01] transition-all disabled:opacity-50 uppercase text-xs"
          >
            {loading ? "🚀 Broadcasting..." : "Broadcast Job Post"}
          </button>
        </form>
      </div>
    </div>
  );
}
