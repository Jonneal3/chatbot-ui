import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const user_api_key =
      request.headers.get("Authorization")?.split(" ")[1] || ""

    let supabase
    if (user_api_key) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: user_api_key
            }
          },
          auth: {
            persistSession: false,
            detectSessionInUrl: false,
            autoRefreshToken: false
          }
        }
      )
    } else {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const body = await request.json()

    // Check if all required parameters are present
    const requiredParams = [
      "user_id",
      "description",
      "name",
      "schema",
      "custom_headers",
      "connection_id",
      "sharing",
      "request_in_body",
      "workspace_id"
    ]

    for (const param of requiredParams) {
      if (!(param in body)) {
        return NextResponse.json(
          { error: `Missing parameter: ${param}` },
          { status: 400 }
        )
      }
    }

    // Destructure the parameters from the body
    const {
      user_id,
      folder_id,
      sharing,
      description,
      name,
      schema,
      url,
      custom_headers,
      request_in_body,
      connection_id,
      post_process,
      workspace_id
    }: {
      user_id: string
      folder_id?: string
      sharing?: string
      description: string
      name: string
      schema: object
      url?: string
      custom_headers: object
      request_in_body?: boolean
      connection_id: string
      post_process?: object
      workspace_id: string
    } = body

    // Convert schema and custom_headers to properly formatted JSON strings
    const schemaString = JSON.stringify(schema, null, 2)
    const customHeadersString = JSON.stringify(custom_headers, null, 2)

    // Create the tool object
    const tool = {
      user_id,
      folder_id: folder_id ?? null,
      sharing: sharing ?? null,
      description,
      name,
      schema: schemaString,
      url: url ?? null,
      custom_headers: customHeadersString,
      request_in_body: request_in_body ?? null,
      connection_id,
      post_process: post_process ?? null
    }

    // Insert the new tool into the tools table
    const { data: toolData, error: toolError } = await supabase
      .from("tools")
      .insert([tool])
      .select() // Ensure the data is returned by using select()

    if (toolError) {
      throw toolError
    }

    // Check if toolData is null or empty
    if (!toolData || toolData.length === 0) {
      return NextResponse.json(
        { error: "Failed to insert the tool" },
        { status: 500 }
      )
    }

    const tool_id = toolData[0].id

    // Create the tool_workspaces object
    const toolWorkspace = {
      user_id,
      tool_id,
      workspace_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert the new tool_workspace into the tool_workspaces table
    const { data: workspaceData, error: workspaceError } = await supabase
      .from("tool_workspaces")
      .insert([toolWorkspace])
      .select()

    if (workspaceError) {
      throw workspaceError
    }

    // Check if workspaceData is null or empty
    if (!workspaceData || workspaceData.length === 0) {
      return NextResponse.json(
        { error: "Failed to insert the tool_workspace" },
        { status: 500 }
      )
    }

    // Returning a response with the inserted tool and tool_workspace data
    return NextResponse.json(
      { tool: toolData[0], tool_workspace: workspaceData[0] },
      { status: 201 }
    )
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
