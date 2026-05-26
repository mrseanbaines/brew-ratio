import type { BrewMethod, BrewMethodConfig } from "./types"

export const BREW_METHODS: Record<BrewMethod, BrewMethodConfig> = {
  custom: {
    id: "custom",
    name: "Custom",
    defaultCoffee: 18,
    defaultRatio: 16,
    preferredMode: "ratio",
  },
  pourover: {
    id: "pourover",
    name: "Pourover",
    defaultCoffee: 16,
    defaultRatio: 16,
    preferredMode: "ratio",
  },
  espresso: {
    id: "espresso",
    name: "Espresso",
    defaultCoffee: 18,
    defaultRatio: 2,
    preferredMode: "ratio",
  },
  cupping: {
    id: "cupping",
    name: "Cupping",
    defaultCoffee: 8.25,
    defaultGramsPerLitre: 55,
    preferredMode: "gramsPerLitre",
  },
  frenchPress: {
    id: "frenchPress",
    name: "French Press",
    defaultCoffee: 30,
    defaultRatio: 15,
    preferredMode: "ratio",
  },
  aeropress: {
    id: "aeropress",
    name: "AeroPress",
    defaultCoffee: 15,
    defaultRatio: 14,
    preferredMode: "ratio",
  },
  coldBrew: {
    id: "coldBrew",
    name: "Cold Brew",
    defaultCoffee: 100,
    defaultGramsPerLitre: 125,
    preferredMode: "gramsPerLitre",
  },
}
