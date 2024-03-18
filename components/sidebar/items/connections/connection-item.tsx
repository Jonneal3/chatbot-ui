import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONNECTION_NAME_MAX } from "@/db/limits"
import { Tables, TablesUpdate } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import { IconArrowsSort } from "@tabler/icons-react"

interface ConnectionItemProps {
  connection: Tables<"connections">
}

export const ConnectionItem: FC<ConnectionItemProps> = ({ connection }) => {
  const [isTyping, setIsTyping] = useState(false)
  const [name, setName] = useState(connection.name || "") // Initialize with connection name or empty string

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    setIsTyping(true) // Set isTyping to true when typing
  }

  return (
    <SidebarItem
      item={connection}
      isTyping={isTyping}
      contentType="connections"
      icon={<IconArrowsSort height={26} width={26} />}
      updateState={{ name } as TablesUpdate<"connections">} // Update only the name field
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="Connection name..."
              value={name}
              onChange={handleNameChange}
              maxLength={CONNECTION_NAME_MAX}
            />
          </div>
        </>
      )}
    />
  )
}
