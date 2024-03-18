import { FC } from "react"
import { redirect } from "next/navigation" // Import redirect from next/navigation

interface FinishStepProps {
  displayName: string
}

export const FinishStep: FC<FinishStepProps> = ({ displayName }) => {
  const redirectToPricing = () => {
    redirect("/pricing") // Use redirect to navigate to /pricing
  }

  return (
    <div className="space-y-4">
      <div>
        Welcome to Chatbot UI
        {displayName.length > 0 ? `, ${displayName.split(" ")[0]}` : null}!
      </div>

      {/* Call redirectToPricing function when the user clicks */}
      <button
        onClick={redirectToPricing}
        className="text-blue-500 hover:underline"
      >
        Click next to start chatting.
      </button>
    </div>
  )
}
