'use client'

interface LottoBallProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
  isBonus?: boolean
}

export function LottoBall({ number, size = 'md', isBonus = false }: LottoBallProps) {
  const getColorClass = () => {
    if (number <= 10) return 'from-yellow-400 to-yellow-600 text-yellow-900'
    if (number <= 20) return 'from-blue-400 to-blue-600 text-white'
    if (number <= 30) return 'from-red-400 to-red-600 text-white'
    if (number <= 40) return 'from-gray-400 to-gray-600 text-white'
    return 'from-green-400 to-green-600 text-white'
  }

  const sizeClass = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  }[size]

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full flex items-center justify-center font-bold
        bg-gradient-to-br ${getColorClass()}
        shadow-lg transition-transform hover:scale-110
        ${isBonus ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0f0f1a]' : ''}
      `}
    >
      {number}
    </div>
  )
}

// 여러 공을 한 줄로 표시
interface LottoBallsProps {
  numbers: number[]
  bonus?: number
  size?: 'sm' | 'md' | 'lg'
}

export function LottoBalls({ numbers, bonus, size = 'md' }: LottoBallsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {numbers.map((num, idx) => (
        <LottoBall key={idx} number={num} size={size} />
      ))}
      {bonus !== undefined && (
        <>
          <span className="text-gray-400 mx-2">+</span>
          <LottoBall number={bonus} size={size} isBonus />
        </>
      )}
    </div>
  )
}
