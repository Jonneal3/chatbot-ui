import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createChat } from "@/db/chats"
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
      "user_id",
      "assistant_id",
      "model",
      "workspace_id"
    ]

    for (const param of requiredParams) {
      if (!(param in body)) {
        return NextResponse.json(
          { error: `Missing parameter: ${param}` },
          { status: 400 }
        )
      }
    }

    // Define default or pre-filled values for other parameters
    const defaultValues = {
      folder_id: null,
      sharing: "private",
      context_length: 4096,
      embeddings_provider: "openai",
      include_profile_context: true,
      include_workspace_instructions: false,
      name: "default_name",
      prompt: "default_prompt",
      temperature: 0.2,
      metadata: body.metadata // Use metadata from the request body
    }

    // Merge body and defaultValues
    const chat = { ...defaultValues, ...body }

    // Insert the chat into the database
    const Chat = await createChat(chat)

    // Returning a response
    return NextResponse.json({ chat: Chat }) // Return runs data
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
