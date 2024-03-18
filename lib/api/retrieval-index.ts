import { ChatFile } from "@/types"
import { retrieve } from "./retrieval"

export const handleRetrieval = async (
  userInput: string,
  newMessageFiles: ChatFile[],
  chatFiles: ChatFile[],
  embeddingsProvider: "openai" | "local",
  sourceCount: number,
  user_id: string
) => {
  const requestBody = {
    userInput,
    fileIds: [...newMessageFiles, ...chatFiles].map(file => file.id),
    embeddingsProvider,
    sourceCount,
    user_id
  }

  console.log("Request Body Complete")

  const response = await retrieve({
    body: JSON.stringify(requestBody)
  })

  console.log("Retreival Response Complete")

  if (!response.ok) {
    console.error("Error retrieving:", response)
    // Handle error if needed
    return []
  }

  try {
    const { results } = await response.json()
    console.log("Results Retrieved")
    return results
  } catch (error) {
    console.error("Error parsing JSON:", error)
    // Handle error if needed
    return []
  }
}
