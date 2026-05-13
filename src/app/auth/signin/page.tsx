"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Zap } from "lucide-react";

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.65 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.013 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.143 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.033 12.033 0 0 1-4.084 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

export default function SignInPage() {
  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center px-4" style={{ background: "#060B0F" }}>
      <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full blur-3xl" style={{ background: "rgba(99,102,241,0.12)" }} />
      <div className="absolute top-1/2 -right-20 h-72 w-72 rounded-full blur-3xl" style={{ background: "rgba(139,92,246,0.08)" }} />
      <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full blur-3xl" style={{ background: "rgba(99,102,241,0.06)" }} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] rounded-[20px] p-12"
        style={{ background: "#0C1419", border: "1px solid #1A2E3A", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
            <Zap size={16} style={{ color: "#060B0F" }} />
          </div>
          <p className="text-white font-semibold">ClearGroup</p>
        </div>

        <h1 className="text-white font-bold" style={{ fontSize: 28 }}>Welcome back</h1>
        <p className="mt-2 mb-8" style={{ color: "#7A9BAD", fontSize: 15 }}>Sign in to access your project dashboard</p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full h-[52px] rounded-[10px] px-4 flex items-center justify-center gap-3 transition-all"
          style={{ background: "#FFFFFF", color: "#1A1A1A" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#F5F5F5"; e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.18)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#FFFFFF"; e.currentTarget.style.boxShadow = "none"; }}
        >
          <GoogleGlyph />
          <span style={{ fontWeight: 500 }}>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1" style={{ background: "#1A2E3A" }} />
          <span style={{ color: "#7A9BAD", fontSize: 12 }}>or</span>
          <div className="h-px flex-1" style={{ background: "#1A2E3A" }} />
        </div>

        <Link href="/upload" className="inline-flex font-medium" style={{ color: "#6366F1" }}>
          Continue as guest ?
        </Link>
        <p className="mt-1 text-xs" style={{ color: "#7A9BAD" }}>Guest sessions are not saved</p>

        <p className="mt-8 text-xs" style={{ color: "#7A9BAD" }}>By continuing you agree to our Terms of Service</p>
      </motion.div>
    </main>
  );
}
