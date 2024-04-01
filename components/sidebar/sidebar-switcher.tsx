/* eslint-disable react/jsx-no-undef */
import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconTool,
  IconFolders,
  IconFile,
  IconMessages,
  IconPencil,
  IconRobotFace,
  IconSparkles,
  IconSwitchHorizontal
} from "@tabler/icons-react"
import { FC } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { ProfileSettings } from "@/components/utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import Account from "@/components/utility/billing"
import logo from "@/public/icon-192x192.png"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

export const SIDEBAR_ICON_SIZE = 20

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  return (
    <div className="border-base-100 bg-base-300 flex flex-col justify-between border-r px-0 pb-5">
      <TabsList className="bg-background grid h-[300px] grid-rows-10">
        <SidebarSwitchItem
          icon={<ChatbotUISVG theme="dark" scale={0.09} />} // Adjust theme and scale as needed
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconMessages size={SIDEBAR_ICON_SIZE} />}
          contentType="chats"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />}
          contentType="presets"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconPencil size={SIDEBAR_ICON_SIZE} />}
          contentType="prompts"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconSparkles size={SIDEBAR_ICON_SIZE} />}
          contentType="models"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFile size={SIDEBAR_ICON_SIZE} />}
          contentType="files"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconFolders size={SIDEBAR_ICON_SIZE} />}
          contentType="collections"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconRobotFace size={SIDEBAR_ICON_SIZE} />}
          contentType="assistants"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconSwitchHorizontal size={SIDEBAR_ICON_SIZE} />}
          contentType="connections"
          onContentTypeChange={onContentTypeChange}
        />

        <SidebarSwitchItem
          icon={<IconTool size={SIDEBAR_ICON_SIZE} />}
          contentType="tools"
          onContentTypeChange={onContentTypeChange}
        />
      </TabsList>

      <div className="grid h-[75px] grid-rows-2">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}

        <WithTooltip display={<div>Billing</div>} trigger={<Account />} />

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />
      </div>
    </div>
  )
}
