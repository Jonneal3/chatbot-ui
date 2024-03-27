"use client"

import { Button } from "@/components/ui/button"
import Card from "@/components/ui/Card/Card"
import { updateName } from "@/utils/auth-helpers/server"
import { handleRequest } from "@/utils/auth-helpers/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function NameForm({ userName }: { userName: string }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true)
    // Check if the new name is the same as the old name
    if (e.currentTarget.fullName.value === userName) {
      e.preventDefault()
      setIsSubmitting(false)
      return
    }
    handleRequest(e, updateName, router)
    setIsSubmitting(false)
  }

  return (
    <Card
      title="Your Name"
      description="Please enter your full name, or a display name you are comfortable with."
      footer={
        <div className="flex flex-col items-start justify-between sm:flex-row sm:items-center">
          <p className="pb-4 sm:pb-0">64 characters maximum</p>
          <Button
            variant="default"
            type="submit"
            form="nameForm"
            loading={isSubmitting}
          >
            Update Name
          </Button>
        </div>
      }
    >
      <div className="mb-4 mt-8 text-xl font-semibold">
        <form id="nameForm" onSubmit={e => handleSubmit(e)}>
          <input
            type="text"
            name="fullName"
            className="w-1/2 rounded-md bg-zinc-800 p-3"
            defaultValue={userName}
            placeholder="Your name"
            maxLength={64}
          />
        </form>
      </div>
    </Card>
  )
}
