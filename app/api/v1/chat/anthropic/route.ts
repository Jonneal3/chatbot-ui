import { CHAT_SETTING_LIMITS } from "@/lib/chat-setting-limits"
import {
  checkApiKey,
  getServerProfile
} from "@/lib/server/serverless-chat-helpers"
import { ChatSettings } from "@/types"
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const { chatSettings, user_id, messages } = json as {
      user_id: any
      chatSettings: ChatSettings
      messages: any[]
    }

    const profile = await getServerProfile(user_id) // Adjusted to pass user_id
    checkApiKey(profile.anthropic_api_key, "Anthropic")

    let ANTHROPIC_FORMATTED_MESSAGES: any = messages.slice(1)

    const anthropic = new Anthropic({
      apiKey: profile.anthropic_api_key || ""
    })

    const response = await anthropic.messages.create({
      model: chatSettings.model,
      messages: ANTHROPIC_FORMATTED_MESSAGES,
      temperature: chatSettings.temperature,
      system: messages[0].content,
      max_tokens:
        CHAT_SETTING_LIMITS[chatSettings.model].MAX_TOKEN_OUTPUT_LENGTH,
      stream: false // Adjusted stream setting
    })

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Anthropic API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Anthropic API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: { "Content-Type": "application/json" }
    })
  }
}
