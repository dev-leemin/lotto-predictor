'use client'

import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import type { PieLabelRenderProps } from 'recharts'

interface StatsData {
  totalRounds: number
  numberFreq: Array<{ number: number; count: number }>
  sumDist: Array<{ range: string; count: number; percent: number }>
  oddEven: Array<{ ratio: string; count: number; percent: number }>
  highLow: Array<{ ratio: string; count: number; percent: number }>
  avgFreq: number
}

function getBallColor(num: number): string {
  if (num <= 10) return '#FBC400'
  if (num <= 20) return '#69C8F2'
  if (num <= 30) return '#FF7272'
  if (num <= 40) return '#AAAAAA'
  return '#B0D840'
}

const PIE_COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F5F3FF']

export default function StatsCharts() {
  const [data, setData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-500">실시간 통계 로딩 중...</span>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center">
        <p className="text-sm text-red-600">통계 데이터를 불러오지 못했습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 번호별 출현 빈도 바 차트 */}
      <section className="p-4 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-1">번호별 출현 빈도</h2>
        <p className="text-xs text-gray-500 mb-4">
          1~45번 각 번호가 역대 {data.totalRounds}회차에서 출현한 횟수 (보너스 포함)
        </p>
        <div className="w-full overflow-x-auto -mx-2 px-2">
          <div className="min-w-[600px]" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.numberFreq} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="number"
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  interval={0}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}회`, '출현 횟수']}
                  labelFormatter={(label) => `${label}번`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar
                  dataKey="count"
                  radius={[2, 2, 0, 0]}
                  isAnimationActive={true}
                >
                  {data.numberFreq.map((entry) => (
                    <Cell key={entry.number} fill={getBallColor(entry.number)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-3 justify-center">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FBC400' }} /> 1-10
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#69C8F2' }} /> 11-20
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#FF7272' }} /> 21-30
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#AAAAAA' }} /> 31-40
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#B0D840' }} /> 41-45
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-0.5 bg-indigo-400" /> 평균 {data.avgFreq}회
          </span>
        </div>
      </section>

      {/* 합계 분포 + 홀짝·고저 비율 (2단) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 합계 분포 바 차트 */}
        <section className="p-4 sm:p-6 rounded-2xl bg-violet-50 border border-violet-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">당첨번호 합계 분포</h2>
          <p className="text-xs text-gray-500 mb-4">
            6개 번호 합계 구간별 비율
          </p>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.sumDist} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DDD6FE" />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  unit="%"
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, '비율']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #DDD6FE', fontSize: 12 }}
                />
                <Bar dataKey="percent" radius={[4, 4, 0, 0]}>
                  {data.sumDist.map((entry, idx) => (
                    <Cell
                      key={entry.range}
                      fill={idx === 2 ? '#7C3AED' : idx === 1 || idx === 3 ? '#A78BFA' : '#DDD6FE'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            121~160 구간이 가장 높은 비율
          </p>
        </section>

        {/* 홀짝 + 고저 파이 차트 */}
        <section className="p-4 sm:p-6 rounded-2xl bg-indigo-50 border border-indigo-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">홀짝 / 고저 비율 분포</h2>
          <p className="text-xs text-gray-500 mb-4">
            역대 당첨번호의 홀짝·고저 조합 분포
          </p>
          <div className="grid grid-cols-2 gap-2">
            {/* 홀짝 */}
            <div>
              <p className="text-xs font-bold text-gray-700 text-center mb-2">홀짝 비율</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.oddEven.slice(0, 5)}
                      dataKey="percent"
                      nameKey="ratio"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      label={(props: PieLabelRenderProps) => `${String(props.name || '').replace('홀', '').replace('짝', '')} ${props.percent}%`}
                    >
                      {data.oddEven.slice(0, 5).map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, '비율']}
                      contentStyle={{ borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* 고저 */}
            <div>
              <p className="text-xs font-bold text-gray-700 text-center mb-2">고저 비율</p>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.highLow.slice(0, 5)}
                      dataKey="percent"
                      nameKey="ratio"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={2}
                      label={(props: PieLabelRenderProps) => `${String(props.name || '').replace('저', '').replace('고', '')} ${props.percent}%`}
                    >
                      {data.highLow.slice(0, 5).map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value}%`, '비율']}
                      contentStyle={{ borderRadius: 8, fontSize: 11 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 범례 */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="space-y-1">
              {data.oddEven.slice(0, 4).map((item, idx) => (
                <div key={item.ratio} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-gray-600">{item.ratio} — {item.percent}%</span>
                </div>
              ))}
            </div>
            <div className="space-y-1">
              {data.highLow.slice(0, 4).map((item, idx) => (
                <div key={item.ratio} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="text-gray-600">{item.ratio} — {item.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
