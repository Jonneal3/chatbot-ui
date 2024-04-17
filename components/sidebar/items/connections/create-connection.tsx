import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { Input } from "@/components/ui/input"
import { ChatbotUIContext } from "@/context/context"
import { FC, useContext, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import {
  createConnection,
  getConnectionWorkspacesByWorkspaceId
} from "@/db/connections"
import Nango from "@nangohq/frontend"

const publicKey = process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY_PROD || ""

if (!publicKey) {
  throw new Error(
    "NEXT_PUBLIC_NANGO_SECRET_KEY_PROD is not defined in the environment variables."
  )
}

const nango = new Nango({ publicKey })

interface Integration {
  id: string
  name: string
  image: string | null
}

interface CreateConnectionProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateConnection: FC<CreateConnectionProps> = ({
  isOpen,
  onOpenChange
}) => {
  const { profile, selectedWorkspace, integrations, setConnections } =
    useContext(ChatbotUIContext) // Include setConnections from context
  const [searchQuery, setSearchQuery] = useState<string>("")

  const handleConnect = async (integration: Integration) => {
    const connectionId = uuidv4()

    if (!profile || !selectedWorkspace) return null

    try {
      const result = await nango.auth(integration.id, connectionId)
      const createdConnection = await createConnection(
        {
          id: result.connectionId,
          integration_id: result.providerConfigKey,
          sharing: "private",
          user_id: profile.user_id,
          metadata: {},
          name: `${profile.display_name}'s ${result.providerConfigKey} Connection`,
          folder_id: null,
          image: integration.image
        },
        selectedWorkspace.id,
        profile.user_id
      )

      // Fetch updated connections after adding a new one
      const updatedConnections = await getConnectionWorkspacesByWorkspaceId(
        selectedWorkspace.id
      )
      setConnections(updatedConnections.connections) // Update context variable with the updated list of connections
    } catch (error) {
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
            <ul className="space-y-2">
              {integrations
                .filter(integration =>
                  integration.name
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map(integration => (
                  <li key={integration.id} className="relative">
                    <button
                      className="flex w-full items-center justify-between rounded-md bg-transparent px-4 py-2 transition-opacity hover:opacity-70 focus:outline-none"
                      onClick={() => handleConnect(integration)}
                    >
                      <div className="flex items-center space-x-2">
                        {integration.image && (
                          <img
                            src={integration.image}
                            alt={integration.name}
                            className="size-10 rounded-full object-contain"
                          />
                        )}
                        <span>{integration.name}</span>
                      </div>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </>
      )}
      isTyping={false}
      createState={undefined}
      contentType={"connections"}
    />
  )
}
