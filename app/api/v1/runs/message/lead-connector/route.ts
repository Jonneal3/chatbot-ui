import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { runFunction } from "@/lib/run-message"
import getOauthObject from "@/lib/get-integration"
import fetch from "node-fetch" // Import node-fetch for making API requests

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

    const user_id = apiKeyData.user_id
    console.log("USER_ID", user_id)

    const body = await request.json()

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

    // Type assertion for runMessage
    const runMessageData: any = runMessage

    // Extracting content from runMessage
    let messageContent = ""
    if (
      runMessageData &&
      runMessageData.runMessage &&
      runMessageData.runMessage.choices &&
      runMessageData.runMessage.choices.length > 0 &&
      runMessageData.runMessage.choices[0].message
    ) {
      messageContent = runMessageData.runMessage.choices[0].message.content
    }

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

    console.log(apiResponse)
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
