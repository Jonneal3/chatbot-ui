import { IconUser } from "@tabler/icons-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TEAM_NAME_MAX } from "@/db/limits"
import { Tables } from "@/supabase/types"
import { FC, useState } from "react"
import { SidebarItem } from "../all/sidebar-display-item"

interface TeamItemProps {
  team: Tables<"teams">
}

export const TeamItem: FC<TeamItemProps> = ({ team }) => {
  const [name, setName] = useState(team.name)
  const [isTyping, setIsTyping] = useState(false)

  return (
    <SidebarItem
      item={team}
      isTyping={isTyping}
      contentType="teams"
      icon={<IconUser height={30} width={30} />}
      updateState={{
        name
      }}
      renderInputs={() => (
        <>
          <div className="space-y-1">
            <Label>Email</Label>
            <div>{team.email}</div>
          </div>
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="User name..."
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={TEAM_NAME_MAX}
            />
          </div>
        </>
      )}
    />
  )
}
