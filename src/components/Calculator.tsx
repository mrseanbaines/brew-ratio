import { useState, useCallback, useRef, useEffect } from "react"
import { Sparkles } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText } from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { loadSettings, saveSettings, clearSettings } from "@/lib/storage"

type FieldType = "coffee" | "water" | "ratio" | "gpl"

const defaultMethod = BREW_METHODS.custom

function getDefaultRatio(config: (typeof BREW_METHODS)[keyof typeof BREW_METHODS]): number {
  return config.preferredMode === "gramsPerLitre"
    ? gramsPerLitreToRatio(config.defaultGramsPerLitre)
    : config.defaultRatio
}

export function Calculator() {
  const [coffee, setCoffee] = useState(() => {
    const stored = loadSettings()
    return stored?.coffee ?? defaultMethod.defaultCoffee
  })

  const [ratio, setRatio] = useState(() => {
    const stored = loadSettings()
    return stored?.ratio ?? getDefaultRatio(defaultMethod)
  })

  const [water, setWater] = useState(() => {
    const stored = loadSettings()
    return stored?.water ?? calculateWater(defaultMethod.defaultCoffee, getDefaultRatio(defaultMethod))
  })

  const [brewMethod, setBrewMethod] = useState<BrewMethod>(() => {
    const stored = loadSettings()
    return stored?.brewMethod ?? defaultMethod.id
  })

  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>(() => {
    const stored = loadSettings()
    return stored?.measurementMode ?? defaultMethod.preferredMode
  })

  useEffect(() => {
    saveSettings({ coffee, water, ratio, brewMethod, measurementMode })
  }, [coffee, water, ratio, brewMethod, measurementMode])

  const [calculatedField, setCalculatedField] = useState<"coffee" | "water" | "ratio">("water")
  const calculatedFieldRef = useRef<"coffee" | "water" | "ratio">("water")

  const [flashKeys, setFlashKeys] = useState({ coffee: 0, water: 0, ratio: 0 })
  const [hasEdited, setHasEdited] = useState(false)
  const hasEditedRef = useRef(false)

  const setCalculated = (field: "coffee" | "water" | "ratio") => {
    const isFirstEdit = !hasEditedRef.current
    if (isFirstEdit) {
      hasEditedRef.current = true
      setHasEdited(true)
    }
    if (isFirstEdit || calculatedFieldRef.current !== field) {
      setFlashKeys((prev) => ({ ...prev, [field]: prev[field] + 1 }))
      calculatedFieldRef.current = field
    }
    setCalculatedField(field)
  }

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
        setCalculated("ratio")
      } else {
        setWater(calculateWater(coffeeValue, ratio))
        setCalculated("water")
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
        setCalculated("ratio")
      } else {
        setCoffee(calculateCoffee(waterValue, ratio))
        setCalculated("coffee")
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
        setCalculated("coffee")
      } else {
        setWater(calculateWater(coffee, ratioValue))
        setCalculated("water")
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
        setCalculated("coffee")
      } else {
        setWater(calculateWater(coffee, newRatio))
        setCalculated("water")
      }
    },
    [coffee, water],
  )

  const handleReset = useCallback(() => {
    clearSettings()
    const defaultRatio = getDefaultRatio(defaultMethod)
    setCoffee(defaultMethod.defaultCoffee)
    setRatio(defaultRatio)
    setWater(calculateWater(defaultMethod.defaultCoffee, defaultRatio))
    setBrewMethod(defaultMethod.id)
    setMeasurementMode(defaultMethod.preferredMode)
    setCalculatedField("water")
    calculatedFieldRef.current = "water"
    hasEditedRef.current = false
    setHasEdited(false)
  }, [])

  const handleBrewMethodChange = useCallback((value: BrewMethod | null) => {
    if (!value) return
    setBrewMethod(value)
    const config = BREW_METHODS[value]
    setCoffee(config.defaultCoffee)
    const newRatio =
      config.preferredMode === "gramsPerLitre" ? gramsPerLitreToRatio(config.defaultGramsPerLitre) : config.defaultRatio
    setRatio(newRatio)
    setWater(calculateWater(config.defaultCoffee, newRatio))
    setMeasurementMode(config.preferredMode)
    setCalculatedField("water")
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

                <div className="relative">
                  {flashKeys.coffee > 0 && <div key={flashKeys.coffee} className="field-flash absolute inset-0" />}
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

                  <Sparkles
                    className={`absolute top-1/2 left-full ml-2 size-3.5 -translate-y-1/2 transition-opacity ${hasEdited && calculatedField === "coffee" ? "opacity-100" : "opacity-0"}`}
                  />
                </div>

                <FieldDescription>Dry coffee weight.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="water">Water</FieldLabel>

                <div className="relative">
                  {flashKeys.water > 0 && <div key={flashKeys.water} className="field-flash absolute inset-0" />}
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

                  <Sparkles
                    className={`absolute top-1/2 left-full ml-2 size-3.5 -translate-y-1/2 transition-opacity ${hasEdited && calculatedField === "water" ? "opacity-100" : "opacity-0"}`}
                  />
                </div>

                <FieldDescription>Total water weight.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>
                  Strength{" "}
                  <Badge variant="default" className="ml-auto">
                    {measurementMode === "ratio" ? `${formatNumber(gramsPerLitre)} g/L` : `1:${formatNumber(ratio)}`}
                  </Badge>
                </FieldLabel>

                <div className="relative">
                  {flashKeys.ratio > 0 && <div key={flashKeys.ratio} className="field-flash absolute inset-0" />}
                  {measurementMode === "ratio" ? (
                    <InputGroup>
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
                    <InputGroup>
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

                  <Sparkles
                    className={`absolute top-1/2 left-full ml-2 size-3.5 -translate-y-1/2 transition-opacity ${hasEdited && calculatedField === "ratio" ? "opacity-100" : "opacity-0"}`}
                  />
                </div>

                <FieldDescription>Coffee to water ratio.</FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />

          <Button variant="outline" size="sm" type="button" onClick={handleReset}>
            Reset to defaults
          </Button>
        </FieldGroup>
      </form>
    </div>
  )
}
