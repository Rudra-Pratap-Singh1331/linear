"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  SquareDashed,
  CircleCheck,
  CircleDashed,
  Layers,
  Bell,
  PanelRight,
} from "lucide-react";

export default function TopNavTabs() {
  const params = useParams();
  const pathname = usePathname();
  const { workspaceName, teamKey } = params;

  if (!teamKey) return null;

  const tabs = [
    { id: "all", label: "All issues", icon: <SquareDashed size={14} /> },
    { id: "active", label: "Active", icon: <CircleCheck size={14} /> },
    { id: "backlog", label: "Backlog", icon: <CircleDashed size={14} /> },
  ];

  return (
    <div
      className="flex h-11 items-center justify-between border-b px-4 select-none
        bg-[#fafafa] border-zinc-300/40
        dark:bg-[#0b0c0d] dark:border-white/5"
    >
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
                  "flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[13px] transition-colors border",
                  isActive
                    ? "bg-zinc-300/50 text-zinc-950 border-zinc-300/60 font-medium dark:bg-[#27282B] dark:text-zinc-100 dark:border-white/10"
                    : "text-zinc-700 border-transparent hover:bg-zinc-200/50 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-transparent"
                )}
              >
                <span
                  className={cn(
                    "text-zinc-600 dark:text-zinc-500",
                    isActive && "text-zinc-900 dark:text-zinc-100"
                  )}
                >
                  {tab.icon}
                </span>

                <span className={cn(isActive && "font-semibold")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="h-4 w-px mx-1
          bg-zinc-300/60
          dark:bg-white/10"
        />

        <button
          className="p-1 rounded transition-colors
            text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-950
            dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
        >
          <Layers size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5 ml-2">
          <button
            className="p-1.5 rounded transition-colors
              text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-950
              dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
          >
            <Bell size={16} />
          </button>

          <button
            className="p-1.5 rounded transition-colors
              text-zinc-700 hover:bg-zinc-200/50 hover:text-zinc-950
              dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-300"
          >
            <PanelRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
