import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useUserStore } from '../store/userStore';

export interface Comment {
    id: number;
    userId: string;
    text: string;
    language?: string;
    createdAt: string;
    ayahId: string;
    replyToId?: number | null;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REMOVED_BY_MODERATOR';
    user: {
        name: string;
    };
    likeCount?: number;
    isLikedByMe?: boolean;
}

export function useComments(surahNo: number, ayahNo: number) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useUserStore();

    const ayahId = `${surahNo}_${ayahNo}`;

    const fetchComments = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await apiClient.get(`/comments/${ayahId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    }, [ayahId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (text: string, asAnonymous: boolean = false, replyToId?: number | null) => {
        if (!userId) throw new Error("Giriş yapmalısınız!");
        const { language } = useUserStore.getState();

        try {
            await apiClient.post('/comments', {
                ayahId,
                text,
                language,
                ...(replyToId ? { replyToId } : {})
            });
            // Re-fetch comments to show the new one
            await fetchComments();
        } catch (error) {
            console.error("Error adding comment:", error);
            throw error;
        }
    };

    const deleteComment = async (commentId: number | string) => {
        if (!userId) return;
        try {
            await apiClient.delete(`/comments/${commentId}`);
            // Remove from local state instantly for snappy UI
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const toggleLike = async (commentId: string | number) => {
        if (!userId) {
            import('react-native').then(({ Alert }) => {
                import('../services/i18n').then(({ default: i18n }) => {
                    Alert.alert(
                        i18n.t('comments.login_prompt_title') || 'Giriş Gerekli',
                        i18n.t('comments.login_prompt_desc') || 'Yorumları beğenmek için giriş yapmalısınız.',
                        [{ text: i18n.t('common.close') || 'Kapat', style: 'cancel' }]
                    );
                });
            });
            return;
        }

        // Optimistic UI update
        setComments(prev => prev.map(c => {
            if (c.id === Number(commentId)) {
                const wasLiked = c.isLikedByMe;
                return {
                    ...c,
                    isLikedByMe: !wasLiked,
                    likeCount: Math.max(0, (c.likeCount || 0) + (wasLiked ? -1 : 1))
                };
            }
            return c;
        }));

        try {
            await apiClient.post(`/comments/${commentId}/like`);
        } catch (error) {
            console.error("Error toggling like:", error);
            // Revert on error
            fetchComments(true);
        }
    };

    return { comments, loading, addComment, toggleLike, deleteComment, refresh: fetchComments };
}
