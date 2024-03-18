/* eslint-disable react-hooks/rules-of-hooks */
"use client"

import Link from "next/link"
import { SignOut } from "@/utils/auth-helpers/server"
import { handleRequest } from "@/utils/auth-helpers/client"
import Logo from "@/components/icons/Logo"
import { usePathname, useRouter } from "next/navigation"
import { getRedirectMethod } from "@/utils/auth-helpers/settings"
import s from "./Navbar.module.css"
import { supabase } from "@/lib/supabase/browser-client"

interface NavlinksProps {
  user?: any
}

export default function Navlinks({ user }: NavlinksProps) {
  const router = getRedirectMethod() === "client" ? useRouter() : null

  // Define handleSignOut function
  async function handleSignOut() {
    await supabase.auth.signOut() // Sign out the user using Supabase
    router?.push("/login") // Navigate to the login page, using optional chaining
  }

  return (
    <div className="align-center relative flex flex-row justify-between py-4 md:py-6">
      <div className="flex flex-1 items-center">
        <Link href="/login" className={s.logo} aria-label="Logo">
          <Logo />
        </Link>
      </div>
      <div className="flex justify-end space-x-8">
        {
          <form
            onSubmit={async e => {
              e.preventDefault() // Prevent default form submission behavior
              await handleSignOut() // Call the handleSignOut function to sign out the user
            }}
          >
            <button type="submit" className={s.link}>
              Go Back
            </button>
          </form>
        }
      </div>
    </div>
  )
}
