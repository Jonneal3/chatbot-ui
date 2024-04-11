import { getChatById } from "@/db/chats"

// Define the BodyContent interface
interface BodyContent {
  [key: string]: string | boolean
}

// Define the type for metadata
interface Metadata {
  [key: string]: JSON | undefined
}

export async function processBodyContent(
  chat_id: string,
  body_content: BodyContent
): Promise<BodyContent> {
  const dynamicKeys: string[] = []

  // Await the promise to get chat metadata
  const chatMetadata = await getChatById(chat_id)
  const body_content1 = body_content // Assign body_content to body_content1

  const pattern = /\${chats.metadata\.(\w+)}/
  for (const value of Object.values(body_content1)) {
    if (typeof value === "string" && pattern.test(value)) {
      const match = value.match(pattern)
      if (match) {
        const key = match[1] // Extract the part after 'chats.metadata.'
        dynamicKeys.push(key)
      }
    }
  }

  console.log("DYNAMIC KEYS", dynamicKeys)
  // Initialize an empty object to store matched metadata
  const matchedMetadata: { [key: string]: string | boolean } = {}

  // Check if both dynamicKeys and chatMetadata have items
  if (dynamicKeys.length > 0 && chatMetadata && chatMetadata.metadata) {
    // Type assertion for metadata
    const typedMetadata = chatMetadata.metadata as Metadata

    console.log("typedMetadata", typedMetadata)

    // Loop through matched dynamic keys
    for (const key of dynamicKeys) {
      // Ensure the dynamic key exists in the metadata
      if (key in typedMetadata) {
        console.log("key exists")
        // Get the value from the metadata
        const value = typedMetadata[key]
        // Check if the value is not undefined and is of type string or boolean
        if (
          value !== undefined &&
          (typeof value === "string" || typeof value === "boolean")
        ) {
          // Replace the dynamic key in body_content1 with the matched value
          Object.entries(body_content1).forEach(([bodyKey, bodyValue]) => {
            if (
              typeof bodyValue === "string" &&
              bodyValue.includes(`\${chats.metadata.${key}}`)
            ) {
              body_content1[bodyKey] = bodyValue.replace(
                `\${chats.metadata.${key}}`,
                value as string
              )
            }
          })
        }
      }
    }

    // Return the updated body_content1 if there are matched items
    return body_content1
  } else {
    // Return an error if no items in dynamicKeys were matched or if chatMetadata is empty
    throw new Error("No matched items found in metadata or metadata is empty")
  }
}
