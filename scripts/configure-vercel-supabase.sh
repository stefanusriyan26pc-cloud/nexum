#!/usr/bin/env bash
# Add your Vercel production URL to Supabase Auth redirect allow-list.
# Usage: bash scripts/configure-vercel-supabase.sh https://your-app.vercel.app

set -euo pipefail

APP_URL="${1:-}"
PROJECT_REF="${SUPABASE_PROJECT_REF:-rbqpzqkffccdtwciasos}"

if [ -z "$APP_URL" ]; then
  echo "Usage: bash scripts/configure-vercel-supabase.sh https://your-app.vercel.app"
  exit 1
fi

APP_URL="${APP_URL%/}"
CALLBACK="${APP_URL}/auth/callback"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }

bold "Configure Supabase Auth for production"
echo ""
echo "Project ref: ${PROJECT_REF}"
echo "Site URL:    ${APP_URL}"
echo "Callback:    ${CALLBACK}"
echo ""
echo "In Supabase Dashboard → Authentication → URL Configuration, set:"
echo "  • Site URL: ${APP_URL}"
echo "  • Redirect URLs (add both if missing):"
echo "      http://localhost:3000/auth/callback"
echo "      ${CALLBACK}"
echo ""
echo "For Google OAuth, also add in Google Cloud Console authorized redirect:"
echo "  https://${PROJECT_REF}.supabase.co/auth/v1/callback"
echo ""

if command -v supabase >/dev/null 2>&1; then
  yellow() { printf "\033[33m%s\033[0m\n" "$1"; }
  yellow "Tip: After saving in the dashboard, test login at ${APP_URL}/login"
fi
