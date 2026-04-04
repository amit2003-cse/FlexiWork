"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiLayout, FiSearch, FiBriefcase, FiRepeat, FiUser, FiBriefcase as FiPoster } from "react-icons/fi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  // Don't show on landing page
  if (pathname === "/") return null;

  const role = (session?.user as any)?.role;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 flex items-center justify-center text-sm group-hover:scale-110 transition-transform text-white font-bold">🚀</div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">FlexiWork</span>
          </Link>

          {/* Role Switch & Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {role !== 'employer' ? (
              <Link 
                href="/jobs" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${pathname === '/jobs' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                <FiSearch className="text-lg" />
                Explore Jobs
              </Link>
            ) : null}
            
            {session && (
              <Link 
                href="/dashboard" 
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${pathname === '/dashboard' ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
              >
                <FiLayout className="text-lg" />
                Dashboard
              </Link>
            )}

            {session && (
              <button 
                onClick={async () => {
                  const newRole = role === "employer" ? "employee" : "employer";
                  const res = await fetch("/api/profile/switch-role", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ role: newRole }),
                  });
                  if (res.ok) {
                    await update({ role: newRole });
                    toast.success(`Switched to ${newRole === 'employer' ? 'Hiring Mode' : 'Seeking Work'}`);
                    if (newRole === 'employer') {
                      router.push("/dashboard");
                    }
                    setTimeout(() => window.location.reload(), 500);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 md:ml-3"
              >
                <FiRepeat className="text-sm" />
                Switch to {role === 'employer' ? 'Seeker' : 'Hiring'}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {session ? (
              <>
                <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mr-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-neutral-800">
                    {session.user?.image ? (
                      <img src={session.user.image} alt="User" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>
                    )}
                  </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-violet-400 uppercase tracking-tighter">
                        {role === 'employer' ? 'Job Poster' : 'Job Seeker'}
                      </span>
                      <span className="text-xs font-semibold text-neutral-300 max-w-[80px] truncate">{session.user?.name}</span>
                   </div>
                </div>
                
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 md:px-4 md:py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all flex items-center gap-2"
                  title="Logout"
                >
                  <FiLogOut className="text-lg" />
                  <span className="hidden md:block text-sm font-semibold">Logout</span>
                </button>
              </>
            ) : (
              <Link 
                href="/"
                className="px-6 py-2 rounded-xl bg-white text-black font-bold text-sm hover:scale-105 transition-all"
              >
                Sign In
              </Link>
            )}
            
            {/* Mobile Nav Toggle Icon */}
            <div className="md:hidden flex gap-2">
               <Link href="/jobs" className="p-2 text-neutral-400 hover:text-white"><FiBriefcase className="text-xl"/></Link>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}
