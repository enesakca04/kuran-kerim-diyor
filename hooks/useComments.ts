import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, getDoc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUserStore } from '../store/userStore';
import { maskName } from '../utils/privacy';

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
    surahNo: number;
    ayahNo: number;
    replyToId?: string | null;
    isDeletedUser?: boolean;
    isDeletedMod?: boolean;
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

    const addComment = async (text: string, asAnonymous: boolean, replyToId: string | null = null, effectiveName?: string) => {
        if (!userId) throw new Error("Giriş yapmalısınız!");

        // Mahremiyet filtresi
        const safeName = asAnonymous ? 'Anonim' : maskName(effectiveName || displayName || 'Kullanıcı');

        const newComment = {
            userId,
            text,
            language,
            isAnonymous: asAnonymous,
            displayName: safeName,
            likes: 0,
            likedBy: [],
            createdAt: serverTimestamp(),
            surahNo,
            ayahNo,
            replyToId,
            isDeletedUser: false,
            isDeletedMod: false,
        };

        const docRef = await addDoc(commentsRef, newComment);

        // Profil koleksiyonuna bir kopya/isaret kaydedelim
        // Bu kullanicinin yorumlarini bedavaya okumasi icin guvenilir yontem
        const profileCommentRef = doc(db, `user_comments/${userId}/comments`, docRef.id);
        await setDoc(profileCommentRef, {
            ayahId,
            surahNo,
            ayahNo,
            text, // kisa bir onizleme
            createdAt: serverTimestamp(),
        });

        // Toplu sayac
        const statsRef = doc(db, 'ayah_stats', ayahId);
        await setDoc(statsRef, {
            totalComments: increment(1)
        }, { merge: true });
    };

    const deleteComment = async (commentId: string) => {
        if (!userId) return;
        const commentRef = doc(db, `comments/${ayahId}/comments`, commentId);
        
        await updateDoc(commentRef, {
            text: '',
            isDeletedUser: true
        });

        const profileCommentRef = doc(db, `user_comments/${userId}/comments`, commentId);
        await updateDoc(profileCommentRef, {
            text: '',
            isDeletedUser: true
        }).catch(() => {});
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

    return { comments, loading, addComment, toggleLike, deleteComment };
}
