import type { BrewMethod, BrewMethodConfig } from "./types"

export const BREW_METHODS: Record<BrewMethod, BrewMethodConfig> = {
  pourOver: {
    id: "pourOver",
    name: "Pour Over",
    defaultCoffee: 18,
    defaultRatio: 16,
    ratioRange: [14, 18],
    preferredMode: "ratio",
  },
  frenchPress: {
    id: "frenchPress",
    name: "French Press",
    defaultCoffee: 30,
    defaultRatio: 15,
    ratioRange: [12, 17],
    preferredMode: "ratio",
  },
  aeropress: {
    id: "aeropress",
    name: "AeroPress",
    defaultCoffee: 15,
    defaultRatio: 14,
    ratioRange: [10, 17],
    preferredMode: "ratio",
  },
  espresso: {
    id: "espresso",
    name: "Espresso",
    defaultCoffee: 18,
    defaultRatio: 2,
    ratioRange: [1.5, 3],
    preferredMode: "ratio",
  },
  coldBrew: {
    id: "coldBrew",
    name: "Cold Brew",
    defaultCoffee: 100,
    defaultRatio: 8,
    ratioRange: [5, 12],
    preferredMode: "gramsPerLitre",
  },
  custom: {
    id: "custom",
    name: "Custom",
    defaultCoffee: 18,
    defaultRatio: 16,
    ratioRange: [1, 20],
    preferredMode: "ratio",
  },
}
