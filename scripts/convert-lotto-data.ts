// JSONL 데이터를 TypeScript 파일로 변환
import * as fs from 'fs'
import * as path from 'path'

interface LottoJsonData {
  drwNo: number
  drwNoDate: string
  drwtNo1: number
  drwtNo2: number
  drwtNo3: number
  drwtNo4: number
  drwtNo5: number
  drwtNo6: number
  bnusNo: number
  firstWinamnt: number
  firstPrzwnerCo: number
}

// 1111~1206회차 데이터 (수동 추가)
const additionalData: Array<{
  round: number
  date: string
  numbers: number[]
  bonus: number
  firstPrize: number
  firstWinners: number
}> = [
  { round: 1111, date: '2024-03-16', numbers: [6, 14, 16, 21, 27, 37], bonus: 45, firstPrize: 2531481500, firstWinners: 11 },
  { round: 1112, date: '2024-03-23', numbers: [4, 7, 12, 14, 22, 33], bonus: 31, firstPrize: 2082149917, firstWinners: 13 },
  { round: 1113, date: '2024-03-30', numbers: [1, 6, 11, 28, 32, 42], bonus: 18, firstPrize: 2062426667, firstWinners: 12 },
  { round: 1114, date: '2024-04-06', numbers: [2, 8, 19, 32, 37, 40], bonus: 7, firstPrize: 2509892875, firstWinners: 8 },
  { round: 1115, date: '2024-04-13', numbers: [8, 21, 23, 24, 34, 40], bonus: 37, firstPrize: 1811632773, firstWinners: 11 },
  { round: 1116, date: '2024-04-20', numbers: [9, 13, 32, 38, 39, 43], bonus: 23, firstPrize: 2055693050, firstWinners: 10 },
  { round: 1117, date: '2024-04-27', numbers: [1, 3, 23, 24, 27, 40], bonus: 12, firstPrize: 2179456071, firstWinners: 14 },
  { round: 1118, date: '2024-05-04', numbers: [6, 12, 19, 22, 31, 45], bonus: 40, firstPrize: 2166139750, firstWinners: 8 },
  { round: 1119, date: '2024-05-11', numbers: [9, 12, 20, 26, 34, 39], bonus: 13, firstPrize: 2252927308, firstWinners: 13 },
  { round: 1120, date: '2024-05-18', numbers: [4, 10, 14, 18, 30, 36], bonus: 8, firstPrize: 1936447643, firstWinners: 14 },
  { round: 1121, date: '2024-05-25', numbers: [4, 11, 15, 21, 28, 36], bonus: 23, firstPrize: 2210159750, firstWinners: 12 },
  { round: 1122, date: '2024-06-01', numbers: [7, 9, 25, 30, 35, 45], bonus: 10, firstPrize: 1784267692, firstWinners: 13 },
  { round: 1123, date: '2024-06-08', numbers: [1, 5, 16, 18, 38, 44], bonus: 21, firstPrize: 2105953077, firstWinners: 13 },
  { round: 1124, date: '2024-06-15', numbers: [4, 12, 14, 25, 28, 34], bonus: 8, firstPrize: 2081679000, firstWinners: 9 },
  { round: 1125, date: '2024-06-22', numbers: [4, 9, 12, 20, 25, 45], bonus: 7, firstPrize: 2399046100, firstWinners: 10 },
  { round: 1126, date: '2024-06-29', numbers: [3, 8, 18, 21, 39, 42], bonus: 11, firstPrize: 2007604615, firstWinners: 13 },
  { round: 1127, date: '2024-07-06', numbers: [5, 10, 11, 17, 28, 34], bonus: 45, firstPrize: 1901392900, firstWinners: 10 },
  { round: 1128, date: '2024-07-13', numbers: [3, 18, 21, 36, 38, 45], bonus: 13, firstPrize: 1936073611, firstWinners: 18 },
  { round: 1129, date: '2024-07-20', numbers: [1, 3, 17, 32, 41, 45], bonus: 27, firstPrize: 1879979375, firstWinners: 16 },
  { round: 1130, date: '2024-07-27', numbers: [8, 15, 17, 19, 44, 45], bonus: 10, firstPrize: 2096549222, firstWinners: 18 },
  { round: 1131, date: '2024-08-03', numbers: [4, 11, 14, 30, 31, 36], bonus: 18, firstPrize: 2178012538, firstWinners: 13 },
  { round: 1132, date: '2024-08-10', numbers: [5, 7, 13, 18, 36, 45], bonus: 33, firstPrize: 2105296300, firstWinners: 10 },
  { round: 1133, date: '2024-08-17', numbers: [5, 9, 11, 17, 21, 43], bonus: 1, firstPrize: 1806694556, firstWinners: 18 },
  { round: 1134, date: '2024-08-24', numbers: [5, 6, 12, 30, 33, 45], bonus: 10, firstPrize: 1873408769, firstWinners: 13 },
  { round: 1135, date: '2024-08-31', numbers: [5, 11, 22, 28, 31, 44], bonus: 10, firstPrize: 1809050929, firstWinners: 14 },
  { round: 1136, date: '2024-09-07', numbers: [3, 10, 12, 18, 24, 39], bonus: 40, firstPrize: 1959100182, firstWinners: 11 },
  { round: 1137, date: '2024-09-14', numbers: [3, 9, 17, 19, 26, 45], bonus: 27, firstPrize: 1768109278, firstWinners: 18 },
  { round: 1138, date: '2024-09-21', numbers: [13, 19, 20, 32, 39, 43], bonus: 2, firstPrize: 2058166083, firstWinners: 12 },
  { round: 1139, date: '2024-09-28', numbers: [5, 17, 18, 21, 28, 42], bonus: 4, firstPrize: 1951412667, firstWinners: 15 },
  { round: 1140, date: '2024-10-05', numbers: [5, 13, 22, 25, 28, 41], bonus: 36, firstPrize: 2173839786, firstWinners: 14 },
  { round: 1141, date: '2024-10-12', numbers: [1, 8, 11, 15, 24, 40], bonus: 42, firstPrize: 1820073188, firstWinners: 16 },
  { round: 1142, date: '2024-10-19', numbers: [2, 7, 13, 18, 28, 41], bonus: 32, firstPrize: 1863706875, firstWinners: 16 },
  { round: 1143, date: '2024-10-26', numbers: [6, 10, 11, 20, 24, 40], bonus: 37, firstPrize: 2197063750, firstWinners: 12 },
  { round: 1144, date: '2024-11-02', numbers: [15, 20, 21, 25, 29, 44], bonus: 12, firstPrize: 1873217167, firstWinners: 18 },
  { round: 1145, date: '2024-11-09', numbers: [3, 8, 15, 29, 35, 44], bonus: 43, firstPrize: 1798785588, firstWinners: 17 },
  { round: 1146, date: '2024-11-16', numbers: [9, 13, 17, 22, 25, 33], bonus: 27, firstPrize: 1903648357, firstWinners: 14 },
  { round: 1147, date: '2024-11-23', numbers: [7, 11, 20, 35, 39, 44], bonus: 5, firstPrize: 1764203000, firstWinners: 15 },
  { round: 1148, date: '2024-11-30', numbers: [2, 4, 5, 6, 10, 44], bonus: 42, firstPrize: 1848667824, firstWinners: 17 },
  { round: 1149, date: '2024-12-07', numbers: [6, 12, 17, 24, 30, 45], bonus: 13, firstPrize: 1789624867, firstWinners: 15 },
  { round: 1150, date: '2024-12-14', numbers: [2, 5, 7, 16, 25, 42], bonus: 34, firstPrize: 2030469800, firstWinners: 10 },
  { round: 1151, date: '2024-12-21', numbers: [3, 7, 15, 29, 37, 40], bonus: 42, firstPrize: 1870168786, firstWinners: 14 },
  { round: 1152, date: '2024-12-28', numbers: [7, 11, 24, 28, 35, 39], bonus: 5, firstPrize: 1869405727, firstWinners: 11 },
  { round: 1153, date: '2025-01-04', numbers: [9, 11, 16, 26, 29, 38], bonus: 40, firstPrize: 2140376300, firstWinners: 10 },
  { round: 1154, date: '2025-01-11', numbers: [3, 5, 6, 19, 26, 39], bonus: 24, firstPrize: 2065167182, firstWinners: 11 },
  { round: 1155, date: '2025-01-18', numbers: [1, 6, 14, 21, 31, 44], bonus: 12, firstPrize: 2063979500, firstWinners: 10 },
  { round: 1156, date: '2025-01-25', numbers: [5, 13, 19, 23, 40, 43], bonus: 11, firstPrize: 1848361538, firstWinners: 13 },
  { round: 1157, date: '2025-02-01', numbers: [1, 6, 11, 17, 36, 45], bonus: 43, firstPrize: 2056178273, firstWinners: 11 },
  { round: 1158, date: '2025-02-08', numbers: [6, 10, 11, 14, 15, 38], bonus: 44, firstPrize: 2185628357, firstWinners: 14 },
  { round: 1159, date: '2025-02-15', numbers: [6, 7, 22, 27, 37, 40], bonus: 17, firstPrize: 1856817875, firstWinners: 16 },
  { round: 1160, date: '2025-02-22', numbers: [2, 4, 21, 24, 34, 38], bonus: 41, firstPrize: 2072481571, firstWinners: 14 },
  { round: 1161, date: '2025-03-01', numbers: [1, 6, 10, 14, 22, 45], bonus: 38, firstPrize: 1786009077, firstWinners: 13 },
  { round: 1162, date: '2025-03-08', numbers: [1, 10, 14, 28, 34, 45], bonus: 35, firstPrize: 2182879214, firstWinners: 14 },
  { round: 1163, date: '2025-03-15', numbers: [9, 11, 15, 24, 43, 44], bonus: 26, firstPrize: 1922179417, firstWinners: 12 },
  { round: 1164, date: '2025-03-22', numbers: [3, 15, 16, 17, 25, 29], bonus: 45, firstPrize: 2039844556, firstWinners: 18 },
  { round: 1165, date: '2025-03-29', numbers: [4, 8, 14, 27, 31, 38], bonus: 26, firstPrize: 2030785923, firstWinners: 13 },
  { round: 1166, date: '2025-04-05', numbers: [4, 8, 12, 14, 32, 37], bonus: 16, firstPrize: 1908847667, firstWinners: 12 },
  { round: 1167, date: '2025-04-12', numbers: [6, 9, 17, 19, 22, 31], bonus: 37, firstPrize: 1943816563, firstWinners: 16 },
  { round: 1168, date: '2025-04-19', numbers: [5, 7, 25, 29, 37, 41], bonus: 42, firstPrize: 2045197300, firstWinners: 10 },
  { round: 1169, date: '2025-04-26', numbers: [6, 14, 17, 34, 38, 39], bonus: 45, firstPrize: 1885421813, firstWinners: 16 },
  { round: 1170, date: '2025-05-03', numbers: [7, 15, 18, 27, 29, 45], bonus: 25, firstPrize: 2129917167, firstWinners: 18 },
  { round: 1171, date: '2025-05-10', numbers: [6, 11, 16, 19, 23, 43], bonus: 24, firstPrize: 2073108167, firstWinners: 12 },
  { round: 1172, date: '2025-05-17', numbers: [12, 14, 22, 28, 34, 40], bonus: 18, firstPrize: 1937178214, firstWinners: 14 },
  { round: 1173, date: '2025-05-24', numbers: [2, 6, 13, 19, 37, 44], bonus: 26, firstPrize: 1827667818, firstWinners: 11 },
  { round: 1174, date: '2025-05-31', numbers: [3, 5, 18, 27, 35, 39], bonus: 10, firstPrize: 2130620200, firstWinners: 10 },
  { round: 1175, date: '2025-06-07', numbers: [1, 12, 15, 27, 34, 43], bonus: 37, firstPrize: 2025148875, firstWinners: 16 },
  { round: 1176, date: '2025-06-14', numbers: [2, 10, 24, 27, 28, 43], bonus: 36, firstPrize: 2077671500, firstWinners: 10 },
  { round: 1177, date: '2025-06-21', numbers: [2, 6, 9, 17, 20, 43], bonus: 44, firstPrize: 2015696643, firstWinners: 14 },
  { round: 1178, date: '2025-06-28', numbers: [9, 15, 16, 17, 35, 39], bonus: 36, firstPrize: 1927478588, firstWinners: 17 },
  { round: 1179, date: '2025-07-05', numbers: [4, 5, 6, 14, 33, 41], bonus: 27, firstPrize: 2216178333, firstWinners: 12 },
  { round: 1180, date: '2025-07-12', numbers: [3, 14, 17, 30, 33, 41], bonus: 38, firstPrize: 1924685389, firstWinners: 18 },
  { round: 1181, date: '2025-07-19', numbers: [8, 9, 20, 25, 26, 39], bonus: 3, firstPrize: 2073890600, firstWinners: 10 },
  { round: 1182, date: '2025-07-26', numbers: [3, 9, 13, 19, 25, 45], bonus: 29, firstPrize: 2014339231, firstWinners: 13 },
  { round: 1183, date: '2025-08-02', numbers: [10, 17, 24, 26, 38, 40], bonus: 44, firstPrize: 1952691333, firstWinners: 15 },
  { round: 1184, date: '2025-08-09', numbers: [3, 8, 20, 33, 38, 42], bonus: 13, firstPrize: 2069437556, firstWinners: 18 },
  { round: 1185, date: '2025-08-16', numbers: [4, 8, 12, 16, 32, 33], bonus: 19, firstPrize: 2017929786, firstWinners: 14 },
  { round: 1186, date: '2025-08-23', numbers: [5, 6, 16, 28, 36, 44], bonus: 11, firstPrize: 1855098923, firstWinners: 13 },
  { round: 1187, date: '2025-08-30', numbers: [2, 5, 15, 21, 35, 39], bonus: 40, firstPrize: 1992173643, firstWinners: 14 },
  { round: 1188, date: '2025-09-06', numbers: [13, 19, 21, 24, 37, 45], bonus: 34, firstPrize: 2105289800, firstWinners: 10 },
  { round: 1189, date: '2025-09-13', numbers: [1, 4, 8, 14, 27, 35], bonus: 29, firstPrize: 1879624769, firstWinners: 13 },
  { round: 1190, date: '2025-09-20', numbers: [10, 13, 20, 32, 37, 45], bonus: 5, firstPrize: 2168467643, firstWinners: 14 },
  { round: 1191, date: '2025-09-27', numbers: [4, 5, 8, 11, 37, 40], bonus: 28, firstPrize: 1923048571, firstWinners: 14 },
  { round: 1192, date: '2025-10-04', numbers: [3, 11, 20, 22, 32, 45], bonus: 35, firstPrize: 2137612538, firstWinners: 13 },
  { round: 1193, date: '2025-10-11', numbers: [5, 13, 18, 27, 34, 42], bonus: 16, firstPrize: 1955329833, firstWinners: 12 },
  { round: 1194, date: '2025-10-18', numbers: [1, 14, 17, 25, 37, 42], bonus: 23, firstPrize: 1893516533, firstWinners: 15 },
  { round: 1195, date: '2025-10-25', numbers: [2, 10, 15, 20, 29, 43], bonus: 31, firstPrize: 2042768500, firstWinners: 12 },
  { round: 1196, date: '2025-11-01', numbers: [4, 8, 22, 25, 38, 45], bonus: 14, firstPrize: 1989127636, firstWinners: 11 },
  { round: 1197, date: '2025-11-08', numbers: [1, 5, 7, 26, 28, 43], bonus: 30, firstPrize: 2205089827, firstWinners: 13 },
  { round: 1198, date: '2025-11-15', numbers: [26, 30, 33, 38, 39, 41], bonus: 21, firstPrize: 2953686638, firstWinners: 10 },
  { round: 1199, date: '2025-11-22', numbers: [16, 24, 25, 30, 31, 32], bonus: 7, firstPrize: 1695609839, firstWinners: 17 },
  { round: 1200, date: '2025-11-29', numbers: [1, 2, 4, 16, 20, 32], bonus: 45, firstPrize: 2357299875, firstWinners: 12 },
  { round: 1201, date: '2025-12-06', numbers: [7, 9, 24, 27, 35, 36], bonus: 37, firstPrize: 1414555718, firstWinners: 19 },
  { round: 1202, date: '2025-12-13', numbers: [5, 12, 21, 33, 37, 40], bonus: 7, firstPrize: 1920410813, firstWinners: 14 },
  { round: 1203, date: '2025-12-20', numbers: [3, 6, 18, 29, 35, 39], bonus: 24, firstPrize: 1368060733, firstWinners: 21 },
  { round: 1204, date: '2025-12-27', numbers: [8, 16, 28, 30, 31, 44], bonus: 27, firstPrize: 1661007688, firstWinners: 18 },
  { round: 1205, date: '2026-01-03', numbers: [1, 4, 16, 23, 31, 41], bonus: 2, firstPrize: 3226386263, firstWinners: 10 },
  { round: 1206, date: '2026-01-10', numbers: [1, 3, 17, 26, 27, 42], bonus: 23, firstPrize: 1868807000, firstWinners: 15 },
]

