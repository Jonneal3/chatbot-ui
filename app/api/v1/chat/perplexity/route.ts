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

    checkApiKey(profile.perplexity_api_key, "Perplexity")

    // Perplexity is compatible with the OpenAI SDK
    const perplexity = new OpenAI({
      apiKey: profile.perplexity_api_key || "",
      baseURL: "https://api.perplexity.ai/"
    })

    const response = await perplexity.chat.completions.create({
      model: chatSettings.model,
      messages,
      stream: false
    })

    // Respond with the result
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error: any) {
    let errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Perplexity API Key not found. Please set it in your profile settings."
    } else if (errorCode === 401) {
      errorMessage =
        "Perplexity API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: { "Content-Type": "application/json" }
    })
  }
}
