import { ChatMessage, ChatPayload, LLM, MessageImage } from "@/types"
import { Database, Tables } from "@/supabase/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import {
  buildGoogleGeminiFinalMessages,
  buildFinalMessages
} from "@/lib/build-prompt"

export const handleHostedChat = async (
  payload: ChatPayload,
  profile: Tables<"profiles">,
  modelData: LLM,
  isRegeneration: boolean,
  newAbortController: AbortController,
  newMessageImages: MessageImage[],
  chatImages: MessageImage[],
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
  setToolInUse: React.Dispatch<React.SetStateAction<string>>
) => {
  const provider =
    modelData.provider === "openai" && profile.use_azure_openai
      ? "azure"
      : modelData.provider

  console.log("provider", provider)

  const user_id = profile.user_id
  console.log("user_id checkpoint 1", user_id)

  let formattedMessages = []

  if (provider === "google") {
    formattedMessages = await buildGoogleGeminiFinalMessages(
      payload,
      profile,
      newMessageImages
    )
  } else {
    formattedMessages = await buildFinalMessages(payload, profile, chatImages)
  }

  const apiEndpoint =
    provider === "custom"
      ? `${process.env.SITE_URL}/api/v1/chat/custom`
      : `${process.env.SITE_URL}/api/v1/chat/${provider}`

  const requestBody = {
    chatSettings: payload.chatSettings,
    user_id: user_id,
    messages: formattedMessages,
    customModelId: provider === "custom" ? modelData.hostedId : ""
  }

  console.log("chat request:", requestBody)
  console.log("apiEndpoint555:", apiEndpoint)
  console.log("newAbortController:", newAbortController)

  const response = await fetchChatResponse(
    apiEndpoint,
    requestBody,
    true,
    newAbortController
  )

  console.log("response", response)

  // Return the response and any other necessary data
  return { response, formattedMessages }
}

export const fetchChatResponse = async (
  url: string,
  body: object,
  isHosted: boolean,
  controller: AbortController
) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      signal: controller.signal
    })

    // Extract JSON content from the response
    const responseData = await response.json()

    console.log("RESPONSE 2134", responseData) // Now responseData contains the full GPT-like response

    if (!response.ok) {
      // If response status is not OK (2xx), handle the error
      let errorMessage = "An error occurred while fetching the chat response."

      // Check specific error cases
      if (response.status === 404 && !isHosted) {
        // If the response status is 404 and it's not a hosted environment
        errorMessage = "Chat endpoint not found."
      } else {
        // For other error statuses, try to parse the error response body
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          } else {
            errorMessage = `Error: ${response.statusText}`
          }
        } catch (error) {
          // If there's an error parsing JSON, handle it gracefully
          errorMessage = "Invalid server response format."
        }
      }

      // Throw an error with the appropriate message
      throw new Error(errorMessage)
    }

    // If response is OK, return the response
    return responseData
  } catch (error) {
    // Handle any network errors or exceptions during fetch
    throw new Error(
      `Fetch error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
    )
  }
}

export function checkApiKey(apiKey: string | null, keyName: string) {
  if (apiKey === null || apiKey === "") {
    throw new Error(`${keyName} API Key not found`)
  }
}
