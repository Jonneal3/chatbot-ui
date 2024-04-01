import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runFunction } from "@/lib/run-message"
import getOauthObject from "@/lib/get-integration"
import fetch from "node-fetch" // Import node-fetch for making API requests
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

    // Extract customData from the body
    body = body.customData

    const profile = getProfileByUserId(body.user_id)
    const user_id = (await profile).user_id

    // Check if all required parameters are present
    const requiredParams: string[] = [
      "assistant_id",
      "chat_id",
      "connection_id",
      "contact_id",
      "message_type",
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
      content,
      connection_id,
      message_type, // Added message_type
      contact_id // Added contact_id
    }: {
      assistant_id: string
      chat_id: string
      content: string
      connection_id: string // Add type for connection_id
      message_type: string // Add type for message_type
      contact_id: string // Add type for contact_id
    } = body

    // Using runFunction with inferred types
    const runMessage = await runFunction(
      assistant_id,
      chat_id,
      user_id, // Use the retrieved user ID
      content
    )

    // Get the OAuth token using the connection_id
    let token = await getOauthObject(connection_id)

    const final_token = token.data.credentials.access_token

    console.log("FINAL TOKEN", final_token)

    const messageContent = (runMessage as any)?.choices[0]?.message.content

    // Making the additional API request with the obtained token
    const requestBody = {
      type: message_type, // Use message_type variable
      contactId: contact_id, // Use contact_id variable
      message: messageContent // Use extracted content as message
    }

    const apiRequestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${final_token}`, // Use the token for authorization
        Version: "2021-04-15",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    }

    const apiResponse = await fetch(
      "https://services.leadconnectorhq.com/conversations/messages",
      apiRequestOptions
    )
    const apiData = await apiResponse.json()

    console.log(apiData)

    // Returning a response with both runMessage and API data
    return NextResponse.json({ runMessage, apiData })
  } catch (error: any) {
    // Return the actual error message from Supabase
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
