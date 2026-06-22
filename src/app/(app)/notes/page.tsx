"use client";

import { Header } from "@/components/layout/header";
import { useProfile } from "@/components/layout/profile-provider";
import { NoteGrid } from "@/components/notes/note-grid";
import { NoteList } from "@/components/notes/note-list";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, ViewToggle } from "@/components/ui/view-toggle";
import { useTranslation } from "@/components/providers/i18n-provider";
import { sortNotes } from "@/lib/notes/sort-notes";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/types/database";
import { LayoutGrid, List, NotebookPen, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type View = "grid" | "list";

export default function NotesPage() {
  const profile = useProfile();
  const { t } = useTranslation();
  const [notes, setNotes] = useState<Note[]>([]);
  const [view, setView] = useState<View>("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const loadNotes = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });
    setNotes(sortNotes(data ?? []));
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }, [notes, search]);

  const openCreate = () => {
    setSelected(null);
    setTitle("");
    setContent("");
    setModalOpen(true);
  };

  const openEdit = (note: Note) => {
    setSelected(note);
    setTitle(note.title);
    setContent(note.content);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (selected) {
      const { data } = await supabase
        .from("notes")
        .update({ title: title || "Untitled", content })
        .eq("id", selected.id)
        .select()
        .single();
      if (data) setNotes(sortNotes(notes.map((n) => (n.id === data.id ? data : n))));
    } else {
      const { data } = await supabase
        .from("notes")
        .insert({ user_id: user!.id, title: title || "Untitled", content })
        .select()
        .single();
      if (data) setNotes(sortNotes([data, ...notes]));
    }
    setSaving(false);
    setModalOpen(false);
  };

  const togglePin = async (note: Note) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notes")
      .update({ is_pinned: !note.is_pinned })
      .eq("id", note.id)
      .select()
      .single();
    if (data) setNotes(sortNotes(notes.map((n) => (n.id === data.id ? data : n))));
  };

  const deleteNote = async (id: string) => {
    const supabase = createClient();
    await supabase.from("notes").delete().eq("id", id);
    setNotes(notes.filter((n) => n.id !== id));
    setModalOpen(false);
  };

  return (
    <>
      <Header title={t("notes.title")} subtitle={t("notes.subtitle")} profile={profile}>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          {t("notes.newNote")}
        </Button>
      </Header>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ViewToggle
            views={[
              { id: "grid" as View, label: t("notes.gridView"), icon: LayoutGrid },
              { id: "list" as View, label: t("notes.listView"), icon: List },
            ]}
            active={view}
            onChange={setView}
          />
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder={t("notes.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : notes.length === 0 ? (
          <EmptyState
            icon={NotebookPen}
            title={t("notes.emptyTitle")}
            description={t("notes.emptyDesc")}
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {t("notes.createNote")}
              </Button>
            }
          />
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("common.noData")}
          </p>
        ) : view === "grid" ? (
          <NoteGrid notes={filtered} onEdit={openEdit} onTogglePin={togglePin} />
        ) : (
          <NoteList
            notes={filtered}
            onEdit={openEdit}
            onTogglePin={togglePin}
            onDelete={deleteNote}
          />
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selected ? t("notes.editNote") : t("notes.newNote")}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className="border-0 px-0 text-lg font-medium focus:ring-0"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing..."
            rows={12}
            className="resize-none border-0 px-0 focus:ring-0"
          />
          <div className="flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
            {selected ? (
              <IconButton
                icon={Trash2}
                label={t("common.delete")}
                variant="ghost"
                onClick={() => deleteNote(selected.id)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400"
              />
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
