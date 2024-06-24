// Import necessary modules
import { NextResponse } from "next/server"
import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { createTool } from "@/db/tools" // Adjust the import based on the actual location of your db file

// Define constants
export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

// Define the POST function
export async function POST(request: Request) {
  try {
    // Retrieve user API key from the request headers
    const user_api_key =
      request.headers.get("Authorization")?.split(" ")[1] || ""

    // Initialize Supabase client if user API key exists
    let supabase: SupabaseClient | null = null
    if (user_api_key) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
    } else {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    // Parse request body as JSON
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

    // Create the tool in the database
    const createdTool = await createTool(tool, workspace_id)

    // Returning a response with the inserted tool data
    return NextResponse.json({ tool: createdTool }, { status: 201 })
  } catch (error: any) {
    // Return the actual error message
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
