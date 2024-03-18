import Stripe from "stripe"
import { stripe } from "@/stripe/config"
import {
  upsertProductRecord,
  upsertPriceRecord,
  manageSubscriptionStatusChange,
  deleteProductRecord,
  deletePriceRecord
} from "@/supabase/admin"

const relevantEvents = new Set([
  "product.created",
  "product.updated",
  "product.deleted",
  "price.created",
  "price.updated",
  "price.deleted",
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted"
])

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature") as string
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event: Stripe.Event

  try {
    if (!sig || !webhookSecret) {
      console.log("Webhook secret not found.")
      return new Response("Webhook secret not found.", { status: 400 })
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    console.log(`🔔  Webhook received: ${event.type}`)
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "product.created":
        case "product.updated":
          console.log("Upserting product record...")
          await upsertProductRecord(event.data.object as Stripe.Product)
          break
        case "price.created":
        case "price.updated":
          console.log("Upserting price record...")
          await upsertPriceRecord(event.data.object as Stripe.Price)
          break
        case "price.deleted":
          console.log("Deleting price record...")
          await deletePriceRecord(event.data.object as Stripe.Price)
          break
        case "product.deleted":
          console.log("Deleting product record...")
          await deleteProductRecord(event.data.object as Stripe.Product)
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
          console.log("Managing subscription status change...")
          const subscription = event.data.object as Stripe.Subscription
          await manageSubscriptionStatusChange(
            subscription.id,
            subscription.customer as string,
            event.type === "customer.subscription.created"
          )
          break
        case "checkout.session.completed":
          console.log("Handling checkout session completion...")
          const checkoutSession = event.data.object as Stripe.Checkout.Session
          if (checkoutSession.mode === "subscription") {
            const subscriptionId = checkoutSession.subscription
            await manageSubscriptionStatusChange(
              subscriptionId as string,
              checkoutSession.customer as string,
              true
            )
          }
          break
        default:
          throw new Error("Unhandled relevant event!")
      }
    } catch (error) {
      console.error("Webhook handler failed:", error)
      console.log("Failed event type:", event.type)
      console.log("Failed event data:", event.data)
      return new Response(
        `Webhook handler failed for event type ${event.data}. View your Next.js function logs for details.`,
        {
          status: 400
        }
      )
    }
  } else {
    console.log(`Unsupported event type: ${event.type}`)
    return new Response(`Unsupported event type: ${event.type}`, {
      status: 400
    })
  }
  return new Response(JSON.stringify({ received: true }))
}
