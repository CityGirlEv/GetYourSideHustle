import { describe, it, expect, vi, beforeEach } from "vitest"

const rpcMock = vi.fn()

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: (...args: any[]) => rpcMock(...args),
  },
}))

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

import {
  fetchScenarioConversationNotes,
  addScenarioConversationNote,
  updateScenarioConversationNote,
} from "../scenario-conversation-notes"

beforeEach(() => {
  rpcMock.mockReset()
})

describe("scenario-conversation-notes", () => {
  describe("fetchScenarioConversationNotes", () => {
    it("returns mapped notes on success", async () => {
      const mockNotes = [
        {
          id: "note-1",
          scenario_id: "scen-1",
          author_id: "user-1",
          author_name: "John Doe",
          body: "Hello world",
          created_at: "2026-06-09T22:00:00Z",
          updated_at: "2026-06-09T22:00:00Z",
        },
      ]
      rpcMock.mockResolvedValue({ data: mockNotes, error: null })

      const result = await fetchScenarioConversationNotes("scen-1")
      expect(rpcMock).toHaveBeenCalledWith("list_scenario_conversation_notes", {
        p_scenario: "scen-1",
      })
      expect(result).toEqual(mockNotes)
    })

    it("returns empty array and shows toast on error", async () => {
      rpcMock.mockResolvedValue({ data: null, error: { message: "Database error" } })

      const result = await fetchScenarioConversationNotes("scen-1")
      expect(result).toEqual([])
    })
  })

  describe("addScenarioConversationNote", () => {
    it("returns null when body is empty", async () => {
      const result = await addScenarioConversationNote("scen-1", "   ")
      expect(result).toBeNull()
      expect(rpcMock).not.toHaveBeenCalled()
    })

    it("creates note and refetches on success", async () => {
      const mockNotes = [
        {
          id: "note-1",
          scenario_id: "scen-1",
          author_id: "user-1",
          author_name: "John Doe",
          body: "Hello world",
          created_at: "2026-06-09T22:00:00Z",
          updated_at: "2026-06-09T22:00:00Z",
        },
      ]

      // First call is to add_scenario_conversation_note, returning the note ID
      rpcMock.mockResolvedValueOnce({ data: "note-1", error: null })
      // Second call is to list_scenario_conversation_notes to refetch the list
      rpcMock.mockResolvedValueOnce({ data: mockNotes, error: null })

      const result = await addScenarioConversationNote("scen-1", "Hello world")
      expect(rpcMock).toHaveBeenNthCalledWith(1, "add_scenario_conversation_note", {
        p_scenario: "scen-1",
        p_body: "Hello world",
      })
      expect(rpcMock).toHaveBeenNthCalledWith(2, "list_scenario_conversation_notes", {
        p_scenario: "scen-1",
      })
      expect(result).toEqual(mockNotes[0])
    })

    it("returns null and shows toast on add error", async () => {
      rpcMock.mockResolvedValue({ data: null, error: { message: "Failed to add" } })

      const result = await addScenarioConversationNote("scen-1", "Hello world")
      expect(result).toBeNull()
    })
  })

  describe("updateScenarioConversationNote", () => {
    it("returns false when body is empty", async () => {
      const result = await updateScenarioConversationNote("scen-1", "note-1", "   ")
      expect(result).toBe(false)
      expect(rpcMock).not.toHaveBeenCalled()
    })

    it("returns true on success", async () => {
      rpcMock.mockResolvedValue({ error: null })

      const result = await updateScenarioConversationNote("scen-1", "note-1", "Updated body")
      expect(rpcMock).toHaveBeenCalledWith("update_scenario_conversation_note", {
        p_note: "note-1",
        p_body: "Updated body",
      })
      expect(result).toBe(true)
    })

    it("returns false and shows toast on update error", async () => {
      rpcMock.mockResolvedValue({ error: { message: "Failed to update" } })

      const result = await updateScenarioConversationNote("scen-1", "note-1", "Updated body")
      expect(result).toBe(false)
    })
  })
})
