"use client";

import { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2, Calendar, Tag, User, ChevronRight, Check, Sparkles, Paperclip, MoreHorizontal, Circle, CircleDashed, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import StatusDropdown, { InProgressIcon, DoneIcon } from "./StatusDropdown";
import PriorityDropdown, { UrgentIcon, HighPriorityIcon, MediumPriorityIcon, LowPriorityIcon, NoPriorityIcon } from "./PriorityDropdown";

// Refined icons for the modal
const StatusIcon = ({ status }) => {
    switch (status) {
        case "backlog": return <CircleDashed size={14} className="text-zinc-500" />;
        case "todo": return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
        case "in_progress": return <InProgressIcon />;
        case "done": return <DoneIcon />;
        case "canceled":
        case "duplicate": return <XCircle size={14} className="text-zinc-500" />;
        default: return <Circle size={14} className="text-zinc-500" strokeWidth={2.5} />;
    }
};

const PriorityIcon = ({ priority }) => {
    switch (priority) {
        case 1:
        case "urgent": return <UrgentIcon />;
        case 2:
        case "high": return <HighPriorityIcon />;
        case 3:
        case "medium": return <MediumPriorityIcon />;
        case 4:
        case "low": return <LowPriorityIcon />;
        default: return <NoPriorityIcon />;
    }
};

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
    
    // Previous month padding
    const prevMonthDays = daysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: prevMonthDays - i, current: false, date: new Date(year, month - 1, prevMonthDays - i) });
    }
    
    // Current month
    for (let i = 1; i <= totalDays; i++) {
        days.push({ day: i, current: true, date: new Date(year, month, i) });
    }
    
    // Next month padding
    const padding = 42 - days.length;
    for (let i = 1; i <= padding; i++) {
        days.push({ day: i, current: false, date: new Date(year, month + 1, i) });
    }

    return (
        <div className="bg-[#1a1b1c] border border-white/10 rounded-xl shadow-2xl p-4 w-[260px] select-none animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between mb-4 px-1">
                <span className="text-[13px] font-semibold text-zinc-200">{monthNames[month]} {year}</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setViewDate(new Date(year, month - 1))} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300">
                        <ChevronRight size={14} className="rotate-180" />
                    </button>
                    <button onClick={() => setViewDate(new Date(year, month + 1))} className="p-1 hover:bg-white/5 rounded text-zinc-500 hover:text-zinc-300">
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
                        onClick={() => { onSelect(d.date); onClose(); }}
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

