import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createMessage } from "@/db/messages"
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
      "chat_id",
      "assistant_id",
      "user_id",
      "content",
      "image_paths",
      "model",
      "role",
      "sequence_number"
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
      chat_id,
      assistant_id,
      user_id,
      content,
      image_paths,
      model,
      role,
      sequence_number
    }: {
      chat_id: string
      assistant_id: string
      user_id: string
      content: string
      image_paths: string[]
      model: string
      role: string
      sequence_number: number
    } = body // Add types for additional parameters

    // Create the message object
    const message = {
      chat_id,
      assistant_id,
      user_id,
      content,
      image_paths,
      model,
      role,
      sequence_number
    }

    // Using runFunction with inferred types
    const runWithMessage = await createMessage(message)

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
