#!/bin/bash
set -e

BASE_URL="http://localhost:3001"
PASS=0
FAIL=0

check() {
  local label="$1"
  local condition="$2"
  if eval "$condition"; then
    echo "PASS: $label"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $label"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "=== Adventure Agent — Smoke Tests ==="
echo ""

# ── Health check ──────────────────────────────────────────────────────────────
echo "--- /health ---"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
check "/health returns 200" '[ "$STATUS" = "200" ]'

BODY=$(curl -s "$BASE_URL/health")
check "/health has status:ok" 'echo "$BODY" | grep -q "\"status\":\"ok\""'

# ── Calculator ────────────────────────────────────────────────────────────────
echo ""
echo "--- calculator tool ---"
RESP=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"what is 42 * 7?"}')
check "calculator: 42 * 7 = 294" 'echo "$RESP" | grep -q "294"'

sleep 5
RESP2=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"what is 15 * 24?"}')
check "calculator: 15 * 24 = 360" 'echo "$RESP2" | grep -q "360"'

# ── Web search ────────────────────────────────────────────────────────────────
echo ""
echo "--- web search tool ---"
sleep 5
RESP3=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"what is the current weather on Mount Rainier?"}')
check "web search: returns a response" 'echo "$RESP3" | grep -q "response"'

# ── Knowledge base ────────────────────────────────────────────────────────────
echo ""
echo "--- knowledge base tool ---"
sleep 5
RESP4=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"what are the most important trails in Canyonlands?"}')
check "knowledge base: returns relevant content" 'echo "$RESP4" | grep -qi "canyonlands\|needles\|island"'

# ── Multi-turn memory ─────────────────────────────────────────────────────────
echo ""
echo "--- conversation memory ---"
SESSION_ID=$(uuidgen)
sleep 5
curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"message":"My name is Alex"}' > /dev/null

sleep 5
RESP5=$(curl -s -X POST "$BASE_URL/chat" \
  -H "Content-Type: application/json" \
  -H "x-session-id: $SESSION_ID" \
  -d '{"message":"What is my name?"}')
check "memory: remembers name from prior turn" 'echo "$RESP5" | grep -qi "alex"'

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
echo ""

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
exit 0
