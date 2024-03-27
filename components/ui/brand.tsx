import Link from "next/link"
import { FC } from "react"
import { ChatbotUISVG } from "../icons/chatbotui-svg"

interface BrandProps {
  theme?: "dark" | "light"
}

export const Brand: FC<BrandProps> = ({ theme = "dark" }) => {
  return (
    <Link
      href="https://www.samuraichat.com"
      target="_blank"
      rel="noopener noreferrer"
      className="flex cursor-pointer flex-col items-center hover:opacity-50"
    >
      <div className="mb-0" style={{ opacity: 0.3 }}>
        {/* Adjust the scale to control the size of the logo */}
        <ChatbotUISVG theme={theme} scale={0.3} />
      </div>
      <div
        className="mt-0 text-4xl font-bold tracking-wide"
        style={{ opacity: 0.3 }}
      >
        Samurai
      </div>
    </Link>
  )
}
