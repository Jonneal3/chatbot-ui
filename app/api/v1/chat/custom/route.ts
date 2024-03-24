import { Database } from "@/supabase/types"
import { ChatSettings } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, user_id, customModelId } = json as {
    chatSettings: ChatSettings
    messages: any[]
    user_id: any
    customModelId: string
  }

  try {
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: customModel, error } = await supabaseAdmin
      .from("models")
      .select("*")
      .eq("id", customModelId)
      .single()

    if (error || !customModel) {
      throw new Error(error?.message || "Custom model not found")
    }

    const custom = new OpenAI({
      apiKey: customModel.api_key || "",
      baseURL: customModel.base_url || ""
    })

    const response = await custom.chat.completions.create({
      model: customModel.model_id as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      max_tokens:
        chatSettings.model === "gpt-4-vision-preview" ? 4096 : undefined,
      stream: false
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
        "Custom API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Custom API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode,
      headers: { "Content-Type": "application/json" }
    })
  }
}
