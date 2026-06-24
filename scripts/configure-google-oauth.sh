#!/usr/bin/env bash
# Enable Google OAuth on Supabase using Management API.
# Usage:
#   GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... bash scripts/configure-google-oauth.sh
# Or:
#   bash scripts/configure-google-oauth.sh <client_id> <client_secret>

set -euo pipefail

PROJECT_REF="${SUPABASE_PROJECT_REF:-rbqpzqkffccdtwciasos}"
CLIENT_ID="${GOOGLE_CLIENT_ID:-${1:-}}"
CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-${2:-}}"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
red() { printf "\033[31m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
  red "Google Client ID and Client Secret are required."
  echo ""
  echo "Usage:"
  echo "  GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy bash scripts/configure-google-oauth.sh"
  echo ""
  echo "Create credentials at:"
  echo "  https://console.cloud.google.com/apis/credentials"
  echo ""
  echo "Redirect URI (required):"
  echo "  https://${PROJECT_REF}.supabase.co/auth/v1/callback"
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  red "Supabase CLI is required."
  exit 1
fi

TOKEN=""
for service in "Supabase CLI" "supabase-cli" "go-keyring-base"; do
  TOKEN=$(security find-generic-password -s "$service" -w 2>/dev/null || true)
  if [[ "$TOKEN" == sbp_* ]]; then
    break
  fi
  TOKEN=""
done

if [ -z "$TOKEN" ]; then
  red "Could not read Supabase access token. Run: supabase login"
  exit 1
fi

bold "Enabling Google OAuth on Supabase (${PROJECT_REF})..."

RESPONSE=$(curl -sS -w "\n%{http_code}" -X PATCH \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"external_google_enabled\": true,
    \"external_google_client_id\": \"${CLIENT_ID}\",
    \"external_google_secret\": \"${CLIENT_SECRET}\"
  }")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
  green "Google OAuth enabled on Supabase."
  echo ""
  echo "Test at: https://nexum-nu.vercel.app/login"
else
  red "Failed to configure Google OAuth (HTTP ${HTTP_CODE})"
  echo "$BODY"
  exit 1
fi
