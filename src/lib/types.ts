export type MeasurementMode = "ratio" | "gramsPerLitre"

export type BrewMethod =
  | "pourOver"
  | "frenchPress"
  | "aeropress"
  | "espresso"
  | "coldBrew"
  | "custom"

export interface BrewMethodConfig {
  id: BrewMethod
  name: string
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
