import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CONNECTION_NAME_MAX } from "@/db/limits"
import { Tables, TablesUpdate } from "@/supabase/types"
import { IconArrowsExchange, IconCopy } from "@tabler/icons-react"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"
import Image from "next/image"
import { ToastProvider, Toast } from "@radix-ui/react-toast"

interface ConnectionItemProps {
  connection: Tables<"connections">
}

export const ConnectionItem: FC<ConnectionItemProps> = ({ connection }) => {
  const [isTyping, setIsTyping] = useState(false)
  const [name, setName] = useState(connection.name)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(connection.id)
    // You can show the toast here
  }

  return (
    <ToastProvider>
      <SidebarItem
        item={connection}
        isTyping={isTyping}
        contentType="connections"
        icon={
          connection.image ? (
            <img
              src={connection.image}
              alt="Connection Icon"
              className="mr-3 size-6"
            />
          ) : (
            <IconArrowsExchange height={30} width={30} />
          )
        }
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
            <div className="space-y-1">
              <Label>Connection ID</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={connection.id}
                  disabled={true}
                  className="cursor-not-allowed"
                />
                <button
                  onClick={copyToClipboard}
                  className="hover:bg-accent rounded-md  p-1"
                >
                  <IconCopy size={18} />
                </button>
              </div>
            </div>
            <Toast />
          </>
        )}
      />
    </ToastProvider>
  )
}
