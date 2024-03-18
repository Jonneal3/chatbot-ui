import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getRunById = async (run_id: string) => {
  const { data: run, error } = await supabase
    .from("runs")
    .select("*")
    .eq("id", run_id)
    .single()

  if (!run) {
    throw new Error(error.message)
  }

  return run
}

export const getRunByUserId = async (user_id: string) => {
  const { data: run, error } = await supabase
    .from("runs")
    .select("*")
    .eq("user_id", user_id)
    .single()

  if (!run) {
    throw new Error(error.message)
  }

  return run
}

export const getRunsByAssistantId = async (assistant_id: string) => {
  const { data: run, error } = await supabase
    .from("runs")
    .select("*")
    .eq("assistant_id", assistant_id)

  if (!run) {
    throw new Error(error.message)
  }

  return run
}

export const createRun = async (
  run: TablesInsert<"runs">,
  workspace_id: string
) => {
  const { data: createdRun, error } = await supabase
    .from("runs")
    .insert([run])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdRun
}

export const createRuns = async (
  runs: TablesInsert<"runs">[],
  workspace_id: string
) => {
  const { data: createdRuns, error } = await supabase
    .from("runs")
    .insert(runs)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  return createdRuns
}

export const updateRun = async (runId: string, run: TablesUpdate<"runs">) => {
  const { data: updatedRun, error } = await supabase
    .from("runs")
    .update(run)
    .eq("id", runId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedRun
}

export const deleteRun = async (runId: string) => {
  const { error } = await supabase.from("runs").delete().eq("id", runId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}
