"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";

export default function AuthEmailComponent({ buttonActive, isButtonActive }) {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const supabase = useSupabase(); // Ensure useSupabase is imported from provider or passed correctly. 
  // Wait, useSupabase is NOT imported in this file in the original view. 
  // I need to add the import if it's missing or use the one I'm confident exists.
  // The Analysis showed it being used in signup/page.jsx, assuming this component has access or I import it.
  // The previous view of AuthEmailComponent did NOT show useSupabase import. I must add it.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage("Check your email for the login link!");
    } catch (err) {
      console.error("Login failed:", err);
      // Optional: set error state
    } finally {
      setLoading(false);
    }
  };

  if (message) {
    return (
      <div className="text-center text-[#ededed] animate-fade-in">
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
}
