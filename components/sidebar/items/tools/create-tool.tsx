/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/rules-of-hooks */
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TextareaAutosize } from "@/components/ui/textarea-autosize"
import { TOOL_DESCRIPTION_MAX, TOOL_NAME_MAX } from "@/db/limits"
import { TablesInsert } from "@/supabase/types"
import { FC, useState, useEffect, useContext } from "react"
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { getConnectionWorkspacesByWorkspaceId } from "@/db/connections"
import { ChatbotUIContext } from "@/context/context"

interface Connection {
  image: string
  id: string
  name: string
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
  const [connectedAccountName, setConnectedAccountName] = useState("")
  const [dropdownOptions, setDropdownOptions] = useState<Connection[]>([])

  if (!profile || !selectedWorkspace) return null

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const connections = await getConnectionWorkspacesByWorkspaceId(
          selectedWorkspace?.id as string
        )
        const dropdownOptions = connections.connections.map(
          (connection: any) => ({
            id: connection.id,
            name: connection.name,
            image: connection.image || "" // set default image if image is null
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

  const handleDropdownChange = (id: string, name: string) => {
    setConnectedAccount(id) // Set the ID of the selected account
    setConnectedAccountName(name) // Set the name for display
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
          connection_id: connectedAccount
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
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Input
                  type="text"
                  placeholder={`Select Connected Account (${dropdownOptions.length} connections)`}
                  value={connectedAccountName}
                  onChange={e => setConnectedAccountName(e.target.value)}
                  readOnly={dropdownOptions.length === 0}
                  style={{
                    width: "20.9vw",
                    cursor:
                      dropdownOptions.length === 0 ? "not-allowed" : "pointer"
                  }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                style={{ width: "21vw", maxHeight: "20rem", overflowY: "auto" }}
              >
                {dropdownOptions.length === 0 ? (
                  <DropdownMenuItem disabled>
                    No connections available
                  </DropdownMenuItem>
                ) : (
                  dropdownOptions.map(option => (
                    <DropdownMenuItem
                      key={option.id}
                      onClick={() =>
                        handleDropdownChange(option.id, option.name)
                      }
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      {option.image && (
                        <img
                          src={option.image}
                          alt={option.name}
                          style={{
                            marginRight: "0.5rem",
                            width: "2rem",
                            height: "2rem"
                          }}
                        />
                      )}
                      <span>{option.name}</span>
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

export default CreateTool
