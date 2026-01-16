import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  // If there's a 'next' param, use it, otherwise default to dashboard
  let redirectPath = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // Check if user has a workspace
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
         const { data: memberships } = await supabase
          .from("workspace_members")
          .select("workspace_id")
          .eq("user_id", user.id)
          .limit(1);
         
         // If NO workspace, Force Redirect to Create Workspace
         if (!memberships || memberships.length === 0) {
           redirectPath = "/create-workspace";
         } else {
            // Get the workspace slug
            const { data: workspace } = await supabase
              .from("workspaces")
              .select("slug")
              .eq("id", memberships[0].workspace_id)
              .single();
            
            if (workspace) {
              redirectPath = `/${workspace.slug}/team/TES/active`;
            }
          }
      }
    }
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}
