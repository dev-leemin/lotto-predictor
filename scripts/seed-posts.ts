import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const seedPosts = [
  // 자유게시판 (FREE)
  {
    category: 'FREE' as const,
    title: '로또 처음 사보려는데 어떻게 사야 하나요?',
    content: '안녕하세요, 로또를 한 번도 안 사봤는데 이번에 처음 도전해보려 합니다. 편의점에서 살 수 있나요? 자동이랑 수동 차이가 뭔지도 궁금합니다. 그리고 1장에 얼마인지도 알려주시면 감사하겠습니다!',
    nickname: '로또초보',
  },
  {
    category: 'FREE' as const,
    title: '매주 로또 사시는 분들 한 달에 얼마 정도 쓰시나요?',
    content: '저는 매주 5천원씩 5게임 사고 있는데 한 달이면 2만원이 넘더라고요. 다들 로또에 한 달 평균 얼마 정도 쓰시나요? 너무 많이 쓰는 건 아닌지 궁금해서요. 소소한 재미로 즐기는 수준이 어느 정도인지 의견 부탁드립니다.',
    nickname: '매주구매자',
  },
  {
    category: 'FREE' as const,
    title: '로또 번호 선택할 때 생일 날짜 쓰시나요?',
    content: '저는 항상 가족 생일 날짜로 번호를 만들어서 사는데, 생일은 보통 1~31 사이잖아요. 그래서 32~45번이 안 들어가는 게 불리한 건 아닌가 생각이 들어서요. 다들 어떤 기준으로 번호 선택하시나요?',
    nickname: '생일로또',
  },
  {
    category: 'FREE' as const,
    title: '로또 당첨되면 회사 바로 그만두실 건가요?',
    content: '가끔 상상해보는 건데, 만약 1등 당첨되면 다들 회사를 바로 그만두실 건가요? 아니면 일단 조용히 다니면서 계획 세우실 건가요? 저는 일단 아무한테도 말 안 하고 6개월은 다닐 것 같아요 ㅋㅋ',
    nickname: '월급쟁이',
  },
  {
    category: 'FREE' as const,
    title: '동행복권 앱으로 사는 게 편하네요',
    content: '예전엔 매번 편의점 가서 샀는데, 동행복권 앱 깔고 나서 온라인으로 사니까 너무 편합니다. 자동 결제도 되고, 당첨 확인도 바로 되고. 혹시 아직 모르시는 분들 있으면 추천드려요. 다만 충전 한도가 있어서 그것만 좀 아쉽네요.',
    nickname: '앱유저',
  },
  {
    category: 'FREE' as const,
    title: '이 사이트 분석 결과 정확도가 어떤가요?',
    content: '내로또 사이트 처음 사용해보는데, AI 분석이라고 되어있는데 실제로 정확도가 어느 정도 되는 건가요? 백테스트에서 평균 2~3개 적중이라고 하는데 그게 높은 건지 낮은 건지 잘 모르겠어서요. 사용해보신 분들 후기 부탁드립니다.',
    nickname: '데이터매니아',
  },
  {
    category: 'FREE' as const,
    title: '연금복권이랑 로또 중에 뭐가 더 나을까요?',
    content: '로또는 일확천금이고, 연금복권은 매달 700만원씩 20년이잖아요. 총 금액으로 따지면 연금복권이 16억8천이라 세후로도 꽤 괜찮은데, 다들 어떤 게 더 좋다고 생각하시나요? 저는 개인적으로 연금복권이 더 끌리는데...',
    nickname: '연금파',
  },
  // 번호공유 (SHARE)
  {
    category: 'SHARE' as const,
    title: '이번주 제 추천 번호 공유합니다',
    content: '내로또 앙상블 분석 + 제 느낌을 종합해서 뽑아봤습니다.\n\nA조: 3, 12, 17, 28, 34, 42\nB조: 7, 15, 23, 31, 38, 44\nC조: 1, 11, 22, 27, 35, 43\n\n합계는 각각 136, 158, 139로 적정 범위 안에 있습니다. 다들 행운을 빕니다!',
    nickname: '번호연구가',
  },
  {
    category: 'SHARE' as const,
    title: 'CDM TOP 6 기반 번호 공유',
    content: '이번 회차 CDM 분석에서 1위~6위 번호를 그대로 조합해봤습니다. CDM 점수가 높은 번호들이라 나름 기대가 됩니다.\n\n번호: 내로또 사이트에서 직접 확인해보세요!\n\n과거 데이터를 보면 TOP 6 중 평균 2~3개는 실제 당첨번호에 포함되더라고요.',
    nickname: 'CDM연구원',
  },
  {
    category: 'SHARE' as const,
    title: '홀짝 3:3 + 고저 3:3 번호 조합',
    content: '통계적으로 가장 많이 나오는 패턴인 홀짝 3:3, 고저 3:3 조합을 만들어봤습니다.\n\n1조: 5, 14, 21, 28, 37, 42 (합: 147)\n2조: 3, 16, 19, 30, 33, 44 (합: 145)\n\n두 조 모두 합계가 100~175 구간 안에 있고, 번호대 분포도 고르게 배치했습니다. 참고만 하세요!',
    nickname: '통계마스터',
  },
  {
    category: 'SHARE' as const,
    title: '최근 10회차 미출현 번호로 조합해봤어요',
    content: '최근 10회차 동안 한 번도 안 나온 번호들을 모아서 조합을 만들어봤습니다. 소위 "찬 번호"인데, 통계적으로 보면 미출현 기간이 길어질수록 출현 확률이 높아진다는 건 도박사의 오류지만... 그래도 한번 시도해봅니다 ㅎㅎ\n\n번호는 직접 확인해서 뽑아보세요!',
    nickname: '찬번호파',
  },
  {
    category: 'SHARE' as const,
    title: '앙상블 TOP 5 세트 중 1번 세트 그대로 삽니다',
    content: '내로또 앙상블 분석의 1번 세트가 CDM, Markov, Monte Carlo 세 가지 모델에서 모두 높은 점수를 받았길래, 이번 주는 그대로 가보기로 했습니다. 결과는 토요일 저녁에 공유하겠습니다!',
    nickname: '앙상블신봉자',
  },
  // 당첨후기 (WINNING)
  {
    category: 'WINNING' as const,
    title: '5등 당첨! 소소하지만 기분 좋네요',
    content: '이번 주 로또 5등에 당첨됐습니다! 5,000원이지만 원금 회수에 커피 한 잔 값이라 기분이 좋네요 ㅎㅎ 내로또 TOP 15에서 3개가 실제 당첨번호에 포함되어 있었어요. 앞으로도 꾸준히 해볼 생각입니다.',
    nickname: '소소한행운',
  },
  {
    category: 'WINNING' as const,
    title: '4등 당첨 인증! 5만원 get',
    content: '지난주에 내로또 추천 번호 기반으로 반자동(일부 수정)으로 샀는데 4등에 당첨됐습니다! 5만원이요! 6개 중 4개를 맞춰서 4등인데, 솔직히 4개 맞추는 것도 쉽지 않거든요. 확률이 1/733이라니... 오늘은 좋은 날!',
    nickname: '4등당첨자',
  },
  {
    category: 'WINNING' as const,
    title: '연금복권 7등 당첨이라도 기쁩니다',
    content: '연금복권 7등 1만원 당첨됐어요! 끝 한 자리만 맞으면 되는 거라 자주 되긴 하는데, 그래도 당첨 알림 뜰 때마다 기분이 좋습니다. 7등이라도 꾸준히 모으면 본전 찾을 수 있을까요? ㅋㅋ',
    nickname: '연금7등',
  },
  {
    category: 'WINNING' as const,
    title: '드디어 3등 당첨!!! 150만원!!!',
    content: '여러분 믿기지 않겠지만 3등에 당첨됐습니다!! 약 150만원이요! 로또 산 지 3년 만에 처음으로 큰 당첨이에요. 번호는 수동으로 제가 직접 골랐는데, 내로또 TOP 15 번호 참고해서 6개 뽑았습니다. 6개 중 5개를 맞췄어요! 보너스 번호만 아니었으면 2등이었는데... 그래도 너무 행복합니다!',
    nickname: '3등인증',
  },
  {
    category: 'FREE' as const,
    title: '로또 당첨금 세금이 생각보다 많네요',
    content: '혹시 모를 당첨을 대비해서 세금을 알아봤는데, 3억 초과분은 33%나 떼가더라고요. 예를 들어 10억 당첨되면 세후 약 7억 정도. 그래도 7억이면 충분하지만 ㅎㅎ 5만원 이하는 세금 없고, 5만원~3억은 22% 세금입니다. 참고하세요!',
    nickname: '세금공부',
  },
  {
    category: 'FREE' as const,
    title: '로또 조합 가능한 경우의 수가 814만개라니',
    content: '45개 중 6개를 뽑는 조합은 8,145,060가지라고 하네요. 매주 1장씩 사면 약 15만년이 걸린다는 계산... 그래도 누군가는 매주 당첨되잖아요. 결국 운이지만, 통계적으로 조금이라도 유리한 조합을 고르는 게 합리적인 것 같아요.',
    nickname: '확률덕후',
  },
  {
    category: 'SHARE' as const,
    title: 'Markov Chain 기반 번호 + 제 직감 조합',
    content: '이번 주 내로또 Markov Chain 분석에서 전이 확률이 높게 나온 번호 4개에 제 직감으로 2개를 추가했습니다.\n\n마르코프 번호 4개 + 직감 2개 = 총 6개\n\n과학과 직감의 콜라보! 결과는 일요일에 알려드리겠습니다.',
    nickname: '마르코프맨',
  },
  {
    category: 'FREE' as const,
    title: '로또 1등 당첨자들의 공통점이 있다던데',
    content: '어디서 봤는데 로또 1등 당첨자들의 공통점이 있다고 하더라고요. 꿈을 꾸고 산 사람이 많다, 자동보다 반자동이 많다, 꾸준히 사는 사람이 많다 등등. 물론 생존자 편향이겠지만, 그래도 재미있는 통계인 것 같아요. 혹시 다른 공통점 아시는 분?',
    nickname: '로또연구소',
  },
]

async function seed() {
  console.log('Seeding posts...')
  const passwordHash = await bcrypt.hash('seed1234', 10)

  for (const post of seedPosts) {
    try {
      await prisma.post.create({
        data: {
          category: post.category,
          title: post.title,
          content: post.content,
          nickname: post.nickname,
          passwordHash,
        },
      })
      console.log(`  Created: ${post.title}`)
    } catch (e) {
      console.error(`  Failed: ${post.title}`, e)
    }
  }

  console.log(`Done! ${seedPosts.length} posts seeded.`)
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
