import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/colors';
import { useColorScheme } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useUserStore } from '../store/userStore';
import { useRouter, Stack } from 'expo-router';
import { MessageSquare } from 'lucide-react-native';

interface MyComment {
    id: string;
    ayahId: string;
    surahNo: number;
    ayahNo: number;
    text: string;
    createdAt: any;
    isDeletedUser?: boolean;
}

export default function MyCommentsScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { userId } = useUserStore();
    const router = useRouter();

    const [comments, setComments] = useState<MyComment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, `user_comments/${userId}/comments`),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched: MyComment[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (!data.isDeletedUser) {
                    fetched.push({ id: doc.id, ...data } as MyComment);
                }
            });
            setComments(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Yorumlarım çekilemedi:", error);
            setLoading(false);
        });

        return unsubscribe;
    }, [userId]);


    const handleNavigateToAyah = async (surahNo: number, ayahNo: number) => {
        try {
            const { useUserStore } = await import('../store/userStore');
            useUserStore.getState().setProgress(surahNo, ayahNo);

            // AsyncStorage'a onceden yaz — tab mount olunca loadData dogru degeri okur.
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem('@kuran_progress', JSON.stringify({ surah: surahNo, ayah: ayahNo }));
        } catch (e) {
            console.error('Navigation prep failed:', e);
        }

        // navigate() ile push yerine tab'a don, yeni instance olusturmaz.
        router.navigate('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen 
                options={{ 
                    title: 'Yorumlarım',
                    headerShadowVisible: false,
                    headerTintColor: theme.text,
                    headerStyle: { backgroundColor: theme.background },
                    headerBackTitle: 'Geri'
                }} 
            />

            {loading ? (
                <View style={[styles.center, { flex: 1 }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={comments}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={[styles.commentCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                            onPress={() => handleNavigateToAyah(item.surahNo, item.ayahNo)}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={[styles.surahTitle, { color: theme.primary }]}>
                                    Sure No: {item.surahNo} • Ayet {item.ayahNo}
                                </Text>
                            </View>
                            <Text style={[styles.commentText, { color: theme.text }]} numberOfLines={3}>
                                {item.text}
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                                <MessageSquare size={14} color={theme.secondary} />
                                <Text style={{ color: theme.secondary, fontSize: 12, marginLeft: 6 }}>Ayete Git</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={[styles.emptyText, { color: theme.muted }]}>Henüz bir ayet için paylaşım yapmadınız.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { alignItems: 'center', justifyContent: 'center', padding: 24, marginTop: 40 },
    emptyText: { fontSize: 16, textAlign: 'center' },
    commentCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    surahTitle: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    commentText: {
        fontSize: 15,
        lineHeight: 22,
    }
});
