/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { ChatbotUIContext } from "@/context/context"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useContext, useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { getConnectionWorkspacesByWorkspaceId } from "@/db/connections"

interface AuthIntegration {
  image: string
  id: string
}

interface ConnectionWithIntegration {
  connection_id: string
  name: string
  auth_integration: AuthIntegration
}

interface CreateToolProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateTool: FC<CreateToolProps> = ({ isOpen, onOpenChange }) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)

  const [name, setName] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [customHeaders, setCustomHeaders] = useState("")
  const [schema, setSchema] = useState("")
  const [isRequestInBody, setIsRequestInBody] = useState(true)
  const [connectedAccount, setConnectedAccount] = useState("")
  const [dropdownOptions, setDropdownOptions] = useState<
    ConnectionWithIntegration[]
  >([])

  if (!profile || !selectedWorkspace) return null

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await getConnectionWorkspacesByWorkspaceId(
          selectedWorkspace?.id as string
        )
        const dropdownOptions = await Promise.all(
          (
            connections.connections as unknown as {
              name: string
              created_at: string
              id: string
              auth_integration_id: string
              user_id: string
              metadata: any
            }[]
          ).map(async connection => {
            // Fetch auth_integration data for each connection
            const integrationResponse = await fetchIntegrationData(
              connection.auth_integration_id
            )
            return {
              connection_id: connection.id,
              name: connection.name,
              auth_integration: integrationResponse
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
      const response = await fetch(`/api/auth_integrations/${integrationKey}`)
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
    <SidebarCreateItem
      contentType="tools"
      createState={
        {
          user_id: profile.user_id,
          name,
          description,
          url,
          custom_headers: customHeaders,
          schema,
          request_in_body: isRequestInBody,
          connection_id: connectedAccount // Include connectedAccount in createState
        } as TablesInsert<"tools">
      }
      isOpen={isOpen}
      isTyping={isTyping}
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
                        src={option.auth_integration.image}
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
      onOpenChange={onOpenChange}
    />
  )
}
