"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { FiLogOut, FiLayout, FiSearch, FiBriefcase, FiRepeat, FiUser, FiBriefcase as FiPoster, FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Navbar() {
  const { data: session, update } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Don't show on landing page
  if (pathname === "/") return null;

  const role = (session?.user as any)?.role;

  const toggleRole = async () => {
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
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20 flex items-center justify-center text-sm group-hover:scale-110 transition-transform text-white font-bold">🚀</div>
            <span className="text-xl font-bold tracking-tight text-white hidden sm:block">FlexiWork</span>
          </Link>

          {/* Desktop Role Switch & Navigation Links */}
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
                onClick={toggleRole}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border border-violet-500/20 md:ml-3"
              >
                <FiRepeat className="text-sm" />
                Switch to {role === 'employer' ? 'Seeker' : 'Hiring'}
              </button>
            )}
          </div>

          {/* Desktop Actions & Mobile Menu Toggle */}
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
                  className="hidden md:flex flex-row p-2 md:px-4 md:py-2 rounded-xl border border-white/10 text-neutral-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-400/5 transition-all items-center gap-2"
                  title="Logout"
                >
                  <FiLogOut className="text-lg" />
                  <span className="hidden md:block text-sm font-semibold">Logout</span>
                </button>

                {/* Mobile Menu Toggle Button */}
                <button 
                  className="md:hidden p-2 text-neutral-400 hover:text-white transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
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
          </div>
        </div>
      </div>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && session && (
        <div className="md:hidden w-full border-t border-white/10 bg-neutral-900/95 backdrop-blur-xl absolute top-16 left-0 right-0 py-4 px-4 flex flex-col gap-2 z-40 shadow-2xl">
          {/* User Profile Summary (Mobile) */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 mb-2">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800 shrink-0">
              {session.user?.image ? (
                <img src={session.user.image} alt="User" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm">👤</div>
              )}
            </div>
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="text-xs font-bold text-violet-400 uppercase tracking-tighter">
                {role === 'employer' ? 'Job Poster' : 'Job Seeker'}
              </span>
              <span className="text-sm font-semibold text-neutral-200 truncate">{session.user?.name}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 w-full">
            {role !== 'employer' && (
              <Link 
                href="/jobs" 
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full px-4 py-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${pathname === '/jobs' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-300 hover:bg-white/5'}`}
              >
                <FiSearch className="text-xl" />
                Explore Jobs
              </Link>
            )}
            
            <Link 
              href="/dashboard" 
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full px-4 py-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 ${pathname === '/dashboard' ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-300 hover:bg-white/5'}`}
            >
              <FiLayout className="text-xl" />
              Dashboard
            </Link>

            <button 
              onClick={() => {
                toggleRole();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-4 rounded-xl text-sm font-medium transition-all flex items-center gap-3 bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 mt-2"
            >
              <FiRepeat className="text-xl" />
              Switch to {role === 'employer' ? 'Seeker' : 'Hiring'}
            </button>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full px-4 py-4 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all flex items-center gap-3 mt-4 border border-red-500/20"
            >
              <FiLogOut className="text-xl" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