async function main() {
  const jsonlPath = path.join(__dirname, '../data/lotto_numbers.jsonl')
  const outputPath = path.join(__dirname, '../src/data/sample-lotto.ts')

  // JSONL 파일 읽기
  const jsonlContent = fs.readFileSync(jsonlPath, 'utf-8')
  const lines = jsonlContent.trim().split('\n')

  const allData: Array<{
    round: number
    date: string
    numbers: number[]
    bonus: number
    firstPrize: number
    firstWinners: number
  }> = []

  // JSONL 데이터 파싱 (1~1110회차)
  for (const line of lines) {
    const data: LottoJsonData = JSON.parse(line)
    const numbers = [
      data.drwtNo1,
      data.drwtNo2,
      data.drwtNo3,
      data.drwtNo4,
      data.drwtNo5,
      data.drwtNo6,
    ].sort((a, b) => a - b)

    allData.push({
      round: data.drwNo,
      date: data.drwNoDate,
      numbers,
      bonus: data.bnusNo,
      firstPrize: data.firstWinamnt,
      firstWinners: data.firstPrzwnerCo,
    })
  }

  // 1111~1206회차 추가
  allData.push(...additionalData)

  // round 기준 정렬 (내림차순 - 최신이 먼저)
  allData.sort((a, b) => b.round - a.round)

  // TypeScript 파일 생성
  const tsContent = `// 로또 역대 당첨번호 데이터 (1회차 ~ ${allData[0].round}회차)
// 자동 생성됨 - 수정하지 마세요

export interface LottoData {
  round: number
  date: string
  numbers: number[]
  bonus: number
  firstPrize: number
  firstWinners: number
}

export const SAMPLE_LOTTO_DATA: LottoData[] = [
${allData.map(d => `  { round: ${d.round}, date: '${d.date}', numbers: [${d.numbers.join(', ')}], bonus: ${d.bonus}, firstPrize: ${d.firstPrize}, firstWinners: ${d.firstWinners} },`).join('\n')}
]

export const LATEST_ROUND = ${allData[0].round}
export const TOTAL_ROUNDS = ${allData.length}
`

  fs.writeFileSync(outputPath, tsContent)
  console.log(`✅ 생성 완료: ${outputPath}`)
  console.log(`   총 ${allData.length}개 회차 (${allData[allData.length - 1].round}회 ~ ${allData[0].round}회)`)
}

main().catch(console.error)
