/**
 * Convert ratio (1:X) to grams per litre
 */
export function ratioToGramsPerLitre(ratio: number): number {
  return 1000 / ratio
}

/**
 * Convert grams per litre to ratio (1:X)
 */
export function gramsPerLitreToRatio(gpl: number): number {
  return 1000 / gpl
}

/**
 * Calculate water amount from coffee and ratio
 */
export function calculateWater(coffee: number, ratio: number): number {
  return Math.round(coffee * ratio * 10) / 10
}

/**
 * Calculate coffee amount from water and ratio
 */
export function calculateCoffee(water: number, ratio: number): number {
  return Math.round((water / ratio) * 10) / 10
}

/**
 * Calculate ratio from coffee and water
 */
export function calculateRatio(coffee: number, water: number): number {
  if (coffee === 0) return 0
  return Math.round((water / coffee) * 100) / 100
}

/**
 * Format ratio for display (e.g., "1:16")
 */
export function formatRatio(ratio: number): string {
  return `1:${ratio % 1 === 0 ? ratio : ratio.toFixed(1)}`
}

/**
 * Format grams per litre for display (e.g., "62.5 g/L")
 */
export function formatGramsPerLitre(gpl: number): string {
  return `${gpl % 1 === 0 ? gpl : gpl.toFixed(1)} g/L`
}
