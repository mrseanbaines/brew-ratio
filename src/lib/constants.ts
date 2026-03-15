import type { BrewMethod, BrewMethodConfig } from "./types"

export const BREW_METHODS: Record<BrewMethod, BrewMethodConfig> = {
  pourOver: {
    id: "pourOver",
    name: "Pour Over",
    defaultRatio: 16,
    ratioRange: [14, 18],
    preferredMode: "ratio",
  },
  frenchPress: {
    id: "frenchPress",
    name: "French Press",
    defaultRatio: 15,
    ratioRange: [12, 17],
    preferredMode: "ratio",
  },
  aeropress: {
    id: "aeropress",
    name: "AeroPress",
    defaultRatio: 14,
    ratioRange: [10, 17],
    preferredMode: "ratio",
  },
  espresso: {
    id: "espresso",
    name: "Espresso",
    defaultRatio: 2,
    ratioRange: [1.5, 3],
    preferredMode: "ratio",
  },
  coldBrew: {
    id: "coldBrew",
    name: "Cold Brew",
    defaultRatio: 8,
    ratioRange: [5, 12],
    preferredMode: "gramsPerLitre",
  },
  custom: {
    id: "custom",
    name: "Custom",
    defaultRatio: 16,
    ratioRange: [1, 20],
    preferredMode: "ratio",
  },
}

export const DEFAULT_COFFEE = 18
export const DEFAULT_RATIO = 16
