"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Check,
  MoreHorizontal,
  AlertSquare
} from "lucide-react";
import { cn } from "@/lib/cn";

// Custom icons to match Linear exactly
export const UrgentIcon = () => (
    <div className="bg-[#f06543] rounded-[3px] p-0.5 flex items-center justify-center w-3.5 h-3.5 shrink-0">
        <span className="text-white text-[10px] font-bold leading-none">!</span>
    </div>
);

export const HighPriorityIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
        <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
    </svg>
);

export const MediumPriorityIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
        <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
        <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" />
    </svg>
);

export const LowPriorityIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
        <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
        <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" fillOpacity="0.2" />
        <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" />
    </svg>
);

export const NoPriorityIcon = () => (
    <MoreHorizontal size={14} className="text-zinc-500 shrink-0" strokeWidth={3} />
);

const priorityOptions = [
  { id: 0, label: "No priority", icon: NoPriorityIcon, shortcut: "0" },
  { id: 1, label: "Urgent", icon: UrgentIcon, shortcut: "1" },
  { id: 2, label: "High", icon: HighPriorityIcon, shortcut: "2" },
  { id: 3, label: "Medium", icon: MediumPriorityIcon, shortcut: "3" },
  { id: 4, label: "Low", icon: LowPriorityIcon, shortcut: "4" },
];

export default function PriorityDropdown({ currentPriority, onSelect, onClose }) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      const option = priorityOptions.find(opt => opt.shortcut === e.key);
      if (option) {
        onSelect(option.id);
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onSelect, onClose]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-[-8px] left-[-8px] w-[200px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] z-100 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-75 max-h-none overflow-hidden h-auto"
    >
      <div className="px-2 pb-1.5 pt-0.5">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/5 rounded-md border border-white/5">
            <span className="text-[13px] text-zinc-500 font-medium">Set priority to...</span>
            <div className="flex bg-white/10 rounded px-1.5 py-0.5 border border-white/10 ml-2 shrink-0">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">P</span>
            </div>
        </div>
      </div>
      
      <div className="mt-0.5 overflow-hidden">
        {priorityOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <option.icon />
              <span className="text-[14px] text-zinc-300 group-hover:text-zinc-100 font-medium tracking-tight">
                {option.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {currentPriority === option.id && (
                <Check size={14} className="text-zinc-400" strokeWidth={2.5} />
              )}
              <span className="text-[11px] font-medium text-zinc-600 w-3 text-center">
                {option.shortcut}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
