"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  Circle, 
  CircleDashed, 
  XCircle, 
  Check,
} from "lucide-react";
import { cn } from "@/lib/cn";

// Custom icons to match Linear exactly
export const InProgressIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500 shrink-0">
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2V14Z" fill="currentColor"/>
  </svg>
);

export const DoneIcon = () => (
    <div className="bg-[#5e6ad2] rounded-full p-0.5 flex items-center justify-center w-3.5 h-3.5 shrink-0">
        <Check size={10} className="text-white" strokeWidth={3} />
    </div>
);

const statusOptions = [
  { id: "backlog", label: "Backlog", icon: CircleDashed, color: "text-zinc-500", shortcut: "1" },
  { id: "todo", label: "Todo", icon: Circle, color: "text-zinc-300", shortcut: "2" },
  { id: "in_progress", label: "In Progress", icon: InProgressIcon, color: "text-yellow-500", shortcut: "3" },
  { id: "done", label: "Done", icon: DoneIcon, color: "text-blue-500", shortcut: "4" },
  { id: "canceled", label: "Canceled", icon: XCircle, color: "text-zinc-500", shortcut: "5" },
  { id: "duplicate", label: "Duplicate", icon: XCircle, color: "text-zinc-500", shortcut: "6" },
];

export default function StatusDropdown({ currentStatus, onSelect, onClose }) {
  const dropdownRef = useRef(null);
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const filteredOptions = statusOptions.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // If search is empty, allow numeric shortcuts
      if (!search) {
        const option = statusOptions.find(opt => opt.shortcut === e.key);
        if (option) {
          onSelect(option.id);
          return;
        }
      }

      if (e.key === "Enter" && filteredOptions.length > 0) {
        onSelect(filteredOptions[0].id);
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
  }, [onSelect, onClose, search, filteredOptions]);

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-[-8px] left-[-8px] w-[260px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] z-100 py-1.5 flex flex-col animate-in fade-in zoom-in-95 duration-75 max-h-none overflow-hidden h-auto"
    >
      <div className="px-2 pb-1.5 pt-0.5">
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-white/5 rounded-md border border-white/5">
            <input 
                ref={inputRef}
                autoFocus
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Change status..." 
                className="bg-transparent text-[13px] text-zinc-200 placeholder-zinc-500 outline-none w-full border-none p-0 focus:ring-0"
            />
            <div className="flex bg-white/10 rounded px-1.5 py-0.5 border border-white/10 ml-2 shrink-0">
                <span className="text-[10px] text-zinc-400 font-bold">S</span>
            </div>
        </div>
      </div>
      
      <div className="mt-0.5 overflow-hidden">
        {filteredOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              {typeof option.icon === 'function' ? <option.icon /> : <option.icon size={14} className={cn(option.color)} strokeWidth={2} />}
              <span className="text-[14px] text-zinc-300 group-hover:text-zinc-100 font-medium tracking-tight">
                {option.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {currentStatus === option.id && (
                <Check size={14} className="text-zinc-400" strokeWidth={2.5} />
              )}
              <span className="text-[11px] font-medium text-zinc-600 w-3 text-center">
                {option.shortcut}
              </span>
            </div>
          </button>
        ))}
        {filteredOptions.length === 0 && (
          <div className="px-3 py-4 text-center text-zinc-500 text-[13px]">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}
