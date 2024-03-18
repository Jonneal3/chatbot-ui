import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getRunsByAssistantId } from "@/db/runs"

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request, { params }: any) {
  try {
    const { assistant_id } = params // Extract user_id from params

    console.log(assistant_id)
    if (!assistant_id) {
      return NextResponse.json(
        { error: "Missing run_id parameter" },
        { status: 400 }
      )
    }

    const runs = await getRunsByAssistantId(assistant_id) // Await getRunByUserId call since it seems asynchronous

    return NextResponse.json({ runs }) // Return runs data
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
