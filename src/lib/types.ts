import { z } from "zod"

export const measurementModeSchema = z.enum(["ratio", "gramsPerLitre"])
export type MeasurementMode = z.infer<typeof measurementModeSchema>

export const brewMethodSchema = z.enum(["pourOver", "frenchPress", "aeropress", "espresso", "coldBrew", "custom"])
export type BrewMethod = z.infer<typeof brewMethodSchema>

export const storedSettingsSchema = z.object({
  coffee: z.number().nonnegative(),
  water: z.number().nonnegative(),
  ratio: z.number().positive(),
  brewMethod: brewMethodSchema,
  measurementMode: measurementModeSchema,
})
export type StoredSettings = z.infer<typeof storedSettingsSchema>

export interface BrewMethodConfig {
  id: BrewMethod
  name: string
  defaultCoffee: number
  defaultRatio: number
  ratioRange: [number, number]
  preferredMode: MeasurementMode
}

export interface CalculatorState {
  coffee: number
  water: number
  ratio: number
  gramsPerLitre: number
  measurementMode: MeasurementMode
  brewMethod: BrewMethod
  lastEdited: "coffee" | "water"
}
