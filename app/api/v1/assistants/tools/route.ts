import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAssistantTool } from "@/db/assistant-tools"

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
    } else {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 })
    }

    const body = await request.json()

    // Check if all required parameters are present
    const requiredParams = ["user_id", "assistant_id", "tool_id"]

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
      assistant_id,
      tool_id
    }: {
      user_id: string
      assistant_id: string
      tool_id: string
    } = body

    // Generate current timestamps
    const currentTimestamp = new Date().toISOString()

    // Create the assistant_tool object with current timestamps
    const assistantTool = {
      user_id,
      assistant_id,
      tool_id,
      created_at: currentTimestamp,
      updated_at: currentTimestamp // set updated_at to current timestamp
    }

    // Insert the new record using createAssistantTool
    const createdAssistantTool = await createAssistantTool(assistantTool)

    // Returning a response with the inserted assistant tool data
    return NextResponse.json(
      { assistant_tool: createdAssistantTool },
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
