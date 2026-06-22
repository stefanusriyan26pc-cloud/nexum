import { Sidebar } from "@/components/layout/sidebar";
import { ProfileProvider } from "@/components/layout/profile-provider";
import { LocaleSync } from "@/components/providers/locale-sync";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <ProfileProvider profile={profile}>
      <LocaleSync language={profile?.language} />
      <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#020617]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </ProfileProvider>
  );
}
