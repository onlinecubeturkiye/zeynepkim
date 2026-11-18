#!/usr/bin/env bash
# "Perde Arkası" istatistiklerini git geçmişinden üretir → assets/making.js
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
START=$(git log -1 --format=%ad --date=short "$(git rev-list --max-parents=0 HEAD | tail -n 1)")
LAST=$(git log -1 --format=%ad --date=short)
COMMITS=$(git rev-list --count HEAD)
DAYS=$(git log --format=%ad --date=short | sort -u | wc -l | tr -d ' ')
LINES=$(cat index.html vaka*.html rekor.html magaza.html profil.html assets/zy11.js assets/style.css android/src/com/zeynepkim/zy11/*.java | wc -l | tr -d ' ')
cat > assets/making.js <<JS
// Otomatik üretildi: tools/making-stats.sh (git geçmişinden)
window.ZY_MAKING = { start: '$START', last: '$LAST', commits: $COMMITS, workDays: $DAYS, lines: $LINES };
JS
echo "making.js: başlangıç $START, $COMMITS güncelleme, $DAYS çalışma günü, $LINES satır"
