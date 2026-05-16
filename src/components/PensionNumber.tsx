'use client'

interface PensionNumberProps {
  group?: number
  numbers: number[]
  showGroup?: boolean
}

export function PensionNumber({ group, numbers, showGroup = true }: PensionNumberProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
      {showGroup && group && (
        <div className="w-8 h-9 sm:w-10 sm:h-11 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm"
          style={{ backgroundColor: '#F59E0B' }}>
          {group}조
        </div>
      )}

      <div className="flex gap-0.5 sm:gap-1">
        {numbers.map((num, idx) => (
          <div
            key={idx}
            className="w-8 h-9 sm:w-10 sm:h-11 rounded-lg flex items-center justify-center font-bold text-base sm:text-lg text-white shadow-sm"
            style={{ backgroundColor: '#8B5CF6' }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  )
}