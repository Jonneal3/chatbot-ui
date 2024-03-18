import { buildFinalMessages } from "@/lib/build-prompt"
import { ChatMessage, ChatPayload, ChatSettings } from "@/types"
import { LLMID } from "@/types/llms"
import { MessageImage } from "@/types/images/message-image"
import { getAssistantCollectionsByAssistantId } from "@/db/assistant-collections"
import { getAssistantFilesByAssistantId } from "@/db/assistant-files"
import { getAssistantToolsByAssistantId } from "@/db/assistant-tools"
import { getCollectionFilesByCollectionId } from "@/db/collection-files"
import { getMessagesByChatId } from "@/db/messages" // Import the function to retrieve messages by chat ID
import { getAssistantById } from "@/db/assistants"
import { createMessage } from "@/db/messages"
import { handleRetrieval } from "@/lib/api/retrieval-index"
import { tools } from "@/lib/api/tools"
import { getProfileByUserId } from "@/db/profile"

export const runFunction = async (
  assistant_id: any,
  chat_id: any,
  user_id: any,
  content: any
) => {
  // Assistant
  const assistant = await getAssistantById(assistant_id)

  console.log(assistant)

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

  console.log("Chat Settings", "files")

  // Retrieve the items from the knowledge
  const userInput: string = content
  const profile = await getProfileByUserId(user_id)
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

  console.log("Chat Messages", chatMessages)

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

  // Make a tools request
  if (selectedTools.length > 0 && payload.chatSettings) {
    const formattedMessages = await buildFinalMessages(
      payload,
      profile!,
      chatImages
    )

    console.log("user_id", "userId")

    const requestBody = {
      user_id,
      body: JSON.stringify({
        chatSettings: payload.chatSettings,
        messages: formattedMessages,
        selectedTools
      })
    }

    const response = await tools(
      requestBody.user_id,
      assistant_id,
      requestBody.body,
      chat_id,
      model
    )

    console.log("response FINAL", response)

    return response // Return the allFiles array
  }
}

export default runFunction
