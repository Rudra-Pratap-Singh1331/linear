"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Inbox,
  Layers,
  Layout,
  MoreHorizontal,
  Search,
  SquarePen,
  ChevronDown,
  ChevronRight,
  CircleDashed,
  SquareDashed,
  UserPlus,
  Github,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useKeybindings } from "./KeybindingsProvider";
import WorkspaceDropdown from "./WorkspaceDropdown";

export default function Sidebar({ workspace, user, otherWorkspaces }) {
  const params = useParams();
  const { workspaceName, teamKey: paramTeamKey, issueKey } = params;

  // Derive teamKey from issueKey if not present (e.g. TES-123 -> TES)
  const teamKey = paramTeamKey || (issueKey ? issueKey.split("-")[0] : null);

  const { isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen } = useKeybindings();

  const showTeamSection = !!teamKey;

  return (
    <div
      className="hidden lg:flex h-screen w-60 flex-col border-r select-none
        bg-[#fafafa] text-zinc-800 border-zinc-300/40
        dark:bg-[#0b0c0d] dark:text-zinc-400 dark:border-white/5"
    >
      {/* Workspace Header */}
      <div className="relative px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="flex items-center gap-2 rounded-md p-1 transition-colors overflow-hidden
              hover:bg-zinc-200/50
              dark:hover:bg-white/5"
          >
            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded text-[9px] font-bold text-white uppercase
              bg-zinc-800
              dark:bg-zinc-700"
            >
              {workspace?.name?.charAt(0)}
            </span>

            <span
              className="truncate text-[13px] font-semibold
                text-zinc-950
                dark:text-zinc-200"
            >
              {workspace?.name}
            </span>

            <ChevronDown className="h-3 w-3 shrink-0 text-zinc-600 dark:text-zinc-500" />
          </button>

          <div className="flex items-center gap-1.5 px-1">
            <Search className="h-4 w-4 cursor-pointer transition-colors
              text-zinc-600 hover:text-zinc-900
              dark:text-zinc-500 dark:hover:text-zinc-300"
            />
            <SquarePen className="h-4 w-4 cursor-pointer transition-colors
              text-zinc-600 hover:text-zinc-900
              dark:text-zinc-500 dark:hover:text-zinc-300"
            />
          </div>
        </div>

        <WorkspaceDropdown workspace={workspace} user={user} otherWorkspaces={otherWorkspaces} />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-1">
        {/* Main Nav */}
        <SidebarItem icon={<Inbox size={16} />} label="Inbox" />
        <SidebarItem icon={<CircleDashed size={16} />} label="My issues" />

        <SidebarSection title="Workspace">
          <SidebarItem icon={<Layers size={16} />} label="Projects" />
          <SidebarItem icon={<Layout size={16} />} label="Views" />
          <SidebarItem icon={<MoreHorizontal size={16} />} label="More" />
        </SidebarSection>

        {showTeamSection && (
          <SidebarSection title="Your teams">
            <TeamItem workspaceName={workspaceName} teamKey={teamKey} teamName={workspace?.name} />
          </SidebarSection>
        )}

        <SidebarSection title="Try">
          <SidebarItem icon={<Inbox size={16} />} label="Import Issues" />
          <SidebarItem icon={<UserPlus size={16} />} label="Invite people" />
          <SidebarItem icon={<Github size={16} />} label="Link GitHub" />
        </SidebarSection>
      </div>

      <div className="p-3">{/* Bottom area if needed */}</div>
    </div>
  );
}

function SidebarSection({ title, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex w-full items-center px-2 py-1 text-[11px] font-semibold tracking-tight uppercase transition-colors
          text-zinc-600 hover:text-zinc-950
          dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        <div className="flex items-center gap-1 flex-1">
          <span className="w-3">{/* icon placeholder */}</span>
          {title}
        </div>

        <ChevronRight
          size={12}
          className={cn(
            "transition-transform text-zinc-600 dark:text-zinc-500",
            isOpen && "rotate-90"
          )}
        />
      </button>

      {isOpen && <div className="mt-0.5 space-y-0.5">{children}</div>}
    </div>
  );
}

function SidebarItem({ icon, label, href = "#" }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors group",
        isActive
          ? "bg-zinc-300/50 text-zinc-950 dark:bg-white/10 dark:text-zinc-100"
          : "hover:bg-zinc-200/50 text-zinc-800 dark:hover:bg-white/5 dark:text-zinc-400"
      )}
    >
      <span className="transition-colors
        text-zinc-600 group-hover:text-zinc-900
        dark:text-zinc-500 dark:group-hover:text-zinc-300"
      >
        {icon}
      </span>

      <span className="font-medium">{label}</span>
    </Link>
  );
}

function TeamItem({ workspaceName, teamKey, teamName }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const isActive = (view) => pathname.includes(`/${workspaceName}/team/${teamKey}/${view}`);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors group
          hover:bg-zinc-200/50
          dark:hover:bg-white/5"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#5e6ad2] text-[8px] font-bold text-white uppercase">
          {teamName?.charAt(0)}
        </span>

        <span className="flex-1 text-left truncate font-semibold
          text-zinc-950
          dark:text-zinc-200"
        >
          {teamName}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            "transition-transform text-zinc-600 dark:text-zinc-500",
            !isOpen && "-rotate-90"
          )}
        />
      </button>

      {isOpen && (
        <div className="ml-2 mt-0.5 space-y-0.5">
          <Link
            href={`/${workspaceName}/team/${teamKey}/active`}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors",
              isActive("active") || isActive("all") || isActive("backlog")
                ? "bg-zinc-300/50 text-zinc-950 dark:bg-white/10 dark:text-zinc-100"
                : "hover:bg-zinc-200/50 text-zinc-800 dark:hover:bg-white/5 dark:text-zinc-400"
            )}
          >
            <SquareDashed size={14} className="text-zinc-600 dark:text-zinc-500" />
            <span className="font-medium">Issues</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors
              hover:bg-zinc-200/50 text-zinc-800
              dark:hover:bg-white/5 dark:text-zinc-400"
          >
            <Layers size={14} className="text-zinc-600 dark:text-zinc-500" />
            <span className="font-medium">Projects</span>
          </Link>

          <Link
            href="#"
            className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors
              hover:bg-zinc-200/50 text-zinc-800
              dark:hover:bg-white/5 dark:text-zinc-400"
          >
            <Layout size={14} className="text-zinc-600 dark:text-zinc-500" />
            <span className="font-medium">Views</span>
          </Link>
        </div>
      )}
    </div>
  );
}
