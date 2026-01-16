"use client";

import { useState } from "react";
import { ChevronRight, Check, Plus, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { useKeybindings } from "./KeybindingsProvider";

export default function WorkspaceDropdown({ workspace, user, otherWorkspaces = [] }) {
  const { isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen } = useKeybindings();
  const [isSubOpen, setIsSubOpen] = useState(false);

  if (!isWorkspaceDropdownOpen) return null;

  return (
    <div className="absolute top-12 left-2 z-50 w-64 rounded-lg border border-white/10 bg-[#1A1B1C] py-1 shadow-2xl">
      <div className="px-3 py-2 border-b border-white/5">
        <span className="text-[11px] text-zinc-500 font-medium uppercase truncate block">
          {user?.email}
        </span>
      </div>

      <div className="py-1">
        <button 
          className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
          onMouseEnter={() => setIsSubOpen(true)}
          onMouseLeave={() => setIsSubOpen(false)}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700 text-[10px] font-bold text-white uppercase">
              {workspace?.name?.charAt(0)}
            </span>
            <span className="truncate">{workspace?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-zinc-500" />
            <ChevronRight className="h-3 w-3 text-zinc-500" />
          </div>
        </button>
      </div>

      <div className="py-1 border-t border-white/5">
        <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create or join a workspace...</span>
        </button>
        <button className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:bg-white/5 transition-colors">
          <UserPlus className="h-4 w-4" />
          <span>Add an account...</span>
        </button>
      </div>

      {isSubOpen && (
        <WorkspaceSubDropdown workspaces={otherWorkspaces} currentWorkspaceId={workspace?.id} />
      )}
    </div>
  );
}

function WorkspaceSubDropdown({ workspaces, currentWorkspaceId }) {
  return (
    <div className="absolute top-10 left-[calc(100%-8px)] z-50 w-56 rounded-lg border border-white/10 bg-[#1A1B1C] py-1 shadow-2xl">
      <div className="px-3 py-1.5 border-b border-white/5">
        <span className="text-[11px] text-zinc-500 font-medium uppercase">Switch workspace</span>
      </div>
      <div className="py-1">
        {workspaces.map((ws) => (
          <button
            key={ws.id}
            className="flex w-full items-center justify-between px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-zinc-700 text-[10px] font-bold text-white uppercase">
                {ws.name.charAt(0)}
              </span>
              <span className="truncate">{ws.name}</span>
            </div>
            {ws.id === currentWorkspaceId && <Check className="h-4 w-4 text-zinc-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
