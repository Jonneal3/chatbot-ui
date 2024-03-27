/* eslint-disable tailwindcss/migration-from-tailwind-2 */
"use client"

import { Button } from "@/components/ui/button"
import type { Tables } from "@/supabase/types"
import { getStripe } from "@/stripe/client"
import { checkoutWithStripe } from "@/stripe/server"
import { getErrorRedirect } from "@/utils/helpers"
import { User } from "@supabase/supabase-js"
import cn from "classnames"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

type Subscription = Tables<"subscriptions">
type Product = Tables<"products">
type Price = Tables<"prices">
interface ProductWithPrices extends Product {
  prices: Price[]
}
interface PriceWithProduct extends Price {
  products: Product | null
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null
}

interface Props {
  user: User | null | undefined
  products: ProductWithPrices[]
  subscription: SubscriptionWithProduct | null
}

type BillingInterval = "lifetime" | "year" | "month"

export default function Pricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap(product =>
        product?.prices?.map(price => price?.interval)
      )
    )
  )
  const router = useRouter()
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month")
  const [priceIdLoading, setPriceIdLoading] = useState<string>()
  const currentPath = usePathname()

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id)

    if (!user) {
      setPriceIdLoading(undefined)
      return router.push("/login")
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      currentPath
    )

    if (errorRedirect) {
      setPriceIdLoading(undefined)
      return router.push(errorRedirect)
    }

    if (!sessionId) {
      setPriceIdLoading(undefined)
      return router.push(
        getErrorRedirect(
          currentPath,
          "An unknown error occurred.",
          "Please try again later or contact a system administrator."
        )
      )
    }

    const stripe = await getStripe()
    stripe?.redirectToCheckout({ sessionId })

    setPriceIdLoading(undefined)
  }

  if (!products.length) {
    return (
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            No subscription pricing plans found. Create them in your{" "}
            <a
              className="text-pink-500 underline"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    )
  } else {
    return (
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
              Pricing Plans
            </h1>
            <p className="m-auto mt-5 max-w-2xl text-xl text-zinc-200 sm:text-center sm:text-2xl">
              Start building AI assistants free for 30 days.
            </p>
            <div className="relative mt-6 flex self-center rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 sm:mt-8">
              {intervals.includes("month") && (
                <button
                  onClick={() => setBillingInterval("month")}
                  type="button"
                  className={`${
                    billingInterval === "month"
                      ? "relative w-1/2 border-zinc-800 bg-zinc-700 text-white shadow-sm"
                      : "relative ml-0.5 w-1/2 border border-transparent text-zinc-400"
                  } m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8`}
                >
                  Monthly billing
                </button>
              )}
              {intervals.includes("year") && (
                <button
                  onClick={() => setBillingInterval("year")}
                  type="button"
                  className={`${
                    billingInterval === "year"
                      ? "relative w-1/2 border-zinc-800 bg-zinc-700 text-white shadow-sm"
                      : "relative ml-0.5 w-1/2 border border-transparent text-zinc-400"
                  } m-1 whitespace-nowrap rounded-md py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 sm:w-auto sm:px-8`}
                >
                  Yearly billing
                </button>
              )}
            </div>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 space-y-4 sm:mt-16 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none">
            {products.map(product => {
              const price = product?.prices?.find(
                price => price.interval === billingInterval
              )
              if (!price) return null
              const priceString = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: price.currency!,
                minimumFractionDigits: 0
              }).format((price?.unit_amount || 0) / 100)
              return (
                <div
                  key={product.id}
                  className={cn(
                    "flex flex-col divide-y divide-zinc-600 rounded-lg bg-zinc-900 shadow-sm",
                    {
                      "border border-pink-500": subscription
                        ? product.name === subscription?.prices?.products?.name
                        : product.name === "Freelancer"
                    },
                    "flex-1", // This makes the flex item grow to fill the space
                    "basis-1/3", // Assuming you want each card to take up roughly a third of the container's width
                    "max-w-xs" // Sets a maximum width to the cards to prevent them from getting too large
                  )}
                >
                  <div className="p-6">
                    <h2 className="text-2xl font-semibold leading-6 text-white">
                      {product.name}
                    </h2>
                    <p className="mt-4 text-zinc-300">{product.description}</p>
                    <p className="mt-8">
                      <span className="white text-5xl font-extrabold">
                        {priceString}
                      </span>
                      <span className="text-base font-medium text-zinc-100">
                        /{billingInterval}
                      </span>
                    </p>
                    <Button
                      variant="default"
                      type="button"
                      loading={priceIdLoading === price.id}
                      onClick={() => handleStripeCheckout(price)}
                      className="mt-8 block w-full rounded-md py-2 text-center text-sm font-semibold text-white hover:bg-zinc-900"
                    >
                      {subscription ? "Subscribe" : "Subscribe"}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    )
  }
}
