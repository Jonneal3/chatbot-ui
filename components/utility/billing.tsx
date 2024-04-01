import CustomerPortalForm from "@/components/ui/AccountForms/CustomerPortalForm"
import { ChatbotUIContext } from "@/context/context"
import { getActiveOrTrialingSubscriptionsByUserId } from "@/db/subscriptions"
import { FC, useContext, useState, useEffect } from "react"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { Button } from "../ui/button"
import { IconReceipt2 } from "@tabler/icons-react"
import Image from "next/image" // Import Image from 'next/image'
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"

interface ProfileSettingsProps {}

const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const { profile } = useContext(ChatbotUIContext)
  const [isOpen, setIsOpen] = useState(false)
  const [subscription, setSubscription] = useState<any>(null) // Change to `any` or the correct type

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscriptionData = await getActiveOrTrialingSubscriptionsByUserId(
          profile?.user_id || ""
        )
        setSubscription(subscriptionData)
      } catch (error) {
        console.error("Error fetching subscription:", error)
        setSubscription(null)
      }
    }

    if (profile) {
      fetchSubscription()
    }
  }, [profile])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Your key down event handling logic here
  }

  const handleToggleSheet = () => {
    setIsOpen(!isOpen)
  }

  const handleCancel = () => {
    // Handle cancel action
    setIsOpen(false) // Close the sheet if needed
  }

  const handleSave = () => {
    // Handle save action
    // You can add your save logic here
    setIsOpen(false) // Close the sheet if needed
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger>
          <Button size="icon" variant="ghost" onClick={handleToggleSheet}>
            {profile?.image_url ? (
              <Image
                className="mt-2 size-[26px] cursor-pointer rounded hover:opacity-50"
                src={profile.image_url + "?" + new Date().getTime()}
                height={34}
                width={34}
                alt="Profile Image"
              />
            ) : (
              <IconReceipt2 size={SIDEBAR_ICON_SIZE} />
            )}
          </Button>
        </SheetTrigger>
        <SheetContent
          className="flex flex-col justify-between"
          side="left"
          onKeyDown={handleKeyDown}
        >
          <div className="grow overflow-auto">
            <section className="mb-4">
              {" "}
              {/* Reduced mb-32 to mb-4 */}
              <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {" "}
                {/* Removed sm:pt-24 */}
                <div className="sm:align-center space-y-2 sm:flex sm:flex-col">
                  {" "}
                  {/* Added space-y-2 */}
                  <h1 className="text-4xl font-bold text-white sm:text-center sm:text-4xl">
                    Account
                  </h1>
                  <p className="m-auto max-w-2xl text-xl text-zinc-200 sm:text-center sm:text-2xl">
                    We partnered with Stripe for a simplified billing.
                  </p>
                </div>
              </div>
              <div className="p-4">
                <CustomerPortalForm subscription={subscription} />
              </div>
            </section>
          </div>
          <div className="flex justify-end p-4">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

export default ProfileSettings
