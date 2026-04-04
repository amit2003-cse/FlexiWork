"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiBriefcase, FiArrowLeft, FiEdit3 } from "react-icons/fi";
import { HiOutlineSpeakerphone } from "react-icons/hi";

export default function Profile() {
  const { data: session, update, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<"employee" | "employer" | "">("");
  const [contact, setContact] = useState("");
  
  // Seeker Specific
  const [categories, setCategories] = useState<string[]>([]);
  const [skillsStr, setSkillsStr] = useState("");
  const [resume, setResume] = useState("");

  const [loading, setLoading] = useState(false);

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    } else if (status === "authenticated" && userRole) {
      router.push(userRole === "employee" ? "/jobs" : "/dashboard");
    }
  }, [status, userRole, router]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    try {
      // Seeker specific transformations
      const skillsArray = skillsStr.split(",").map(s => s.trim()).filter(Boolean);
      // We can append categories as part of skills or separate if api supports it, 
      // but api accepts "skills" as array of strings. We fuse them if seeker.
      const finalSkills = role === "employee" ? [...skillsArray, ...categories] : [];
      
      // If employer, maybe they selected a category they hire for? 
      // The API currently accepts: contact, skills, resume, role.
      // So we'll pass categories in 'skills' field for employers too, if they selected any.
      const payloadSkills = role === "employee" ? finalSkills : categories;

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          role, 
          contact: `+91${contact}`, 
          skills: payloadSkills, 
          resume: role === "employee" ? resume : "" 
        }),
      });
      
      if (res.ok) {
        await update({ role });
        router.push(role === "employee" ? "/jobs" : "/dashboard");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">Loading...</div>;

  const jobCategories = ["Delivery", "Event Helper", "Technician", "Tutor", "Retail", "Other"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[0%] right-[0%] w-[40vw] h-[40vw] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-2xl bg-white/5 border border-white/10 p-8 md:p-12 rounded-[2rem] backdrop-blur-xl shadow-2xl transition-all duration-500">
        
        {step === 1 ? (
          <div className="flex flex-col animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">How do you want to use FlexiWork?</h1>
              <p className="text-neutral-400 text-lg">Select your primary role. You cannot change this later.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => { setRole("employee"); setStep(2); }}
                className="group flex flex-col items-center p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-20 h-20 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FiBriefcase className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">I'm looking for work</h3>
                <p className="text-neutral-400 text-sm">Find part-time jobs, gigs, and build your flexible career.</p>
              </button>

              <button
                onClick={() => { setRole("employer"); setStep(2); }}
                className="group flex flex-col items-center p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all text-center focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <div className="w-20 h-20 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <HiOutlineSpeakerphone className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">I want to hire</h3>
                <p className="text-neutral-400 text-sm">Post jobs, manage shifts, and find reliable local talent.</p>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col animate-in slide-in-from-right-8 fade-in duration-500">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="self-start flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
            >
              <FiArrowLeft /> Back to roles
            </button>
            
            <div className="mb-8 border-b border-white/10 pb-8">
              <div className="flex items-center gap-4">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl">👤</div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{session?.user?.name || "Welcome!"}</h1>
                  <p className="text-neutral-400">{session?.user?.email}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${role === 'employer' ? 'bg-violet-500/20 text-violet-300' : 'bg-blue-500/20 text-blue-300'}`}>
                    {role}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-neutral-300">Contact Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 font-bold border-r border-white/10 pr-4 my-3">
                    🇮🇳 +91
                  </div>
                  <input 
                    required
                    type="tel" 
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={contact}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 10) setContact(val);
                    }}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-24 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-lg tracking-widest placeholder:tracking-normal"
                    placeholder="98765 43210"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider">Enter your 10-digit mobile number</p>
              </div>

              {/* Both roles can pick categories to show intent */}
              <div className="flex flex-col gap-3">
                <label className="text-sm font-medium text-neutral-300">
                  {role === "employee" ? "Preferred Categories" : "Categories You Hire For"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {jobCategories.map(cat => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-4 py-2 rounded-full border transition-all text-sm font-medium ${
                          isSelected 
                            ? role === "employee" ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30" : "bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/30"
                            : "bg-black/40 border-white/10 text-neutral-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  })}
                </div>
              </div>

              {role === "employee" && (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300 flex items-center justify-between">
                      <span>Specific Skills <span className="text-neutral-500 font-normal">(Comma separated)</span></span>
                      <FiEdit3 className="text-neutral-500" />
                    </label>
                    <input 
                      type="text" 
                      value={skillsStr}
                      onChange={(e) => setSkillsStr(e.target.value)}
                      className="bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Carpentry, Web Design, Forklift Certified"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-neutral-300">Resume Link <span className="text-neutral-500 font-normal">(Optional)</span></label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                        🔗
                      </div>
                      <input 
                        type="url" 
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="mt-8">
                <button 
                  type="submit" 
                  disabled={loading || !contact}
                  className={`w-full py-5 rounded-2xl text-white font-bold tracking-wide shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex justify-center items-center gap-2 ${
                    role === "employee" ? "bg-gradient-to-r from-blue-600 to-blue-500 shadow-blue-500/20" : "bg-gradient-to-r from-violet-600 to-violet-500 shadow-violet-500/20"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Saving Profile...
                    </span>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </div>

            </div>
          </form>
        )}
      </div>
    </div>
  );
}
