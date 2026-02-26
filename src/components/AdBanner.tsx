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
    // AdSense 미설정 시 자리 표시
    return (
      <div className={`w-full flex items-center justify-center py-3 ${className}`}>
        <div className="w-full max-w-2xl h-[90px] rounded-xl bg-white/5 border border-white/10 border-dashed flex items-center justify-center">
          <span className="text-xs text-gray-600">AD</span>
        </div>
      </div>
    )
  }

  return (
    <div ref={adRef} className={`w-full flex justify-center py-3 ${className}`}>
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
