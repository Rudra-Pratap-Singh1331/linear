import { createClient } from "@/lib/supabase/server";
import IssuesBoard from "@/components/dashboard/IssuesBoard";
import { seedDefaultIssues } from "@/lib/seedIssues";

export default async function ActiveIssuesPage({ params }) {
  const { workspaceName, teamKey: teamKeyParam } = await params;
  const supabase = await createClient();

  // Get workspace id
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id")
    .eq("slug", workspaceName)
    .single();

  if (!workspace) return null;

  // Get current user for seeding
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Determine team key from path or params
    const teamKey = teamKeyParam || "TES";
    await seedDefaultIssues({ 
      workspaceId: workspace.id, 
      userId: user.id, 
      teamKey, 
      supabase 
    });
  }

  // Fetch active issues (status IN ('todo','in_progress')) for the workspace
  const { data: issues } = await supabase
    .from("issues")
    .select("*")
    .eq("workspace_id", workspace.id)
    .in("status", ["todo", "in_progress"])
    .order('created_at', { ascending: false });

  // Get todo count
  const { count: todoCount } = await supabase
    .from("issues")
    .select("*", { count: 'exact', head: true })
    .eq("workspace_id", workspace.id)
    .eq("status", "todo");

  return <IssuesBoard issues={issues || []} todoCount={todoCount || 0} />;
}
