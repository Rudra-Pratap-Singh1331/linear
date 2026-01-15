"use client";

import React from "react";
import LinearLogo from "@/component/LinearLogo";

export default function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col mt-[-60px]  items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full">
      <div className="mb-3">
       <img width="128" height="128" className="sc-Lcmmc fqGARx" src="https://static.linear.app/client/assets/newAppIcon-1024x1024-CRFZL08z.png"/>
      </div>
      <h1 className="mb-2 text-[53px] font-semibold tracking-tight text-foreground">
        Welcome to Linear
      </h1>
      <p className="mb-8 text-[15px] text-zinc-500 dark:text-[#8a8a8a] max-w-md">
        Linear is a purpose-built system for developing products. Streamline issues, projects, and product roadmaps.
      </p>
      <button
        onClick={onNext}
        className="h-[48px] w-[336px] px-6 rounded-md bg-[#5e6ad2] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#4b55aa] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#080808]"
      >
        Get started
      </button>
    </div>
  );
}
