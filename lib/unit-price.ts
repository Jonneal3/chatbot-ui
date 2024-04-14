// Import the 'updateProfile' function from the appropriate file
import { updateProfile } from "@/db/profile"
import { createClient } from "@supabase/supabase-js"
import { reloadCredits } from "./reload-credits" // Corrected file name
import { getProfileByUserId } from "@/db/profile"

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Define function to process unit price
export async function processUnitPrice(
  user_id: string
): Promise<number | null> {
  try {
    // Define request price
    const requestPrice = 0.0009

    console.log("Fetching profile data...")
    // Retrieve profile data for the user
    const profileResult = await getProfileByUserId(user_id)
    console.log("Profile data fetched:", profileResult)

    // Extract data from profileResult
    const profile = profileResult ?? {}
    console.log("Profile:", profile)

    if (!profile) {
      throw new Error("User profile not found")
    }

    // Extract credits and reload_amount from profile data
    const { credits, reload_amount, id, ...otherProfileProps } = profile // Extract id
    console.log("Current credits:", credits)
    console.log("Reload amount:", reload_amount)

    // Calculate new credits
    let currentCredits = credits

    currentCredits -= requestPrice

    console.log("New credits after deduction:", currentCredits)

    // Reload credits via Stripe if credits fall below zero
    if (currentCredits <= 0) {
      console.log("Credits fall below zero. Reloading credits...")
      await reloadCredits(id, reload_amount) // Use id instead of user_id
      currentCredits = Math.abs(currentCredits) + reload_amount
      currentCredits *= Math.sign(currentCredits) // Maintain the sign of the original credits
      console.log("Credits reloaded. New credits:", currentCredits)
    }

    // Update the profile credits
    console.log("Updating profile credits...")

    const updatedProfile = { credits: currentCredits }
    await updateProfile(id, updatedProfile) // Use id instead of user_id

    console.log("Profile credits updated successfully.")

    return currentCredits
  } catch (error) {
    console.error("Error processing unit price:", error)
    return null
  }
}

export default processUnitPrice
