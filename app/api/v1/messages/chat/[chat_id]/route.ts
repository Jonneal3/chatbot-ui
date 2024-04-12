import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getMessageById } from "@/db/messages"

export const maxDuration = 299 // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: any) {
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

    try {
      const { chat_id } = params // Extract user_id from params

      console.log(chat_id)
      if (!chat_id) {
        return NextResponse.json(
          { error: "Missing chat_id parameter" },
          { status: 400 }
        )
      }

      const message = await getMessageById(chat_id) // Await getRunByUserId call since it seems asynchronous

      return NextResponse.json({ message }) // Return runs data
    } catch (error: any) {
      // Return the actual error message from Supabase
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error(error)
  }
}
