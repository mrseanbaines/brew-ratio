import { storedSettingsSchema, type StoredSettings } from "@/lib/types"

const STORAGE_KEY = "brewratio-settings"

export function loadSettings(): StoredSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      const parsed = JSON.parse(stored)
      const result = storedSettingsSchema.safeParse(parsed)

      if (result.success) {
        return result.data
      }

      console.warn("Invalid stored settings, ignoring:", result.error.issues)
    }
  } catch {
    // Ignore errors
  }

  return null
}

export function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore errors
  }
}
