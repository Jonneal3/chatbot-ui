import { FC } from "react"

// Import your logos here
import darkLogo from "@/public/DARK_BRAND_LOGO.png"
import lightLogo from "@/public/LIGHT_BRAND_LOGO.png"

interface ChatbotUISVGProps {
  theme: "dark" | "light"
  scale?: number
}

export const ChatbotUISVG: FC<ChatbotUISVGProps> = ({ theme, scale = 1 }) => {
  // Choose the appropriate logo based on the theme
  const logo = theme === "dark" ? darkLogo : lightLogo

  // Calculate the center position of the SVG
  const logoWidth = 300 // Adjust the width of the logo as needed
  const logoHeight = 300 // Adjust the height of the logo as needed
  const svgWidth = logoWidth * scale
  const svgHeight = logoHeight * scale
  const viewBox = `0 0 ${logoWidth} ${logoHeight}`

  return (
    <svg
      width={svgWidth}
      height={svgHeight}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Inserting the logo */}
      <image href={logo.src} width={logoWidth} height={logoHeight} />
    </svg>
  )
}
