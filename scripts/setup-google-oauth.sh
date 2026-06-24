#!/usr/bin/env bash
# Guide + checklist for enabling Google login with Supabase.
# Usage: bash scripts/setup-google-oauth.sh [production-url]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_REF="${SUPABASE_PROJECT_REF:-rbqpzqkffccdtwciasos}"
PROD_URL="${1:-https://nexum-nu.vercel.app}"
SUPABASE_CALLBACK="https://${PROJECT_REF}.supabase.co/auth/v1/callback"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

bold "Nexum — Google Login Setup"
echo ""
echo "Project ref : ${PROJECT_REF}"
echo "Supabase URL: https://${PROJECT_REF}.supabase.co"
echo ""

bold "Step 1 — Google Cloud Console"
echo "  1. Open https://console.cloud.google.com/apis/credentials"
echo "  2. Create OAuth client ID → Application type: Web application"
echo "  3. Authorized JavaScript origins (add all that apply):"
echo "       http://localhost:3000"
echo "       ${PROD_URL%/}"
echo "  4. Authorized redirect URIs (required):"
echo "       ${SUPABASE_CALLBACK}"
echo "  5. Copy the Client ID and Client Secret"
echo ""

bold "Step 2 — Supabase Dashboard"
echo "  Open:"
echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/auth/providers"
echo ""
echo "  • Enable Google provider"
echo "  • Paste Client ID and Client Secret"
echo "  • Save"
echo ""

bold "Step 3 — Supabase Auth URLs"
echo "  Open:"
echo "  https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration"
echo ""
echo "  Site URL (production): ${PROD_URL%/}"
echo "  Redirect URLs:"
echo "    http://localhost:3000/auth/callback"
echo "    ${PROD_URL%/}/auth/callback"
echo ""

bold "Step 4 — Test"
echo "  Local:      npm run dev → http://localhost:3000/login"
echo "  Production: ${PROD_URL%/}/login"
echo "  Click \"Continue with Google\""
echo ""

yellow "Note: Google login is already wired in the app (login + register pages)."
yellow "It works once Steps 1–3 are completed in the dashboards above."
echo ""
green "Done — follow the steps above, then test Google sign-in."
