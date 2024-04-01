import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runFunction } from "@/lib/run-message"
export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get("Authorization")?.split("Bearer ")[1]

    console.log("key", apiKey)

    if (!apiKey) {
      return NextResponse.json(
        { error: "Authorization header with Bearer token is missing" },
        { status: 401 }
      )
    }

    // Query the "api_keys" table to find the user ID associated with the API key
    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("api_keys")
      .select("*")
      .eq("id", apiKey)
      .single()

    console.log("api_key_data", apiKeyData)

    if (apiKeyError || !apiKeyData) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const userId = apiKeyData.user_id
    console.log("USER_ID", userId)

    const body = await request.json()

    // Check if all required parameters are present
    const requiredParams: string[] = ["chat_id", "assistant_id", "content"]
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
      chat_id,
      assistant_id,
      content
    }: {
      assistant_id: string
      chat_id: string
      content: string
    } = body

    // Using runFunction with inferred types
    const runMessage = await runFunction(
      assistant_id,
      chat_id,
      userId, // Use the retrieved user ID
      content
    )

    // Returning a response
    return NextResponse.json({ runMessage }) // Return runs data
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
