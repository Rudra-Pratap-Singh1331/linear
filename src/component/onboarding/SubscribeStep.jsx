"use client";

import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXTwitter } from "@fortawesome/free-brands-svg-icons";

function Toggle({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between py-7 border-b border-[#dcdcdc] last:border-0 dark:border-[#23252a]">
      <div className="flex flex-col text-left mr-4 gap-px tracking-[0.2px]">
        <span className="text-[14px] font-semibold text-zinc-900 dark:text-[#ffffff]">{label}</span>
        <span className="text-[13px] text-zinc-500 dark:text-[#9a9a9a]">{description}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-8 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-[#5e6ad2]" : "bg-zinc-300 dark:bg-[#46474a]"
        }`}
      >
        <span
          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SubscribeStep({ onNext }) {
  const [changelog, setChangelog] = useState(false);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="mt-[-60px] flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full max-w-2xl">
      <h1 className="mb-3 text-2xl font-sans font-medium tracking-tight text-foreground">
        Subscribe to updates
      </h1>
      <p className="mb-8 text-[15px] font-sans font-medium text-zinc-500 dark:text-[#787878]">
        Linear is constantly evolving. Subscribe to learn about changes.
      </p>

      <div className="w-[564px] border border-[#dcdcdc] dark:border-[#23252a] max-w-[600px] mb-12 px-10 py-5 rounded-lg bg-white dark:bg-[#101012] text-left shadow-[0px_5px_20px_rgba(0,0,0,0.15)] dark:shadow-[0px_0px_28px_6px_rgba(0,_0,_0,_0.1)] flex flex-col">
        <Toggle
          label="Subscribe to changelog"
          description="Bi-weekly email about new features and improvements"
          checked={changelog}
          onChange={setChangelog}
        />
        <Toggle
          label="Subscribe to marketing and onboarding emails"
          description="Occasional messages to help you get the most out of Linear"
          checked={marketing}
          onChange={setMarketing}
        />
        
        {/* Follow us on X Section */}
        <div className="flex items-center justify-between py-5">
          <div className="flex flex-col text-left mr-4 gap-0.5">
             <span className="text-[14px] font-medium text-zinc-900 dark:text-[#ffffff]">Follow us on X</span>
             <span className="text-[13px] text-zinc-500 dark:text-[#787878]">Stay up-to-date on new features and best practices</span>
          </div>
          <a
            href="https://twitter.com/linear"
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-200  bg-white dark:bg-[#23252a] dark:border-[#23252a] dark:hover:border-none dark:hover:bg-[#2e3139c7]  text-[13px] font-medium text-zinc-700 hover:bg transition shadow-sm"
          >
            <FontAwesomeIcon icon={faXTwitter} className="h-3 w-3 dark:text-[#cccccc] text-zinc-700" />
            <span className="text-zinc-700 dark:text-[#cccccc]" >@linear</span>
          </a>
        </div>
      </div>

      <button
        onClick={onNext}
        className=" w-[336px] rounded-[5px] h-[48px] text-[15px] hover:bg-[#cacbce72] dark:bg-none font-medium text-black dark:text-white  dark:hover:bg-[#3d404b72] transition"
      >
        Continue
      </button>
    </div>
  );
}
