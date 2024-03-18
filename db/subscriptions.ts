import { supabase } from "@/lib/supabase/browser-client"

export const getSubscriptionsByUserId = async (user_id: string) => {
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user_id)
    .single()

  if (!subscription) {
    throw new Error(error.message)
  }

  return subscription
}

export const getActiveOrTrialingSubscriptionsByUserId = async (
  user_id: string
) => {
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("*, prices(*, products(*))")
    .in("status", ["trialing", "active"])
    .eq("user_id", user_id)
    .maybeSingle()

  if (error) {
    console.log(error)
    throw new Error("Error fetching active or trialing subscriptions")
  }

  return subscription
}
