"use client";

import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Paperclip,
  CheckCircle2,
  Circle,
  Clock,
  ArrowUpCircle,
  XCircle,
  AlertCircle,
  CircleDashed,
  Calendar,
  Plus,
  ChevronRight,
  X,
  Sparkles,
  Edit,
  Loader2,
  PanelRight
} from "lucide-react";

import StatusDropdown, { InProgressIcon, DoneIcon } from "@/components/dashboard/StatusDropdown";
import PriorityDropdown, { UrgentIcon, HighPriorityIcon, MediumPriorityIcon, LowPriorityIcon, NoPriorityIcon } from "@/components/dashboard/PriorityDropdown";
import LabelsDropdown from "@/components/dashboard/LabelsDropdown";
import IssueActivity from "@/components/issue/IssueActivity";

// DatePicker Component
const DatePicker = ({ onSelect, onClose }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    const days = [];
    const firstDay = firstDayOfMonth(year, month);
    const totalDays = daysInMonth(year, month);
    
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    
    for (let i = 1; i <= totalDays; i++) {
        days.push({ day: i, current: true, date: new Date(year, month, i) });
    }
    
    const padding = 42 - days.length;
    for (let i = 1; i <= padding; i++) {
        days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
    }

    return (
        <div className="bg-[#1a1b1c] border border-white/10 rounded-xl shadow-2xl p-4 w-[260px] select-none z-50 absolute right-0 top-full mt-2">
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[13px] font-semibold text-zinc-200">{monthNames[month]} {year}</span>
                <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month - 1)); }} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300">
                        <ChevronRight size={14} className="rotate-180" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month + 1)); }} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300">
                        <ChevronRight size={14} />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-[10px] font-bold text-zinc-600 text-center py-1">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((d, i) => (
                    <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); onSelect(d.date); onClose(); }}
                        className={cn(
                            "h-7 w-7 flex items-center justify-center rounded text-[12px] transition-colors",
                            d.current ? "text-zinc-200 hover:bg-[#5e6ad2] hover:text-white" : "text-zinc-600 hover:text-zinc-400",
                            new Date().toDateString() === d.date.toDateString() && "bg-white/5 text-[#5e6ad2] font-bold"
                        )}
                    >
                        {d.day}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default function IssueDetailView({
  issue: initialIssue,
  workspaceName,
  user,
}) {
  const [issue, setIssue] = useState(initialIssue);
  const [title, setTitle] = useState(initialIssue.title);
  const [description, setDescription] = useState(initialIssue.description || "");
  const [currentStatus, setCurrentStatus] = useState(initialIssue.status);
  const [currentPriority, setCurrentPriority] = useState(initialIssue.priority);
  const [selectedLabelIds, setSelectedLabelIds] = useState([]); // Array of IDs
  const [selectedLabels, setSelectedLabels] = useState([]); // Array of objects for UI
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);
  const [isLabelsDropdownOpen, setIsLabelsDropdownOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Due Date State
  const [dueDate, setDueDate] = useState(initialIssue.due_date ? new Date(initialIssue.due_date) : null);
  const [isDueDateDropdownOpen, setIsDueDateDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  // Helper to log key events
  const logActivity = async (eventType, details = {}) => {
      const { error } = await supabase.from("issue_events").insert({
          issue_id: issue.id,
          workspace_id: issue.workspace_id,
          actor_id: user.id,
          actor_email: user.email,
          event_type: eventType,
          details: details
      });
      if (error) console.error("Error logging activity:", error);
  };
  const titleTimeoutRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  
  // Auto-resize helper
  const autoResize = (ref) => {
      if (ref.current) {
          ref.current.style.height = 'auto';
          ref.current.style.height = ref.current.scrollHeight + 'px';
      }
  };

  useEffect(() => {
     autoResize(titleRef);
     autoResize(descriptionRef);
  }, []); // Initial resize

  useEffect(() => {
     autoResize(titleRef);
  }, [title]);

  useEffect(() => {
     autoResize(descriptionRef);
  }, [description]);

  // Helper to map priority string to ID (if needed) or keep logic consistent
  const getPriorityId = (p) => {
      const map = { "no_priority": 0, "urgent": 1, "high": 2, "medium": 3, "low": 4 };
      if (typeof p === 'number') return p;
      return map[p] || 0;
  };
  const [priorityId, setPriorityId] = useState(getPriorityId(initialIssue.priority));

  const formatDueDate = (date) => {
    if (!date) return "No due date";
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options); // e.g. Feb 9
  };

  // Sync state if issue changes externally
  useEffect(() => {
     setCurrentStatus(issue.status);
     setPriorityId(getPriorityId(issue.priority));
     setDueDate(issue.due_date ? new Date(issue.due_date) : null);
     setTitle(issue.title);
     setDescription(issue.description || "");
  }, [issue]);

  // Fetch fresh data on mount to avoid stale cache from Back button
  useEffect(() => {
      const fetchFresh = async () => {
          const { data } = await supabase.from('issues').select('*').eq('id', initialIssue.id).single();
          if (data) {
              setIssue(data);
          }
      };
      fetchFresh();
  }, [initialIssue.id, supabase]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`issue-${issue.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "issues",
          filter: `id=eq.${issue.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setIssue((prev) => ({ ...prev, ...payload.new }));
            if (payload.new.title !== title) {
                // Consider strict vs loose sync. For now, sync.
                setTitle(payload.new.title);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [issue.id, supabase, title]);

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Debounce processing
    if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current);

    titleTimeoutRef.current = setTimeout(async () => {
      // 1. Optimistic Update (already done via state)
      // 2. DB Update
      const { error } = await supabase
        .from("issues")
        .update({ title: newTitle })
        .eq("id", issue.id);

       if (!error) {
        logActivity("update_title");
        // 3. URL Update (Slug)
        // slugify
        const slug = newTitle
           .toLowerCase()
           .replace(/[^a-z0-9]+/g, "-")
           .replace(/(^-|-$)+/g, "");
        
        // Use replace to avoid history stack buildup
        router.replace(`/${workspaceName}/issue/${issue.issue_key}/${slug}`);
      }
    }, 500); // 500ms debounce
  };

  const handleDescriptionChange = async (e) => {
    const newDesc = e.target.value;
    setDescription(newDesc);
  };

  const saveDescription = async () => {
     if (description === issue.description) return;
     const { error } = await supabase.from("issues").update({ description }).eq("id", issue.id);
     if (!error) logActivity("update_description");
  };

  const handleStatusChange = async (newStatus) => {
     setIsStatusDropdownOpen(false);
     setCurrentStatus(newStatus); // Optimistic
     const { error } = await supabase.from("issues").update({ status: newStatus }).eq("id", issue.id);
     if (error) setCurrentStatus(issue.status); // Revert
     else logActivity("update_status", { from: issue.status, to: getStatusLabel(newStatus) });
  };

  const handlePriorityChange = async (newPriorityId) => {
     setIsPriorityDropdownOpen(false);
     setPriorityId(newPriorityId); // Optimistic

     const priorityMap = { 0: "no_priority", 1: "urgent", 2: "high", 3: "medium", 4: "low" };
     const dbValue = priorityMap[newPriorityId];

     const { error } = await supabase.from("issues").update({ priority: dbValue }).eq("id", issue.id);
     if (error) setPriorityId(getPriorityId(issue.priority)); // Revert
     else logActivity("update_priority", { from: getPriorityLabel(getPriorityId(issue.priority)), to: getPriorityLabel(newPriorityId) });
  };

  const handleDueDateChange = async (date) => {
      const newDate = date; // Date object or null
      setIsDueDateDropdownOpen(false);
      setDueDate(newDate); // Optimistic

      // Use a local date formatting to avoid timezone shifts if storing as date only?
      // "YYYY-MM-DD"
      // date.toISOString() returns UTC.
      // If user picks Feb 10, local time, and we convert to UTC, might be Feb 9.
      // Better to use local YYYY-MM-DD construction.
      let dbValue = null;
      if (newDate) {
          const year = newDate.getFullYear();
          const month = String(newDate.getMonth() + 1).padStart(2, '0');
          const day = String(newDate.getDate()).padStart(2, '0');
          dbValue = `${year}-${month}-${day}`;
      }

      const { error } = await supabase.from("issues").update({ due_date: dbValue }).eq("id", issue.id);
      
      if (error) {
          console.error("Error updating due date:", error);
          setDueDate(issue.due_date ? new Date(issue.due_date) : null); // Revert
      } else {
          logActivity("update_due_date", { to: newDate ? formatDueDate(newDate) : null });
      }
  };

  const handleLabelToggle = async (label) => {
      const exists = selectedLabelIds.includes(label.id);
      let newIds, newLabels;
      
      if (exists) {
          newIds = selectedLabelIds.filter(id => id !== label.id);
          newLabels = selectedLabels.filter(l => l.id !== label.id);
          
          await supabase.from("issue_labels").delete().eq("issue_id", issue.id).eq("label_id", label.id);
          logActivity("remove_label", { label: label.name });
      } else {
          newIds = [...selectedLabelIds, label.id];
          newLabels = [...selectedLabels, label];
          
          await supabase.from("issue_labels").insert({ issue_id: issue.id, label_id: label.id });
          logActivity("add_label", { label: label.name });
      }
      
      setSelectedLabelIds(newIds);
      setSelectedLabels(newLabels);

      // Sync to legacy `label` column (Primary Label)
      // If we have labels, use the first one's name. If none, null.
      const primaryLabelName = newLabels.length > 0 ? newLabels[0].name : null;
      await supabase.from("issues").update({ label: primaryLabelName }).eq("id", issue.id);
  };

  const handlePostComment = async () => {
      if (!commentText.trim()) return;
      
      const text = commentText;
      setCommentText(""); 
      
      const { error } = await supabase.from("issue_comments").insert({
          issue_id: issue.id,
          workspace_id: issue.workspace_id,
          created_by: user.id,
          user_email: user.email,
          comment_text: text
      });

      if (error) {
          console.error("Error posting comment:", error);
          setCommentText(text); // Restore text on error
      }
  };

  const handlePolishComment = async () => {
    if (!commentText.trim() || isPolishing) return;
    setIsPolishing(true);
    try {
      const res = await fetch("/api/ai/comment-reply", {
        method: "POST",
        body: JSON.stringify({
          type: "polish",
          issueTitle: title,
          issueDescription: description,
          currentDraft: commentText
        })
      });
      const data = await res.json();
      if (data.text) {
        setCommentText(data.text);
      }
    } catch (err) {
      console.error("Polish failed:", err);
    } finally {
      setIsPolishing(false);
    }
  };

  useEffect(() => {
      const fetchLabels = async () => {
          const { data } = await supabase
              .from("issue_labels")
              .select("label_id, labels(*)")
              .eq("issue_id", issue.id);
          
          if (data && data.length > 0) {
              const mapped = data.map(d => d.labels).filter(l => l);
              setSelectedLabels(mapped);
              setSelectedLabelIds(mapped.map(l => l.id));
          } else if (issue.label) {
              // Backward compatibility: If no issue_labels but issue.label exists
              // Attempt to find a matching label in `labels` table
              const { data: matchingLabel } = await supabase
                  .from("labels")
                  .select("*")
                  .ilike("name", issue.label)
                  .eq("workspace_id", issue.workspace_id)
                  .single();

              if (matchingLabel) {
                   setSelectedLabels([matchingLabel]);
                   setSelectedLabelIds([matchingLabel.id]);
              } else {
                  // Fallback: If label exists but not in DB, assume it's one of the defaults
                  // and construct a mock label object so it displays correctly.
                  const defaults = {
                      "Bug": "#ef4444",
                      "Feature": "#a855f7",
                      "Improvement": "#3b82f6"
                  };
                  
                  const color = defaults[issue.label] || "#71717a"; // Default to zinc-500 if unknown
                  
                  const mockLabel = {
                      id: "legacy-mock-" + issue.label,
                      name: issue.label,
                      color: color,
                      workspace_id: issue.workspace_id
                  };
                  
                  setSelectedLabels([mockLabel]);
                  setSelectedLabelIds([mockLabel.id]);
              }
          }
      };
      
      fetchLabels();
  }, [issue.id, issue.label, issue.workspace_id, supabase]);


  const getStatusIcon = (status) => {
     switch (status) {
       case "backlog": return <CircleDashed size={14} className="text-zinc-600" strokeWidth={2.5} />;
       case "todo": return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
       case "in_progress": return <InProgressIcon />;
       case "done": return <DoneIcon />;
       case "canceled": return <XCircle size={14} className="text-zinc-600" strokeWidth={2.5} />;
       case "duplicate": return <AlertCircle size={14} className="text-zinc-600" strokeWidth={2.5} />;
       default: return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
     }
  };

  const getStatusLabel = (status) => {
      const map = { backlog: "Backlog", todo: "Todo", in_progress: "In Progress", done: "Done", canceled: "Canceled", duplicate: "Duplicate" };
      return map[status] || "Todo";
  };

  const getPriorityIcon = (id) => {
      switch(id) {
          case 0: return <NoPriorityIcon />;
          case 1: return <UrgentIcon />;
          case 2: return <HighPriorityIcon />;
          case 3: return <MediumPriorityIcon />;
          case 4: return <LowPriorityIcon />;
          default: return <NoPriorityIcon />;
      }
  };
  const getPriorityLabel = (id) => {
      const map = { 0: "No priority", 1: "Urgent", 2: "High", 3: "Medium", 4: "Low" };
      return map[id] || "No priority";
  };

  return (
    <div className="flex h-full  flex-col bg-[#0b0c0d] text-zinc-100 lg:flex-row">
      {/* Center Main Content */}
      <div className="flex-1 overflow-y-auto lg:border-r border-white/5 p-8 mx-auto w-full lg:max-w-[1010px]">
         {/* Breadcrumb / Top Bar */}
         <div className="flex items-center justify-between mb-6 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-4 h-4 rounded bg-purple-500/20 text-purple-400 font-bold text-[9px]">
                    {workspaceName.charAt(0).toUpperCase()}
                </span>
                <span>{workspaceName}</span>
                <span>/</span>
                <span className="font-medium text-zinc-300">{issue.issue_key}</span>
            </div>
            <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 hover:bg-white/5 rounded-md transition-colors text-zinc-500 hover:text-zinc-300 border border-white/5"
            >
                <PanelRight size={18} />
            </button>
         </div>

         {/* Title Input */}
         <textarea
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            rows={1}
            className="w-full bg-transparent text-3xl font-bold placeholder:text-zinc-600 focus:outline-none mb-4 resize-none overflow-hidden"
            placeholder="Issue title"
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent new line in title? Or allow? Linear allows wrapping but usually Enter submits or moves focus.
                    // User asked for wrapping, so Enter should probably just be accepted or maybe focus description.
                    // If user wants wrapping, it happens automatically. Enter usually signifies "done".
                    // Let's allow simple wrapping but prevent explicit newlines if it's a title.
                    // Linear titles don't usually have newlines. They wrap.
                    // So we prevent Enter from inserting newline, but CSS handles standard wrapping.
                }
            }}
         />

         {/* Description Editor */}
         <textarea
            ref={descriptionRef}
            value={description}
            onChange={handleDescriptionChange}
            onBlur={saveDescription}
            className="w-full min-h-[150px] bg-transparent resize-none text-base text-zinc-300 placeholder:text-zinc-600 focus:outline-none leading-relaxed overflow-hidden"
            placeholder="Add description..."
         />

         {/* Activity & Comments */}
         <div className="mt-12 pt-8 border-t border-white/5">
            <IssueActivity 
                issueId={issue.id} 
                workspaceId={issue.workspace_id} 
                currentUser={user} 
                issueTitle={title} 
                issueDescription={description} 
            />

            {/* Comment Input */}
            <div className="mt-8 bg-[#141517] border border-white/5 rounded-lg p-3">
                <textarea 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handlePostComment();
                        }
                    }}
                    className="w-full bg-transparent resize-none text-[14px] placeholder:text-zinc-500 focus:outline-none min-h-[60px]"
                    placeholder="Leave a comment..."
                />
                <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3">
                        <Paperclip size={14} className="text-zinc-500 cursor-pointer hover:text-zinc-300" />
                        <button 
                            onClick={handlePolishComment}
                            disabled={!commentText || isPolishing}
                            className="flex items-center gap-1.5 px-2 py-1 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded text-[12px] font-medium transition-all disabled:opacity-30"
                        >
                            {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Polish
                        </button>
                    </div>
                    <button 
                        onClick={handlePostComment}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-[12px] font-medium text-zinc-300 transition-colors"
                    >
                        Comment
                    </button>
                </div>
            </div>
         </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 right-0 z-50 w-80 lg:w-72 shrink-0 p-4 space-y-8 bg-[#0b0c0d] lg:bg-transparent border-l border-white/5 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:block lg:pt-8",
        isMobileSidebarOpen ? "translate-x-0 shadow-[-32px_0_64px_rgba(0,0,0,0.5)]" : "translate-x-full lg:translate-x-0 hidden lg:block"
      )}>
          {/* Mobile Close Button */}
          <div className="flex lg:hidden items-center justify-between mb-4 pb-4 border-b border-white/5">
              <span className="text-sm font-semibold text-zinc-200">Issue details</span>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 hover:bg-white/5 rounded transition-colors text-zinc-500"
              >
                  <X size={20} />
              </button>
          </div>

          <div className="overflow-y-auto h-full pb-20 lg:pb-0 scrollbar-none">
              {/* Properties Section */}
              <div className="space-y-4">
                {/* Status */}
                 <div className="relative">
                    <div className="text-[12px] font-medium text-zinc-500 mb-2 ml-2">Status</div>
                    <button 
                        onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                        className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-[13px] text-zinc-300 group transition-colors"
                    >
                        <div className="shrink-0">{getStatusIcon(currentStatus)}</div>
                        <span>{getStatusLabel(currentStatus)}</span>
                    </button>
                    {isStatusDropdownOpen && (
                        <StatusDropdown 
                            currentStatus={currentStatus} 
                            onSelect={handleStatusChange} 
                            onClose={() => setIsStatusDropdownOpen(false)} 
                        />
                    )}
                </div>

                {/* Priority */}
                <div className="relative">
                     <div className="text-[12px] font-medium text-zinc-500 mb-2 ml-2">Priority</div>
                     <button 
                         onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
                         className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-[13px] text-zinc-300 group transition-colors"
                     >
                        <div className="shrink-0">{getPriorityIcon(priorityId)}</div>
                        <span>{getPriorityLabel(priorityId)}</span>
                    </button>
                     {isPriorityDropdownOpen && (
                        <PriorityDropdown 
                            currentPriority={priorityId} 
                            onSelect={handlePriorityChange} 
                            onClose={() => setIsPriorityDropdownOpen(false)} 
                        />
                    )}
                </div>

                 {/* Assignee (Mock) */}
                 <div>
                     <div className="text-[12px] font-medium text-zinc-500 mb-2 ml-2">Assignee</div>
                    <button className="flex items-center gap-2.5 w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-[13px] text-zinc-300 group transition-colors">
                        <div className="w-4 h-4 rounded-full border border-dashed border-zinc-500 flex items-center justify-center">
                             <span className="text-[10px] text-zinc-500">+</span>
                        </div>
                        <span className="text-zinc-500">Assign to...</span>
                    </button>
                 </div>
              </div>
              
               {/* Labels */}
              <div className="relative mt-8">
                <div className="text-[12px] font-medium text-zinc-500 mb-2">Labels</div>
                <div className="flex flex-wrap gap-1.5">
                    {selectedLabels.map(label => (
                        <span key={label.id} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border bg-white/5 border-white/10 text-zinc-300">
                            <span 
                                className="w-1.5 h-1.5 rounded-full" 
                                style={{ backgroundColor: label.color }}
                            />
                            {label.name}
                        </span>
                    ))}
                     <button 
                        onClick={() => setIsLabelsDropdownOpen(!isLabelsDropdownOpen)}
                        className="text-zinc-500 hover:text-zinc-300 text-[16px] leading-none px-1 h-5 flex items-center justify-center rounded hover:bg-white/5"
                     >
                        <Plus size={14} />
                     </button>
                     {isLabelsDropdownOpen && (
                         <LabelsDropdown 
                            workspaceId={issue.workspace_id} // passed from parent
                            selectedLabelIds={selectedLabelIds}
                            onToggle={handleLabelToggle}
                            onClose={() => setIsLabelsDropdownOpen(false)}
                         />
                     )}
                </div>
              </div>

                {/* Due Date */}
                <div className="relative mt-8">
                 <div className="text-[12px] font-medium text-zinc-500 mb-2">Due Date</div>
                  <button 
                     onClick={() => setIsDueDateDropdownOpen(!isDueDateDropdownOpen)}
                     className={cn(
                         "flex items-center gap-2 w-full text-left px-2 py-1.5 hover:bg-white/5 rounded text-[13px] text-zinc-300 group transition-colors",
                         isDueDateDropdownOpen && "bg-white/5"
                     )}
                  >
                         <Clock size={14} className={cn("text-zinc-500", dueDate && "text-zinc-300")} /> 
                         <span>{dueDate ? formatDueDate(dueDate) : "No due date"}</span>
                 </button>
                 {isDueDateDropdownOpen && (
                     <div className="absolute top-full left-0 mt-2 w-[220px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                         <div className="py-1">
                             <div 
                                 onClick={(e) => { e.stopPropagation(); handleDueDateChange(null); }}
                                 className="px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/5 cursor-pointer group text-red-400"
                             >
                                 <div className="w-4 h-4 flex items-center justify-center">
                                     <X size={14} />
                                 </div>
                                 <span className="text-[13px] font-medium">Remove due date</span>
                             </div>
                             <div className="h-px bg-white/5 my-1"></div>
                             {[
                                 { label: "Custom...", action: () => setIsDatePickerOpen(true) },
                                 { label: "Tomorrow", sub: "Sun", action: () => { const d = new Date(); d.setDate(d.getDate() + 1); handleDueDateChange(d); } },
                                 { label: "End of this week", sub: "Fri", action: () => { const d = new Date(); d.setDate(d.getDate() + (5 - d.getDay())); handleDueDateChange(d); } },
                                 { label: "In one week", sub: "Sat", action: () => { const d = new Date(); d.setDate(d.getDate() + 7); handleDueDateChange(d); } }
                             ].map((item, i) => (
                                 <div 
                                     key={i} 
                                     onClick={(e) => { e.stopPropagation(); item.action(); }}
                                     className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                 >
                                     <div className="flex items-center gap-2.5">
                                         <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
                                             <Calendar size={14} />
                                         </div>
                                         <span className="text-[13px] text-zinc-300 group-hover:text-zinc-100 font-medium">{item.label}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
                 {isDatePickerOpen && (
                     <div className="absolute top-full right-0 z-50">
                         <DatePicker 
                             onSelect={(date) => { handleDueDateChange(date); setIsDatePickerOpen(false); }} 
                             onClose={() => setIsDatePickerOpen(false)} 
                         />
                     </div>
                 )}
                </div>
          </div>
      </div>
    </div>
  );
}
