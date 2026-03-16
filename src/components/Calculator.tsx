import { useState, useCallback, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import type { BrewMethod, MeasurementMode } from "@/lib/types"
import { BREW_METHODS } from "@/lib/constants"
import {
  calculateWater,
  calculateCoffee,
  calculateRatio,
  ratioToGramsPerLitre,
  gramsPerLitreToRatio,
} from "@/lib/calculator"

type FieldType = "coffee" | "water" | "ratio" | "gpl"

const STORAGE_KEY = "brewratio-settings"

interface StoredSettings {
  coffee: number
  water: number
  ratio: number
  brewMethod: BrewMethod
  measurementMode: MeasurementMode
}

function loadSettings(): StoredSettings | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    // Ignore errors
  }
  return null
}

function saveSettings(settings: StoredSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore errors
  }
}

const defaultMethod = BREW_METHODS.pourOver

export function Calculator() {
  const [coffee, setCoffee] = useState(() => {
    const stored = loadSettings()
    return stored?.coffee ?? defaultMethod.defaultCoffee
  })

  const [ratio, setRatio] = useState(() => {
    const stored = loadSettings()
    return stored?.ratio ?? defaultMethod.defaultRatio
  })

  const [water, setWater] = useState(() => {
    const stored = loadSettings()
    return stored?.water ?? calculateWater(defaultMethod.defaultCoffee, defaultMethod.defaultRatio)
  })

  const [brewMethod, setBrewMethod] = useState<BrewMethod>(() => {
    const stored = loadSettings()
    return stored?.brewMethod ?? "pourOver"
  })

  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(() => {
    const stored = loadSettings()
    return stored?.measurementMode ?? defaultMethod.preferredMode
  })

  useEffect(() => {
    saveSettings({ coffee, water, ratio, brewMethod, measurementMode })
  }, [coffee, water, ratio, brewMethod, measurementMode])

  const currentFieldRef = useRef<FieldType>("ratio")
  const previousFieldRef = useRef<FieldType>("ratio")

  const updateFieldTracking = (field: FieldType) => {
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
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Settings</FieldLegend>

            <FieldDescription>
              Choose how you want to measure strength and optionally select a preset brew method.
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Unit</FieldLabel>

                <ToggleGroup
                  value={[measurementMode]}
                  onValueChange={handleMeasurementModeChange}
                  variant="outline"
                  className="w-full"
                >
                  <ToggleGroupItem value="ratio" className="flex-1">
                    Ratio
                  </ToggleGroupItem>

                  <ToggleGroupItem value="gramsPerLitre" className="flex-1">
                    g/L
                  </ToggleGroupItem>
                </ToggleGroup>

                <FieldDescription>Ratio (1:16) or grams per litre (62.5 g/L).</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="preset">Preset</FieldLabel>

                <Select value={brewMethod} onValueChange={handleBrewMethodChange}>
                  <SelectTrigger id="preset" className="w-full">
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

                <FieldDescription>Common brew methods with recommended ratios.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <FieldSet>
            <FieldLegend>Calculator</FieldLegend>

            <FieldDescription>Enter any two values and the third will be calculated.</FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="coffee">Coffee</FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    id="coffee"
                    type="number"
                    inputMode="decimal"
                    value={coffee || ""}
                    onChange={(e) => handleCoffeeChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupText>g</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                <FieldDescription>Dry coffee weight.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="water">Water</FieldLabel>

                <InputGroup>
                  <InputGroupInput
                    id="water"
                    type="number"
                    inputMode="decimal"
                    value={water || ""}
                    onChange={(e) => handleWaterChange(e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />

                  <InputGroupAddon align="inline-end">
                    <InputGroupText>g</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>

                <FieldDescription>Total water weight.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>
                  Strength{" "}
                  <Badge variant="default" className="ml-auto">
                    {measurementMode === "ratio" ? `${formatNumber(gramsPerLitre)} g/L` : `1:${formatNumber(ratio)}`}
                  </Badge>
                </FieldLabel>

                <div className="flex items-center gap-4">
                  {measurementMode === "ratio" ? (
                    <InputGroup className="flex-1">
                      <InputGroupInput
                        id="ratio"
                        type="number"
                        inputMode="decimal"
                        value={formatNumber(ratio)}
                        onChange={(e) => handleRatioChange(e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />

                      <InputGroupAddon align="inline-start">
                        <InputGroupText>1:</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  ) : (
                    <InputGroup className="flex-1">
                      <InputGroupInput
                        id="gpl"
                        type="number"
                        inputMode="decimal"
                        value={formatNumber(gramsPerLitre)}
                        onChange={(e) => handleGplChange(e.target.value)}
                        onFocus={(e) => e.target.select()}
                      />

                      <InputGroupAddon align="inline-end">
                        <InputGroupText>g/L</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  )}
                </div>

                <FieldDescription>Coffee to water ratio.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  )
}
