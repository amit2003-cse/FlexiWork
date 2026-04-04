"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FiBriefcase, FiUsers, FiCheckCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "authenticated") {
      if (userRole === "employee") {
        router.push("/jobs");
      } else if (userRole === "employer") {
        router.push("/dashboard");
      } else {
        router.push("/profile");
      }
    }
  }, [status, userRole, router]);

  if (status === "loading") {
    return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 overflow-hidden relative selection:bg-violet-500/30">
      {/* Premium Animated Backgrounds */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-10000" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-10000 delay-5000" />
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navbar */}
        <nav className="flex items-center justify-center p-6 md:p-8">
          <div className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center text-xl">🚀</span>
            FlexiWork
          </div>
        </nav>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md shadow-xl">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-sm font-medium text-neutral-300">The premier network for flexible jobs</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-tight">
              One platform. <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400">
                Endless opportunities.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 font-light max-w-2xl mx-auto">
              Join the ecosystem where talented freelancers meet verified employers. Whether you want to work or hire, start your journey today.
            </p>
          </div>

          {/* Cards & Login Action */}
          <div className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 justify-center items-stretch mb-16">
            
            {/* Job Seeker Card */}
            <div className="flex-1 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl flex flex-col relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] group-hover:bg-blue-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
                <FiBriefcase className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">I'm looking for work</h2>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-blue-400 shrink-0" />
                  <span>Find flexible gigs instantly</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-blue-400 shrink-0" />
                  <span>Get paid directly on your terms</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-blue-400 shrink-0" />
                  <span>Build a verified portfolio</span>
                </li>
              </ul>
            </div>

            {/* Login Gateway (Center Piece) */}
            <div className="lg:w-[400px] shrink-0 bg-gradient-to-b from-white/10 to-white/5 border border-white/20 p-8 rounded-3xl backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center z-10 relative">
              <div className="absolute inset-0 rounded-3xl border border-white/30 [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none"></div>
              
              <div className="p-4 bg-white/5 rounded-full border border-white/10 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full blur-[10px] absolute opacity-50"></div>
                <img src="/next.svg" alt="Auth" className="w-12 h-12 relative invert opacity-80" />
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2 text-center">Get Started Now</h3>
              <p className="text-neutral-400 text-center text-sm mb-8">Secure login with Google to access both seeker and employer dashboards.</p>
              
              <button
                onClick={() => signIn("google", { callbackUrl: "/profile" })}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-neutral-900 font-bold hover:bg-neutral-100 hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <FcGoogle className="w-6 h-6" />
                Continue with Google
              </button>

              <div className="mt-6 text-xs text-neutral-500 text-center max-w-[250px]">
                By continuing, you agree to the Terms of Service and Privacy Policy.
              </div>
            </div>

            {/* Employer Card */}
            <div className="flex-1 bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl flex flex-col relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
              <div className="absolute top-0 left-0 w-32 h-32 bg-violet-500/10 blur-[50px] group-hover:bg-violet-500/20 transition-all"></div>
              <div className="w-14 h-14 bg-violet-500/20 rounded-2xl flex items-center justify-center text-violet-400 mb-6 border border-violet-500/20">
                <FiUsers className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">I want to hire</h2>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-violet-400 shrink-0" />
                  <span>Post jobs perfectly tailored to you</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-violet-400 shrink-0" />
                  <span>Access a pool of vetted talent</span>
                </li>
                <li className="flex items-center gap-3 text-neutral-300">
                  <FiCheckCircle className="text-violet-400 shrink-0" />
                  <span>Manage applications effortlessly</span>
                </li>
              </ul>
            </div>
            
          </div>
        </main>
        
        {/* Simple Footer */}
        <footer className="w-full py-8 text-center text-neutral-600 text-sm border-t border-white/5 mt-auto z-10">
          <p>© {new Date().getFullYear()} FlexiWork. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
