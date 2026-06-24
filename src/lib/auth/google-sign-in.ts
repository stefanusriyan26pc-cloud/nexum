import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(callbackPath = "/auth/callback") {
  const supabase = createClient();
  const redirectTo = `${window.location.origin}${callbackPath}`;

  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      queryParams: {
        prompt: "select_account",
      },
    },
  });
}
