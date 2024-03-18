import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getConnectionById = async (connectionId: string) => {
  const { data: connection, error } = await supabase
    .from("connections")
    .select("*")
    .eq("id", connectionId)
    .single()

  if (!connection) {
    throw new Error(error.message)
  }

  return connection
}

export const getConnectionWorkspacesByWorkspaceId = async (
  workspaceId: string
) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      connections (*)
    `
    )
    .eq("id", workspaceId)
    .single()

  if (!workspace) {
    throw new Error(error.message)
  }

  return workspace
}

export const getConnectionWorkspacesByConnectionId = async (
  connectionId: string
) => {
  const { data: connection, error } = await supabase
    .from("workspaces")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", connectionId)
    .single()

  if (!connection) {
    throw new Error(error.message)
  }

  return connection
}

export const createConnection = async (
  connection: TablesInsert<"connections">,
  workspace_id: string,
  user_id: string // Add user_id as a parameter to the function
) => {
  const { data: createdConnection, error } = await supabase
    .from("connections")
    .insert([connection])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (connection.id === undefined) {
    throw new Error("Connection ID is undefined")
  }

  await createConnectionWorkspace({
    connection_id: connection.id,
    workspace_id: workspace_id,
    user_id: user_id // Pass the user_id parameter to createConnectionWorkspace
  })

  return createdConnection
}

export const createConnections = async (
  connection: TablesInsert<"connections">,
  workspace_id: string,
  user_id: string
) => {
  const { data: createdConnection, error } = await supabase
    .from("connections")
    .insert([connection])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  if (connection.id === undefined) {
    throw new Error("Connection ID is undefined")
  }

  await createConnectionWorkspaces([
    {
      connection_id: connection.id,
      workspace_id: workspace_id,
      created_at: "", // Add an empty string as the default value for created_at
      user_id: user_id
    }
  ])

  return createdConnection
}

export const createConnectionWorkspace = async (item: {
  connection_id: string
  workspace_id: string
  created_at?: string
  user_id: string // Add the missing user_id property
}) => {
  const { data: createdConnectionWorkspace, error } = await supabase
    .from("connection_workspaces")
    .insert([
      {
        ...item,
        created_at: item.created_at || new Date().toISOString() // Ensure created_at is always a string
      }
    ])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdConnectionWorkspace
}

export const createConnectionWorkspaces = async (
  items: {
    connection_id: string
    workspace_id: string
    created_at: string
    user_id: string
  }[]
) => {
  const { data: createdConnectionWorkspaces, error } = await supabase
    .from("connection_workspaces")
    .insert(items)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdConnectionWorkspaces
}

export const updateConnection = async (
  connectionId: string,
  connection: TablesUpdate<"connections">
) => {
  const { data: updatedConnection, error } = await supabase
    .from("connections")
    .update(connection)
    .eq("id", connectionId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedConnection
}

export const deleteConnection = async (connectionId: string) => {
  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteConnectionWorkspace = async (
  connectionId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("connection_workspaces")
    .delete()
    .eq("connection_id", connectionId)
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
