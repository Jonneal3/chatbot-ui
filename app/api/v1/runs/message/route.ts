import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runFunction } from "@/lib/run-message"

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Check if all required parameters are present
    const requiredParams: string[] = [
      "chat_id",
      "assistant_id",
      "user_id",
      "content"
    ]
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
      user_id,
      content
    }: {
      assistant_id: string
      chat_id: string
      user_id: string
      content: string
    } = body

    // Using runFunction with inferred types
    const runWithMessage = await runFunction(
      assistant_id,
      chat_id,
      user_id,
      content
    )

    // Returning a response
    return NextResponse.json({ runs: runWithMessage }) // Return runs data
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
