/* eslint-disable @next/next/no-img-element */
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useEffect, useState } from "react"
import { getAllActiveIntegrations } from "@/db/integrations"
import Nango from "@nangohq/frontend"
import { ScrollArea } from "@radix-ui/react-scroll-area"
import { v4 as uuidv4 } from "uuid" // Import uuidv4 from 'uuid'
import { createConnection } from "@/db/connections"

// Get the public key from environment variables
const publicKey = process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY_PROD || ""

// Check if the public key is defined
if (!publicKey) {
  throw new Error(
    "NEXT_PUBLIC_NANGO_SECRET_KEY_PROD is not defined in the environment variables."
  )
}

// Create a new instance of Nango with the public key
const nango = new Nango({
  publicKey
})

interface CreateConnectionProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

interface Integration {
  id: string
  unique_key: string
  name: string
  image: string
}

export const CreateConnection: FC<CreateConnectionProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const [authIntegrations, setAuthIntegrations] = useState<Integration[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const fetchAuthIntegrations = async () => {
      if (!selectedWorkspace) return

      try {
        const integrations = await getAllActiveIntegrations()
        const formattedIntegrations: Integration[] = integrations.map(
          integration => ({
            ...integration,
            id: integration.id,
            image: integration.image,
            unique_key: "" // Add the unique_key property here
          })
        )
        setAuthIntegrations(formattedIntegrations)
      } catch (error) {
        console.error(
          "Error fetching auth integrations:",
          (error as Error).message
        )
      }
    }

    fetchAuthIntegrations()
  }, [selectedWorkspace])

  const filteredIntegrations = authIntegrations.filter(integration =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleConnect = async (integration: Integration) => {
    const connectionId: string = uuidv4() // Generate random UUID for connectionId

    if (!profile || !selectedWorkspace) return null

    try {
      const result = await nango.auth(integration.id, connectionId)
      console.log("Connection created:", result)

      console.log("Connection data:")
      console.log("id:", result.connectionId)
      console.log("integration_id:", result.providerConfigKey)
      console.log("user_id:", profile.user_id)
      console.log("metadata:", {})
      console.log(
        "name:",
        `${profile.display_name}'s ${result.providerConfigKey} Connection`
      )
      console.log("folder_id:", null) // or the actual folder ID if available
      console.log("Selected workspace ID:", selectedWorkspace.id)
      console.log("Profile user ID:", profile.user_id)

      const CreateConnection = await createConnection(
        {
          id: result.connectionId,
          integration_id: result.providerConfigKey,
          sharing: "private",
          user_id: profile.user_id, // Provide the actual user ID here
          metadata: {}, // Provide any metadata if needed, otherwise use an empty object
          name: `${profile.display_name}'s ${result.providerConfigKey} Connection`, // Provide a name for the connection
          folder_id: null // Provide the folder ID if available, otherwise omit or provide NULL
        },
        selectedWorkspace.id, // Provide the actual workspace ID here
        profile.user_id // Provide the actual user ID here
      )
    } catch (error) {
      // Handle errors
      console.error("Error:", error)
    }
  }

  return (
    <SidebarCreateItem
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      renderInputs={() => (
        <>
          <div className="space-y-4">
            <Input
              placeholder="Search integration"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <ScrollArea className="max-h-[80vh] overflow-y-auto">
              <ul className="space-y-2">
                {filteredIntegrations.map(integration => (
                  <li key={integration.id} className="relative">
                    <button
                      className={`flex w-full items-center justify-between rounded-md bg-transparent px-4 py-2 transition-opacity hover:opacity-70 focus:outline-none`}
                      onClick={() => handleConnect(integration)}
                    >
                      <div className="flex items-center space-x-2">
                        <img
                          src={integration.image}
                          alt={integration.name}
                          className="size-10 rounded-full object-contain"
                        />
                        <span>{integration.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </>
      )}
      isTyping={false}
      createState={undefined}
      contentType={"connections"}
    />
  )
}
