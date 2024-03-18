function runPostProcessingFile(parsedArgs: any, schemaDetails: any): any {
  // Iterate through schemaDetails metadata
  for (const [key, value] of Object.entries(schemaDetails.post_process)) {
    console.log("Key:", key)
    console.log("Value:", value)
    // Check if the key exists in the function call arguments
    if (
      parsedArgs.hasOwnProperty("parameters") &&
      parsedArgs.parameters.hasOwnProperty(key)
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
        // Add other cases for different conversions if needed
      }
    }
  }

  // Return the updated parsedArgs
  return parsedArgs
}

export default runPostProcessingFile
