import { useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import type { BrewMethod, MeasurementMode } from "@/lib/types"
import { BREW_METHODS } from "@/lib/constants"
import {
  calculateWater,
  calculateCoffee,
  calculateRatio,
  ratioToGramsPerLitre,
  gramsPerLitreToRatio,
} from "@/lib/calculator"

type Field = "coffee" | "water" | "ratio" | "gpl"

const defaultMethod = BREW_METHODS.pourOver

export function Calculator() {
  const [coffee, setCoffee] = useState(defaultMethod.defaultCoffee)
  const [ratio, setRatio] = useState(defaultMethod.defaultRatio)
  const [water, setWater] = useState(calculateWater(defaultMethod.defaultCoffee, defaultMethod.defaultRatio))
  const [brewMethod, setBrewMethod] = useState<BrewMethod>("pourOver")
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(defaultMethod.preferredMode)

  // Track which field was edited BEFORE the current one
  const currentFieldRef = useRef<Field>("ratio")
  const previousFieldRef = useRef<Field>("ratio")

  const updateFieldTracking = (field: Field) => {
    if (currentFieldRef.current !== field) {
      previousFieldRef.current = currentFieldRef.current
      currentFieldRef.current = field
    }
  }

  const gramsPerLitre = ratioToGramsPerLitre(ratio)

  const handleCoffeeChange = useCallback(
    (value: string) => {
      const coffeeValue = parseFloat(value) || 0
      setCoffee(coffeeValue)

      updateFieldTracking("coffee")

      // If previous field was water, adjust ratio. Otherwise adjust water.
      if (previousFieldRef.current === "water") {
        setRatio(calculateRatio(coffeeValue, water))
      } else {
        setWater(calculateWater(coffeeValue, ratio))
      }
    },
    [ratio, water],
  )

  const handleWaterChange = useCallback(
    (value: string) => {
      const waterValue = parseFloat(value) || 0
      setWater(waterValue)

      updateFieldTracking("water")

      // If previous field was coffee, adjust ratio. Otherwise adjust coffee.
      if (previousFieldRef.current === "coffee") {
        setRatio(calculateRatio(coffee, waterValue))
      } else {
        setCoffee(calculateCoffee(waterValue, ratio))
      }
    },
    [ratio, coffee],
  )

  const handleRatioChange = useCallback(
    (value: string) => {
      const ratioValue = parseFloat(value) || 0
      setRatio(ratioValue)

      updateFieldTracking("ratio")

      // If previous field was water, adjust coffee. Otherwise adjust water.
      if (previousFieldRef.current === "water") {
        setCoffee(calculateCoffee(water, ratioValue))
      } else {
        setWater(calculateWater(coffee, ratioValue))
      }
    },
    [coffee, water],
  )

  const handleGplChange = useCallback(
    (value: string) => {
      const gplValue = parseFloat(value) || 0
      const newRatio = gramsPerLitreToRatio(gplValue)
      setRatio(newRatio)

      updateFieldTracking("gpl")

      // If previous field was water, adjust coffee. Otherwise adjust water.
      if (previousFieldRef.current === "water") {
        setCoffee(calculateCoffee(water, newRatio))
      } else {
        setWater(calculateWater(coffee, newRatio))
      }
    },
    [coffee, water],
  )

  const handleBrewMethodChange = useCallback((value: BrewMethod | null) => {
    if (!value) return
    setBrewMethod(value)
    const config = BREW_METHODS[value]
    setCoffee(config.defaultCoffee)
    setRatio(config.defaultRatio)
    setWater(calculateWater(config.defaultCoffee, config.defaultRatio))
    setMeasurementMode(config.preferredMode)
  }, [])

  const handleMeasurementModeChange = useCallback((value: readonly string[]) => {
    const mode = value[0] as MeasurementMode | undefined
    if (mode) {
      setMeasurementMode(mode)
    }
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-sm">Strength</Label>
          <ToggleGroup
            value={[measurementMode]}
            onValueChange={handleMeasurementModeChange}
            className="bg-muted rounded-lg p-1"
          >
            <ToggleGroupItem value="ratio" className="text-xs px-3 data-pressed:bg-background">
              Ratio
            </ToggleGroupItem>
            <ToggleGroupItem value="gramsPerLitre" className="text-xs px-3 data-pressed:bg-background">
              g/L
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="flex items-center gap-4">
          {measurementMode === "ratio" ? (
            <>
              <InputGroup className="flex-1">
                <InputGroupInput
                  id="ratio"
                  type="number"
                  inputMode="decimal"
                  value={formatNumber(ratio)}
                  onChange={(e) => handleRatioChange(e.target.value)}
                  className="h-12 text-xl font-light"
                />
                <InputGroupAddon align="inline-start">
                  <InputGroupText>1:</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <span className="text-muted-foreground text-sm">
                {formatNumber(gramsPerLitre)} g/L
              </span>
            </>
          ) : (
            <>
              <InputGroup className="flex-1">
                <InputGroupInput
                  id="gpl"
                  type="number"
                  inputMode="decimal"
                  value={formatNumber(gramsPerLitre)}
                  onChange={(e) => handleGplChange(e.target.value)}
                  className="h-12 text-xl font-light"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>g/L</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <span className="text-muted-foreground text-sm">
                1:{formatNumber(ratio)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
