/* eslint-disable @next/next/no-img-element */
export default function LogoCloud() {
  return (
    <div>
      <p className="mt-24 text-center text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">
        Brought to you by
      </p>
      <div className="my-12 grid grid-cols-1	place-items-center space-y-4 sm:mt-8 sm:grid sm:grid-cols-5 sm:gap-6 sm:space-y-0 md:mx-auto md:max-w-2xl">
        <div className="flex h-12 items-center justify-start">
          <a href="https://nextjs.org" aria-label="Next.js Link">
            <img
              src="/nextjs.svg"
              alt="Next.js Logo"
              className="h-6 text-white sm:h-12"
            />
          </a>
        </div>
        <div className="flex h-12 items-center justify-start">
          <a href="https://vercel.com" aria-label="Vercel.com Link">
            <img
              src="/vercel.svg"
              alt="Vercel.com Logo"
              className="h-6 text-white"
            />
          </a>
        </div>
        <div className="flex h-12 items-center justify-start">
          <a href="https://stripe.com" aria-label="stripe.com Link">
            <img
              src="/stripe.svg"
              alt="stripe.com Logo"
              className="h-12 text-white"
            />
          </a>
        </div>
        <div className="flex h-12 items-center justify-start">
          <a href="https://supabase.io" aria-label="supabase.io Link">
            <img
              src="/supabase.svg"
              alt="supabase.io Logo"
              className="h-10 text-white"
            />
          </a>
        </div>
        <div className="flex h-12 items-center justify-start">
          <a href="https://github.com" aria-label="github.com Link">
            <img
              src="/github.svg"
              alt="github.com Logo"
              className="h-8 text-white"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
