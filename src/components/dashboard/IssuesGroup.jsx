"use client";

import { useState } from "react";
import { ChevronDown, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import IssueRow from "./IssueRow";
import CreateIssueModal from "./CreateIssueModal";

export default function IssuesGroup({ title, count, issues = [], icon }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="mt-4 first:mt-2">
      <div
        className="group flex items-center justify-between px-3 py-1 rounded-md transition-colors
          bg-transparent hover:bg-zinc-200/40
          dark:hover:bg-white/2"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded transition-colors
              text-zinc-600 hover:text-zinc-900
              dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform text-zinc-700 dark:text-zinc-600",
                !isOpen && "-rotate-90"
              )}
            />
          </button>

          <div className="flex items-center gap-2.5">
            {icon || (
              <Circle
                size={14}
                className="text-zinc-600 dark:text-zinc-500"
                strokeWidth={2.5}
              />
            )}

            <div className="flex items-center gap-2">
              <span className="text-[13px] font-semibold
                text-zinc-950
                dark:text-zinc-200"
              >
                {title}
              </span>

              <span className="text-[13px] font-semibold
                text-zinc-700
                dark:text-zinc-500"
              >
                {count}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-1">
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded transition-colors
              text-zinc-600 hover:bg-zinc-300/60 hover:text-zinc-900
              dark:text-zinc-500 dark:hover:bg-white/10 dark:hover:text-zinc-200"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="mt-1">
          {issues.length > 0 ? (
            issues.map((issue) => <IssueRow key={issue.id} issue={issue} />)
          ) : (
            <div className="px-12 py-4 text-xs
              text-zinc-700
              dark:text-zinc-600"
            >
              No issues in this group
            </div>
          )}
        </div>
      )}

      <CreateIssueModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teamKey="TES"
      />
    </div>
  );
}
