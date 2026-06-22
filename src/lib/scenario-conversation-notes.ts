import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ScenarioConversationNote {
  id: string;
  scenario_id: string;
  author_id: string;
  author_name: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export async function fetchScenarioConversationNotes(
  scenarioId: string,
): Promise<ScenarioConversationNote[]> {
  const { data, error } = await supabase.rpc("list_scenario_conversation_notes", {
    p_scenario: scenarioId,
  });
  if (error) {
    console.warn("[scenario-notes] fetch failed", error.message);
    toast.error("Could not load conversation notes", { description: error.message });
    return [];
  }
  return (data ?? []) as ScenarioConversationNote[];
}

export async function addScenarioConversationNote(
  scenarioId: string,
  body: string,
): Promise<ScenarioConversationNote | null> {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const { data: noteId, error } = await supabase.rpc("add_scenario_conversation_note", {
    p_scenario: scenarioId,
    p_body: trimmed,
  });
  if (error) {
    console.warn("[scenario-notes] add failed", error.message);
    toast.error("Could not save note", { description: error.message });
    return null;
  }

  const notes = await fetchScenarioConversationNotes(scenarioId);
  return notes.find((n) => n.id === noteId) ?? notes[notes.length - 1] ?? null;
}

export async function updateScenarioConversationNote(
  scenarioId: string,
  noteId: string,
  body: string,
): Promise<boolean> {
  const trimmed = body.trim();
  if (!trimmed) return false;

  const { error } = await supabase.rpc("update_scenario_conversation_note" as any, {
    p_note: noteId,
    p_body: trimmed,
  });
  if (error) {
    console.warn("[scenario-notes] update failed", error.message);
    toast.error("Could not update note", { description: error.message });
    return false;
  }
  return true;
}
