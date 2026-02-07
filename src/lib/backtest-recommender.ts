/**
 * 백테스트 기반 추천 시스템
 *
 * 20개 공식을 과거 데이터로 검증하여 실제로 2~3개씩 맞춘 공식들을 기반으로 추천
 */

export interface LottoResultData {
  round: number
  numbers: number[]
  bonus: number
}

export interface BacktestSet {
  set: number
  numbers: number[]
  score: number
  method: string
  hitRate: number      // 전체 기간 적중률 (2+ 매치)
  recentHitRate: number // 최근 30회 적중률
}

// ========== 헬퍼 함수 ==========

function topFreq(history: LottoResultData[], n: number, count: number): number[] {
  const freq = new Map<number, number>();
  const subset = history.slice(-n);
  for (const r of subset) {
    for (const num of r.numbers) {
      freq.set(num, (freq.get(num) || 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(e => e[0]);
}

function fillTo6(arr: number[], history: LottoResultData[]): number[] {
  if (arr.length >= 6) return arr.slice(0, 6).sort((a, b) => a - b);
  const freq = topFreq(history, 50, 45);
  const result = [...arr];
  for (const n of freq) {
    if (result.length >= 6) break;
    if (!result.includes(n)) result.push(n);
  }
  return result.slice(0, 6).sort((a, b) => a - b);
}

function getGaps(history: LottoResultData[]): Map<number, { lastSeen: number; avgGap: number }> {
  const appearances = new Map<number, number[]>();
  for (let i = 1; i <= 45; i++) appearances.set(i, []);

  history.forEach((r, idx) => {
    for (const num of r.numbers) {
      appearances.get(num)!.push(idx);
    }
  });

  const result = new Map<number, { lastSeen: number; avgGap: number }>();
  const lastIdx = history.length - 1;

  for (let num = 1; num <= 45; num++) {
    const app = appearances.get(num)!;
    const lastSeen = app.length > 0 ? lastIdx - app[app.length - 1] : 999;
    let avgGap = 7; // 기본값
    if (app.length > 1) {
      let totalGap = 0;
      for (let i = 1; i < app.length; i++) {
        totalGap += app[i] - app[i - 1];
      }
      avgGap = totalGap / (app.length - 1);
    }
    result.set(num, { lastSeen, avgGap });
  }
  return result;
}

// ========== 20개 공식 ==========

// F1: 전회차 에코 - 최근 5회 중 2번 이상 나온 번호
function F1(history: LottoResultData[]): number[] {
  const recent5 = history.slice(-5);
  const freq = new Map<number, number>();
  for (const r of recent5) {
    for (const num of r.numbers) {
      freq.set(num, (freq.get(num) || 0) + 1);
    }
  }
  const result = [...freq.entries()]
    .filter(e => e[1] >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F2: 합계 기반 예측
function F2(history: LottoResultData[]): number[] {
  const recent10 = history.slice(-10);
  const avgSum = recent10.reduce((s, r) => s + r.numbers.reduce((a, b) => a + b, 0), 0) / 10;
  const freq = topFreq(history, 20, 45);

  let bestCombo: number[] = [];
  let bestDiff = Infinity;

  // 탐욕적으로 합계에 가까운 조합 생성
  const candidates = freq.slice(0, 20);
  for (let i = 0; i < 100; i++) {
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const combo = shuffled.slice(0, 6);
    const sum = combo.reduce((a, b) => a + b, 0);
    const diff = Math.abs(sum - avgSum);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestCombo = combo;
    }
  }
  return bestCombo.sort((a, b) => a - b);
}

// F3: 갭 주기 예측 - 평균 갭의 0.9~1.5배 사이인 번호
function F3(history: LottoResultData[]): number[] {
  const gaps = getGaps(history);
  const due: Array<{ num: number; ratio: number }> = [];

  for (const [num, data] of gaps) {
    if (data.avgGap > 0) {
      const ratio = data.lastSeen / data.avgGap;
      if (ratio >= 0.9 && ratio <= 1.5) {
        due.push({ num, ratio: Math.abs(ratio - 1) });
      }
    }
  }

  const result = due.sort((a, b) => a.ratio - b.ratio).map(e => e.num);
  return fillTo6(result, history);
}

// F4: 핫 스트릭 - 최근 7회 중 3번 이상 출현
function F4(history: LottoResultData[]): number[] {
  const recent7 = history.slice(-7);
  const freq = new Map<number, number>();
  for (const r of recent7) {
    for (const num of r.numbers) {
      freq.set(num, (freq.get(num) || 0) + 1);
    }
  }
  const result = [...freq.entries()]
    .filter(e => e[1] >= 3)
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F5: 미러 넘버 - 전회차 번호를 중간값 기준 대칭변환
function F5(history: LottoResultData[]): number[] {
  const last = history[history.length - 1];
  const median = [...last.numbers].sort((a, b) => a - b)[2];
  const mirrored = new Set<number>();

  for (const num of last.numbers) {
    const mirror = ((num + median) % 45) + 1;
    if (mirror >= 1 && mirror <= 45) mirrored.add(mirror);
  }

  return fillTo6([...mirrored], history);
}

// F6: 10단위 로테이션 - 최근 10회에서 가장 적게 나온 대역
function F6(history: LottoResultData[]): number[] {
  const recent10 = history.slice(-10);
  const bands = [0, 0, 0, 0, 0]; // 1-9, 10-19, 20-29, 30-39, 40-45

  for (const r of recent10) {
    for (const num of r.numbers) {
      if (num <= 9) bands[0]++;
      else if (num <= 19) bands[1]++;
      else if (num <= 29) bands[2]++;
      else if (num <= 39) bands[3]++;
      else bands[4]++;
    }
  }

  const minBandIdx = bands.indexOf(Math.min(...bands));
  const bandRanges = [[1, 9], [10, 19], [20, 29], [30, 39], [40, 45]];
  const [start, end] = bandRanges[minBandIdx];

  // 해당 대역에서 전체 빈도 높은 번호 선택
  const freq = new Map<number, number>();
  for (const r of history) {
    for (const num of r.numbers) {
      if (num >= start && num <= end) {
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }
  }

  const result = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F7: 델타 패턴 - 최근 3회 델타 평균으로 투영
function F7(history: LottoResultData[]): number[] {
  const recent3 = history.slice(-3);
  const allDeltas: number[] = [];

  for (const r of recent3) {
    const sorted = [...r.numbers].sort((a, b) => a - b);
    for (let i = 1; i < sorted.length; i++) {
      allDeltas.push(sorted[i] - sorted[i - 1]);
    }
  }

  const avgDeltas: number[] = [];
  for (let i = 0; i < 5; i++) {
    const sum = allDeltas.filter((_, idx) => idx % 5 === i).reduce((a, b) => a + b, 0);
    const count = allDeltas.filter((_, idx) => idx % 5 === i).length;
    avgDeltas.push(Math.round(sum / count) || 7);
  }

  const last = history[history.length - 1];
  const base = Math.min(...last.numbers);
  const result = [base];

  for (let i = 0; i < 5 && result.length < 6; i++) {
    const next = result[result.length - 1] + avgDeltas[i];
    if (next >= 1 && next <= 45 && !result.includes(next)) {
      result.push(next);
    }
  }

  return fillTo6(result, history);
}

// F8: 피보나치 모드 필터
function F8(history: LottoResultData[]): number[] {
  const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34];
  const fibMod = new Set<number>();

  for (let i = 0; i < 30; i++) {
    const val = (fib[i % fib.length] * (i + 1)) % 45;
    if (val >= 1 && val <= 45) fibMod.add(val);
  }

  // 피보나치 모드 번호 중 최근 30회 빈도 높은 것
  const recent30 = history.slice(-30);
  const freq = new Map<number, number>();
  for (const r of recent30) {
    for (const num of r.numbers) {
      if (fibMod.has(num)) {
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }
  }

  const result = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F9: 페어 빈도 - 자주 같이 나오는 번호 쌍
function F9(history: LottoResultData[]): number[] {
  const pairs = new Map<string, number>();

  for (const r of history) {
    const nums = r.numbers;
    for (let i = 0; i < nums.length; i++) {
      for (let j = i + 1; j < nums.length; j++) {
        const key = `${Math.min(nums[i], nums[j])}-${Math.max(nums[i], nums[j])}`;
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  }

  const topPairs = [...pairs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);

  // 최근 10회에서 활성화된 페어의 파트너 번호
  const recent10 = history.slice(-10);
  const recentNums = new Set<number>();
  for (const r of recent10) {
    for (const num of r.numbers) recentNums.add(num);
  }

  const result = new Set<number>();
  for (const [pairKey] of topPairs) {
    const [a, b] = pairKey.split('-').map(Number);
    if (recentNums.has(a) && !recentNums.has(b)) result.add(b);
    if (recentNums.has(b) && !recentNums.has(a)) result.add(a);
  }

  return fillTo6([...result], history);
}

// F10: 위치별 빈도 - 각 위치(1~6번째)에서 가장 자주 나오는 번호
function F10(history: LottoResultData[]): number[] {
  const recent50 = history.slice(-50);
  const posFreq: Map<number, number>[] = [new Map(), new Map(), new Map(), new Map(), new Map(), new Map()];

  for (const r of recent50) {
    const sorted = [...r.numbers].sort((a, b) => a - b);
    sorted.forEach((num, pos) => {
      posFreq[pos].set(num, (posFreq[pos].get(num) || 0) + 1);
    });
  }

  const result: number[] = [];
  for (let pos = 0; pos < 6; pos++) {
    const sorted = [...posFreq[pos].entries()].sort((a, b) => b[1] - a[1]);
    for (const [num] of sorted) {
      if (!result.includes(num)) {
        result.push(num);
        break;
      }
    }
  }

  return fillTo6(result, history);
}

// F11: 핫콜드 교대 - 핫 3개 + 콜드 3개
function F11(history: LottoResultData[]): number[] {
  const recent10 = history.slice(-10);
  const freq = new Map<number, number>();
  for (const r of recent10) {
    for (const num of r.numbers) {
      freq.set(num, (freq.get(num) || 0) + 1);
    }
  }

  const hot = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => e[0]);

  const gaps = getGaps(history);
  const cold = [...gaps.entries()]
    .filter(([_, data]) => data.lastSeen >= data.avgGap && data.lastSeen <= data.avgGap * 2)
    .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
    .slice(0, 3)
    .map(e => e[0]);

  return fillTo6([...hot, ...cold], history);
}

// F12: 연번 경향 - 최근 연번 패턴 반영
function F12(history: LottoResultData[]): number[] {
  // 역대 연번 쌍 빈도
  const consec = new Map<string, number>();
  for (const r of history) {
    const sorted = [...r.numbers].sort((a, b) => a - b);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] - sorted[i] === 1) {
        consec.set(`${sorted[i]}-${sorted[i + 1]}`, (consec.get(`${sorted[i]}-${sorted[i + 1]}`) || 0) + 1);
      }
    }
  }

  const topConsec = [...consec.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const result: number[] = [];
  if (topConsec.length > 0) {
    const [a, b] = topConsec[0][0].split('-').map(Number);
    result.push(a, b);
  }

  // 나머지는 빈도로 채움
  const freq = topFreq(history, 30, 45);
  for (const num of freq) {
    if (result.length >= 6) break;
    if (!result.includes(num)) result.push(num);
  }

  return result.slice(0, 6).sort((a, b) => a - b);
}

// F13: 끝자리 패턴
function F13(history: LottoResultData[]): number[] {
  const recent10 = history.slice(-10);
  const lastDigitFreq = new Map<number, number>();

  for (const r of recent10) {
    for (const num of r.numbers) {
      const lastDigit = num % 10;
      lastDigitFreq.set(lastDigit, (lastDigitFreq.get(lastDigit) || 0) + 1);
    }
  }

  const topDigits = [...lastDigitFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(e => e[0]);

  // 해당 끝자리를 가진 번호 중 빈도 높은 것
  const freq = new Map<number, number>();
  for (const r of history) {
    for (const num of r.numbers) {
      if (topDigits.includes(num % 10)) {
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }
  }

  const result = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F14: 이동평균 크로스 - 5회 이평 > 20회 이평인 번호
function F14(history: LottoResultData[]): number[] {
  const recent20 = history.slice(-20);
  const recent5 = history.slice(-5);

  const freq20 = new Map<number, number>();
  const freq5 = new Map<number, number>();

  for (const r of recent20) {
    for (const num of r.numbers) {
      freq20.set(num, (freq20.get(num) || 0) + 1);
    }
  }

  for (const r of recent5) {
    for (const num of r.numbers) {
      freq5.set(num, (freq5.get(num) || 0) + 1);
    }
  }

  const bullish: Array<{ num: number; diff: number }> = [];
  for (let num = 1; num <= 45; num++) {
    const rate5 = (freq5.get(num) || 0) / 5;
    const rate20 = (freq20.get(num) || 0) / 20;
    if (rate5 > rate20) {
      bullish.push({ num, diff: rate5 - rate20 });
    }
  }

  const result = bullish
    .sort((a, b) => b.diff - a.diff)
    .map(e => e.num);
  return fillTo6(result, history);
}

// F15: 경계 번호 - 긴 갭의 양 끝 번호
function F15(history: LottoResultData[]): number[] {
  const gaps = getGaps(history);
  const sorted = [...gaps.entries()]
    .sort((a, b) => b[1].lastSeen - a[1].lastSeen);

  const result: number[] = [];
  for (const [num, data] of sorted.slice(0, 10)) {
    // 긴 갭 번호의 ±1
    if (num > 1) result.push(num - 1);
    if (num < 45) result.push(num + 1);
  }

  return fillTo6([...new Set(result)], history);
}

// F16: 자릿수 합 필터
function F16(history: LottoResultData[]): number[] {
  const digitSum = (n: number) => Math.floor(n / 10) + (n % 10);

  const recent20 = history.slice(-20);
  const sumFreq = new Map<number, number>();

  for (const r of recent20) {
    for (const num of r.numbers) {
      const ds = digitSum(num);
      sumFreq.set(ds, (sumFreq.get(ds) || 0) + 1);
    }
  }

  const topSums = [...sumFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(e => e[0]);

  // 해당 자릿수합을 가진 번호 중 빈도 높은 것
  const freq = new Map<number, number>();
  for (const r of history) {
    for (const num of r.numbers) {
      if (topSums.includes(digitSum(num))) {
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }
  }

  const result = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F17: 소수 편향
function F17(history: LottoResultData[]): number[] {
  const primes = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43]);

  const recent20 = history.slice(-20);
  let primeCount = 0;
  let totalCount = 0;

  for (const r of recent20) {
    for (const num of r.numbers) {
      totalCount++;
      if (primes.has(num)) primeCount++;
    }
  }

  const recentPrimeRate = primeCount / totalCount;
  const expectedRate = 14 / 45;

  // 소수 과대표시면 소수 위주, 아니면 비소수 위주
  const freq = new Map<number, number>();
  for (const r of history.slice(-50)) {
    for (const num of r.numbers) {
      freq.set(num, (freq.get(num) || 0) + 1);
    }
  }

  const candidates = [...freq.entries()].sort((a, b) => b[1] - a[1]);
  const result: number[] = [];

  if (recentPrimeRate > expectedRate) {
    // 소수 4개 + 비소수 2개
    for (const [num] of candidates) {
      if (primes.has(num) && result.filter(n => primes.has(n)).length < 4) result.push(num);
      if (result.length >= 4) break;
    }
    for (const [num] of candidates) {
      if (!primes.has(num) && result.length < 6) result.push(num);
    }
  } else {
    // 비소수 4개 + 소수 2개
    for (const [num] of candidates) {
      if (!primes.has(num) && result.filter(n => !primes.has(n)).length < 4) result.push(num);
      if (result.length >= 4) break;
    }
    for (const [num] of candidates) {
      if (primes.has(num) && result.length < 6) result.push(num);
    }
  }

  return fillTo6(result, history);
}

// F18: 사분면 분석
function F18(history: LottoResultData[]): number[] {
  const getQuadrant = (n: number) => Math.floor((n - 1) / 11);

  const recent20 = history.slice(-20);
  const patterns = new Map<string, number>();

  for (const r of recent20) {
    const quads = [0, 0, 0, 0, 0];
    for (const num of r.numbers) {
      quads[getQuadrant(num)]++;
    }
    const pattern = quads.join('-');
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1);
  }

  const topPattern = [...patterns.entries()]
    .sort((a, b) => b[1] - a[1])[0];

  if (!topPattern) return fillTo6([], history);

  const targetQuads = topPattern[0].split('-').map(Number);

  // 각 사분면에서 빈도 높은 번호 선택
  const quadFreq: Map<number, number>[] = [new Map(), new Map(), new Map(), new Map(), new Map()];
  for (const r of history) {
    for (const num of r.numbers) {
      const q = getQuadrant(num);
      quadFreq[q].set(num, (quadFreq[q].get(num) || 0) + 1);
    }
  }

  const result: number[] = [];
  for (let q = 0; q < 5; q++) {
    const count = targetQuads[q];
    const sorted = [...quadFreq[q].entries()].sort((a, b) => b[1] - a[1]);
    let added = 0;
    for (const [num] of sorted) {
      if (added >= count) break;
      if (!result.includes(num)) {
        result.push(num);
        added++;
      }
    }
  }

  return fillTo6(result, history);
}

// F19: 래그 상관 - N회 전 출현 번호와의 상관관계
function F19(history: LottoResultData[]): number[] {
  const lag1Corr = new Map<number, Map<number, number>>();

  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].numbers;
    const curr = history[i].numbers;

    for (const p of prev) {
      if (!lag1Corr.has(p)) lag1Corr.set(p, new Map());
      for (const c of curr) {
        lag1Corr.get(p)!.set(c, (lag1Corr.get(p)!.get(c) || 0) + 1);
      }
    }
  }

  // 마지막 회차 번호에 대해 가장 상관 높은 번호
  const last = history[history.length - 1].numbers;
  const candidates = new Map<number, number>();

  for (const num of last) {
    const corr = lag1Corr.get(num);
    if (corr) {
      for (const [target, count] of corr) {
        candidates.set(target, (candidates.get(target) || 0) + count);
      }
    }
  }

  const result = [...candidates.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// F20: 나머지 패턴
function F20(history: LottoResultData[]): number[] {
  const recent20 = history.slice(-20);

  // 3, 5, 7로 나눈 나머지 분포
  const mod3 = [0, 0, 0];
  const mod5 = [0, 0, 0, 0, 0];
  const mod7 = [0, 0, 0, 0, 0, 0, 0];

  for (const r of recent20) {
    for (const num of r.numbers) {
      mod3[num % 3]++;
      mod5[num % 5]++;
      mod7[num % 7]++;
    }
  }

  // 기대값 대비 부족한 나머지 클래스
  const deficit3 = mod3.map((v, i) => ({ mod: i, deficit: 40 - v }));
  const deficit5 = mod5.map((v, i) => ({ mod: i, deficit: 24 - v }));

  deficit3.sort((a, b) => b.deficit - a.deficit);
  deficit5.sort((a, b) => b.deficit - a.deficit);

  const targetMod3 = deficit3[0].mod;
  const targetMod5 = deficit5[0].mod;

  // 해당 나머지를 가진 번호 중 빈도 높은 것
  const freq = new Map<number, number>();
  for (const r of history) {
    for (const num of r.numbers) {
      if (num % 3 === targetMod3 || num % 5 === targetMod5) {
        freq.set(num, (freq.get(num) || 0) + 1);
      }
    }
  }

  const result = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);
  return fillTo6(result, history);
}

// ========== 공식 정의 ==========

interface FormulaInfo {
  name: string
  label: string
  fn: (history: LottoResultData[]) => number[]
  minHistory: number
}

const FORMULAS: FormulaInfo[] = [
  { name: 'F1', label: '전회차 에코', fn: F1, minHistory: 5 },
  { name: 'F2', label: '합계 기반', fn: F2, minHistory: 10 },
  { name: 'F3', label: '갭 주기', fn: F3, minHistory: 20 },
  { name: 'F4', label: '핫 스트릭', fn: F4, minHistory: 7 },
  { name: 'F5', label: '미러 넘버', fn: F5, minHistory: 1 },
  { name: 'F6', label: '10단위 로테이션', fn: F6, minHistory: 10 },
  { name: 'F7', label: '델타 패턴', fn: F7, minHistory: 3 },
  { name: 'F8', label: '피보나치 필터', fn: F8, minHistory: 30 },
  { name: 'F9', label: '페어 빈도', fn: F9, minHistory: 30 },
  { name: 'F10', label: '위치별 빈도', fn: F10, minHistory: 50 },
  { name: 'F11', label: '핫콜드 교대', fn: F11, minHistory: 10 },
  { name: 'F12', label: '연번 경향', fn: F12, minHistory: 10 },
  { name: 'F13', label: '끝자리 패턴', fn: F13, minHistory: 10 },
  { name: 'F14', label: '이평 크로스', fn: F14, minHistory: 20 },
  { name: 'F15', label: '경계 번호', fn: F15, minHistory: 10 },
  { name: 'F16', label: '자릿수 합', fn: F16, minHistory: 10 },
  { name: 'F17', label: '소수 편향', fn: F17, minHistory: 20 },
  { name: 'F18', label: '사분면 분석', fn: F18, minHistory: 20 },
  { name: 'F19', label: '래그 상관', fn: F19, minHistory: 30 },
  { name: 'F20', label: '나머지 패턴', fn: F20, minHistory: 20 },
];

// ========== 백테스트 및 추천 생성 ==========

interface BacktestResult {
  name: string
  label: string
  tested: number
  matchCounts: number[]
  recentTested: number
  recentMatchCounts: number[]
  hitRate: number
  recentHitRate: number
}

function runBacktest(results: LottoResultData[], recentN: number = 30): BacktestResult[] {
  const sortedResults = [...results].sort((a, b) => a.round - b.round);
  const backtestResults: BacktestResult[] = FORMULAS.map(f => ({
    name: f.name,
    label: f.label,
    tested: 0,
    matchCounts: [0, 0, 0, 0, 0, 0, 0],
    recentTested: 0,
    recentMatchCounts: [0, 0, 0, 0, 0, 0, 0],
    hitRate: 0,
    recentHitRate: 0,
  }));

  const latestRound = sortedResults[sortedResults.length - 1].round;

  for (let i = 1; i < sortedResults.length; i++) {
    const targetRound = sortedResults[i];
    const history = sortedResults.slice(0, i);
    const actualSet = new Set(targetRound.numbers);
    const isRecent = targetRound.round > latestRound - recentN;

    for (let fIdx = 0; fIdx < FORMULAS.length; fIdx++) {
      const formula = FORMULAS[fIdx];
      if (history.length < formula.minHistory) continue;

      try {
        const prediction = formula.fn(history);
        if (!prediction || prediction.length !== 6) continue;

        const matches = prediction.filter(n => actualSet.has(n)).length;
        backtestResults[fIdx].tested++;
        backtestResults[fIdx].matchCounts[matches]++;

        if (isRecent) {
          backtestResults[fIdx].recentTested++;
          backtestResults[fIdx].recentMatchCounts[matches]++;
        }
      } catch {
        // skip
      }
    }
  }

  // 적중률 계산
  for (const res of backtestResults) {
    if (res.tested > 0) {
      const hits = res.tested - res.matchCounts[0] - res.matchCounts[1];
      res.hitRate = hits / res.tested;
    }
    if (res.recentTested > 0) {
      const recentHits = res.recentTested - res.recentMatchCounts[0] - res.recentMatchCounts[1];
      res.recentHitRate = recentHits / res.recentTested;
    }
  }

  return backtestResults;
}

export function generateBacktestSets(results: LottoResultData[]): BacktestSet[] {
  if (results.length < 50) return [];

  const sortedResults = [...results].sort((a, b) => a.round - b.round);

  // 백테스트 실행
  const backtestResults = runBacktest(sortedResults);

  // 최근 성적 기준 정렬
  const rankedByRecent = [...backtestResults]
    .filter(r => r.recentTested > 0)
    .sort((a, b) => b.recentHitRate - a.recentHitRate);

  // 전체 성적 기준 정렬
  const rankedByAll = [...backtestResults]
    .filter(r => r.tested > 0)
    .sort((a, b) => b.hitRate - a.hitRate);

  // 현재 시점 예측 생성
  const sets: BacktestSet[] = [];
  const usedCombinations = new Set<string>();

  const getCombinationKey = (nums: number[]) => [...nums].sort((a, b) => a - b).join(',');

  // 최근 성적 TOP 5
  for (let i = 0; i < Math.min(5, rankedByRecent.length); i++) {
    const res = rankedByRecent[i];
    const formula = FORMULAS.find(f => f.name === res.name);
    if (!formula) continue;

    try {
      const prediction = formula.fn(sortedResults);
      if (!prediction || prediction.length !== 6) continue;

      const sorted = prediction.sort((a, b) => a - b);
      const key = getCombinationKey(sorted);
      if (usedCombinations.has(key)) continue;
      usedCombinations.add(key);

      sets.push({
        set: sets.length + 1,
        numbers: sorted,
        score: Math.round(res.recentHitRate * 100 * 10) / 10,
        method: `${res.name} ${res.label}`,
        hitRate: Math.round(res.hitRate * 1000) / 10,
        recentHitRate: Math.round(res.recentHitRate * 1000) / 10,
      });
    } catch {
      // skip
    }
  }

  // 전체 성적 TOP 5 (중복 제외)
  for (let i = 0; i < rankedByAll.length && sets.length < 10; i++) {
    const res = rankedByAll[i];
    const formula = FORMULAS.find(f => f.name === res.name);
    if (!formula) continue;

    // 이미 추가된 공식인지 확인
    if (sets.some(s => s.method.startsWith(res.name))) continue;

    try {
      const prediction = formula.fn(sortedResults);
      if (!prediction || prediction.length !== 6) continue;

      const sorted = prediction.sort((a, b) => a - b);
      const key = getCombinationKey(sorted);
      if (usedCombinations.has(key)) continue;
      usedCombinations.add(key);

      sets.push({
        set: sets.length + 1,
        numbers: sorted,
        score: Math.round(res.hitRate * 100 * 10) / 10,
        method: `${res.name} ${res.label}`,
        hitRate: Math.round(res.hitRate * 1000) / 10,
        recentHitRate: Math.round(res.recentHitRate * 1000) / 10,
      });
    } catch {
      // skip
    }
  }

  // 점수 순 재정렬
  sets.sort((a, b) => b.score - a.score);
  sets.forEach((s, idx) => { s.set = idx + 1; });

  return sets.slice(0, 10);
}

// 컨센서스 번호 추출 (여러 공식에서 겹치는 번호)
export function getConsensusNumbers(results: LottoResultData[]): Array<{ number: number; count: number }> {
  if (results.length < 50) return [];

  const sortedResults = [...results].sort((a, b) => a.round - b.round);
  const numberCounts = new Map<number, number>();

  for (const formula of FORMULAS) {
    if (sortedResults.length < formula.minHistory) continue;

    try {
      const prediction = formula.fn(sortedResults);
      if (!prediction || prediction.length !== 6) continue;

      for (const num of prediction) {
        numberCounts.set(num, (numberCounts.get(num) || 0) + 1);
      }
    } catch {
      // skip
    }
  }

  return [...numberCounts.entries()]
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count);
}
