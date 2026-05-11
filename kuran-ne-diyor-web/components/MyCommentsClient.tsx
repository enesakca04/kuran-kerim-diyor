"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { getAyahDisplay } from "@/services/ayahUtils";
import type { Comment } from "@/types/api";

export function MyCommentsClient() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<Comment[]>("/comments/my");
      setComments(response.data);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void load();
    });
  }, [load]);

  if (loading) return <p className="text-sm font-semibold text-muted">Yorumlar yükleniyor...</p>;

  return (
    <div className="grid gap-4">
      {comments.length === 0 ? (
        <p className="rounded-lg border border-border bg-card p-6 text-center text-sm font-semibold text-muted shadow-sm">Yorum bulunamadı.</p>
      ) : (
        comments.map((comment) => {
          const display = getAyahDisplay(comment.ayahId);
          return (
            <Link
              key={comment.id}
              href={`/surah/${display.surahNumber}#ayah-${display.ayahNumber}`}
              className="rounded-lg border border-border bg-card p-5 shadow-sm transition hover:bg-background"
            >
              <p className="text-sm font-bold text-primary">
                {display.surah?.name.tr || comment.ayahId} · {comment.status}
              </p>
              <p className="mt-3 text-sm leading-6 text-secondary">{comment.text}</p>
              {comment.moderationReason && <p className="mt-2 text-xs font-bold text-primary">{comment.moderationReason}</p>}
            </Link>
          );
        })
      )}
    </div>
  );
}
