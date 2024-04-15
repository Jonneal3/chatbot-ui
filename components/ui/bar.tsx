import React from "react"

interface CreditBarProps {
  credits: number
  reloadAmount: number
}

const CreditBar: React.FC<CreditBarProps> = ({ credits, reloadAmount }) => {
  // Calculate the percentage of credits used
  const percentage = (credits / reloadAmount) * 100

  // Convert credits to dollar value
  const dollars = `$${credits.toFixed(2)}`

  return (
    <div>
      <div className="mb-2">Credits</div>
      <div className="flex items-center">
        <div className="h-10 w-full overflow-hidden rounded-md border border-gray-400 bg-transparent">
          <div
            className="h-full bg-gray-500"
            style={{ width: `${percentage}%` }}
            title={`Credits: ${dollars}`}
          ></div>
        </div>
        <div className="ml-2">{dollars}</div>
      </div>
    </div>
  )
}

export default CreditBar
