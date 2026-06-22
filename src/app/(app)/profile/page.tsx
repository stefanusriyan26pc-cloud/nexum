"use client";

import { Header } from "@/components/layout/header";
import { usePatchProfile, useProfile } from "@/components/layout/profile-provider";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { Camera, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

export default function ProfilePage() {
  const profile = useProfile();
  const patchProfile = usePatchProfile();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${profile.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      patchProfile({ avatar_url: url });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleAvatarDelete = async () => {
    if (!profile || !avatarUrl) return;
    setUploading(true);

    const supabase = createClient();
    const { data: files } = await supabase.storage.from("avatars").list(profile.id);

    if (files?.length) {
      await supabase.storage
        .from("avatars")
        .remove(files.map((f) => `${profile.id}/${f.name}`));
    }

    await supabase.from("profiles").update({ avatar_url: null }).eq("id", profile.id);
    patchProfile({ avatar_url: null });
    setAvatarUrl("");
    setUploading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName }).eq("id", profile.id);
    patchProfile({ full_name: fullName });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <>
      <Header
        title={t("profile.title")}
        subtitle={t("profile.subtitle")}
        profile={profile}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                {t("profile.personalInfo")}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar src={avatarUrl || null} name={fullName} size="lg" />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    aria-label={t("profile.changePhoto")}
                    title={t("profile.changePhoto")}
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">
                    {fullName || t("common.user")}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{profile?.email}</p>
                  {uploading && (
                    <p className="text-xs text-indigo-600 dark:text-indigo-400">
                      {t("profile.uploading")}
                    </p>
                  )}
                  {avatarUrl && !uploading && (
                    <div className="mt-2">
                      <IconButton
                        icon={Trash2}
                        label={t("profile.removePhoto")}
                        onClick={handleAvatarDelete}
                        className="h-8 w-8 text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("profile.fullNameLabel")}
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("profile.fullNameLabel")}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("profile.emailLabel")}
                </label>
                <Input
                  value={profile?.email ?? ""}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800/50"
                />
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t("profile.emailHint")}
                </p>
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving ? t("common.saving") : saved ? t("common.saved") : t("common.save")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
