import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAssistant } from "@/db/assistants"

export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const user_api_key =
      request.headers.get("Authorization")?.split(" ")[1] || ""

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

    let body = await request.json()

    // Check if all required parameters are present
    const requiredParams: string[] = [
      "workspace_id",
      "user_id",
      "sharing",
      "context_length",
      "description",
      "embeddings_provider",
      "include_profile_context",
      "include_workspace_instructions",
      "model",
      "name",
      "image_path",
      "prompt",
      "temperature"
    ] // Add additional parameters here
    for (const param of requiredParams) {
      if (!(param in body)) {
        return NextResponse.json(
          { error: `Missing parameter: ${param}` },
          { status: 400 }
        )
      }
    }

    // Assuming these parameters are strings, you can annotate them accordingly
    const {
      id,
      workspace_id,
      user_id,
      sharing,
      context_length,
      description,
      embeddings_provider,
      include_profile_context,
      include_workspace_instructions,
      model,
      name,
      image_path,
      prompt,
      temperature
    }: {
      id: string
      workspace_id: string
      user_id: string
      sharing: string
      context_length: number
      description: string
      embeddings_provider: string
      include_profile_context: boolean
      include_workspace_instructions: boolean
      model: string
      name: string
      image_path: string
      prompt: string
      temperature: number
    } = body // Add types for additional parameters

    // Create the assistant object
    const assistant = {
      user_id,
      sharing,
      context_length,
      description,
      embeddings_provider,
      include_profile_context,
      include_workspace_instructions,
      model,
      name,
      image_path,
      prompt,
      temperature
    }

    // Using runFunction with inferred types
    const runWithAssistant = await createAssistant(assistant, workspace_id) // Passing workspace_id as the second argument

    // Returning a response with "assistant" as the key
    return NextResponse.json({ assistant: runWithAssistant }) // Return the response with "assistant" key
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
