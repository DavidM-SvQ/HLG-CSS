import * as React from "react"
import { cn } from "../../lib/utils"

interface DualRangeSliderProps {
  min: number
  max: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  className?: string
}

export function DualRangeSlider({ min, max, value, onChange, className }: DualRangeSliderProps) {
  const [minVal, maxVal] = value;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMin = Number(e.target.value);
    if (newMin > maxVal) {
      newMin = maxVal;
    }
    onChange([newMin, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMax = Number(e.target.value);
    if (newMax < minVal) {
      newMax = minVal;
    }
    onChange([minVal, newMax]);
  };

  // Safe checks for min/max
  const safeMin = min ?? 0;
  const safeMax = max ?? 100;
  const range = Math.max(1, safeMax - safeMin);
  
  const minPercent = ((minVal - safeMin) / range) * 100;
  const maxPercent = ((maxVal - safeMin) / range) * 100;

  return (
    <div className={cn("relative w-full h-8 flex items-center", className)}>
      {/* Track */}
      <div className="absolute w-full h-1.5 bg-neutral-200 rounded-full" />
      {/* Selected Range */}
      <div 
        className="absolute h-1.5 bg-blue-500 rounded-full cursor-pointer" 
        style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
      />
      {/* Min Slider */}
      <input
        type="range"
        min={safeMin}
        max={safeMax}
        value={minVal}
        onChange={handleMinChange}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        style={{ zIndex: minVal > safeMax - 1 ? 4 : 3 }}
      />
      {/* Max Slider */}
      <input
        type="range"
        min={safeMin}
        max={safeMax}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        style={{ zIndex: 4 }}
      />
    </div>
  )
}
