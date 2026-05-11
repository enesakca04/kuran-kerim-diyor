"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/services/apiClient";
import { useUserStore } from "@/store/userStore";
import type { Comment } from "@/types/api";

export function useComments(ayahId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useUserStore((state) => state.user);
  const language = useUserStore((state) => state.language);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Comment[]>(`/comments/${ayahId}`);
      setComments(response.data);
    } catch {
      setError("Yorumlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [ayahId]);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh]);

  const addComment = async (text: string, replyToId?: number | null) => {
    if (!user || user.isGuest) {
      throw new Error("Yorum yazmak için hesapla giriş yapmalısınız.");
    }

    await apiClient.post("/comments", {
      ayahId,
      text,
      language,
      ...(replyToId ? { replyToId } : {}),
    });
    await refresh();
  };

  const deleteComment = async (commentId: number) => {
    await apiClient.delete(`/comments/${commentId}`);
    setComments((current) => current.filter((comment) => comment.id !== commentId));
  };

  const toggleLike = async (commentId: number) => {
    if (!user || user.isGuest) return;

    setComments((current) =>
      current.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              isLikedByMe: !comment.isLikedByMe,
              likeCount: Math.max(0, (comment.likeCount ?? 0) + (comment.isLikedByMe ? -1 : 1)),
            }
          : comment,
      ),
    );

    try {
      await apiClient.post(`/comments/${commentId}/like`);
    } catch {
      await refresh();
    }
  };

  return { comments, loading, error, addComment, deleteComment, toggleLike, refresh };
}
