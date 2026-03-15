import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { BrewMethod, MeasurementMode } from "@/lib/types"
import { BREW_METHODS, DEFAULT_COFFEE, DEFAULT_RATIO } from "@/lib/constants"
import {
  calculateWater,
  calculateCoffee,
  ratioToGramsPerLitre,
  gramsPerLitreToRatio,
  formatRatio,
  formatGramsPerLitre,
} from "@/lib/calculator"

export function Calculator() {
  const [coffee, setCoffee] = useState(DEFAULT_COFFEE)
  const [ratio, setRatio] = useState(DEFAULT_RATIO)
  const [water, setWater] = useState(calculateWater(DEFAULT_COFFEE, DEFAULT_RATIO))
  const [brewMethod, setBrewMethod] = useState<BrewMethod>("pourOver")
  const [measurementMode, setMeasurementMode] = useState<MeasurementMode>("ratio")
  const [lastEdited, setLastEdited] = useState<"coffee" | "water">("coffee")

  const methodConfig = BREW_METHODS[brewMethod]
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

  const handleSliderChange = useCallback(
    (value: number | readonly number[]) => {
      const sliderValue = Array.isArray(value) ? value[0] : value
      let newRatio: number

      if (measurementMode === "ratio") {
        newRatio = sliderValue
      } else {
        newRatio = gramsPerLitreToRatio(sliderValue)
      }

      setRatio(newRatio)
      if (lastEdited === "coffee") {
        setWater(calculateWater(coffee, newRatio))
      } else {
        setCoffee(calculateCoffee(water, newRatio))
      }
    },
    [coffee, water, lastEdited, measurementMode],
  )

  const handleBrewMethodChange = useCallback((value: BrewMethod | null) => {
    if (!value) return
    setBrewMethod(value)
    const config = BREW_METHODS[value]
    setRatio(config.defaultRatio)
    setMeasurementMode(config.preferredMode)
  }, [])

  const handleMeasurementModeChange = useCallback((value: readonly string[]) => {
    const mode = value[0] as MeasurementMode | undefined
    if (mode) {
      setMeasurementMode(mode)
    }
  }, [])

  useEffect(() => {
    if (lastEdited === "coffee") {
      setWater(calculateWater(coffee, ratio))
    } else {
      setCoffee(calculateCoffee(water, ratio))
    }
  }, [ratio])

  const sliderMin =
    measurementMode === "ratio" ? methodConfig.ratioRange[0] : ratioToGramsPerLitre(methodConfig.ratioRange[1])
  const sliderMax =
    measurementMode === "ratio" ? methodConfig.ratioRange[1] : ratioToGramsPerLitre(methodConfig.ratioRange[0])
  const sliderValue = measurementMode === "ratio" ? ratio : gramsPerLitre
  const sliderStep = measurementMode === "ratio" ? 0.5 : 1

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="space-y-4">
        <Select value={brewMethod} onValueChange={handleBrewMethodChange}>
          <SelectTrigger className="w-full h-12 text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(BREW_METHODS).map((method) => (
              <SelectItem key={method.id} value={method.id}>
                {method.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-light">
            {measurementMode === "ratio" ? formatRatio(ratio) : formatGramsPerLitre(gramsPerLitre)}
          </span>
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
        <Slider
          value={[sliderValue]}
          onValueChange={handleSliderChange}
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{measurementMode === "ratio" ? formatRatio(sliderMin) : formatGramsPerLitre(sliderMin)}</span>
          <span>{measurementMode === "ratio" ? formatRatio(sliderMax) : formatGramsPerLitre(sliderMax)}</span>
        </div>
      </div>
    </div>
  )
}
