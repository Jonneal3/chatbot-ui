import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONNECTION_NAME_MAX } from "@/db/limits"
import { Tables, TablesUpdate } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "@/components/sidebar/items/all/sidebar-display-item"
import { IconArrowsSort } from "@tabler/icons-react"

interface ConnectionItemProps {
  connection: Tables<"connections">
}

export const ConnectionItem: FC<ConnectionItemProps> = ({ connection }) => {
  const [isTyping, setIsTyping] = useState(false)
  const [name, setName] = useState(connection.name)

  return (
    <SidebarItem
      item={connection}
      isTyping={isTyping}
      contentType="connections"
      icon={<IconArrowsSort height={26} width={26} />}
      updateState={
        {
          id: connection.id,
          name,
          integration_id: connection.integration_id,
          user_id: connection.user_id,
          metadata: connection.metadata
        } as TablesUpdate<"connections">
      }
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>

            <Input
              placeholder="Connection name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={CONNECTION_NAME_MAX}
            />
          </div>
        </>
      )}
    />
  )
}
