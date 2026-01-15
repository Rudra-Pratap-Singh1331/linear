"use client";

import React, { useState } from "react";

export default function InviteStep({ onNext }) {
  const [emails, setEmails] = useState("");

  const handleSend = (e) => {
    e.preventDefault();
    // Logic to send invites would go here
    onNext();
  };

  return (
    <div className="mt-[0px] flex flex-col items-center text-center animate-[fade-slide-down_0.5s_ease-out_both] w-full max-w-2xl">
      <h1 className="mb-3 text-2xl font-sans tracking-tight text-foreground">
        Invite co-workers to your team
      </h1>
      <p className="mb-8 text-[15px] font-sans font-medium text-zinc-500 dark:text-[#787878]">
        Linear is meant to be used with your team. Invite some co-workers to test it out with.
      </p>

      <form onSubmit={handleSend} className="w-[564px] max-w-[90vw] mb-15 px-8 py-[23px] rounded-[8px] bg-[#fcfcfc] dark:bg-[#101012] text-left shadow-[0px_5px_20px_rgba(0,0,0,0.15)]
  border border-[#dcdcdc] dark:border-[#23252a]  dark:shadow-[0px_0px_28px_6px_rgba(0,_0,_0,_0.1)]">
        <label className="block text-[13px] font-medium text-zinc-700 dark:text-[#ffffff] mb-2 mt-2">
          Email
        </label>
        <textarea
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          placeholder="email@example.com, email2@example.com..."
          className="w-full h-16 bg-white border border-[#cfcfcf] rounded-[5px] text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-[#5e6ad2] focus:ring-1 focus:ring-[#5e6ad2] resize-none mb-3 transition-colors font-sans px-[12px] py-[6px] dark:bg-[#101012] dark:border-[#23252a] dark:text-[#ffffff]"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="h-8 px-4 rounded-md bg-[#5e6ad2] text-[13px] font-medium text-white shadow-sm transition hover:bg-[#4b55aa] focus:outline-none focus:ring-2 focus:ring-[#5e6ad2] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#ffffff]"
          >
            Send invites
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4">
        <button
          onClick={onNext}
          className="text-[15px] mb-10 font-medium text-zinc-500 hover:text-black dark:text-[#6f7073] dark:hover:text-[#8a8a8a] transition"
        >
          Continue
        </button>
        <button
          onClick={onNext}
          className="text-[15px] font-medium tracking-wide text-zinc-500 hover:text-zinc-700 dark:text-[#6f7073] dark:hover:text-[#8a8a8a] transition"
        >
          I'll do this later
        </button>
      </div>
    </div>
  );
}
