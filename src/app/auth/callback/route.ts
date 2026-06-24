import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

function resolveRedirectOrigin(request: Request, fallbackOrigin: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    return fallbackOrigin;
  }

  if (forwardedHost) {
    return `https://${forwardedHost}`;
  }

  return fallbackOrigin;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  const redirectOrigin = resolveRedirectOrigin(request, origin);

  if (oauthError) {
    const reason = oauthErrorDescription || oauthError;
    return NextResponse.redirect(
      `${redirectOrigin}/login?error=auth&reason=${encodeURIComponent(reason)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${redirectOrigin}${next}`);
    }
  }

  return NextResponse.redirect(`${redirectOrigin}/login?error=auth`);
}
