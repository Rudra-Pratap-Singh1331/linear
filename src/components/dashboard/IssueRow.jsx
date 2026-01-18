"use client";

import { useState, useEffect } from "react";
import { GripVertical, Circle, CheckCircle2, CircleDashed, Clock, XCircle, AlertCircle, MoreHorizontal, Calendar } from "lucide-react";
import { cn } from "@/lib/cn";
import StatusDropdown from "./StatusDropdown";
import PriorityDropdown from "./PriorityDropdown";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";

export default function IssueRow({ issue }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(issue.status);
  const [currentPriority, setCurrentPriority] = useState(issue.priority ?? 0);
  const router = useRouter();
  const supabase = createClient();
  const params = useParams();
  const { workspaceName } = params;

  const formattedDate = new Date(issue.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const formatDueDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === today.getTime()) return "Today";
    if (checkDate.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (checkDate.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "backlog": return <CircleDashed size={14} className="text-zinc-600" strokeWidth={2.5} />;
      case "todo": return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
      case "in_progress": return <Clock size={14} className="text-yellow-500" strokeWidth={2.5} />;
      case "done": return <CheckCircle2 size={14} className="text-blue-500" strokeWidth={2.5} />;
      case "canceled": return <XCircle size={14} className="text-zinc-600" strokeWidth={2.5} />;
      case "duplicate": return <AlertCircle size={14} className="text-zinc-600" strokeWidth={2.5} />;
      default: return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 1: // Urgent
        return (
            <div className="bg-[#f06543] rounded-[3px] p-0.5 flex items-center justify-center w-3.5 h-3.5 shrink-0">
                <span className="text-white text-[10px] font-bold leading-none">!</span>
            </div>
        );
      case 2: // High
        return (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
                <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
                <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" />
            </svg>
        );
      case 3: // Medium
        return (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
                <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" />
                <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" />
            </svg>
        );
      case 4: // Low
        return (
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400 shrink-0">
                <rect x="2" y="10" width="3" height="4" rx="1" fill="currentColor" />
                <rect x="6.5" y="6" width="3" height="8" rx="1" fill="currentColor" fillOpacity="0.2" />
                <rect x="11" y="2" width="3" height="12" rx="1" fill="currentColor" fillOpacity="0.2" />
            </svg>
        );
      default: // No priority
        return <MoreHorizontal size={14} className="text-zinc-600 shrink-0" />;
    }
  };

  const handleStatusChange = async (newStatus) => {
    setIsDropdownOpen(false);
    if (newStatus === currentStatus) return;

    // Optimistic update
    setCurrentStatus(newStatus);

    const { error } = await supabase
      .from("issues")
      .update({ status: newStatus })
      .eq("id", issue.id);

    if (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setCurrentStatus(issue.status);
    } else {
      // Refresh to ensure all lists are consistent
      router.refresh();
    }
  };

  const handlePriorityChange = async (newPriorityId) => {
    setIsPriorityDropdownOpen(false);
    if (newPriorityId === currentPriority) return;

    // Map numeric ID to DB string
    const priorityMap = {
      0: "no_priority",
      1: "urgent",
      2: "high",
      3: "medium",
      4: "low"
    };
    const dbValue = priorityMap[newPriorityId];

    // Optimistic update (keep numeric ID for UI if used, or sync with string)
    setCurrentPriority(newPriorityId);

    const { error } = await supabase
      .from("issues")
      .update({ priority: dbValue })
      .eq("id", issue.id);

    if (error) {
      console.error("Error updating priority:", error);
      // Revert on error
      setCurrentPriority(issue.priorityId ?? 0);
    } else {
      // Refresh to ensure all lists are consistent
      router.refresh();
    }
  };

  // Convert incoming priority string to numeric ID for internal state
  useEffect(() => {
    const priorityToId = {
      "no_priority": 0,
      "urgent": 1,
      "high": 2,
      "medium": 3,
      "low": 4
    };
    if (typeof issue.priority === 'string') {
        setCurrentPriority(priorityToId[issue.priority] ?? 0);
    } else {
        setCurrentPriority(issue.priority ?? 0);
    }
  }, [issue.priority]);

  // Handle keybindings when hovering
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (isHovered) {
        if (key === "s" && !isDropdownOpen && !isPriorityDropdownOpen) {
          e.preventDefault();
          setIsDropdownOpen(true);
        } else if (key === "p" && !isDropdownOpen && !isPriorityDropdownOpen) {
          e.preventDefault();
          setIsPriorityDropdownOpen(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHovered, isDropdownOpen, isPriorityDropdownOpen]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        // slugify title for URL
        const slug = issue.title
           .toLowerCase()
           .replace(/[^a-z0-9]+/g, "-")
           .replace(/(^-|-$)+/g, "");
        router.push(`/${workspaceName}/issue/${issue.issue_key}/${slug}`);
      }}
      className="group flex items-center justify-between border-b border-white/5 py-1.5 px-4 hover:bg-white/3 cursor-pointer transition-colors relative select-none"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex items-center gap-2.5">
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPriorityDropdownOpen(!isPriorityDropdownOpen);
                }}
                className="flex items-center justify-center hover:bg-white/10 p-0.5 rounded transition-colors"
              >
                {getPriorityIcon(currentPriority)}
              </button>
              {isPriorityDropdownOpen && (
                <PriorityDropdown 
                  currentPriority={currentPriority} 
                  onSelect={handlePriorityChange} 
                  onClose={() => setIsPriorityDropdownOpen(false)} 
                />
              )}
            </div>
            <span className="text-[12px] font-medium text-zinc-500 shrink-0 tracking-tight uppercase">
                {issue.issue_key}
            </span>
        </div>
        
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div 
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center justify-center hover:bg-white/10 p-0.5 rounded transition-colors"
              >
                {getStatusIcon(currentStatus)}
              </button>
              {isDropdownOpen && (
                <StatusDropdown 
                  currentStatus={currentStatus} 
                  onSelect={handleStatusChange} 
                  onClose={() => setIsDropdownOpen(false)} 
                />
              )}
            </div>
            <span className="text-[13px] text-zinc-100 truncate font-medium">
                {issue.title}
            </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {issue.label && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    issue.label === 'Bug' ? 'bg-red-500' :
                    issue.label === 'Feature' ? 'bg-purple-500' : 'bg-blue-500'
                )} />
                <span className="text-[11px] text-zinc-400 font-medium">{issue.label}</span>
            </div>
        )}
        {issue.due_date && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-zinc-400">
                <Calendar size={12} className={cn(
                    (formatDueDate(issue.due_date) === 'Today' || formatDueDate(issue.due_date) === 'Tomorrow') ? "text-orange-500" : "text-zinc-500"
                )} />
                <span className="text-[11px] font-medium">{formatDueDate(issue.due_date)}</span>
            </div>
        )}
        <span className="text-[12px] text-zinc-500 font-normal mr-1">
            {formattedDate}
        </span>
      </div>
    </div>
  );
}
