import React, { FC, useState, useEffect, useContext } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "../ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import CustomerPortalForm from "@/components/ui/AccountForms/CustomerPortalForm"
import { IconReceipt2 } from "@tabler/icons-react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { getActiveOrTrialingSubscriptionsByUserId } from "@/db/subscriptions"
import { ChatbotUIContext } from "@/context/context"
import CreditBar from "@/components/ui/bar" // Import the CreditBar component
import { updateProfile } from "@/db/profile"

interface BillingProps {}

interface ProfileSettingsProps {}

const ProfileSettings: FC<ProfileSettingsProps> = ({}) => {
  const { profile } = useContext(ChatbotUIContext)
  const [subscription, setSubscription] = useState<any>(null)
  const [reloadAmount, setReloadAmount] = useState<number>(
    profile?.reload_amount || 1
  )
  const [newReloadAmount, setNewReloadAmount] = useState<number>(
    profile?.reload_amount || 1
  )

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        if (profile) {
          const subscriptionData =
            await getActiveOrTrialingSubscriptionsByUserId(profile.user_id)
          setSubscription(subscriptionData)
        }
      } catch (error) {
        console.error("Error fetching subscription:", error)
        setSubscription(null)
      }
    }

    if (profile) {
      fetchSubscription()
    }
  }, [profile])

  const handleReloadAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const amount = parseFloat(event.target.value)
    if (amount >= 15) {
      setNewReloadAmount(amount)
    } else {
      // Show toast notification for minimum amount requirement
      // Implement your toast notification logic here
      console.log("Minimum reload amount is $15")
    }
  }

  const handleUpdateReloadAmount = async () => {
    if (newReloadAmount >= 15) {
      try {
        if (profile) {
          const updatedProfile = await updateProfile(profile.id, {
            reload_amount: newReloadAmount
          })
          if (updatedProfile) {
            setReloadAmount(updatedProfile.reload_amount)
          }
        }
      } catch (error: any) {
        console.error("Error updating reload amount:", error.message)
        // Handle error, e.g., display an error message
      }
    } else {
      // Show toast notification for minimum amount requirement
      // Implement your toast notification logic here
      console.log("Minimum reload amount is $15")
    }
  }

  return (
    <>
      {profile && <CustomerPortalForm subscription={subscription} />}
      {/* Credit bar */}
      {profile && (
        <CreditBar credits={profile.credits || 0} reloadAmount={reloadAmount} />
      )}
      {/* Credit reload input */}
      <div className="mt-4">
        <div className="mb-2 font-semibold">Credit Reload Amount</div>
        <div className="flex items-center">
          <input
            type="number"
            className="w-70 mr-2 rounded border border-gray-300 bg-transparent px-3 py-2"
            value={newReloadAmount}
            onChange={handleReloadAmountChange}
          />
          <button
            className="rounded bg-white px-4 py-2 text-black hover:bg-gray-600"
            onClick={handleUpdateReloadAmount}
          >
            Update
          </button>
        </div>
      </div>
    </>
  )
}

export const Billing: FC<BillingProps> = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleCloseSheet = () => {
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger>
        <IconReceipt2 size={SIDEBAR_ICON_SIZE} />
      </SheetTrigger>
      <SheetContent side="left">
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>Billing</div>
            </SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="billing">
            <TabsList className="mt-4 grid w-full grid-cols-2">
              <TabsTrigger value="billing">Plans</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            <TabsContent value="billing">
              <ProfileSettings />
            </TabsContent>
            <TabsContent value="usage">
              <div className="text-center text-gray-600">Coming soon</div>
            </TabsContent>
          </Tabs>
        </div>
        <button onClick={handleCloseSheet} className="ml-auto space-x-2">
          Cancel
        </button>
      </SheetContent>
    </Sheet>
  )
}

export default Billing
