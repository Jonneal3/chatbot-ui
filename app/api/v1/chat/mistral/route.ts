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
    user_id: any
    messages: any[]
  }

  try {
    const profile = await getServerProfile(user_id)

    checkApiKey(profile.mistral_api_key, "Mistral")

    // Mistral is compatible with the OpenAI SDK
    const mistral = new OpenAI({
      apiKey: profile.mistral_api_key || "",
      baseURL: "https://api.mistral.ai/v1"
    })

    const response = await mistral.chat.completions.create({
      model: chatSettings.model,
      messages,
      max_tokens:
        CHAT_SETTING_LIMITS[chatSettings.model]?.MAX_TOKEN_OUTPUT_LENGTH || 150, // Default max tokens if not found
      stream: false
    })

    // Respond with the stream
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Mistral API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Mistral API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: { "Content-Type": "application/json" }
    })
  }
}
