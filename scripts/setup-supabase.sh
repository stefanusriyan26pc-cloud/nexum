#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
green() { printf "\033[32m%s\033[0m\n" "$1"; }
yellow() { printf "\033[33m%s\033[0m\n" "$1"; }

bold "Nexus — Supabase automated setup"
echo ""

if ! command -v supabase >/dev/null 2>&1; then
  yellow "Supabase CLI not found. Install it first:"
  echo "  brew install supabase/tap/supabase"
  exit 1
fi

if ! supabase projects list >/dev/null 2>&1; then
  yellow "You need to log in to Supabase first."
  supabase login
fi

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
if [ -z "$PROJECT_REF" ]; then
  echo ""
  bold "Your Supabase projects:"
  supabase projects list
  echo ""
  read -rp "Enter Project Ref (from dashboard URL, e.g. abcdefghijklmno): " PROJECT_REF
fi

if [ -z "$PROJECT_REF" ]; then
  echo "Project Ref is required."
  exit 1
fi

SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

bold "Step 1/4 — Linking project..."
if [ -f "supabase/.temp/project-ref" ]; then
  LINKED_REF="$(cat supabase/.temp/project-ref)"
  if [ "$LINKED_REF" != "$PROJECT_REF" ]; then
    yellow "Currently linked to $LINKED_REF, re-linking to $PROJECT_REF..."
    supabase link --project-ref "$PROJECT_REF"
  else
    green "Already linked to $PROJECT_REF"
  fi
else
  supabase link --project-ref "$PROJECT_REF"
fi

bold "Step 2/4 — Pushing database schema..."
supabase db push

bold "Step 3/4 — Pushing auth config (redirect URLs)..."
if supabase config push >/dev/null 2>&1; then
  green "Auth config pushed"
else
  yellow "Could not push auth config automatically."
  echo "Add these manually in Supabase → Authentication → URL Configuration:"
  echo "  Site URL: http://localhost:3000"
  echo "  Redirect URLs: http://localhost:3000/auth/callback"
fi

bold "Step 4/4 — Writing .env.local..."
ANON_KEY=""
if ANON_KEY="$(supabase projects api-keys --project-ref "$PROJECT_REF" 2>/dev/null | awk '/anon/ {print $NF; exit}')"; then
  :
fi

if [ -z "$ANON_KEY" ]; then
  yellow "Could not fetch anon key automatically."
  echo "Copy it from Supabase → Project Settings → API"
  read -rp "Paste your anon/public key: " ANON_KEY
fi

cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
EOF

green "Created .env.local"
echo ""
bold "Setup complete!"
echo ""
echo "  Supabase URL : $SUPABASE_URL"
echo "  Project Ref  : $PROJECT_REF"
echo ""
echo "Next steps:"
echo "  1. npm run dev"
echo "  2. Open http://localhost:3000"
echo ""
yellow "Optional — Google login:"
echo "  Run: npm run auth:google"
echo "  Or enable manually in Supabase → Authentication → Providers → Google"
echo "  Redirect URI: ${SUPABASE_URL}/auth/v1/callback"
echo ""
