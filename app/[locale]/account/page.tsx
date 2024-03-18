import CustomerPortalForm from "@/components/ui/AccountForms/CustomerPortalForm"
import EmailForm from "@/components/ui/AccountForms/EmailForm"
import NameForm from "@/components/ui/AccountForms/NameForm"
import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

export default async function Account() {
  const supabase = createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const { data: userDetails } = await supabase
    .from("users")
    .select("*")
    .single()

  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .maybeSingle()

  if (error) {
    console.log(error)
  }

  if (!user) {
    return redirect("/login")
  }

  return (
    <section className="bg-spacy-2">
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:pt-24 lg:px-8">
        <div className="sm:align-center sm:flex sm:flex-col">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-xl text-zinc-200 sm:text-center sm:text-2xl">
            We partnered with Stripe for a simplified billing.
          </p>
        </div>
      </div>
      <div className="px-4 pb-8">
        <div className="mx-auto max-w-screen-xl">
          <CustomerPortalForm subscription={subscription} />
          <NameForm userName={userDetails?.full_name ?? ""} />
          <EmailForm userEmail={user.email} />
        </div>
      </div>
    </section>
  )
}
