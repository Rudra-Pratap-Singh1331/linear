"use client";

import { useEffect, useState, useRef } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";
import { Tag, Edit, AlertCircle, Calendar, CheckCircle2, Circle, Reply, Check, SmilePlus, MoreHorizontal, X } from "lucide-react";

import { useShortcuts } from "@/lib/shortcuts";
import { Sparkles, Send, Loader2, ArrowUp } from "lucide-react";

export default function IssueActivity({ issueId, workspaceId, currentUser, issueTitle, issueDescription }) {
  const [activities, setActivities] = useState([]);
  const [hoveredActivityId, setHoveredActivityId] = useState(null);
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  
  const replyRef = useRef(null);
  const supabase = createSupabaseBrowserClient();

  const autoResize = () => {
    if (replyRef.current) {
        replyRef.current.style.height = 'auto';
        replyRef.current.style.height = replyRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    if (replyingToId) {
        autoResize();
    }
  }, [replyText, replyingToId]);

  // Handle R shortcut to reply to hovered comment
  useShortcuts([
    {
      keys: "r",
      callback: () => {
        if (hoveredActivityId && hoveredActivityId.startsWith("c-")) {
          setReplyingToId(hoveredActivityId);
        }
      }
    }
  ]);

  useEffect(() => {
    // 1. Fetch initial data (comments + events)
    const fetchActivities = async () => {
        const [commentsResp, eventsResp, issueResp] = await Promise.all([
            supabase
            .from("issue_comments")
            .select(`*`)
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true }),

            supabase
            .from("issue_events")
            .select(`*`)
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true }),

            supabase
            .from("issues")
            .select(`created_at, created_by`)
            .eq("id", issueId)
            .single()
        ]);

        let combined = [];

        if (commentsResp.data) {
             combined.push(...commentsResp.data.map(c => ({
                 type: "comment",
                 id: "c-" + c.id,
                 user: c.user_email || "User",
                 text: c.comment_text,
                 created_at: c.created_at,
                 raw: c
             })));
        }

        if (eventsResp.data) {
            combined.push(...eventsResp.data.map(e => ({
                type: "event",
                id: "e-" + e.id,
                user: e.actor_email || "User", 
                eventType: e.event_type,
                details: e.details,
                created_at: e.created_at,
                raw: e
            })));
        }

        // Check if there's a 'create' event, if not, add virtual one
        const hasCreateEvent = combined.some(a => a.eventType === 'create');
        if (!hasCreateEvent && issueResp.data) {
            // Need the creator's email/name. For now we use "User" or fetch it.
            // But usually we want consistency.
            combined.push({
                type: "event",
                id: "virtual-create",
                user: "User", // Fallback, we'll try to get more info if needed
                eventType: "create",
                details: {},
                created_at: issueResp.data.created_at
            });
        }

        combined.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        setActivities(combined);
    };

    fetchActivities();

    // 2. Subscribe to new comments & events
    const channel = supabase
      .channel(`activity-${issueId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "issue_comments", filter: `issue_id=eq.${issueId}` }, 
        (payload) => {
            const newComment = payload.new;
             setActivities(prev => [...prev, {
                 type: "comment",
                 id: "c-" + newComment.id,
                 user: newComment.user_email || "Me", 
                 text: newComment.comment_text,
                 created_at: newComment.created_at
             }]);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "issue_events", filter: `issue_id=eq.${issueId}` },
        (payload) => {
            const newEvent = payload.new;
            setActivities(prev => [...prev, {
                type: "event",
                id: "e-" + newEvent.id,
                user: newEvent.actor_email || "Me",
                eventType: newEvent.event_type,
                details: newEvent.details,
                created_at: newEvent.created_at
            }]);
        })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [issueId, supabase, currentUser]);

  const handlePostReply = async (activity) => {
    if (!replyText.trim()) return;

    const { error } = await supabase.from("issue_comments").insert({
        issue_id: issueId,
        workspace_id: workspaceId,
        created_by: currentUser.id,
        user_email: currentUser.email,
        comment_text: replyText
    });

    if (!error) {
        setReplyText("");
        setReplyingToId(null);
    }
  };

  const handleAiAction = async (type, activity) => {
    if (type === "generate") setIsAiGenerating(true);
    else setIsPolishing(true);

    try {
        const res = await fetch("/api/ai/comment-reply", {
            method: "POST",
            body: JSON.stringify({
                type,
                issueTitle,
                issueDescription,
                commentContent: activity.text,
                currentDraft: replyText
            })
        });
        const data = await res.json();
        if (data.text) {
            setReplyText(data.text);
        }
    } catch (err) {
        console.error("AI action failed:", err);
    } finally {
        setIsAiGenerating(false);
        setIsPolishing(false);
    }
  };

  const timeAgo = (dateStr) => {
      const date = new Date(dateStr);
      const now = new Date();
      const seconds = Math.floor((now - date) / 1000);
      if (seconds < 60) return "just now";
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
  };

  const renderEventMessage = (activity) => {
      const { eventType, details } = activity;
      switch (eventType) {
          case 'create':
              return <span>created the issue</span>;
          case 'update_status':
               return <span>changed status to <span className="font-medium text-zinc-300">{details.to}</span></span>;
          case 'update_priority':
               return <span>changed priority to <span className="font-medium text-zinc-300">{details.to}</span></span>;
          case 'update_title':
               return <span>changed title</span>;
          case 'update_description':
               return <span>updated description</span>;
           case 'update_due_date':
               return <span>set due date to <span className="font-medium text-zinc-300">{details.to || 'No Date'}</span></span>;
           case 'add_label':
               return <span>added label <span className="font-medium text-zinc-300">{details.label}</span></span>;
           case 'remove_label':
               return <span>removed label <span className="font-medium text-zinc-300">{details.label}</span></span>;
          default:
              return <span>updated issue</span>;
      }
  };
  
  const getEventIcon = (eventType) => {
      switch (eventType) {
          case 'create': return <Circle size={10} />;
          case 'add_label': 
          case 'remove_label': return <Tag size={10} />;
          case 'update_due_date': return <Calendar size={10} />;
          default: return <Edit size={10} />;
      }
  }

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [isSummaryDropdownOpen, setIsSummaryDropdownOpen] = useState(false);
  const [summaryTimeframe, setSummaryTimeframe] = useState("");

  const handleSummarize = async (timeframe) => {
    setIsSummaryDropdownOpen(false);
    setIsSummarizing(true);
    setSummaryTimeframe(timeframe);

    const now = new Date();
    let filtered = activities;

    if (timeframe === "24h") {
      filtered = activities.filter(a => (now - new Date(a.created_at)) <= 24 * 60 * 60 * 1000);
    } else if (timeframe === "week") {
      filtered = activities.filter(a => (now - new Date(a.created_at)) <= 7 * 24 * 60 * 60 * 1000);
    }

    try {
      const res = await fetch("/api/ai/summarize", {
        method: "POST",
        body: JSON.stringify({
          activities: filtered,
          timeframeTitle: timeframe === "24h" ? "Last 24 Hours" : timeframe === "week" ? "Past Week" : "Complete History"
        })
      });
      const data = await res.json();
      if (data.text) {
        setSummaryData(data.text);
      }
    } catch (err) {
      console.error("Summarization failed:", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-medium text-zinc-400">Activity</h3>
            <div className="relative">
                <button 
                    onClick={() => setIsSummaryDropdownOpen(!isSummaryDropdownOpen)}
                    disabled={isSummarizing || activities.length === 0}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                    {isSummarizing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Summarize
                </button>

                {isSummaryDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1b1c] border border-white/10 rounded-lg shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                        {[
                            { id: "24h", label: "Last 24 hours" },
                            { id: "week", label: "Past week" },
                            { id: "all", label: "Complete history" }
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleSummarize(opt.id)}
                                className="w-full px-4 py-2 text-left text-[13px] text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

       {activities.length === 0 && (
           <div className="text-zinc-600 italic text-xs">No activity yet</div>
       )}

       {activities.map(activity => (
           <div 
             key={activity.id} 
             className="flex gap-3 group"
             onMouseEnter={() => setHoveredActivityId(activity.id)}
             onMouseLeave={() => setHoveredActivityId(null)}
           >
               {activity.type === 'comment' ? (
                   <>
                       <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-medium text-white uppercase shrink-0 mt-1">
                           {activity.user && activity.user.substring(0,2)}
                       </div>
                       <div className="flex-1 min-w-0">
                           <div className="bg-[#141517] border border-white/5 rounded-md p-3 relative group/bubble hover:border-white/10 transition-colors">
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-[#141517] pl-2">
                                    <div className="relative group/reply-btn">
                                        <button 
                                          onClick={() => setReplyingToId(activity.id)}
                                          className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/10 transition-colors"
                                        >
                                            <Reply size={14} />
                                        </button>
                                        <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap bg-zinc-800 text-[11px] text-zinc-300 px-2 py-1 rounded border border-white/10 opacity-0 group-hover/reply-btn:opacity-100 pointer-events-none transition-opacity shadow-xl flex items-center gap-2">
                                            Reply to comment <span className="bg-zinc-700 px-1 rounded text-[10px] font-bold">R</span>
                                        </div>
                                    </div>
                                    <button className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/10 transition-colors">
                                        <Check size={14} />
                                    </button>
                                    <button className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/10 transition-colors">
                                        <SmilePlus size={14} />
                                    </button>
                                    <button className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/10 transition-colors">
                                        <MoreHorizontal size={14} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[13px] mb-1">
                                    <span className="font-medium text-zinc-300">{activity.user}</span>
                                    <span className="text-zinc-500">{timeAgo(activity.created_at)}</span>
                                </div>
                                <div className="text-[14px] text-zinc-300 leading-relaxed whitespace-pre-wrap">
                                    {activity.text}
                                </div>
                           </div>

                           {/* Reply Box UI matching Image 2 */}
                           {replyingToId === activity.id && (
                             <div className="mt-3 ml-0 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="bg-[#141517] border border-white/10 rounded-lg p-3 shadow-lg group focus-within:border-white/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-medium text-white uppercase shrink-0 mt-0.5">
                                            {currentUser?.email?.substring(0,2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <textarea 
                                                ref={replyRef}
                                                autoFocus
                                                value={replyText}
                                                onChange={(e) => {
                                                    setReplyText(e.target.value);
                                                    autoResize();
                                                }}
                                                placeholder="Leave a reply..."
                                                className="w-full bg-transparent border-none focus:ring-0 p-0 text-[14px] text-zinc-200 placeholder:text-zinc-500 resize-none min-h-[40px] leading-relaxed overflow-hidden"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handlePostReply(activity);
                                                    }
                                                    if (e.key === 'Escape') {
                                                        setReplyingToId(null);
                                                        setReplyText("");
                                                    }
                                                }}
                                            />
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                      onClick={() => handleAiAction("generate", activity)}
                                                      disabled={isAiGenerating || isPolishing}
                                                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded text-[12px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                                    >
                                                        {isAiGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                        Reply with AI
                                                    </button>
                                                    <button 
                                                      onClick={() => handleAiAction("polish", activity)}
                                                      disabled={!replyText || isAiGenerating || isPolishing}
                                                      className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded text-[12px] font-medium transition-all disabled:opacity-30"
                                                    >
                                                        {isPolishing ? <Loader2 size={12} className="animate-spin" /> : <Edit size={12} />}
                                                        Polish
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                      onClick={() => setReplyingToId(null)}
                                                      className="px-3 py-1.5 text-zinc-500 hover:text-zinc-300 text-[12px] font-medium rounded hover:bg-white/5"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button 
                                                      onClick={() => handlePostReply(activity)}
                                                      className="w-8 h-8 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors"
                                                    >
                                                        <ArrowUp size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                           )}
                       </div>
                   </>
               ) : (
                   <>
                       <div className="w-6 h-6 flex items-center justify-center text-zinc-500 shrink-0 relative">
                             <div className="w-px h-full bg-zinc-800 absolute top-[-12px] bottom-[-12px] -z-10 group-first:top-3 group-last:bottom-3 hidden"></div>
                             {getEventIcon(activity.eventType)}
                       </div>
                       <div className="flex-1 min-w-0 flex items-center text-[13px] text-zinc-400">
                           <span className="font-medium text-zinc-300 mr-1">{activity.user}</span>
                           {renderEventMessage(activity)}
                           <span className="text-zinc-500 ml-1.5 ">· {timeAgo(activity.created_at)}</span>
                       </div>
                   </>
               )}
           </div>
       ))}

       {/* Summary Modal */}
       {summaryData && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-100 flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-[#141517] border border-white/10 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                   <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                       <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                           <Sparkles size={16} className="text-indigo-400" />
                           {summaryTimeframe === "24h" ? "Last 24 Hours Summary" : summaryTimeframe === "week" ? "Past Week Summary" : "Complete History Summary"}
                       </h2>
                       <button 
                           onClick={() => setSummaryData(null)}
                           className="text-zinc-500 hover:text-zinc-300 transition-colors"
                       >
                           <X size={18} />
                       </button>
                   </div>
                   <div className="p-6">
                        <div className="text-zinc-300 text-[14px] leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {summaryData}
                        </div>
                   </div>
                   <div className="px-6 py-4 border-t border-white/5 flex justify-end">
                       <button 
                           onClick={() => setSummaryData(null)}
                           className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md text-[13px] font-medium transition-colors"
                       >
                           Close
                       </button>
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}
