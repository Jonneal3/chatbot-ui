import { supabase } from "@/lib/supabase/browser-client"
import { getProfilesByEmail } from "@/db/profile"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getWorkspacesByTeamUserId = async (userId: string) => {
  // Fetch teams associated with the user
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("workspace_id")
    .eq("user_id", userId)

  if (teamsError) {
    throw new Error(teamsError.message)
  }

  // If no teams found, return an empty array
  if (!teams || teams.length === 0) {
    return []
  }

  // Extract workspace_ids from teams
  const workspaceIds = teams.map((team: any) => team.workspace_id)

  // Fetch workspaces corresponding to the workspace_ids
  const { data: workspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select("*")
    .in("id", workspaceIds)

  if (workspacesError) {
    throw new Error(workspacesError.message)
  }

  return workspaces || []
}

export const getTeamUsersByWorkspaceId = async (workspaceId: string) => {
  // Fetch teams associated with the provided workspace ID
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("*")
    .eq("workspace_id", workspaceId)

  if (teamsError) {
    throw new Error(teamsError.message)
  }

  return teams
}

export const createTeam = async (userData: {
  email: string
  workspace_id: string
  name: string
}) => {
  const { email, workspace_id, name } = userData

  // Log the email being processed
  console.log("Processing email:", email)

  // Fetch user profile by email
  const profiles = await getProfilesByEmail(email)

  if (!profiles || profiles.length === 0) {
    throw new Error("User not found with the provided email")
  }

  const user_id = profiles[0].user_id // Use the 'id' field from the user profile

  console.log("USER_ID", user_id)

  // Insert a new record into the teams table
  const { data: createdTeam, error: teamError } = await supabase
    .from("teams")
    .insert([{ name, email, user_id, workspace_id }])
    .single()

  if (teamError) {
    throw new Error(teamError.message)
  }

  return createdTeam
}

export const updateTeam = async (
  team_id: string,
  teams: TablesUpdate<"teams">
) => {
  const { data: updatedTeam, error: updateError } = await supabase
    .from("teams")
    .update(teams)
    .eq("id", team_id)
    .single()

  if (updateError) {
    throw new Error(updateError.message)
  }

  return updatedTeam
}

export const deleteTeam = async (team_id: string) => {
  const { data: deletedTeam, error: deleteError } = await supabase
    .from("teams")
    .delete()
    .eq("id", team_id)
    .single()

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  return deletedTeam
}
