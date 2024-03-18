import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getMessageById } from "@/db/messages"

// Create a single Supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: Request, { params }: any) {
  try {
    const { message_id } = params // Extract user_id from params

    console.log(message_id)
    if (!message_id) {
      return NextResponse.json(
        { error: "Missing message_id parameter" },
        { status: 400 }
      )
    }

    const message = await getMessageById(message_id) // Await getRunByUserId call since it seems asynchronous

    return NextResponse.json({ message }) // Return runs data
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
