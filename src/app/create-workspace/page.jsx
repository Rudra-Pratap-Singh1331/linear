"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { useTheme } from "@/component/ThemeProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle, faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function CreateWorkspacePage() {
  const router = useRouter();
  const supabase = useSupabase();
  const { theme } = useTheme();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [isNameTouched, setIsNameTouched] = useState(false);

  // Check auth and existing workspace status
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error: authError } = await supabase.auth.getUser();
        const user = data?.user;

        if (authError || !user) {
          router.replace("/login"); // or root
          return;
        }

        setUser(user);

        // Check if user already has a workspace
        const { data: memberships, error: memberError } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id);

        if (memberError) {
          console.error("Error checking membership:", memberError);
          // If error occurs, assume no workspace or allow retry by showing page
          setLoading(false);
        } else if (memberships && memberships.length > 0) {
          // User already has a workspace, redirect to home/dashboard
          router.replace("/");
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setLoading(false);
      }
    };

    checkUser();
  }, [supabase, router]);

  // Handle Slug Generation
  const handleNameChange = (e) => {
    const name = e.target.value;
    setWorkspaceName(name);
    
    // Auto-generate slug from name if user hasn't manually edited slug mostly
    // For simplicity, let's just mirror name to slug initially or sanitizing on the fly
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "") // remove invalid chars
      .replace(/\s+/g, "-");    // spaces to hyphens
    
    setWorkspaceSlug(generatedSlug);
  };

  const handleSlugChange = (e) => {
    const val = e.target.value;
    // Enforce slug format
    const sanitized = val
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    setWorkspaceSlug(sanitized);
  };

  const handleCreate = async () => {
    setIsNameTouched(true);
    if (!workspaceName.trim()) {
      return;
    }
    if (!workspaceSlug.trim()) {
      return; // Add specific slug error if needed
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create Workspace
      const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          owner_id: user.id,
          name: workspaceName,
          slug: workspaceSlug,
          region: "United States" // Default or from dropdown
        })
        .select()
        .single();

      if (wsError) {
        if (wsError.code === "23505") { // Unique violation for slug
            throw new Error("This URL is already taken. Please choose another one.");
        }
        throw wsError;
      }

      // 2. Add Member (Owner) - Logic handled by RLS/Trigger usually, or explicit insert.
      // My schema implementation plan had explicit insert in the flow.
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspace.id,
          user_id: user.id,
          role: "owner"
        });

      if (memberError) {
        // If this fails, we might have an orphan workspace. 
        // Ideally should be a transaction or Postgres function, but for client-side flow:
        console.error("Failed to add member:", memberError);
        throw new Error("Failed to set up workspace membership.");
      }

      // 3. Success -> Onboarding
      router.push(`/${workspaceSlug}/welcome`);

    } catch (err) {
      console.error("Creation failed:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center">Loading...</div>;
  }

  const isNameInvalid = isNameTouched && !workspaceName.trim();

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-white dark:bg-linear-to-b dark:from-[#0f1011] dark:to-[#060606]">
      
      {/* Header */}
      <div className="w-full px-8 py-6 flex justify-between items-center z-10">
         <button 
           onClick={handleLogout}
           className="text-[13px] text-zinc-500 hover:text-zinc-800 dark:text-[#8a8a8a] dark:hover:text-zinc-300 transition-colors"
         >
           Log out
         </button>
         <div className="text-[13px] text-zinc-500 dark:text-[#8a8a8a] flex flex-col items-end">
           <span className="text-[11px] uppercase tracking-wider mb-0.5 opacity-70">Logged in as</span>
           <span className="font-medium text-zinc-800 dark:text-[#ededed]">{user?.email}</span>
         </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-4">
        
        {/* Headings */}
        <h1 className="text-[28px] font-semibold text-zinc-900 dark:text-[#ededed] mb-3 tracking-tight">
          Create a new workspace
        </h1>
        <p className="text-[15px] text-zinc-500 dark:text-[#8a8a8a] mb-10 text-center max-w-lg leading-normal">
          Workspaces are shared environments where teams can work <br className="hidden sm:block"/> on projects, cycles and issues.
        </p>

        {/* Card */}
        <div className="w-full max-w-[440px] bg-white dark:bg-[#131315] rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_#262626] border border-transparent dark:border-[#262626] p-8">
          
          {/* Workspace Name Input */}
          <div className="mb-6">
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-[#b4b4b4] mb-2">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={handleNameChange}
              onBlur={() => setIsNameTouched(true)}
              className={`w-full h-10 px-3 rounded-[6px] bg-white dark:bg-[#1a1a1c] border ${isNameInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-zinc-200 dark:border-[#2e2e30] focus:border-[#5e6ad2] focus:ring-[#5e6ad2]/20'} text-[14px] text-zinc-900 dark:text-[#ededed] shadow-sm transition-all focus:outline-none focus:ring-4`}
            />
            {isNameInvalid && (
              <span className="text-[12px] text-red-500 mt-1.5 block">Required</span>
            )}
          </div>

          {/* Workspace URL Input */}
          <div className="mb-8">
            <label className="block text-[13px] font-medium text-zinc-700 dark:text-[#b4b4b4] mb-2">
              Workspace URL
            </label>
            <div className={`flex items-center w-full h-10 px-3 rounded-[6px] bg-white dark:bg-[#1a1a1c] border border-zinc-200 dark:border-[#2e2e30] focus-within:border-[#5e6ad2] focus-within:ring-4 focus-within:ring-[#5e6ad2]/20 text-[14px] shadow-sm transition-all`}>
              <span className="text-zinc-400 dark:text-[#5e5e60] select-none">localhost:3000/</span>
              <input
                type="text"
                value={workspaceSlug}
                onChange={handleSlugChange}
                className="flex-1 bg-transparent border-none p-0 text-zinc-900 dark:text-[#ededed] focus:ring-0 placeholder-zinc-300 dark:placeholder-zinc-700"
                placeholder="slug"
              />
            </div>
            {error && (
               <span className="text-[12px] text-red-500 mt-1.5 block">{error}</span>
            )}
          </div>

          {/* Location Dropdown (Visual Only) */}
          <div className="mb-8 flex items-center justify-between">
             <div className="flex items-center text-[13px] text-zinc-500 dark:text-[#8a8a8a]">
               <span>Workspace will be hosted in the</span>
             </div>
             <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-700 dark:text-[#d4d4d4] bg-zinc-100 dark:bg-[#232325] px-2.5 py-1 rounded hover:bg-zinc-200 dark:hover:bg-[#2d2d30] transition-colors">
                  United States
                  <FontAwesomeIcon icon={faChevronDown} className="text-[10px] opacity-60 ml-0.5" />
                </button>
                <div className="text-zinc-400 dark:text-[#404040] hover:text-zinc-500 dark:hover:text-[#606060] cursor-help">
                  <FontAwesomeIcon icon={faQuestionCircle} className="w-3.5 h-3.5" />
                </div>
             </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleCreate}
            disabled={submitting || !workspaceName.trim()}
            className={`w-full h-10 rounded-[6px] text-[14px] font-medium text-white transition-all shadow-sm ${
              submitting || !workspaceName.trim()
                ? "bg-[#5e6ad2] opacity-50 cursor-not-allowed" 
                : "bg-[#5e6ad2] hover:bg-[#4e5ac0] hover:shadow"
            }`}
          >
            {submitting ? "Creating..." : "Create workspace"}
          </button>


        </div>
      </div>
    </div>
  );
}
