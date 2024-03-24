/* eslint-disable react-hooks/rules-of-hooks */
import { buildFinalMessages } from "@/lib/build-prompt"
import { ChatMessage, ChatPayload, ChatSettings, ModelProvider } from "@/types"
import { LLMID } from "@/types/llms"
import { MessageImage } from "@/types/images/message-image"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { getMessagesByChatId } from "@/db/messages" // Import the function to retrieve messages by chat ID
import {
  getAssistantById,
  getAssistantWorkspacesByAssistantId
} from "@/db/assistants"
import { createMessage } from "@/db/messages"
import { handleRetrieval } from "@/lib/api/retrieval-index"
import { tools } from "@/lib/api/tools"
import { getProfileByUserId } from "@/db/profile"
import {
  fetchHostedModels,
  fetchOpenRouterModels
} from "@/lib/models/api/fetch-models"
import { OpenRouterLLM, LLM } from "@/types"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { Dispatch, SetStateAction } from "react"
import { Tables } from "@/supabase/types"
import { handleHostedChat } from "@/components/chat/chat-helpers/api/index"
import { getModelWorkspacesByWorkspaceId } from "@/db/models"
import { VALID_ENV_KEYS } from "@/types/valid-keys"

const isRegeneration: boolean = false
const newAbortController: AbortController = new AbortController()
const newMessageImages: MessageImage[] = []
const setChatMessages: Dispatch<SetStateAction<ChatMessage[]>> = () => [] // Placeholder function
const setToolInUse: Dispatch<SetStateAction<string>> = () => [] // Placeholder function

