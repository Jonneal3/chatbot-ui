import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { createChat } from "@/db/chats"

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
      "user_id",
      "assistant_id",
      "model",
      "workspace_id"
    ] // Only user_id and assistant_id are required
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
      temperature: 0.2
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
