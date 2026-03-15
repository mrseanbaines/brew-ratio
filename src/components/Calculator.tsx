import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BrewMethod } from "@/lib/types"
import { BREW_METHODS } from "@/lib/constants"
import { calculateWater, calculateCoffee, ratioToGramsPerLitre, gramsPerLitreToRatio } from "@/lib/calculator"

const defaultMethod = BREW_METHODS.pourOver

export function Calculator() {
  const [coffee, setCoffee] = useState(defaultMethod.defaultCoffee)
  const [ratio, setRatio] = useState(defaultMethod.defaultRatio)
  const [water, setWater] = useState(calculateWater(defaultMethod.defaultCoffee, defaultMethod.defaultRatio))
  const [brewMethod, setBrewMethod] = useState<BrewMethod>("pourOver")
  const [lastEdited, setLastEdited] = useState<"coffee" | "water" | "ratio" | "gpl">("coffee")

  const gramsPerLitre = ratioToGramsPerLitre(ratio)

  const handleCoffeeChange = useCallback(
    (value: string) => {
      const coffeeValue = parseFloat(value) || 0
      setCoffee(coffeeValue)
      setWater(calculateWater(coffeeValue, ratio))
      setLastEdited("coffee")
    },
    [ratio],
  )

  const handleWaterChange = useCallback(
    (value: string) => {
      const waterValue = parseFloat(value) || 0
      setWater(waterValue)
      setCoffee(calculateCoffee(waterValue, ratio))
      setLastEdited("water")
    },
    [ratio],
  )

  const handleRatioChange = useCallback(
    (value: string) => {
      const ratioValue = parseFloat(value) || 0
      setRatio(ratioValue)
      if (lastEdited === "water" || lastEdited === "gpl") {
        setCoffee(calculateCoffee(water, ratioValue))
      } else {
        setWater(calculateWater(coffee, ratioValue))
      }
      setLastEdited("ratio")
    },
    [coffee, water, lastEdited],
  )

  const handleGplChange = useCallback(
    (value: string) => {
      const gplValue = parseFloat(value) || 0
      const newRatio = gramsPerLitreToRatio(gplValue)
      setRatio(newRatio)
      if (lastEdited === "water" || lastEdited === "ratio") {
        setCoffee(calculateCoffee(water, newRatio))
      } else {
        setWater(calculateWater(coffee, newRatio))
      }
      setLastEdited("gpl")
    },
    [coffee, water, lastEdited],
  )

  const handleBrewMethodChange = useCallback((value: BrewMethod | null) => {
    if (!value) return
    setBrewMethod(value)
    const config = BREW_METHODS[value]
    setCoffee(config.defaultCoffee)
    setRatio(config.defaultRatio)
    setWater(calculateWater(config.defaultCoffee, config.defaultRatio))
  }, [])

  const formatNumber = (n: number) => {
    if (n === 0) return ""
    return n % 1 === 0 ? n.toString() : n.toFixed(1)
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <Select value={brewMethod} onValueChange={handleBrewMethodChange}>
        <SelectTrigger className="w-full h-12 text-base">
          <SelectValue>{BREW_METHODS[brewMethod].name}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {Object.values(BREW_METHODS).map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="coffee" className="text-muted-foreground text-sm">
            Coffee (g)
          </Label>
          <Input
            id="coffee"
            type="number"
            inputMode="decimal"
            value={coffee || ""}
            onChange={(e) => handleCoffeeChange(e.target.value)}
            className="h-14 text-2xl font-light text-center"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="water" className="text-muted-foreground text-sm">
            Water (g)
          </Label>
          <Input
            id="water"
            type="number"
            inputMode="decimal"
            value={water || ""}
            onChange={(e) => handleWaterChange(e.target.value)}
            className="h-14 text-2xl font-light text-center"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="ratio" className="text-muted-foreground text-sm">
            Ratio (1:X)
          </Label>
          <Input
            id="ratio"
            type="number"
            inputMode="decimal"
            value={formatNumber(ratio)}
            onChange={(e) => handleRatioChange(e.target.value)}
            className="h-12 text-xl font-light text-center"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gpl" className="text-muted-foreground text-sm">
            g/L
          </Label>
          <Input
            id="gpl"
            type="number"
            inputMode="decimal"
            value={formatNumber(gramsPerLitre)}
            onChange={(e) => handleGplChange(e.target.value)}
            className="h-12 text-xl font-light text-center"
          />
        </div>
      </div>
    </div>
  )
}
