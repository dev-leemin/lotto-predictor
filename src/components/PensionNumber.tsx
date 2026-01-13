'use client'

interface PensionNumberProps {
  group: number
  numbers: number[]
}

export function PensionNumber({ group, numbers }: PensionNumberProps) {
  return (
    <div className="flex items-center gap-2">
      {/* 조 번호 */}
      <div className="w-10 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg">
        {group}조
      </div>

      {/* 6자리 숫자 */}
      <div className="flex gap-1">
        {numbers.map((num, idx) => (
          <div
            key={idx}
            className="w-10 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xl text-white shadow-lg transition-transform hover:scale-105"
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  )
}
