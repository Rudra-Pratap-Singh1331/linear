"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { ListFilter, LayoutGrid, GripVertical, Circle, CircleDashed, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import IssuesGroup from "./IssuesGroup";

export default function IssuesBoard({ issues = [], todoCount = 0, viewType, workspaceId, statusFilter }) {
  const [localIssues, setLocalIssues] = useState(issues);
  const supabase = createSupabaseBrowserClient();

  // Sync props to state if props change (re-validation)
  useEffect(() => {
    setLocalIssues(issues);
  }, [issues]);

  // Fetch fresh issues on mount to avoid stale cache on back navigation
  useEffect(() => {
      if (!workspaceId) return;
      const fetchIssues = async () => {
          let query = supabase.from('issues').select('*').eq('workspace_id', workspaceId).order('created_at', { ascending: false });
          if (statusFilter) {
               // Handles simple array filter. If multiple filters needed, logic differs.
               // Assuming statusFilter is array of strings.
               query = query.in('status', statusFilter);
          }
          
          const { data } = await query;
          if (data) {
              setLocalIssues(data);
          }
      };
      fetchIssues();
  }, [workspaceId, statusFilter, supabase]);

  useEffect(() => {
    if (!workspaceId) return;

    const channel = supabase.channel('issues-realtime')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'issues',
            filter: `workspace_id=eq.${workspaceId}` 
        }, (payload) => {
            if (payload.eventType === 'INSERT') {
                const newIssue = payload.new;
                // Check if it matches filter
                if (!statusFilter || statusFilter.includes(newIssue.status)) {
                    setLocalIssues(prev => [newIssue, ...prev]);
                }
            } else if (payload.eventType === 'UPDATE') {
                 const updatedIssue = payload.new;
                 const isActive = !statusFilter || statusFilter.includes(updatedIssue.status);

                 setLocalIssues(prev => {
                     const exists = prev.find(i => i.id === updatedIssue.id);
                     if (exists) {
                         if (isActive) {
                             return prev.map(i => i.id === updatedIssue.id ? updatedIssue : i);
                         } else {
                             // Moved out of view
                             return prev.filter(i => i.id !== updatedIssue.id);
                         }
                     } else {
                         // Moved into view (e.g. from Backlog to Todo)
                         if (isActive) {
                             return [updatedIssue, ...prev];
                         }
                         return prev;
                     }
                 });
            } else if (payload.eventType === 'DELETE') {
                setLocalIssues(prev => prev.filter(i => i.id !== payload.old.id));
            }
        })
        .subscribe((status) => {
            console.log("Realtime subscription status:", status, "Workspace:", workspaceId);
        });

    return () => {
        console.log("Cleaning up realtime subscription");
        supabase.removeChannel(channel);
    };
  }, [workspaceId, statusFilter, supabase]);

  // Sort issues by priority: Urgent > High > Medium > Low > No priority
  const sortedIssues = [...localIssues].sort((a, b) => {
    const getWeight = (p) => {
      // Handle both numeric and string values for resilience
      if (p === 1 || p === "urgent") return 4;
      if (p === 2 || p === "high") return 3;
      if (p === 3 || p === "medium") return 2;
      if (p === 4 || p === "low") return 1;
      return 0; // "no_priority", 0, null, etc.
    };
    return getWeight(b.priority) - getWeight(a.priority);
  });

  // Group sorted issues by status
  const backlogIssues = sortedIssues.filter(i => i.status === 'backlog');
  const todoIssues = sortedIssues.filter(i => i.status === 'todo');
  const inProgressIssues = sortedIssues.filter(i => i.status === 'in_progress');
  const doneIssues = sortedIssues.filter(i => i.status === 'done');
  const canceledIssues = sortedIssues.filter(i => i.status === 'canceled');
  const duplicateIssues = sortedIssues.filter(i => i.status === 'duplicate');

  const groups = [
    { title: "Backlog", issues: backlogIssues, icon: CircleDashed, color: "text-zinc-600" },
    { title: "Todo", issues: todoIssues, count: todoIssues.length, icon: Circle, color: "text-zinc-500" },
    { title: "In Progress", issues: inProgressIssues, icon: InProgressIcon, color: "text-yellow-500" },
    { title: "Done", issues: doneIssues, icon: CheckCircle2, color: "text-blue-500" },
    { title: "Canceled", issues: canceledIssues, icon: XCircle, color: "text-zinc-600" },
    { title: "Duplicate", issues: duplicateIssues, icon: AlertCircle, color: "text-zinc-600" },
  ];

  // For backlog view, we only want to show the backlog group
  const displayGroups = viewType === "backlog" 
    ? groups.filter(g => g.title === "Backlog")
    : groups;

  return (
    <div className="flex-1  bg-[#0b0c0d]">
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
        {displayGroups.map((group) => (
          (group.issues.length > 0 || (group.title === "Todo" && group.count > 0)) && (
            <IssuesGroup 
              key={group.title}
              title={group.title} 
              count={group.count ?? group.issues.length} 
              issues={group.issues} 
              icon={group.icon === InProgressIcon ? <InProgressIcon /> : <group.icon size={14} className={group.color} strokeWidth={2.5} />}
            />
          )
        ))}

        {localIssues.length === 0 && viewType === "backlog" && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            <div className="grid grid-cols-2 gap-2 mb-8 opacity-40">
              <CircleDashed size={32} className="text-zinc-400" />
              <CircleDashed size={32} className="text-zinc-400" />
              <CircleDashed size={32} className="text-zinc-400" />
              <CircleDashed size={32} className="text-zinc-400" />
            </div>
            
            <h3 className="text-[15px] font-semibold text-zinc-200 mb-2">
              Backlog issues
            </h3>
            
            <p className="max-w-[380px] text-[13px] text-zinc-500 leading-relaxed mb-1">
              The backlog is a place for new issues and ideas that haven't been prioritized yet.
            </p>
            <p className="max-w-[420px] text-[13px] text-zinc-500 leading-relaxed mb-6">
              When your team is ready to work on these issues, you can move them out of the backlog by updating their status or adding them to a Cycle.
            </p>
            
            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#4a55c2] text-white rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5 shadow-lg shadow-indigo-500/10">
                Create new issue
                <div className="flex bg-white/20 rounded px-1 py-0.5 text-[10px] font-bold">C</div>
              </button>
              <button className="px-3 py-1.5 hover:bg-white/5 text-zinc-400 rounded-md text-[13px] font-medium transition-colors border border-white/5">
                Documentation
              </button>
            </div>
          </div>
        )}

        {localIssues.length === 0 && viewType !== "backlog" && (
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

// Custom InProgressIcon matching the one in StatusDropdown if not exported
function InProgressIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-yellow-500 shrink-0">
      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14ZM8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16Z" fill="currentColor" fillOpacity="0.2"/>
      <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2V14Z" fill="currentColor"/>
    </svg>
  );
}
