import { openapiToFunctions } from "@/lib/openapi-conversion"
import {
  checkApiKey,
  getServerProfile
} from "@/lib/server/serverless-chat-helpers"
import { Tables } from "@/supabase/types"
import { ChatSettings } from "@/types"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions"
import { createMessage } from "@/db/messages"
import { UUID } from "crypto"
import getOauthObject from "@/lib/get-integration"
import runPostProcessingFile from "@/lib/post-process"

export async function tools(
  assistant_id: string,
  user_id: string,
  body: string,
  chat_id: UUID,
  model: any
): Promise<any> {
  let json
  try {
    json = JSON.parse(body)
  } catch (error) {
    console.error("Error parsing JSON:", error)
    return // Return or handle the error appropriately
  }

  const { chatSettings, messages, selectedTools } = json as {
    chatSettings: ChatSettings
    messages: any[]
    selectedTools: Tables<"tools">[]
  }

  console.log("user_id_2", user_id)

  try {
    const profile = await getServerProfile(user_id)

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    let allTools: OpenAI.Chat.Completions.ChatCompletionTool[] = []
    let allRouteMaps = {}
    let schemaDetails = []

    for (const selectedTool of selectedTools) {
      const parsedSchema = JSON.parse(selectedTool.schema as string)
      console.log("parsed_schema", parsedSchema)

      const convertedSchema = await openapiToFunctions(
        JSON.parse(selectedTool.schema as string)
      )
      const tools = convertedSchema.functions || []
      allTools = allTools.concat(tools)

      const routeMap = convertedSchema.routes.reduce(
        (map: Record<string, string>, route) => {
          map[route.path.replace(/{(\w+)}/g, ":$1")] = route.operationId
          return map
        },
        {}
      )

      allRouteMaps = { ...allRouteMaps, ...routeMap }

      console.log("TOOL SELECTED", selectedTool)

      schemaDetails.push({
        title: convertedSchema.info.title,
        description: convertedSchema.info.description,
        url: convertedSchema.info.server,
        headers: selectedTool.custom_headers,
        post_process: selectedTool.post_process,
        connection_id: selectedTool.connection_id,
        routeMap,
        request_in_body: selectedTool.request_in_body
      })
    }

    const firstResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      tools: allTools
    })

    console.log("first response", firstResponse)

    const message = firstResponse.choices[0].message

    console.log("first response message", message)
    messages.push(message)

    const toolCalls = message.tool_calls || []

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const functionCall = toolCall.function
        const functionName = functionCall.name
        const argumentsString = functionCall.arguments.trim()
        let parsedArgs = JSON.parse(argumentsString)

        console.log("Function name:", functionName)
        console.log("Parsed arguments:", parsedArgs)
        console.log("Function call:", functionCall)

        const schemaDetail = schemaDetails.find(detail =>
          Object.values(detail.routeMap).includes(functionName)
        )

        console.log("Schema details:", schemaDetail)

        if (schemaDetail && schemaDetail.post_process !== null) {
          const finalFunc = await runPostProcessingFile(
            parsedArgs,
            schemaDetail
          )
          console.log("Post-processing metadata found:", finalFunc)
          parsedArgs = finalFunc
        } else {
          console.log(
            "No post-processing metadata found. Continuing with function:",
            functionName
          )
        }

        if (!schemaDetail) {
          throw new Error(`Function ${functionName} not found in any schema`)
        }

        const pathTemplate = Object.keys(schemaDetail.routeMap).find(
          key => schemaDetail.routeMap[key] === functionName
        )

        if (!pathTemplate) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        const path = pathTemplate.replace(/:(\w+)/g, (_, paramName) => {
          const value = parsedArgs.parameters[paramName]
          if (!value) {
            throw new Error(
              `Parameter ${paramName} not found for function ${functionName}`
            )
          }
          return encodeURIComponent(value)
        })

        if (!path) {
          throw new Error(`Path for function ${functionName} not found`)
        }

        const isRequestInBody = schemaDetail.request_in_body
        let data = {}

        if (isRequestInBody) {
          let headers = {
            "Content-Type": "application/json"
          }

          const customHeaders = schemaDetail.headers
          let auth: Record<string, any> = {}

          console.log("schema_detail", schemaDetail)

          if (schemaDetail.connection_id) {
            auth = (await getOauthObject(schemaDetail.connection_id)) as Record<
              string,
              any
            >
          }

          console.log("AUTH2", auth)

          if (customHeaders && typeof customHeaders === "string") {
            let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
              string,
              string
            >

            for (let key in parsedCustomHeaders) {
              if (parsedCustomHeaders[key].includes("${token}")) {
                parsedCustomHeaders[key] = parsedCustomHeaders[key].replace(
                  "${token}",
                  auth.data.credentials.access_token
                )
              }
            }

            headers = {
              ...headers,
              ...parsedCustomHeaders
            }
          }

          console.log("final_headers", headers)

          const fullUrl = schemaDetail.url + path

          const bodyContent = parsedArgs.requestBody || parsedArgs
          console.log("body-content", bodyContent)

          const requestInit = {
            method: "POST",
            headers,
            body: JSON.stringify(bodyContent)
          }

          const response = await fetch(fullUrl, requestInit)

          console.log("URL", fullUrl)
          console.log("REQ-INIT", requestInit)

          if (!response.ok) {
            const errorBody = await response.text()
            console.log(
              "API request result - Error",
              response.statusText,
              errorBody
            )
            data = {
              error: response.statusText
            }
          } else {
            data = await response.json()
            console.log("API request result - Success", data)
          }
        } else {
          const queryParams = new URLSearchParams(
            parsedArgs.parameters
          ).toString()
          const fullUrl =
            schemaDetail.url + path + (queryParams ? "?" + queryParams : "")

          let headers = {}

          const customHeaders = schemaDetail.headers
          let auth: Record<string, any> = {}

          if (schemaDetail.connection_id) {
            auth = (await getOauthObject(schemaDetail.connection_id)) as Record<
              string,
              string
            >
          }

          console.log("auth", auth)

          if (customHeaders && typeof customHeaders === "string") {
            let parsedCustomHeaders = JSON.parse(customHeaders) as Record<
              string,
              string
            >

            for (let key in parsedCustomHeaders) {
              if (parsedCustomHeaders[key].includes("${token}")) {
                parsedCustomHeaders[key] = parsedCustomHeaders[key].replace(
                  "${token}",
                  auth.data.credentials.access_token
                )
              }
            }

            headers = {
              ...headers,
              ...parsedCustomHeaders
            }
          }

          console.log("final_headers", headers)

          const response = await fetch(fullUrl, {
            method: "GET",
            headers: headers
          })
          console.log("URL", fullUrl)

          if (!response.ok) {
            const errorBody = await response.text()
            console.log(
              "API request failed with status:",
              response.statusText,
              "Error body:",
              errorBody
            )
            data = {
              error: response.statusText
            }
            console.log("Error data for GET request:", data)
          } else {
            data = await response.json()
            console.log("Successful GET request, data received:", data)
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: functionName,
            content: JSON.stringify(data)
          })
        }
      }
    }

    console.log("messages", messages)

    const secondResponse = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages,
      stream: false
    })

    console.log("response2", secondResponse.choices[0].message.content)

    const message2 = await createMessage({
      chat_id: chat_id,
      assistant_id: assistant_id,
      user_id: user_id,
      content: secondResponse.choices[0].message.content || "",
      role: "assistant",
      image_paths: [],
      model: model,
      sequence_number: 1
    })

    console.log(message2)

    return secondResponse
  } catch (error: any) {
    console.error(error)
    const errorMessage = error.error?.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}

export default tools
