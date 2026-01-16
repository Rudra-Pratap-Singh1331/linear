"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { SquareDashed, CircleCheck, CircleDashed, Filter, Layers, Bell, PanelRight, LayoutGrid } from "lucide-react";

export default function TopNavTabs() {
  const params = useParams();
  const pathname = usePathname();
  const { workspaceName, teamKey } = params;

  const tabs = [
    { id: "all", label: "All issues", icon: <SquareDashed size={14} /> },
    { id: "active", label: "Active", icon: <CircleCheck size={14} /> },
    { id: "backlog", label: "Backlog", icon: <CircleDashed size={14} /> },
  ];

  return (
    <div className="flex h-11 items-center justify-between border-b border-white/5 px-4 bg-[#0b0c0d] select-none">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {tabs.map((tab) => {
            const href = `/${workspaceName}/team/${teamKey}/${tab.id}`;
            const isActive = pathname === href;
            
            return (
              <Link
                key={tab.id}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] font-normal transition-colors border border-transparent",
                  isActive 
                    ? "bg-[#27282B] text-zinc-100 border-white/10" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {tab.icon}
                <span className={cn(isActive && "font-medium")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
        <div className="h-4 w-px bg-white/10 mx-1"></div>
        <button className="p-1 rounded hover:bg-white/5 transition-colors text-zinc-500">
          <Layers size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 ml-2">
          <button className="p-1.5 rounded hover:bg-white/5 text-zinc-500">
            <Bell size={16} />
          </button>
          <button className="p-1.5 rounded hover:bg-white/5 text-zinc-500">
            <PanelRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
