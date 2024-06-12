// Import necessary modules
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createWorkspace } from "@/db/workspaces"

// Define constants
export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

// Define the POST function
export async function POST(request: Request) {
  try {
    // Retrieve user API key from the request headers
    const user_api_key =
      request.headers.get("Authorization")?.split(" ")[1] || ""

    // Create Supabase client if user API key exists
    if (user_api_key) {
      const supabase = createClient(
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
    }

    // Parse request body as JSON
    const body = await request.json()

    // Define type annotations for the expected parameters
    const {
      user_id,
      default_context_length,
      description,
      embeddings_provider,
      include_profile_context,
      include_workspace_instructions,
      default_model,
      name,
      image_path,
      default_prompt,
      default_temperature,
      is_home,
      sharing = "private",
      instructions
    }: {
      user_id: string
      default_context_length: number
      description: string
      embeddings_provider: string
      include_profile_context: boolean
      include_workspace_instructions: boolean
      default_model: string
      name: string
      image_path: string
      default_prompt: string
      default_temperature: number
      is_home: boolean
      sharing?: string // Make sharing optional
      instructions: string // Ensure instructions is always a string
    } = body

    // Create the workspace object
    const workspace = {
      user_id,
      sharing,
      default_context_length,
      description,
      embeddings_provider,
      include_profile_context,
      include_workspace_instructions,
      default_model,
      name,
      image_path,
      default_prompt,
      default_temperature,
      instructions: instructions || "", // Ensure instructions is a string
      is_home
    }

    // Create the workspace in the database
    const workspaceData = await createWorkspace(workspace)

    // Returning a response with "workspace" as the key
    return NextResponse.json({ workspace: workspaceData })
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
