"use client";

import React, { useEffect } from "react";

export default function CommandMenuStep({ onNext }) {
  useEffect(() => {
    // Allow advancing if user actually presses Ctrl+K (optional delight)
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        // Maybe visualize success briefly then next? For now just prevent default to not annoy browser
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="mt-[-60px] flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full max-w-2xl">
      <h1 className="mb-3 text-[23px] font-sans font-medium tracking-normal text-foreground dark:text-[#ffffff]">
        Meet the command menu
      </h1>
      <p className="mb-8 text-[15px] font-sans tracking-normal text-zinc-500 dark:text-[#a9a9a9]">
        Complete any action in seconds by typing it into the command menu.
      </p>

      <div className="w-full max-w-[600px] mb-12 py-7 px-8 rounded-lg bg-white dark:bg-[#080808] border border-zinc-200 dark:border-[#23252a] flex flex-col items-center shadow-sm dark:shadow-[0px_0px_28px_6px_rgba(0,0,0,0.1)]">
        <p className="mb-8 text-[15px] font-sans font-semibold tracking-normal text-zinc-900 dark:text-[#ffffff]">Try opening the command menu with:</p>
        <div className="flex gap-3">
          <kbd className="flex h-[80px] text-[48px] tracking-tight px-[4px] items-center justify-center rounded-xl bg-white dark:bg-[#101012] border border-zinc-200 dark:border-[#23252a] text-4xl font-sans font-medium text-zinc-900 dark:text-[#ffffff] shadow-[0_3px_0_rgba(0,0,0,0.05)]">
            Ctrl
          </kbd>
          <kbd className="flex h-[80px] w-[80px] text-[48px] tracking-tight items-center justify-center rounded-xl bg-white dark:bg-[#101012] border border-zinc-200 dark:border-[#23252a] text-4xl font-sans font-medium text-zinc-900 dark:text-[#ffffff] shadow-[0_3px_0_rgba(0,0,0,0.05)]">
            K
          </kbd>
        </div>
      </div>

      <button
        onClick={onNext}
        className="h-[48px] w-[336px] px-12 rounded-md text-[.9375rem] font-medium text-black  dark:text-white transition hover:bg-[#cacbce72]  dark:hover:bg-[#3d404b72] "
      >
        Continue
      </button>
    </div>
  );
}
