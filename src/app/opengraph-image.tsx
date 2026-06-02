import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Lotto45 - AI 로또 번호 추천 서비스'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 40,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '12px',
            }}
          >
            {[7, 13, 24, 33, 40, 45].map((n) => (
              <div
                key={n}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: n <= 10 ? '#FBC400' : n <= 20 ? '#69C8F2' : n <= 30 ? '#FF7272' : n <= 40 ? '#AAAAAA' : '#B0D840',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: n <= 10 ? '#7A5C00' : '#FFFFFF',
                }}
              >
                {n}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: '52px',
            fontWeight: 'bold',
            marginBottom: '16px',
          }}
        >
          Lotto45
        </div>
        <div
          style={{
            fontSize: '28px',
            opacity: 0.9,
            marginBottom: '8px',
          }}
        >
          AI 기반 로또 번호 추천 서비스
        </div>
        <div
          style={{
            fontSize: '22px',
            opacity: 0.7,
          }}
        >
          CDM · Markov Chain · Monte Carlo 앙상블 분석
        </div>
        <div
          style={{
            fontSize: '20px',
            opacity: 0.6,
            marginTop: '20px',
          }}
        >
          lotto45.kr
        </div>
      </div>
    ),
    {
      ...size,
    },
  )
}
