import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUserStore } from '../store/userStore';

export interface Comment {
    id: string;
    userId: string;
    text: string;
    language: string;
    isAnonymous: boolean;
    displayName: string;
    likes: number;
    likedBy: string[];
    createdAt: any;
}

export function useComments(surahNo: number, ayahNo: number) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const { userId, isAnonymous, displayName, language } = useUserStore();

    const ayahId = `${surahNo}_${ayahNo}`;
    const commentsRef = collection(db, `comments/${ayahId}/comments`);

    useEffect(() => {
        const q = query(commentsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: Comment[] = [];
            snapshot.forEach((doc) => {
                fetched.push({ id: doc.id, ...doc.data() } as Comment);
            });
            setComments(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching comments:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [surahNo, ayahNo]);

    const addComment = async (text: string, asAnonymous: boolean) => {
        if (!userId) throw new Error("Giriş yapmalısınız!");

        const newComment = {
            userId,
            text,
            language, // User's active language
            isAnonymous: asAnonymous,
            displayName: asAnonymous ? 'Anonim' : (displayName || 'Kullanıcı'),
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
        };

        await addDoc(commentsRef, newComment);

        // Update AyahStats
        const statsRef = doc(db, 'ayahStats', ayahId);
        await setDoc(statsRef, {
            totalComments: increment(1)
        }, { merge: true });
    };

    const toggleLike = async (commentId: string) => {
        if (!userId) return;

        const commentRef = doc(db, `comments/${ayahId}/comments`, commentId);
        const commentSnap = await getDoc(commentRef);
        if (!commentSnap.exists()) return;

        const data = commentSnap.data() as Comment;
        const hasLiked = data.likedBy.includes(userId);

        const statsRef = doc(db, 'ayahStats', ayahId);

        if (hasLiked) {
            await updateDoc(commentRef, {
                likes: increment(-1),
                likedBy: data.likedBy.filter(id => id !== userId)
            });
            await setDoc(statsRef, { totalLikes: increment(-1) }, { merge: true });
        } else {
            await updateDoc(commentRef, {
                likes: increment(1),
                likedBy: [...data.likedBy, userId]
            });
            await setDoc(statsRef, { totalLikes: increment(1) }, { merge: true });
        }
    };

    return { comments, loading, addComment, toggleLike };
}