export default function CreateIssueModal({ isOpen, onClose, teamKey = "TES" }) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("no_priority");
  const [dueDate, setDueDate] = useState(null);
  const [label, setLabel] = useState(null);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isLabelOpen, setIsLabelOpen] = useState(false);
  const [isDueDateDropdownOpen, setIsDueDateDropdownOpen] = useState(false);
  const [showDueDateSubmenu, setShowDueDateSubmenu] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isAiPopupOpen, setIsAiPopupOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [createMore, setCreateMore] = useState(false);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const modalRef = useRef(null);
  const moreRef = useRef(null);
  const dueDateRef = useRef(null);
  const statusRef = useRef(null);
  const priorityRef = useRef(null);
  const labelRef = useRef(null);
  const labelSearchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDueDate = (date) => {
    if (!date) return "";
    const options = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleCreateIssue = async () => {
      if (!title.trim() || isSubmitting) return;
      
      setIsSubmitting(true);
      try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error("No user found");

          const { data: workspace } = await supabase
              .from('workspaces')
              .select('id')
              .limit(1)
              .single();

          if (!workspace) throw new Error("No workspace found");

          const priorityMap = {
            0: "no_priority",
            1: "urgent",
            2: "high",
            3: "medium",
            4: "low"
          };

          const { data: newIssue, error } = await supabase
              .from('issues')
              .insert([{
                  title,
                  description,
                  status,
                  priority: typeof priority === 'number' ? priorityMap[priority] : priority,
                  due_date: dueDate ? dueDate.toISOString().split('T')[0] : null,
                  label: label,
                  workspace_id: workspace.id,
                  created_by: user.id
              }])
              .select('*')
              .single();

          if (error) {
              console.error("Supabase error creating issue:", error);
              throw error;
          }

          // Create 'create' event in activity log
          if (newIssue) {
              await supabase.from('issue_events').insert([{
                  issue_id: newIssue.id,
                  workspace_id: workspace.id,
                  actor_id: user.id,
                  actor_email: user.email,
                  event_type: 'create',
                  details: {
                      title: newIssue.title,
                      status: newIssue.status,
                      priority: newIssue.priority
                  }
              }]);
          }
          
          router.refresh();
          
          // Reset state
          setTitle("");
          setDescription("");
          
          if (!createMore) {
              setDueDate(null);
              setLabel(null);
              setStatus("todo");
              setPriority("no_priority");
              onClose();
          }
      } catch (err) {
          console.error("Error creating issue:", err);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAiGenerate = async () => {
      if (!aiPrompt.trim() || isGenerating) return;

      setIsGenerating(true);
      console.log("Starting AI generation with prompt:", aiPrompt);
      try {
          const res = await fetch('/api/ai/generate-issue', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: aiPrompt })
          });

          if (!res.ok) {
              const errorText = await res.text();
              console.error("API Error:", res.status, errorText);
              throw new Error(`Failed to generate issue: ${res.status}`);
          }

          const data = await res.json();
          console.log("AI Response Data:", data);


          // Autofill fields
          setTitle(data.title || "");
          setDescription(data.description || "");
          setStatus(data.status?.toLowerCase() === 'todo' ? 'todo' : 'todo'); // Always todo

          // Map Priority
          const priorityMap = {
              "urgent": 1,
              "high": 2,
              "medium": 3,
              "low": 4,
              "no priority": 0
          };
          setPriority(priorityMap[data.priority?.toLowerCase()] ?? 0);

          // Labels (take first if exists)
          if (data.labels && data.labels.length > 0) {
              setLabel(data.labels[0]);
          }

          // Due Date
          if (data.dueDate) {
              setDueDate(new Date(data.dueDate));
          } else {
             // Keep existing or empty if not provided
          }

          setIsAiPopupOpen(false);
          setAiPrompt("");
      } catch (err) {
          console.error("AI Generation failed:", err);
          // Optional: Show toast
      } finally {
          setIsGenerating(false);
      }
  };

  // Close on Escape & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
        if (e.key === "Escape") {
            document.activeElement.blur();
            return;
        }
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            handleCreateIssue();
            return;
        }
        return;
      }

      if (e.key === "Escape") {
        if (isAiPopupOpen) setIsAiPopupOpen(false);
        else if (isDatePickerOpen) setIsDatePickerOpen(false);
        else if (isStatusOpen) setIsStatusOpen(false);
        else if (isPriorityOpen) setIsPriorityOpen(false);
        else if (isLabelOpen) setIsLabelOpen(false);
        else if (isMoreOpen) setIsMoreOpen(false);
        else if (isDueDateDropdownOpen) setIsDueDateDropdownOpen(false);
        else onClose();
        return;
      }

      // Shortcut: Shift + D for Due Date
      if (e.key.toLowerCase() === 'p' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          setIsPriorityOpen(prev => !prev);
          setIsStatusOpen(false);
          setIsMoreOpen(false);
          setIsDueDateDropdownOpen(false);
          setIsLabelOpen(false);
      }
      if (e.key.toLowerCase() === 'l' && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          setIsLabelOpen(prev => !prev);
          setIsStatusOpen(false);
          setIsPriorityOpen(false);
          setIsMoreOpen(false);
          setIsDueDateDropdownOpen(false);
          setTimeout(() => labelSearchInputRef.current?.focus(), 50);
      }
      if (e.key === 'D' && e.shiftKey && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsMoreOpen(true);
          setShowDueDateSubmenu(true);
      }

      // Shortcut: S for status
      if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          setIsStatusOpen(true);
      }

      // Shortcut: P for priority
      if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          setIsPriorityOpen(true);
      }
    };
    const handleClickOutside = (e) => {
        if (isStatusOpen && statusRef.current && !statusRef.current.contains(e.target)) setIsStatusOpen(false);
        if (isPriorityOpen && priorityRef.current && !priorityRef.current.contains(e.target)) setIsPriorityOpen(false);
        if (isLabelOpen && labelRef.current && !labelRef.current.contains(e.target)) setIsLabelOpen(false);
        if (isMoreOpen && moreRef.current && !moreRef.current.contains(e.target)) setIsMoreOpen(false);
        if (isDueDateDropdownOpen && dueDateRef.current && !dueDateRef.current.contains(e.target)) setIsDueDateDropdownOpen(false);
    };

    if (isOpen) {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, isAiPopupOpen, isMoreOpen, isDueDateDropdownOpen, isDatePickerOpen, isStatusOpen, isPriorityOpen, title, description, status, priority, dueDate, isSubmitting]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div 
        ref={modalRef}
        className={cn(
          "bg-[#1a1b1c] border border-white/10 rounded-xl shadow-[0px_32px_128px_rgba(0,0,0,0.8)] flex flex-col transition-all duration-300 ease-in-out relative",
          isExpanded ? "w-full h-full max-w-[1200px] max-h-[900px]" : "w-[680px] h-auto min-h-[360px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 select-none shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                <div className="w-4 h-4 rounded bg-purple-600/50 flex items-center justify-center text-[10px] text-white font-bold">
                    {teamKey[0]}
                </div>
                <span className="text-[12px] font-medium text-zinc-400">{teamKey}</span>
            </div>
            <ChevronRight size={14} className="text-zinc-600" />
            <span className="text-[13px] font-medium text-zinc-200">New issue</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto">
          <input 
            autoFocus
            type="text"
            placeholder="Issue title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-transparent text-[19px] font-semibold text-zinc-100 placeholder-zinc-700 outline-none w-full border-none p-0 mb-3 focus:ring-0"
          />
          <textarea 
            placeholder="Add description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-transparent text-[14px] text-zinc-300 placeholder-zinc-700 outline-none w-full border-none p-0 resize-none min-h-[150px] focus:ring-0"
          />
        </div>

        {/* Toolbar */}
        <div className="px-4 py-3 border-t border-white/5 flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-400">
                    <div className="relative" ref={statusRef}>
                        <button 
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[13px] text-zinc-300 transition-colors group"
                        >
                            <StatusIcon status={status} />
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                        </button>
                        {isStatusOpen && (
                            <StatusDropdown 
                                currentStatus={status} 
                                onSelect={(s) => { setStatus(s); setIsStatusOpen(false); }} 
                                onClose={() => setIsStatusOpen(false)} 
                            />
                        )}
                    </div>
                    <div className="relative" ref={priorityRef}>
                        <button 
                            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                            className="flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[13px] text-zinc-400 hover:text-zinc-300 transition-colors"
                        >
                            <PriorityIcon priority={priority} />
                            <span>{priority === 'no_priority' ? 'Priority' : 
                                (priority === 1 ? 'Urgent' : 
                                 priority === 2 ? 'High' : 
                                 priority === 3 ? 'Medium' : 
                                 priority === 4 ? 'Low' : 'Priority')}</span>
                        </button>
                        {isPriorityOpen && (
                            <PriorityDropdown 
                                currentPriority={priority} 
                                onSelect={(p) => { setPriority(p); setIsPriorityOpen(false); }} 
                                onClose={() => setIsPriorityOpen(false)} 
                            />
                        )}
                    </div>
                    <button className="flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[13px] text-zinc-400 hover:text-zinc-300 transition-colors">
                        <User size={14} strokeWidth={2.5} />
                        <span>Assignee</span>
                    </button>
                    <div className="relative" ref={labelRef}>
                        <button 
                            onClick={() => {
                                if (label) {
                                    setLabel(null);
                                } else {
                                    setIsLabelOpen(!isLabelOpen);
                                    if (!isLabelOpen) setTimeout(() => labelSearchInputRef.current?.focus(), 50);
                                }
                            }}
                            className={cn(
                                "flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[13px] transition-colors",
                                label ? "text-zinc-200" : "text-zinc-400 hover:text-zinc-300"
                            )}
                        >
                            {label ? (
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        label === 'Bug' ? 'bg-red-500' :
                                        label === 'Feature' ? 'bg-purple-500' : 'bg-blue-500'
                                    )} />
                                    <span>{label}</span>
                                </div>
                            ) : (
                                <>
                                    <Tag size={14} />
                                    <span>Labels</span>
                                </>
                            )}
                        </button>

                        {isLabelOpen && (
                            <div className="absolute top-full left-0 mt-2 w-[220px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-2 py-1.5 border-b border-white/5 relative">
                                    <input 
                                        ref={labelSearchInputRef}
                                        type="text" 
                                        value={labelSearch}
                                        onChange={(e) => setLabelSearch(e.target.value)}
                                        placeholder="Add labels..."
                                        className="w-full bg-transparent border-none outline-none text-[13px] text-zinc-300 placeholder-zinc-600 px-1"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-zinc-600">
                                        <span className="text-[10px] font-bold">L</span>
                                    </div>
                                </div>
                                <div className="py-1">
                                    {[
                                        { name: 'Bug', color: 'bg-red-500' },
                                        { name: 'Feature', color: 'bg-purple-500' },
                                        { name: 'Improvement', color: 'bg-blue-500' }
                                    ].filter(opt => opt.name.toLowerCase().includes(labelSearch.toLowerCase())).map((opt) => (
                                        <div 
                                            key={opt.name}
                                            onClick={() => {
                                                setLabel(opt.name);
                                                setIsLabelOpen(false);
                                                setLabelSearch("");
                                            }}
                                            className="px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/5 cursor-pointer group"
                                        >
                                            <div className={cn("w-2 h-2 rounded-full", opt.color)} />
                                            <span className="text-[13px] text-zinc-300 group-hover:text-zinc-100 font-medium">{opt.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Due Date Shorthand Button (Repositioned) */}
                    {dueDate && (
                        <div className="relative" ref={dueDateRef}>
                            <button 
                                onClick={() => setIsDueDateDropdownOpen(!isDueDateDropdownOpen)}
                                className={cn(
                                    "flex items-center gap-2 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded-md border border-white/5 text-[13px] transition-colors",
                                    isDueDateDropdownOpen ? "bg-white/10 text-zinc-200 border-white/10" : "text-zinc-400 hover:text-zinc-300"
                                )}
                            >
                                <Calendar size={14} className="text-zinc-500" />
                                <span>{formatDueDate(dueDate)}</span>
                            </button>

                            {/* Due Date Dropdown (Image 2) */}
                            {isDueDateDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-[220px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="bg-[#242526] px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                                        <span className="text-[11px] text-zinc-500 font-medium tracking-tight">Try: 24h, 7 days, Feb 9</span>
                                        <div className="flex items-center gap-1.5 text-zinc-600">
                                            <span className="text-[10px] font-semibold tracking-widest">⇧ D</span>
                                            <ChevronRight size={12} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); setDueDate(null); setIsDueDateDropdownOpen(false); }}
                                            className="px-3 py-1.5 flex items-center gap-2.5 hover:bg-white/5 cursor-pointer group text-red-400"
                                        >
                                            <div className="w-4 h-4 flex items-center justify-center">
                                                <X size={14} />
                                            </div>
                                            <span className="text-[13px] font-medium">Remove due date</span>
                                        </div>
                                        <div 
                                            onClick={(e) => { e.stopPropagation(); setIsDueDateDropdownOpen(false); }}
                                            className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group text-zinc-500"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-4 h-4 flex items-center justify-center text-zinc-400 group-hover:text-zinc-300">
                                                    <Calendar size={14} />
                                                </div>
                                                <span className="text-[13px] font-medium">{formatDueDate(dueDate)}</span>
                                            </div>
                                            <span className="text-[10px] italic">Last used</span>
                                        </div>
                                        <div className="h-px bg-white/5 my-1"></div>
                                        {[
                                            { label: "Custom...", action: () => setIsDatePickerOpen(true) },
                                            { label: "Tomorrow", sub: "Sun, 18 Jan", action: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDueDate(d); } },
                                            { label: "End of this week", sub: "Fri, 23 Jan", action: () => { const d = new Date(); d.setDate(d.getDate() + (5 - d.getDay())); setDueDate(d); } },
                                            { label: "In one week", sub: "Sat, 24 Jan", action: () => { const d = new Date(); d.setDate(d.getDate() + 7); setDueDate(d); } }
                                        ].map((item, i) => (
                                            <div 
                                                key={i} 
                                                onClick={(e) => { e.stopPropagation(); item.action(); setIsDueDateDropdownOpen(false); }}
                                                className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover:text-zinc-300">
                                                        <Calendar size={14} />
                                                    </div>
                                                    <span className="text-[13px] text-zinc-300 group-hover:text-zinc-100 font-medium">{item.label}</span>
                                                </div>
                                                {item.sub && <span className="text-[11px] text-zinc-500 font-medium">{item.sub}</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="relative" ref={moreRef}>
                        <button 
                            onClick={() => setIsMoreOpen(!isMoreOpen)}
                            className={cn(
                                "p-1 rounded hover:bg-white/10 text-zinc-500 hover:text-zinc-300 transition-colors",
                                isMoreOpen && "bg-white/10 text-zinc-300"
                            )}
                        >
                            <MoreHorizontal size={16} />
                        </button>

                        {/* More Dropdown */}
                        {isMoreOpen && (
                            <div className="absolute top-full left-0 mt-2 w-[220px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-[0px_8px_32px_rgba(0,0,0,0.6)] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div 
                                    className="px-2.5 py-1.5 text-[13px] text-zinc-300 hover:bg-white/5 flex items-center justify-between cursor-pointer group/item relative"
                                    onMouseEnter={() => setShowDueDateSubmenu(true)}
                                    onMouseLeave={() => setShowDueDateSubmenu(false)}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-500 group-hover/item:text-zinc-300">
                                                <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                                <path d="M5 1V3M11 1V3M2 7H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                                <path d="M9 10.5H11M10 9.5V11.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
                                            </svg>
                                        </div>
                                        <span className="font-medium">Set due date</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-zinc-600 group-hover/item:text-zinc-400">
                                        <span className="text-[10px] font-semibold tracking-widest">⇧ D</span>
                                        <ChevronRight size={12} strokeWidth={3} />
                                    </div>

                                    {/* Nested Submenu */}
                                    {showDueDateSubmenu && (
                                        <div 
                                            className="absolute left-full bottom-[-4px] ml-1 w-[240px] bg-[#1a1b1c] border border-white/10 rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-left-2 duration-150 z-60"
                                            onMouseEnter={() => setShowDueDateSubmenu(true)}
                                            onMouseLeave={() => setShowDueDateSubmenu(false)}
                                        >
                                            <div className="bg-[#242526] px-3 py-1.5 border-b border-white/5">
                                                <span className="text-[11px] text-zinc-500 font-medium tracking-tight">Try: 24h, 7 days, Feb 9</span>
                                            </div>
                                            <div className="py-1">
                                                {[
                                                    { label: "Custom...", sub: "", icon: "M5 2V1M11 2V1M2 6H14M3 2H13C13.5523 2 14 2.44772 14 3V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2Z", action: () => setIsDatePickerOpen(true) },
                                                    { label: "Tomorrow", sub: "Sun, 18 Jan", icon: "M8 4V8L11 11", action: () => { const d = new Date(); d.setDate(d.getDate() + 1); setDueDate(d); } },
                                                    { label: "End of this week", sub: "Fri, 23 Jan", icon: "M5 2V1M11 2V1M2 6H14", action: () => { const d = new Date(); d.setDate(d.getDate() + (5 - d.getDay())); setDueDate(d); } },
                                                    { label: "In one week", sub: "Sat, 24 Jan", icon: "M5 2V1M11 2V1M2 6H14", action: () => { const d = new Date(); d.setDate(d.getDate() + 7); setDueDate(d); } }
                                                ].map((item, i) => (
                                                    <div 
                                                        key={i} 
                                                        onClick={(e) => { e.stopPropagation(); item.action(); setShowDueDateSubmenu(false); setIsMoreOpen(false); }}
                                                        className="px-3 py-1.5 flex items-center justify-between hover:bg-white/5 cursor-pointer group/sub"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover/sub:text-zinc-300">
                                                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d={item.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                                </svg>
                                                            </div>
                                                            <span className="text-[13px] text-zinc-300 group-hover/sub:text-zinc-100 font-medium">{item.label}</span>
                                                        </div>
                                                        <span className="text-[11px] text-zinc-500 font-medium">{item.sub}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="px-2.5 py-1.5 text-[13px] text-zinc-300 hover:bg-white/5 flex items-center gap-2.5 cursor-pointer group/item">
                                    <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover/item:text-zinc-300">
                                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 3V6M8 10V13M3 8H6M10 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
                                        </svg>
                                    </div>
                                    <span className="font-medium">Make recurring...</span>
                                </div>
                                <div className="px-2.5 py-1.5 text-[13px] text-zinc-300 hover:bg-white/5 flex items-center justify-between cursor-pointer group/item">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover/item:text-zinc-300">
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M6 10L10 6M5 7L3 9C1.89543 10.1046 1.89543 11.8954 3 13C4.10457 14.1046 5.89543 14.1046 7 13L9 11M9 5L11 3C12.1046 1.89543 13.8954 1.89543 15 3C16.1046 4.10457 16.1046 5.89543 15 7L13 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <span className="font-medium">Add link...</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-600 font-semibold tracking-widest uppercase">Ctrl Alt L</span>
                                </div>
                                <div className="px-2.5 py-1.5 text-[13px] text-zinc-300 hover:bg-white/5 flex items-center justify-between cursor-pointer group/item border-t border-white/5 mt-1 pt-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-4 h-4 flex items-center justify-center text-zinc-500 group-hover/item:text-zinc-300">
                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4 2V14M4 14H14M4 8H12M12 8L10 6M12 8L10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <span className="font-medium">Add sub-issue</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-600 font-semibold tracking-widest uppercase">Ctrl ⇧ O</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Due Date Shorthand Button (Old Position Removed) */}
                </div>

                <button 
                  onClick={() => setIsAiPopupOpen(true)}
                  className="flex items-center gap-2 px-2.5 py-1 bg-[#5e6ad2]/10 hover:bg-[#5e6ad2]/20 rounded-md border border-[#5e6ad2]/20 text-[13px] text-[#828be2] transition-colors font-medium active:scale-95"
                >
                    <Sparkles size={14} />
                    <span>Generate with AI</span>
                </button>
            </div>

            <div className="flex items-center justify-between mt-1">
                <button className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Paperclip size={18} />
                </button>
                
                <div className="flex items-center gap-4">
                    <div 
                        onClick={() => setCreateMore(!createMore)}
                        className="flex items-center gap-2 select-none cursor-pointer group"
                    >
                        <span className="text-[12px] text-zinc-500 group-hover:text-zinc-400 transition-colors">Create more</span>
                        <div className={cn(
                            "w-7 h-4 rounded-full border p-0.5 relative transition-colors duration-200",
                            createMore ? "bg-[#5e6ad2] border-[#5e6ad2]" : "bg-zinc-800 border-white/10"
                        )}>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full bg-white transition-all duration-200",
                                createMore ? "translate-x-3" : "translate-x-0"
                            )}></div>
                        </div>
                    </div>
                    <button 
                        onClick={handleCreateIssue}
                        disabled={isSubmitting || !title.trim()}
                        className={cn(
                            "px-3 py-1.5 bg-[#5e6ad2] hover:bg-[#4d59c2] text-white rounded-md text-[13px] font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]",
                            (isSubmitting || !title.trim()) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isSubmitting ? "Creating..." : "Create issue"}
                    </button>
                </div>
            </div>
        </div>

        {/* AI Popup - Full Overlay */}
        {isAiPopupOpen && (
            <div className="absolute inset-0 bg-[#1a1b1c] z-210 flex flex-col animate-in fade-in duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 select-none shrink-0">
                    <div className="flex items-center gap-2 text-indigo-400">
                        <Sparkles size={16} />
                        <span className="text-[13px] font-semibold">Generate with AI</span>
                    </div>
                    <button 
                      onClick={() => setIsAiPopupOpen(false)}
                      className="p-1 rounded hover:bg-white/5 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <div className="mb-4">
                        <span className="text-zinc-400 text-[15px] font-medium">Describe what you want to create...</span>
                    </div>
                    <textarea 
                        autoFocus
                        placeholder="e.g. As a user I want to be able to reset my password..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        disabled={isGenerating}
                        className={cn(
                            "bg-zinc-900/50 rounded-xl p-4 text-[16px] text-zinc-200 placeholder-zinc-700 outline-none w-full border border-white/5 resize-none flex-1 focus:border-indigo-500/30 transition-colors",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    />
                </div>
                <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 shrink-0">
                    <button 
                        onClick={() => setIsAiPopupOpen(false)}
                        className="px-4 py-2 hover:bg-white/5 text-zinc-400 rounded-lg text-[14px] font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAiGenerate}
                        disabled={isGenerating || !aiPrompt.trim()}
                        className={cn(
                            "px-5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-[14px] font-medium transition-colors border border-indigo-500/30 active:scale-95",
                            (isGenerating || !aiPrompt.trim()) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isGenerating ? (
                            <div className="flex items-center gap-2">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Generating...</span>
                            </div>
                        ) : (
                            "Generate issue"
                        )}
                    </button>
                </div>
            </div>
        )}
        {/* AI Popup - Full Overlay */}
        {/* ... existing AI popup logic ... */}

        {/* Date Picker Overlay */}
        {isDatePickerOpen && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-220 flex items-center justify-center animate-in fade-in duration-200">
                <DatePicker 
                    onSelect={(date) => { setDueDate(date); setIsDatePickerOpen(false); }} 
                    onClose={() => setIsDatePickerOpen(false)} 
                />
            </div>
        )}
      </div>
    </div>,
    document.body
  );
}
