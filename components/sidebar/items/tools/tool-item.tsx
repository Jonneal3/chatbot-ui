/* eslint-disable @next/next/no-img-element */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { FC, useState, useEffect, useContext } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { IconTool } from "@tabler/icons-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { getConnectionWorkspacesByWorkspaceId } from "@/db/connections"
import { ChatbotUIContext } from "@/context/context"

interface AuthIntegration {
  image: string
  id: string
}

interface ConnectionWithIntegration {
  connection_id: string
  name: string
  integration: AuthIntegration
}

interface ToolItemProps {
  tool: Tables<"tools">
}

export const ToolItem: FC<ToolItemProps> = ({ tool }) => {
  const { selectedWorkspace } = useContext(ChatbotUIContext)
  const [name, setName] = useState(tool.name)
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState(tool.description)
  const [url, setUrl] = useState(tool.url)
  const [customHeaders, setCustomHeaders] = useState(
    tool.custom_headers as string
  )
  const [schema, setSchema] = useState(tool.schema as string)
  const [isRequestInBody, setIsRequestInBody] = useState(tool.request_in_body)
  const [connectedAccount, setConnectedAccount] = useState(
    tool.connection_id || ""
  )
  const [dropdownOptions, setDropdownOptions] = useState<
    ConnectionWithIntegration[]
  >([])

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await getConnectionWorkspacesByWorkspaceId(
          selectedWorkspace?.id as string
        )
        const dropdownOptions = await Promise.all(
          connections.connections.map(async connection => {
            // Fetch auth_integration data for each connection
            const integrationResponse = await fetchIntegrationData(
              connection.integration_id
            )
            return {
              connection_id: connection.id,
              name: connection.name,
              integration: integrationResponse
            }
          })
        )
        setDropdownOptions(dropdownOptions)
      } catch (error) {
        console.error("Error fetching connections:", error)
      }
    }

    fetchConnections()

    // Cleanup function
    return () => {
      // Perform cleanup if needed
    }
  }, [selectedWorkspace])

  const fetchIntegrationData = async (
    integrationKey: string
  ): Promise<AuthIntegration> => {
    try {
      // Fetch auth_integration data using integrationKey
      const response = await fetch(`/integrations/${integrationKey}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching auth_integration data:", error)
      return { image: "", id: "" } // Return default value if error occurs
    }
  }

  const handleDropdownChange = (value: string) => {
    setConnectedAccount(value)
  }

  return (
    <SidebarItem
      item={tool}
      isTyping={isTyping}
      contentType="tools"
      icon={<IconTool />}
      updateState={{
        name,
        description,
        url,
        custom_headers: customHeaders,
        schema,
        request_in_body: isRequestInBody,
        connection_id: connectedAccount // Include connectedAccount in updateState
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Tool name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TOOL_NAME_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Description</Label>

            <Input
              placeholder="Tool description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={TOOL_DESCRIPTION_MAX}
            />
          </div>

          <div className="space-y-1">
            <Label>Connected Accounts</Label>
            <div></div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Input
                  type="text"
                  placeholder={`Select Connected Account (${dropdownOptions.length} connections)`}
                  value={connectedAccount}
                  onChange={e => setConnectedAccount(e.target.value)}
                  readOnly={dropdownOptions.length === 0}
                  style={{
                    width: "20.9vw",
                    cursor:
                      dropdownOptions.length === 0 ? "not-allowed" : "pointer"
                  }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {dropdownOptions.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No connections available
                  </DropdownMenuItem>
                ) : (
                  dropdownOptions.map(option => (
                    <DropdownMenuItem
                      key={option.connection_id}
                      onClick={() => handleDropdownChange(option.connection_id)}
                      style={{
                        width: "20vw",
                        display: "flex",
                        alignItems: "center"
                      }}
                    >
                      <img
                        src={option.integration.image}
                        alt="Logo"
                        style={{
                          marginRight: "0.5rem",
                          width: "2rem",
                          height: "2rem"
                        }}
                      />
                      <span>{option.name}</span>{" "}
                      {/* Display connected account name */}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1">
            <Label>Custom Headers</Label>

            <TextareaAutosize
              placeholder={`{"X-api-key": "1234567890"}`}
              value={customHeaders}
              onValueChange={setCustomHeaders}
              minRows={1}
            />
          </div>

          <div className="space-y-1">
            <Label>Schema</Label>

            <TextareaAutosize
              placeholder={`{
                "openapi": "3.1.0",
                "info": {
                  "title": "Get weather data",
                  "description": "Retrieves current weather data for a location.",
                  "version": "v1.0.0"
                },
                "servers": [
                  {
                    "url": "https://weather.example.com"
                  }
                ],
                "paths": {
                  "/location": {
                    "get": {
                      "description": "Get temperature for a specific location",
                      "operationId": "GetCurrentWeather",
                      "parameters": [
                        {
                          "name": "location",
                          "in": "query",
                          "description": "The city and state to retrieve the weather for",
                          "required": true,
                          "schema": {
                            "type": "string"
                          }
                        }
                      ],
                      "deprecated": false
                    }
                  }
                },
                "components": {
                  "schemas": {}
                }
              }`}
              value={schema}
              onValueChange={setSchema}
              minRows={15}
            />
          </div>
        </>
      )}
    />
  )
}
