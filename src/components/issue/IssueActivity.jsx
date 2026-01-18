"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";
import { Tag, Edit, AlertCircle, Calendar, CheckCircle2, Circle, Reply, Check, SmilePlus, MoreHorizontal } from "lucide-react";

export default function IssueActivity({ issueId, workspaceId, currentUser }) {
  const [activities, setActivities] = useState([]);
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // 1. Fetch initial data (comments + events)
    const fetchActivities = async () => {
        const [commentsResp, eventsResp] = await Promise.all([
            supabase
            .from("issue_comments")
            .select(`*`)
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true }),

            supabase
            .from("issue_events")
            .select(`*`) // No join on user yet, we might need a public profile table or store email in event
            .eq("issue_id", issueId)
            .order("created_at", { ascending: true })
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

  return (
    <div className="space-y-6">
       {/* Explicit Creation Event if not present in DB events or fallback */}
       {/* If we strictly rely on DB events, we might miss old issues without events. Mixing logic is tricky. 
           We'll assume 'create' event is logged or we fallback to "Created issue" at the top if list is empty?
           For now, let's just render the list. 
       */}

       {activities.length === 0 && (
           <div className="text-zinc-600 italic text-xs">No activity yet</div>
       )}

       {activities.map(activity => (
           <div key={activity.id} className="flex gap-3 group">
               {activity.type === 'comment' ? (
                   <>
                       <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-medium text-white uppercase shrink-0 mt-1">
                           {activity.user && activity.user.substring(0,2)}
                       </div>
                       <div className="flex-1 min-w-0">
                           <div className="bg-[#141517] border border-white/5 rounded-md p-3 relative group/bubble">
                                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity bg-[#141517] pl-2">
                                    <button className="p-1 text-zinc-500 hover:text-zinc-300 rounded hover:bg-white/10 transition-colors">
                                        <Reply size={14} />
                                    </button>
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
                       </div>
                   </>
               ) : (
                   <>
                       <div className="w-6 h-6 flex items-center justify-center text-zinc-500 shrink-0 relative">
                            {/* Connector Line Logic hard to do perfectly in map, simple icon for now */}
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
    </div>
  );
}
