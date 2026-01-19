"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";

export default function AuthEmailComponent({ buttonActive, isButtonActive, mode = "signup" }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const supabase = useSupabase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: mode === "signup" ? true : false,
        },
      });

      if (error) throw error;

      setMessage("Check your email for the login link!");
    } catch (err) {
      console.error("Authentication failed:", err);
      if (mode === "login" && (err.message?.includes("User not found") || err.status === 400)) {
        setError("Account not found. Please sign up first.");
      } else {
        setError(err.message || "Authentication failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="text-center text-[#ededed] animate-[fade-slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
        <h3 className="text-lg font-medium mb-2">Check your email</h3>
        <p className="text-sm text-[#8a8a8a] mb-6">{message}</p>
        <button 
          onClick={() => setMessage(null)} 
          className="text-sm text-[#5e6ad2] hover:underline"
        >
          Try another email
        </button>
      </div>
    );
  }

  return (
    <div className="w-[288px] animate-[fade-slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => isButtonActive(" ")}
          className="text-[#919294] hover:text-white transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[13px] font-medium text-[#d4d4d5]">Continue with email</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          required
          autoFocus
          className="w-full h-11 bg-[#0f1113] border border-[#2c2e33] rounded-[6px] px-3.5 text-[13px] text-white placeholder:text-[#6c6e72] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2]/50 focus:border-[#5e6ad2] transition-all"
        />
        
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full h-11 bg-[#5e6ad2] hover:bg-[#6c78e6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-[6px] transition-all shadow-lg shadow-[#5e6ad2]/20"
        >
          {loading ? "Sending link..." : "Continue"}
        </button>

        {error && (
          <p className="text-xs text-red-500 text-left mt-2">{error}</p>
        )}
      </form>
    </div>
  );
}
