import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getAllActiveIntegrations = async () => {
  const { data: integrations, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("active", true)

  if (error) {
    throw new Error(error.message)
  }

  return integrations
}

export const getIntegrationById = async (integrationId: string) => {
  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", integrationId)
    .single()

  if (!integration) {
    throw new Error("Integration not found")
  }

  return integration
}

export const createIntegration = async (
  integration: TablesInsert<"integrations">
) => {
  const { data: createdIntegration, error } = await supabase
    .from("integrations")
    .insert([integration])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdIntegration
}

export const updateIntegration = async (
  integrationId: string,
  integration: TablesUpdate<"integrations">
) => {
  const { data: updatedIntegration, error } = await supabase
    .from("integrations")
    .update(integration)
    .eq("id", integrationId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedIntegration
}

export const deleteIntegration = async (integrationId: string) => {
  const { error } = await supabase
    .from("integrations")
    .delete()
    .eq("id", integrationId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
