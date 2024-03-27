/* eslint-disable react/no-unescaped-entities */
"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { signInWithPassword } from "@/utils/auth-helpers/server"
import { handleRequest } from "@/utils/auth-helpers/client"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

// Define prop type with allowEmail boolean
interface PasswordSignInProps {
  allowEmail: boolean
  redirectMethod: string
}

export default function PasswordSignIn({
  allowEmail,
  redirectMethod
}: PasswordSignInProps) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = redirectMethod === "client" ? useRouter() : null
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsSubmitting(true) // Disable the button while the request is being handled
    await handleRequest(e, signInWithPassword, router)
    setIsSubmitting(false)
  }

  return (
    <div className="my-8">
      <form noValidate={true} className="mb-4" onSubmit={e => handleSubmit(e)}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              placeholder="name@example.com"
              type="email"
              name="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              className="w-full rounded-md bg-zinc-800 p-3"
            />
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              className="w-full rounded-md bg-zinc-800 p-3"
            />
          </div>
          <Button
            variant="default"
            type="submit"
            className="mt-1"
            loading={isSubmitting}
          >
            Sign in
          </Button>
        </div>
      </form>
      <p>
        <Link href="/signin/forgot_password" className="text-sm font-light">
          Forgot your password?
        </Link>
      </p>
      {allowEmail && (
        <p>
          <Link href="/signin/email_signin" className="text-sm font-light">
            Sign in via magic link
          </Link>
        </p>
      )}
      <p>
        <Link href="/signin/signup" className="text-sm font-light">
          Don't have an account? Sign up
        </Link>
      </p>
    </div>
  )
}
