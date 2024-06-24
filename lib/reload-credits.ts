import stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function reloadCredits(
  user_id: string,
  reload_amount: number
): Promise<void> {
  try {
    // Retrieve the stripe_customer_id associated with the user_id from the customers table
    const { data: customerData, error } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .single()

    if (error) {
      throw error
    }

    if (!customerData) {
      throw new Error("Stripe customer ID not found for user")
    }

    const stripeCustomerId = customerData.stripe_customer_id

    // Ensure STRIPE_SECRET_KEY environment variable is set
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY
    if (!stripeSecretKey) {
      throw new Error("Stripe secret key is not provided")
    }

    // Initialize Stripe with your secret key from environment variables
    const stripeClient = new stripe(stripeSecretKey)

    // Create a payment intent with the provided reload_amount
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: reload_amount * 100, // Stripe requires amount in cents
      currency: "usd",
      customer: stripeCustomerId,
      payment_method_types: ["card"]
    })

    // Confirm the payment intent
    const confirmedIntent = await stripeClient.paymentIntents.confirm(
      paymentIntent.id,
      {
        return_url: "https://app.samuraichat.com" // Return URL where the customer should be redirected after the PaymentIntent is confirmed
      }
    )

    // Handle payment intent confirmation result
    if (confirmedIntent.status === "requires_action") {
      // Handle payment intent requiring action
      console.log(
        "Payment intent requires action:",
        confirmedIntent.next_action
      )
    } else if (confirmedIntent.status === "succeeded") {
      // Handle successful payment intent
      console.log("Payment intent confirmed successfully:", confirmedIntent)
    } else {
      // Handle other statuses or errors
      throw new Error("Payment intent confirmation failed")
    }
  } catch (error) {
    console.error("Error reloading credits:", error)
    // Handle error scenario
  }
}
