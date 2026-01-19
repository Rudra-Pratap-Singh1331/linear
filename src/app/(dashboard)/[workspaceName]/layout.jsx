import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNavTabs from "@/components/dashboard/TopNavTabs";
import { KeybindingsProvider } from "@/components/dashboard/KeybindingsProvider";

export default async function DashboardLayout({ children, params }) {
  const { workspaceName } = await params;
  const supabase = await createClient();

  // 1. Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/signup");
  }

  // 2. Fetch workspace by slug (workspaceName param)
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("*")
    .eq("slug", workspaceName)
    .single();

  if (wsError || !workspace) {
    redirect("/signup"); // Or a Not Found page
  }

  // 3. Validate membership
  const { data: membership, error: memberError } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .single();

  if (memberError || !membership) {
    return (
      <div className="flex h-screen items-center justify-center bg-white text-zinc-700 dark:bg-[#08090A] dark:text-zinc-400">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2 text-zinc-900 dark:text-zinc-100">
            Access Denied
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            You don't have permission to access this workspace.
          </p>
        </div>
      </div>
    );
  }

  // 4. Fetch other workspaces for the user
  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", user.id);

  const otherWorkspaces =
    memberships?.map((m) => m.workspaces).filter((ws) => ws.id !== workspace.id) ||
    [];

  return (
    <KeybindingsProvider>
      <div className="flex h-screen overflow-hidden font-sans select-none
        bg-white text-zinc-700
        dark:bg-[#0b0c0d] dark:text-zinc-400"
      >
        <Sidebar
          workspace={workspace}
          user={user}
          otherWorkspaces={otherWorkspaces}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <TopNavTabs />

          <main className="flex-1 overflow-hidden relative
            bg-zinc-50 dark:bg-transparent"
          >
            {children}
          </main>
        </div>
      </div>
    </KeybindingsProvider>
  );
}
