import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import IssueDetailView from "@/components/issue/IssueDetailView";

export default async function IssueDetailPage({ params }) {
  const { workspaceName, issueKey, issueTitle } = await params;
  const supabase = await createClient();

  // 1. Get Workspace
  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name")
    .eq("slug", workspaceName)
    .single();

  if (!workspace) {
    notFound();
  }

  // 2. Get User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/signup");
  }

  // 3. Get Issue
  const { data: issue, error } = await supabase
    .from("issues")
    .select(`
      *,
      workspace:workspaces(name, slug)
    `)
    .eq("issue_key", issueKey)
    .eq("workspace_id", workspace.id)
    .single();

  if (error || !issue) {
    console.error("Issue not found:", error);
    notFound();
  }

  return (
    <IssueDetailView 
      issue={issue} 
      workspaceName={workspaceName} 
      user={user} 
    />
  );
}
