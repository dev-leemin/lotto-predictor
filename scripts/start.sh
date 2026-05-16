#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push --skip-generate

echo "Fixing PostgreSQL sequences..."
# auto-increment 시퀀스를 실제 max(id)와 동기화 (시퀀스 꼬임 방지)
PGPASSWORD="${POSTGRES_PASSWORD:-changeme}" psql -h db -U lotto_user -d lotto -c "
  SELECT setval('\"LottoResult_id_seq\"', COALESCE((SELECT MAX(id) FROM \"LottoResult\"), 0) + 1, false);
  SELECT setval('\"PensionLotteryResult_id_seq\"', COALESCE((SELECT MAX(id) FROM \"PensionLotteryResult\"), 0) + 1, false);
" 2>/dev/null || echo "Sequence sync skipped (tables may not exist yet)"

echo "Starting Next.js server..."
exec node server.js
