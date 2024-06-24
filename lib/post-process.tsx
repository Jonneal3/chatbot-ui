import { getChatById } from "@/db/chats"
import moment from "moment-timezone"

// Define a type for the metadata object
interface ChatMetadata {
  timezone?: string
  // Add other properties as needed
}

async function runPostProcessingFile(
  parsedArgs: any,
  schemaDetails: any,
  chat_id: any
): Promise<any> {
  // Get chat metadata
  const chatMetadata = await getChatById(chat_id)

  // Ensure chatMetadata and chatMetadata.metadata are not null
  const metadata: ChatMetadata = (chatMetadata?.metadata as ChatMetadata) || {}

  for (const [key, value] of Object.entries(schemaDetails.post_process)) {
    console.log("Key:", key)
    console.log("Value:", value)

    if (
      (parsedArgs.hasOwnProperty("parameters") &&
        parsedArgs.parameters &&
        parsedArgs.parameters.hasOwnProperty(key)) ||
      (parsedArgs.hasOwnProperty("requestBody") &&
        parsedArgs.requestBody &&
        parsedArgs.requestBody &&
        parsedArgs.requestBody.hasOwnProperty(key))
    ) {
      console.log("Key exists in function call arguments")

      // Perform conversion based on the value
      switch (value) {
        case "timestamp":
          console.log("Converting to timestamp")
          // Convert the value to timestamp format
          parsedArgs.parameters[key] = new Date(
            parsedArgs.parameters[key]
          ).getTime()
          console.log("Converted value:", parsedArgs.parameters[key])
          break
        case "format":
          console.log("Formatting timezone using Moment.js")
          // Extract timezone from chat metadata if it exists
          let timezone = "Australia/Sydney" // Default timezone
          if (metadata.timezone) {
            timezone = metadata.timezone
          }
          // Apply timezone offset without converting time
          if (
            parsedArgs.requestBody &&
            parsedArgs.requestBody[key] !== undefined &&
            parsedArgs.requestBody[key] !== null
          ) {
            const originalTime = moment(parsedArgs.requestBody[key])
            const formattedTime = originalTime.format("YYYY-MM-DD HH:mm:ss")
            const timezoneOffset = originalTime.clone().tz(timezone).format("Z") // Get timezone offset
            const formattedTimezone = formattedTime + timezoneOffset // Append timezone offset
            parsedArgs.requestBody[key] = formattedTimezone
            console.log(`Formatted timezone (${timezone}):`, formattedTimezone)
          } else {
            console.log("Value is empty, cannot format timezone")
          }
          break

        // Add other cases for different conversions if needed
      }
    } else {
      console.log("Key does not exist in function call arguments")
    }
  }

  // Return the updated parsedArgs
  return parsedArgs
}

export default runPostProcessingFile
