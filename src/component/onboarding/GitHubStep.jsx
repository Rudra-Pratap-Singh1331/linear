"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export default function GitHubStep({ onNext }) {
  return (
    <div className="mt-[-60px] flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full max-w-2xl">
      <div className="mb-6">
        <FontAwesomeIcon icon={faGithub} className="text-[2.6rem] text-black dark:text-[#929292]" />
      </div>
      <h1 className="mb-3 text-[24px] font-sans font-medium tracking-tight text-foreground">
        Connect with GitHub
      </h1>
      <p className="mb-8 text-[15px] font-sans font-medium text-zinc-500 dark:text-[#787878]">
        Automate issue workflow when GitHub pull requests are opened and merged.
      </p>

      <div className="w-[564px] max-w-[90vw] h-61 mb-10 p-6 rounded-[8px]  font-sans ligh: bg-white dark:bg-[#101012] text-left shadow-sm dark:border dark:border-[#191b20] dark:shadow-[0px_0px_28px_6px_rgba(0,_0,_0,_0.1)]">
        <ul className="space-y-6 font-sans font-medium text-[15px]">
          <li className="flex items-start gap-4">
             <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon={faCheck} className="text-[#5e6ad2] h-4   w-4" /> 
             </div>
             <p className="text-[15px] text-black  dark:text-[#ffffff]">Linear links the issue and the GitHub pull request automatically.</p>
          </li>
          <hr className="text-zinc-200 dark:text-zinc-800"/>
          <li className="flex items-start gap-4">
             <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon={faCheck} className="text-[#5e6ad2] h-4 w-4" /> 
             </div>
             <p className="text-[15px] text-black dark:text-[#ffffff]">Linear syncs the issue status when a pull request is opened, closed, merged, or reverted.</p>
          </li>
          <hr className="text-zinc-200 dark:text-zinc-800"/>
          <li className="flex items-start gap-4">
             <div className="flex-shrink-0 mt-1">
                <FontAwesomeIcon icon={faCheck} className="text-[#5e6ad2] h-4 w-4" /> 
             </div>
             <p className="text-[15px] text-black dark:text-[#ffffff]">Linear <span className="font-medium text-black dark:text-white">will not</span> ask for code read permissions.</p>
          </li>
        </ul>
      </div>

      <button
        type="button"
        className="w-[336px] max-w-xs h-[48px] mb-12 flex items-center justify-center rounded-md bg-[#5e6ad2] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#4b55aa] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#080808]"
      >
        Authenticate with GitHub
      </button>

      <button
        onClick={onNext}
        className="text-[15px]  font-sans font-medium tracking-normal text-zinc-500 hover:text-zinc-700 dark:text-[#6f7073] dark:hover:text-[#ffffff] transition"
      >
        I'll do this later
      </button>
    </div>
  );
}
