"use client";

import { GripVertical, Circle, CheckCircle2, CircleDashed, Clock, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

export default function IssueRow({ issue }) {
  const formattedDate = new Date(issue.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "todo": return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
      case "in_progress": return <Clock size={14} className="text-yellow-500" strokeWidth={2.5} />;
      case "done": return <CheckCircle2 size={14} className="text-blue-500" strokeWidth={2.5} />;
      case "backlog": return <CircleDashed size={14} className="text-zinc-600" strokeWidth={2.5} />;
      default: return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
    }
  };

  return (
    <div className="group flex items-center justify-between border-b border-white/5 py-1.5 px-4 hover:bg-white/3 cursor-pointer transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
            <MoreHorizontal size={14} className="text-zinc-600 shrink-0" />
            <span className="text-[12px] font-medium text-zinc-500 shrink-0 tracking-tight uppercase">
                {issue.issue_key}
            </span>
        </div>
        
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
            {getStatusIcon(issue.status)}
            <span className="text-[13px] text-zinc-100 truncate font-medium">
                {issue.title}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <span className="text-[12px] text-zinc-500 font-normal mr-1">
            {formattedDate}
        </span>
      </div>
    </div>
  );
}
