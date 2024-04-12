import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runFunction } from "@/lib/run-message"
import getOauthObject from "@/lib/get-integration"
import fetch from "node-fetch"
import { getProfileByUserId } from "@/db/profile"
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

    const profile = getProfileByUserId(body.user_id)
    const user_id = (await profile).user_id

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
      user_id, // Use the retrieved user ID
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
