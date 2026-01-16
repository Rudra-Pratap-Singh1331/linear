export async function seedDefaultIssues({ workspaceId, userId, teamKey, supabase }) {
  // 1. Check current issue count
  const { count, error: countError } = await supabase
    .from("issues")
    .select("*", { count: 'exact', head: true })
    .eq("workspace_id", workspaceId);

  if (countError) {
    console.error("Error checking issue count:", countError);
    return;
  }

  // 2. If count is 0, seed default issues (only the 3 requested by user)
  if (count === 0) {
    const defaultIssues = [
      { title: "Get familiar with Linear", issue_number: 1 },
      { title: "Connect your tools", issue_number: 2 },
      { title: "Import your data", issue_number: 3 },
    ];

    const issuesToInsert = defaultIssues.map(issue => ({
      workspace_id: workspaceId,
      created_by: userId,
      title: issue.title,
      description: "",
      status: "todo",
      priority: "no_priority",
      issue_number: issue.issue_number
    }));

    const { error: insertError } = await supabase
      .from("issues")
      .insert(issuesToInsert);

    if (insertError) {
      console.error("Error seeding default issues:", insertError);
    } else {
      console.log(`Successfully seeded ${issuesToInsert.length} issues for workspace ${workspaceId}`);
    }
  }
}
