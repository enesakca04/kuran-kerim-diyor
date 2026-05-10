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
    replyToId?: number | null; // Yanıt sistemi için eklendi
    user: {
        name: string;
    };
    likes?: number;
    likedBy?: string[];
}

export function useComments(surahNo: number, ayahNo: number) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useUserStore();

    const ayahId = `${surahNo}_${ayahNo}`;

    const fetchComments = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get(`/comments/${ayahId}`);
            setComments(response.data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    }, [ayahId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = async (text: string, asAnonymous: boolean = false) => {
        if (!userId) throw new Error("Giriş yapmalısınız!");
        const { language } = useUserStore.getState();

        try {
            await apiClient.post('/comments', {
                ayahId,
                text,
                language // Artık dili de gönderiyoruz
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

    const toggleLike = async (commentId: string) => {
        // TODO: Implement toggleLike in the backend API
        console.warn("Like functionality is pending backend implementation.");
    };

    return { comments, loading, addComment, toggleLike, deleteComment, refresh: fetchComments };
}
