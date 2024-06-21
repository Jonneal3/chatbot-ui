import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createAssistant } from "@/db/assistants"

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

    // Insert the new record into the assistant_tools table
    const { data, error } = await supabase
      .from("assistant_tools")
      .insert([assistantTool])
      .select() // Ensure the data is returned by using select()

    if (error) {
      throw error
    }

    // Check if data is null or empty
    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "Failed to insert the assistant tool" },
        { status: 500 }
      )
    }

    // Returning a response with the inserted assistant tool data
    return NextResponse.json({ assistant_tool: data[0] }, { status: 201 })
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
