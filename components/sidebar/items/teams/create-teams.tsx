import { FC, useState, useContext } from "react"
import { SidebarCreateItem } from "@/components/sidebar/items/all/sidebar-create-item"
import { ToastProvider } from "@radix-ui/react-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEAM_NAME_MAX } from "@/db/limits"
import { ChatbotUIContext } from "@/context/context"
import { TablesInsert } from "@/supabase/types"

interface TeamItemProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateTeam: FC<TeamItemProps> = ({ isOpen, onOpenChange }) => {
  const { selectedWorkspace } = useContext(ChatbotUIContext)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")

  const workspace_id = selectedWorkspace?.id || ""

  return (
    <ToastProvider>
      <SidebarCreateItem
        contentType="teams"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        createState={
          {
            email,
            workspace_id,
            name
          } as TablesInsert<"teams">
        }
        renderInputs={() => (
          <>
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="Team name..."
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={TEAM_NAME_MAX}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                placeholder="Email address..."
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </>
        )}
        isTyping={false}
      />
    </ToastProvider>
  )
}
