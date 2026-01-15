"use client";

import React from "react";
import { useTheme } from "@/component/ThemeProvider";

export default function ThemeStep({ onNext }) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full">
      <h1 className="mb-2 text-2xl font-medium tracking-tight text-foreground">
        Choose your style
      </h1>
      <p className="mb-10 text-[13px] text-zinc-500 dark:text-[#8a8a8a]">
        Change your theme at any time via the command menu or settings.
      </p>

      <div className="flex w-[600px] max-w-[90vw] h-[190px] mb-12 border border-[#dcdcdc] dark:border-[#2e3135] rounded-xl overflow-hidden divide-x divide-[#dcdcdc] dark:divide-[#2e3135]">
        {/* Light Theme Option */}
        <button
          onClick={() => setTheme("light")}
          className={`group flex-1 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none ${
            theme === "light" 
              ? "bg-[#f5f5f5] dark:bg-[#1f2023]" 
              : "bg-white dark:bg-[#101012] hover:bg-[#f9f9f9] dark:hover:bg-[#151517]"
          }`}
        >
          <div className={`w-[140px] h-[90px] rounded-lg mb-4 border relative overflow-hidden shadow-sm transition-all duration-300 ${
             theme === "light" ? "border-[#5e6ad2] shadow-indigo-500/10" : "border-gray-200 dark:border-[#333]"
          } bg-white`}>
            {/* Light UI Mockup */}
            <div className="absolute top-0 w-full h-3 border-b border-gray-100 bg-white"></div>
            <div className="absolute top-5 left-2 w-16 h-1 bg-gray-100 rounded-full"></div>
            <div className="absolute top-8 left-2 right-2 h-16 space-y-1.5">
               <div className="w-full h-1 bg-gray-50 rounded-full"></div>
               <div className="w-3/4 h-1 bg-gray-50 rounded-full"></div>
               <div className="w-5/6 h-1 bg-gray-50 rounded-full"></div>
            </div>
          </div>
          <span className={`text-[15px] font-medium tracking-tight ${theme === "light" ? "text-[#0f172a] dark:text-white" : "text-[#64748b] dark:text-[#8a8a8a]"}`}>Light</span>
        </button>

        {/* Dark Theme Option */}
        <button
          onClick={() => setTheme("dark")}
          className={`group flex-1 flex flex-col items-center justify-center transition-all duration-200 focus:outline-none ${
            theme === "dark" 
              ? "bg-[#f5f5f5] dark:bg-[#1f2023]" 
              : "bg-white dark:bg-[#101012] hover:bg-[#f9f9f9] dark:hover:bg-[#151517]"
          }`}
        >
          <div className={`w-[140px] h-[90px] rounded-lg mb-4 border relative overflow-hidden shadow-sm transition-all duration-300 ${
             theme === "dark" ? "border-[#5e6ad2] shadow-indigo-500/10" : "border-transparent dark:border-[#333]"
          } bg-[#18191b]`}>
             {/* Dark UI Mockup */}
            <div className="absolute top-0 w-full h-3 border-b border-[#2e3135] bg-[#232426]"></div>
            <div className="absolute top-5 left-2 w-16 h-1 bg-[#3a3d42] rounded-full"></div>
            <div className="absolute top-8 left-2 right-2 h-16 space-y-1.5">
               <div className="w-full h-1 bg-[#2e3135] rounded-full"></div>
               <div className="w-3/4 h-1 bg-[#2e3135] rounded-full"></div>
               <div className="w-5/6 h-1 bg-[#2e3135] rounded-full"></div>
            </div>
          </div>
          <span className={`text-[15px] font-medium tracking-tight ${theme === "dark" ? "text-[#0f172a] dark:text-white" : "text-[#64748b] dark:text-[#8a8a8a]"}`}>Dark</span>
        </button>
      </div>

      <button
        onClick={onNext}
        className="h-[48px] w-[336px] px-12 rounded-md bg-[#5e6ad2] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#4b55aa] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#080808]"
      >
        Continue
      </button>
    </div>
  );
}
