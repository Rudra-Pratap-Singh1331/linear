"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, MoreHorizontal, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import IssueRow from "./IssueRow";

export default function IssuesGroup({ title, count, issues = [], icon }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-4 first:mt-2">
      <div className="group flex items-center justify-between px-3 py-1 bg-transparent hover:bg-white/2 rounded-md transition-colors">
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <ChevronDown size={14} className={cn("transition-transform text-zinc-600", !isOpen && "-rotate-90")} />
            </button>
            <div className="flex items-center gap-2.5">
                {icon || <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-zinc-200">
                      {title}
                  </span>
                  <span className="text-[13px] text-zinc-500 font-medium">
                      {count}
                  </span>
                </div>
            </div>
        </div>
        
        <div className="flex items-center gap-1 pr-1">
            <button className="p-1 rounded hover:bg-white/10 text-zinc-500 transition-colors">
                <Plus size={14} />
            </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-1">
          {issues.length > 0 ? (
            issues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} />
            ))
          ) : (
            <div className="px-12 py-4 text-xs text-zinc-600">
                No issues in this group
            </div>
          )}
        </div>
      )}
    </div>
  );
}
