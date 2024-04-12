import { Metadata } from "next"
import { PropsWithChildren, Suspense } from "react"
import { getURL } from "@/utils/helpers"
import "@/styles/main.css"

const meta = {
  title: "Next.js Subscription Starter",
  description: "Brought to you by Vercel, Stripe, and Supabase.",
  cardImage: "/og.png",
  robots: "follow, index",
  favicon: "/favicon.ico",
  url: getURL()
}

export async function generateMetadata(): Promise<Metadata> {
  return {}
}

export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <body className="loading bg-black">
        <main
          id="skip"
          className="md:min-h[calc(100dvh-5rem)] min-h-[calc(100dvh-4rem)]"
        >
          {children}
        </main>
      </body>
    </html>
  )
}
