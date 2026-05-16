'use client'

import { useEffect, useRef } from 'react'

interface AdBannerProps {
  slot?: string
  format?: 'auto' | 'fluid' | 'rectangle'
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: Array<Record<string, unknown>>
  }
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({})
        pushed.current = true
      }
    } catch {
      // AdSense not loaded yet
    }
  }, [])

  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID

  if (!adsenseId) {
    return null
  }

  return (
    <div ref={adRef} className={`w-full flex flex-col items-center py-3 ${className}`}>
      <span className="text-[10px] text-gray-400 mb-1">광고</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adsenseId}
        data-ad-slot={slot || ''}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
