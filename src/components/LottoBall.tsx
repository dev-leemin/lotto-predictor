'use client'

interface LottoBallProps {
  number: number
  size?: 'sm' | 'md' | 'lg'
  isBonus?: boolean
}

export function LottoBall({ number, size = 'md', isBonus = false }: LottoBallProps) {
  const getColor = () => {
    if (number <= 10) return { bg: '#FBC400', text: '#7A5C00' }
    if (number <= 20) return { bg: '#69C8F2', text: '#FFFFFF' }
    if (number <= 30) return { bg: '#FF7272', text: '#FFFFFF' }
    if (number <= 40) return { bg: '#AAAAAA', text: '#FFFFFF' }
    return { bg: '#B0D840', text: '#FFFFFF' }
  }

  const sizeClass = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm sm:w-11 sm:h-11 sm:text-base',
    lg: 'w-14 h-14 text-xl',
  }[size]

  const color = getColor()

  return (
    <div
      className={`
        ${sizeClass}
        rounded-full flex items-center justify-center font-bold
        shadow-sm transition-transform hover:scale-105
        ${isBonus ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-gray-50' : ''}
      `}
      style={{ backgroundColor: color.bg, color: color.text }}
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