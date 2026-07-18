#!/usr/bin/env bash
# =====================================================
# Sobe o Flask com dados descartáveis e roda os testes E2E (Playwright).
# Uso: bash tests/run-e2e.sh        (ou: npm run test:e2e)
# Pré-requisitos: pip install Flask python-dotenv · npm install
# =====================================================
set -euo pipefail
cd "$(dirname "$0")/.."

PORTA="${PORTA:-5099}"
export DATA_DIR="$(pwd)/tests/.data-teste"   # nunca toca na data/ real
rm -rf "$DATA_DIR" && mkdir -p "$DATA_DIR"
export SECRET_KEY="apenas-teste"
export MESTRE_USER="${MESTRE_USER:-mestre-teste}"
export MESTRE_SENHA="${MESTRE_SENHA:-senha-teste-123}"

python3 -m flask --app app run --port "$PORTA" >"$DATA_DIR/flask.log" 2>&1 &
FLASK_PID=$!
trap 'kill "$FLASK_PID" 2>/dev/null || true' EXIT

# espera o servidor responder (até ~15s)
for _ in $(seq 1 30); do
  curl -sf "http://127.0.0.1:$PORTA/login" >/dev/null 2>&1 && break
  sleep 0.5
done
curl -sf "http://127.0.0.1:$PORTA/login" >/dev/null || { echo "❌ Flask não subiu — veja $DATA_DIR/flask.log"; exit 1; }

export BASE_URL="http://127.0.0.1:$PORTA"
node tests/e2e-criador.js
node tests/e2e-pdf.js
echo "✅ E2E completo"
