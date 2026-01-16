"use client";

import { ListFilter, LayoutGrid, GripVertical } from "lucide-react";
import IssuesGroup from "./IssuesGroup";

export default function IssuesBoard({ issues = [], todoCount = 0 }) {
  // Group issues by status
  const todoIssues = issues.filter(i => i.status === 'todo');
  const inProgressIssues = issues.filter(i => i.status === 'in_progress');
  const doneIssues = issues.filter(i => i.status === 'done');
  const backlogIssues = issues.filter(i => i.status === 'backlog');

  return (
    <div className="flex-1 overflow-y-auto bg-[#0b0c0d]">
      <div className="flex items-center justify-between px-4 h-9 border-b border-white/5 sticky top-0 bg-[#0b0c0d] z-10 select-none">
        <div className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
          <ListFilter size={14} />
          <span className="text-[13px] font-medium">Filter</span>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-1.5 px-2 py-0.5 text-[13px] font-medium text-zinc-500 border border-white/5 rounded-md hover:bg-white/5 transition-colors">
              <LayoutGrid size={14} />
              Display
           </button>
        </div>
      </div>

      <div className="w-full pb-20">
        {todoIssues.length > 0 && (
          <IssuesGroup 
            title="Todo" 
            count={todoCount} 
            issues={todoIssues} 
          />
        )}
        
        {inProgressIssues.length > 0 && (
          <IssuesGroup 
            title="In Progress" 
            count={inProgressIssues.length} 
            issues={inProgressIssues} 
          />
        )}

        {doneIssues.length > 0 && (
          <IssuesGroup 
            title="Done" 
            count={doneIssues.length} 
            issues={doneIssues} 
          />
        )}

        {backlogIssues.length > 0 && (
          <IssuesGroup 
            title="Backlog" 
            count={backlogIssues.length} 
            issues={backlogIssues} 
          />
        )}

        {issues.length === 0 && (
          <div className="flex h-[60vh] flex-col items-center justify-center text-zinc-500">
            <div className="mb-4 rounded-full bg-zinc-800/50 p-6">
                <GripVertical size={40} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium">No issues found</p>
            <p className="text-xs">Create a new issue to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
