import { PropsWithChildren, Suspense } from "react"
import { getURL } from "@/utils/helpers"

// eslint-disable-next-line @next/next/no-async-client-component
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