export const runFunction = async (
  assistant_id: any,
  chat_id: any,
  user_id: any,
  content: any
) => {
  // Assistant
  const assistant = await getAssistantById(assistant_id)
  const profile = await getProfileByUserId(user_id)

  console.log("assistant", assistant)

  // Add Message
  const message = await createMessage({
    chat_id: chat_id,
    user_id: user_id,
    assistant_id,
    content: content,
    role: "user",
    image_paths: [],
    model: assistant.model, // Default value is an empty string
    sequence_number: 1,
    source: "api"
  })

  const model = assistant.model as LLMID

  // GET MODELS
  const workspace = await getAssistantWorkspacesByAssistantId(assistant_id)
  const workspaceModels = await getModelWorkspacesByWorkspaceId(
    workspace.workspaces[0].id
  )
  const models = workspaceModels.models

  console.log("models", models)

  // Initialize state for available local models
  const envKeyMap: Record<string, VALID_ENV_KEYS> = {}
  const availableHostedModels: LLM[] = []
  const availableLocalModels: LLM[] = []
  const availableOpenRouterModels: OpenRouterLLM[] = []

  console.log("Initialized variables: ")
  console.log("envKeyMap:", envKeyMap)
  console.log("availableHostedModels:", availableHostedModels)
  console.log("availableLocalModels:", availableLocalModels)
  console.log("availableOpenRouterModels:", availableOpenRouterModels)

  if (profile) {
    console.log("profile found")
    const hostedModelRes = await fetchHostedModels(profile)
    if (!hostedModelRes) return

    console.log("hosted_models", hostedModelRes)

    // Assign values to the declared variables directly
    Object.assign(envKeyMap, hostedModelRes.envKeyMap)
    availableHostedModels.push(...hostedModelRes.hostedModels)

    console.log("After fetching hosted models: ")

    if (
      profile["openrouter_api_key"] ||
      hostedModelRes.envKeyMap["openrouter"]
    ) {
      const openRouterModels = await fetchOpenRouterModels()
      if (!openRouterModels) return

      // Ensure each model conforms to the OpenRouterLLM interface before pushing to the array
      openRouterModels.forEach((model: any) => {
        const formattedModel: OpenRouterLLM = {
          modelId: model.modelId,
          modelName: model.modelName,
          provider: model.provider,
          hostedId: model.hostedId,
          platformLink: model.platformLink,
          imageInput: model.imageInput,
          maxContext: model.maxContext // Additional property for OpenRouterLLM
        }
        availableOpenRouterModels.push(formattedModel)
      })

      console.log("After fetching open router models: ")
      console.log("availableOpenRouterModels:", availableOpenRouterModels)
    }
  }

  // Tools
  const assistantTools = (await getAssistantToolsByAssistantId(assistant_id))
    .tools
  console.log("Tools", "tools")

  // Files
  let allFiles = []

  const assistantFiles = (await getAssistantFilesByAssistantId(assistant_id))
    .files
  allFiles = [...assistantFiles]
  const assistantCollections = (
    await getAssistantCollectionsByAssistantId(assistant_id)
  ).collections
  for (const collection of assistantCollections) {
    const collectionFiles = (
      await getCollectionFilesByCollectionId(collection.id)
    ).files
    allFiles = [...allFiles, ...collectionFiles]
  }

  console.log("All Files", "tools")

  const selectedTools = assistantTools
  const setChatFiles = allFiles.map(file => ({
    id: file.id,
    name: file.name,
    type: file.type,
    file: null
  }))

  console.log("Chat Files", "files")
  console.log("Selected Tools", "files")

  // Extract chatSettings from assistant
  const chatSettings: ChatSettings | null = assistant
    ? {
        model: assistant.model as LLMID,
        prompt: assistant.prompt,
        temperature: assistant.temperature,
        contextLength: assistant.context_length,
        includeProfileContext: assistant.include_profile_context,
        includeWorkspaceInstructions: assistant.include_workspace_instructions,
        embeddingsProvider: assistant.embeddings_provider as "openai" | "local"
      }
    : null

  // GET MODELS API
  const modelData = [
    ...models.map(
      (model: {
        api_key: string
        base_url: string
        context_length: number
        created_at: string
        description: string
        folder_id: string | null
        id: string
        model_id: string
        name: string
        sharing: string
        updated_at: string | null
        user_id: string
      }) => ({
        modelId: model.model_id as LLMID,
        modelName: model.name,
        provider: "custom" as ModelProvider,
        hostedId: model.id,
        platformLink: "",
        imageInput: false
      })
    ),
    ...LLM_LIST,
    ...availableLocalModels,
    ...availableOpenRouterModels
  ].find(llm => llm.modelId === chatSettings?.model)

  console.log("Final model data:", modelData)
  console.log("Chat Settings", "files")

  // Retrieve the items from the knowledge
  const userInput: string = content
  const rawMessages = await getMessagesByChatId(chat_id) // Retrieve messages by chat ID

  // Format raw messages to match the ChatMessage interface
  const chatMessages: ChatMessage[] = rawMessages.map(message => ({
    message: {
      chat_id: message.chat_id,
      assistant_id: assistant_id,
      content: message.content,
      metadata: message.metadata,
      source: message.source,
      created_at: message.created_at,
      id: message.id,
      image_paths: message.image_paths,
      model: message.model,
      role: message.role,
      sequence_number: message.sequence_number,
      updated_at: message.updated_at,
      user_id: message.user_id
    },
    fileItems: [] // You can populate this if needed
  }))

  const chatImages: MessageImage[] = []
  const sourceCount = 1

  const retrievedFileItems = await handleRetrieval(
    userInput,
    [],
    setChatFiles,
    chatSettings ? chatSettings.embeddingsProvider : "openai", // Provide a default value if embeddingsProvider is not available
    sourceCount,
    user_id
  )

  console.log("items retrieved")

  // Prepare payload
  const payload: ChatPayload = {
    chatSettings: chatSettings!,
    workspaceInstructions: "",
    chatMessages: chatMessages,
    assistant: assistant_id,
    messageFileItems: retrievedFileItems,
    chatFileItems: []
  }

  console.log("payload complete")

  let generatedText = ""

  // Make a tools request
  if (selectedTools.length > 0 && payload.chatSettings) {
    const formattedMessages = await buildFinalMessages(
      payload,
      profile!,
      chatImages
    )

    console.log("user_id-main", user_id)

    const requestBody = {
      user_id,
      body: JSON.stringify({
        chatSettings: payload.chatSettings,
        messages: formattedMessages,
        selectedTools
      })
    }

    const response = await tools(
      assistant_id,
      requestBody.user_id,
      requestBody.body,
      chat_id,
      model
    )

    generatedText = response

    console.log("response FINAL", response)
  }
  // MAKE A NON-TOOL RELATED CHAT REQUEST
  else {
    const hostedChatResponse = await handleHostedChat(
      payload,
      profile!,
      modelData!,
      isRegeneration,
      newAbortController,
      newMessageImages,
      chatImages,
      setChatMessages,
      setToolInUse
    )

    generatedText = hostedChatResponse.response

    const message2 = await createMessage({
      chat_id: chat_id,
      assistant_id: assistant_id,
      user_id: user_id,
      content: hostedChatResponse.response.choices[0].message.content || "",
      role: "assistant",
      image_paths: [],
      model: model,
      sequence_number: 1
    })
  }

  return generatedText
}

export default runFunction
