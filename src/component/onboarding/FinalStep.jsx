"use client";

import React from "react";
import { useRouter } from "next/navigation";
import LinearLogo from "@/component/LinearLogo";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faShapes, faKeyboard } from "@fortawesome/free-solid-svg-icons";

export default function FinalStep() {
  const router = useRouter();

  const handleFinish = () => {
    // Optionally mark onboarding as complete in DB here
    router.push("/");
  };

  return (
    <div className="mt-[-40px] flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full max-w-[1000px]">
      <h1 className="mb-3 text-[24px] font-sans font-medium tracking-tight text-foreground">
        You're good to go
      </h1>
      <p className="mb-8 text-[14px] font-sans font-medium text-zinc-500 dark:text-[#787878]">
        Go ahead and explore the app. When you're ready, create your first issue by pressing <kbd className="font-sans border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs mx-0.5 bg-gray-50 dark:bg-[#1a1a1a] text-zinc-600 dark:text-[#a0a0a0]">C</kbd>.
      </p>

      {/* 3-Column Container */}
      <div className="flex w-[900px] max-w-[90vw] mb-12 border rounded-[8px] border-[#dcdcdc] dark:border-[#2e3135] bg-white dark:bg-[#0a0a0b] divide-x divide-[#dcdcdc] dark:divide-[#2e3135] overflow-hidden  dark:shadow-none">
        
        {/* Column 1: Tell your team */}
        <div className="flex-1 p-[38px] text-left flex flex-col items-start">
          <div className="h-10 w-10 flex items-center justify-center rounded-[8px] border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-zinc-600 dark:text-[#a0a0a0]">
             <FontAwesomeIcon icon={faUser} className="h-[18px] w-[18px]" />
          </div>
          <h3 className="mb-1 text-[.9375rem] font-semibold text-zinc-900 dark:text-white mt-auto">
            Tell your team
          </h3>
          <p className="text-[14px] font-sans font-medium leading-relaxed text-[#606060] dark:text-[#8a8a8a]">
            Make sure to invite your team members.
          </p>
        </div>

        {/* Column 2: Integrate */}
        <div className="flex-1 p-[38px] text-left flex flex-col items-start">
           <div className="mb-1 h-10 w-10 flex items-center justify-center rounded-[8px] border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-zinc-600 dark:text-[#a0a0a0]">
             <FontAwesomeIcon icon={faShapes} className="h-[18px] w-[18px]" />
          </div>
          <h3 className="mb-1 text-[.9375rem] font-semibold text-zinc-900 dark:text-white mt-auto">
            Integrate GitHub & Slack
          </h3>
          <p className="text-[15px] font-sans font-medium leading-relaxed text-[#606060] dark:text-[#8a8a8a]">
            Link your pull requests and create issues from Slack.
          </p>
        </div>

        {/* Column 3: Keyboard shortcuts */}
        <div className="flex-1 p-[38px] text-left flex flex-col items-start">
           <div className="mb-1 h-10 w-10 flex items-center justify-center rounded-[8px] border border-[#e5e5e5] dark:border-[#333] bg-white dark:bg-[#1a1a1a] text-zinc-600 dark:text-[#a0a0a0]">
             <FontAwesomeIcon icon={faKeyboard} className= "h-[18px] w-[18px]" />
          </div>
          <h3 className="mb-1 text-[.9375rem] font-semibold text-zinc-900 dark:text-white mt-auto">
            Keyboard shortcuts
          </h3>
          <p className="text-[15px] font-sans font-medium leading-relaxed text-[#606060] dark:text-[#8a8a8a]">
            Learn the keyboard commands by pressing <kbd className="font-sans border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 text-[11px] bg-white dark:bg-[#232323] text-zinc-600 dark:text-[#a0a0a0]">?</kbd>.
          </p>
        </div>
      </div>

      <button
        onClick={handleFinish}
        className="w-[336px] h-[48px] rounded-md bg-[#5e6ad2] text-[15px] font-medium text-white shadow-sm transition hover:bg-[#4b55aa] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#080808]"
      >
        Open Linear
      </button>
    </div>
  );
}
