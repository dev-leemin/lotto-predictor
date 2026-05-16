export function getBallColor(num: number): { bg: string; text: string } {
  if (num <= 10) return { bg: '#FBC400', text: '#7A5C00' }
  if (num <= 20) return { bg: '#69C8F2', text: '#FFFFFF' }
  if (num <= 30) return { bg: '#FF7272', text: '#FFFFFF' }
  if (num <= 40) return { bg: '#AAAAAA', text: '#FFFFFF' }
  return { bg: '#B0D840', text: '#FFFFFF' }
}

export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (mins > 0) {
    return `${mins}분 ${secs}초`
  }
  return `${secs}초`
}
