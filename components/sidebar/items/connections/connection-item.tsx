import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONNECTION_NAME_MAX } from "@/db/limits"
import { Tables, TablesUpdate } from "@/supabase/types"
import { IconArrowsExchange } from "@tabler/icons-react"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

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
      icon={<IconArrowsExchange height={30} width={30} />}
      updateState={
        {
          name
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
