# Lotto Predictor - AI 기반 로또 번호 분석 시스템

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)
![ML](https://img.shields.io/badge/ML-Regression-FF6F61?style=for-the-badge)

**머신러닝과 통계 분석을 활용한 로또 6/45 및 연금복권 720+ 번호 예측 시스템**

[Live Demo](#) | [GitHub](https://github.com/dev-leemin/lotto-predictor)

</div>

---

## 프로젝트 소개

Lotto Predictor는 역대 로또 당첨 데이터를 수집하고 분석하여 통계적 패턴을 찾아내는 프로젝트입니다. 머신러닝 회귀 모델과 다양한 통계 분석 기법을 활용하여 번호 출현 빈도, 연속 출현 패턴, 궁합 번호 등을 분석합니다.

### 주요 특징

- **동행복권 API 연동**: 실시간 최신 당첨 결과 자동 수집
- **역대 데이터 분석**: 1회차부터 현재까지 모든 당첨 번호 DB 저장
- **통계 기반 분석**: 출현 빈도, 연속 출현, 번호 간격, 합계 분포 분석
- **ML 예측 모델**: 다항 회귀를 활용한 번호 예측
- **연금복권 720+ 지원**: 로또 6/45와 연금복권 720+ 동시 분석

---

## 주요 기능

### 1. 로또 6/45 분석

<details>
<summary><b>기능 상세 보기</b></summary>

#### 기본 통계
- **번호별 출현 빈도**: 1~45 각 번호의 역대 출현 횟수
- **최근 출현 분석**: 최근 10회, 50회, 100회 출현 빈도
- **Hot/Cold 번호**: 자주 나온 번호 vs 잘 안 나온 번호
- **연속 미출현 추적**: 각 번호가 연속으로 안 나온 횟수

#### 패턴 분석
- **번호 간격 분석**: 인접 번호 간 차이 패턴
- **합계 분포**: 6개 번호 합계의 분포도
- **홀짝 비율**: 홀수/짝수 번호 비율 분석
- **구간별 분포**: 1-9, 10-19, 20-29, 30-39, 40-45 구간 분석

#### 궁합 번호
- **동시 출현 빈도**: 함께 자주 나오는 번호 쌍
- **연관 규칙**: A가 나왔을 때 B가 나올 확률
- **최적 조합 추천**: 통계적으로 유리한 번호 조합

</details>

### 2. 연금복권 720+ 분석

<details>
<summary><b>기능 상세 보기</b></summary>

- **조 분석**: 1~5조 출현 빈도 분석
- **자릿수별 분석**: 각 자릿수(6자리)별 숫자 분포
- **보너스 번호**: 보너스 당첨 번호 패턴 분석
- **연속 출현 추적**: 같은 숫자의 연속 출현 패턴

</details>

### 3. ML 예측 시스템

<details>
<summary><b>기능 상세 보기</b></summary>

- **다항 회귀 모델**: ml-regression 라이브러리 활용
- **시계열 분석**: 회차별 번호 변화 추세 분석
- **앙상블 예측**: 여러 통계 지표를 종합한 예측
- **신뢰도 점수**: 각 예측 번호의 신뢰도 표시

</details>

### 4. 데이터 수집

<details>
<summary><b>기능 상세 보기</b></summary>

- **동행복권 크롤링**: Cheerio를 활용한 공식 사이트 데이터 수집
- **자동 업데이트**: 새로운 당첨 결과 자동 감지 및 저장
- **엑셀 임포트**: xlsx 파일로 대량 데이터 일괄 등록
- **데이터 검증**: 중복 및 오류 데이터 자동 필터링

</details>

---

## 기술 스택

### Frontend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js | 16.1 | App Router 기반 풀스택 프레임워크 |
| React | 19 | UI 라이브러리 |
| TypeScript | 5.0 | 타입 안정성 |
| Tailwind CSS | 4.0 | 유틸리티 기반 스타일링 |

### Backend
| 기술 | 버전 | 용도 |
|------|------|------|
| Next.js API Routes | - | 서버리스 API 엔드포인트 |
| Prisma ORM | 6.19 | 타입 안전 데이터베이스 ORM |
| PostgreSQL | - | Neon 클라우드 데이터베이스 |

### Data Processing & ML
| 기술 | 용도 |
|------|------|
| ml-regression | 다항 회귀 분석 |
| Cheerio | HTML 파싱 및 웹 크롤링 |
| Axios | HTTP 클라이언트 |
| xlsx | Excel 파일 처리 |
| date-fns | 날짜 처리 |

---

## 데이터베이스 스키마

### LottoResult (로또 6/45)
```prisma
model LottoResult {
  id           Int      @id @default(autoincrement())
  round        Int      @unique    // 회차
  date         String              // 추첨일
  num1         Int                 // 1번째 번호
  num2         Int                 // 2번째 번호
  num3         Int                 // 3번째 번호
  num4         Int                 // 4번째 번호
  num5         Int                 // 5번째 번호
  num6         Int                 // 6번째 번호
  bonus        Int                 // 보너스 번호
  firstPrize   BigInt?             // 1등 당첨금
  firstWinners Int?                // 1등 당첨자 수
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### PensionLotteryResult (연금복권 720+)
```prisma
model PensionLotteryResult {
  id         Int      @id @default(autoincrement())
  round      Int      @unique    // 회차
  date       String              // 추첨일
  group1     Int                 // 1등 조 (1~5)
  num1_1     Int                 // 1등 1번째 자리
  num1_2     Int                 // 1등 2번째 자리
  num1_3     Int                 // 1등 3번째 자리
  num1_4     Int                 // 1등 4번째 자리
  num1_5     Int                 // 1등 5번째 자리
  num1_6     Int                 // 1등 6번째 자리
  bonusGroup Int?                // 보너스 조
  bonus1     Int?                // 보너스 1번째 자리
  ...
}
```

---

## 프로젝트 구조

```
lotto-predictor/
├── src/
│   └── app/
│       ├── api/
│       │   ├── lotto/           # 로또 데이터 API
│       │   └── pension/         # 연금복권 데이터 API
│       ├── layout.tsx           # 루트 레이아웃
│       ├── page.tsx             # 메인 분석 대시보드
│       └── globals.css          # 글로벌 스타일
├── scripts/
│   ├── crawl-lotto.ts           # 동행복권 크롤링 스크립트
│   ├── import-excel.ts          # Excel 데이터 임포트
│   └── analyze.ts               # 통계 분석 스크립트
├── data/
│   └── lotto-history.xlsx       # 역대 당첨 데이터
├── prisma/
│   └── schema.prisma            # 데이터베이스 스키마
└── lib/
    ├── prisma.ts                # Prisma 클라이언트
    ├── analysis.ts              # 통계 분석 함수
    └── ml-predictor.ts          # ML 예측 모델
```

---

## 시작하기

### 사전 요구사항

- Node.js 18.17 이상
- npm 또는 yarn
- PostgreSQL 데이터베이스 (Neon 권장)

### 1. 저장소 클론

```bash
git clone https://github.com/dev-leemin/lotto-predictor.git
cd lotto-predictor
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일을 생성하세요:

```env
# 데이터베이스
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

### 4. 데이터베이스 설정

```bash
npx prisma db push
npx prisma generate
```

### 5. 초기 데이터 수집 (선택사항)

```bash
# 동행복권에서 최신 데이터 크롤링
npx tsx scripts/crawl-lotto.ts

# 또는 Excel 파일에서 데이터 임포트
npx tsx scripts/import-excel.ts
```

### 6. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

---

## 분석 알고리즘

### 1. 출현 빈도 분석

각 번호(1-45)의 역대 출현 횟수를 계산하고 기대값과 비교합니다.

```typescript
// 기대 출현 횟수 = 총 회차 × (6/45)
const expectedFrequency = totalRounds * (6 / 45)

// 출현 지수 = 실제 출현 / 기대값
const frequencyIndex = actualCount / expectedFrequency
```

### 2. 연속 미출현 분석

각 번호가 마지막으로 나온 이후 경과한 회차를 추적합니다.

```typescript
// 연속 미출현이 길면 '나올 때가 됐다'는 가설 검증
// (도박사의 오류 주의!)
```

### 3. 궁합 번호 분석

두 번호가 함께 출현한 빈도를 분석합니다.

```typescript
// 동시 출현 확률 = 함께 나온 횟수 / 한 번호가 나온 횟수
const coOccurrence = bothAppeared / oneAppeared
```

### 4. ML 회귀 예측

시계열 데이터를 기반으로 다항 회귀 분석을 수행합니다.

```typescript
import { PolynomialRegression } from 'ml-regression'

// 최근 N회차 데이터로 트렌드 분석
const regression = new PolynomialRegression(x, y, degree)
const prediction = regression.predict(nextRound)
```

---

## 주의사항

> **면책 조항**: 이 프로젝트는 교육 및 연구 목적으로 제작되었습니다.
>
> - 로또는 완전한 무작위 추첨으로, 과거 데이터가 미래 결과를 예측하지 않습니다.
> - 통계 분석 결과는 참고용일 뿐, 당첨을 보장하지 않습니다.
> - 도박은 책임감 있게, 여유 자금으로만 즐기세요.

---

## 개발 현황

### 완료된 기능

- [x] 프로젝트 초기 세팅 (Next.js 16, TypeScript, Tailwind CSS)
- [x] Prisma + Neon PostgreSQL 연동
- [x] 로또 6/45 데이터 스키마 설계
- [x] 연금복권 720+ 데이터 스키마 설계
- [x] 동행복권 크롤링 스크립트
- [x] 기본 통계 분석 (출현 빈도)
- [x] UI 대시보드 구현

### 진행 예정

- [ ] 궁합 번호 분석 시각화
- [ ] ML 예측 모델 고도화
- [ ] 번호 시뮬레이터 기능
- [ ] 알림 서비스 (당첨 결과)
- [ ] 반응형 모바일 UI

---

## 라이선스

MIT License

---

## 문의

프로젝트에 대한 문의사항이나 버그 리포트는 [Issues](https://github.com/dev-leemin/lotto-predictor/issues)에 등록해주세요.
