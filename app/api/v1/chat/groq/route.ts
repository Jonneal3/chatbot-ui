import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import {
  checkApiKey,
  getServerProfile
} from "@/lib/server/serverless-chat-helpers"
import { ChatSettings } from "@/types"
import OpenAI from "openai"

export const runtime = "edge"
export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, user_id, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
    user_id: any
  }

  console.log("GROQ", user_id)

  try {
    const profile = await getServerProfile(user_id)

    checkApiKey(profile.groq_api_key, "G")

    console.log("Profile", profile)

    // Groq is compatible with the OpenAI SDK
    const groq = new OpenAI({
      apiKey: profile.groq_api_key || "",
      baseURL: "https://api.groq.com/openai/v1"
    })

    console.log("GROW OPEN AI", groq)

    const response = await groq.chat.completions.create({
      model: chatSettings.model,
      messages,
      max_tokens:
        CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
      stream: false
    })

    console.log("GROQ RESPONSE", response)

    // Export the response along with necessary headers
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Groq API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Groq API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }
}
