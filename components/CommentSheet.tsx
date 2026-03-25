import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../constants/colors';
import { useComments } from '../hooks/useComments';
import { useUserStore } from '../store/userStore';
import { Heart, MessageSquare } from 'lucide-react-native';

interface CommentSheetProps {
    surahNo: number;
    ayahNo: number;
    onClose: () => void;
}

export function CommentSheet({ surahNo, ayahNo, onClose }: CommentSheetProps) {
    const { comments, loading, addComment, toggleLike } = useComments(surahNo, ayahNo);
    const { userId, language } = useUserStore();
    const theme = Colors.light;

    const [text, setText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [showAllLanguages, setShowAllLanguages] = useState(false);

    const filteredComments = showAllLanguages
        ? comments
        : comments.filter(c => c.language === language);

    const handleSend = async () => {
        if (!text.trim()) return;
        try {
            await addComment(text.trim(), isAnonymous);
            setText('');
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]}>Yorumlar</Text>
                <TouchableOpacity onPress={() => setShowAllLanguages(!showAllLanguages)}>
                    <Text style={{ color: theme.primary }}>
                        {showAllLanguages ? 'Sadece ' + language.toUpperCase() : 'Tüm Diller'}
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <Text style={[styles.loading, { color: theme.muted }]}>Yükleniyor...</Text>
            ) : (
                <FlatList
                    data={filteredComments}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.commentCard, { borderBottomColor: theme.border }]}>
                            <View style={styles.commentHeader}>
                                <Text style={[styles.userName, { color: item.isAnonymous ? theme.muted : theme.text }]}>
                                    {item.displayName}
                                </Text>
                                <Text style={{ fontSize: 12, color: theme.muted }}>{item.language.toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.commentText, { color: theme.text }]}>{item.text}</Text>

                            <View style={styles.commentActions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                                    <Heart
                                        size={16}
                                        color={item.likedBy?.includes(userId || '') ? '#e74c3c' : theme.muted}
                                        fill={item.likedBy?.includes(userId || '') ? '#e74c3c' : 'transparent'}
                                    />
                                    <Text style={[styles.actionText, { color: theme.muted }]}>{item.likes}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.muted }]}>Henüz yorum yapılmamış. İlk yorumu sen yap!</Text>
                    }
                />
            )}

            {userId ? (
                <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
                    <TouchableOpacity
                        style={styles.anonToggle}
                        onPress={() => setIsAnonymous(!isAnonymous)}
                    >
                        <Text style={{ color: isAnonymous ? theme.primary : theme.muted, fontSize: 12 }}>
                            {isAnonymous ? '👁️ Gizli' : 'Kendi İsmimle'}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.inputRow}>
                        <TextInput
                            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                            placeholder="Bir yorum yaz..."
                            placeholderTextColor={theme.muted}
                            value={text}
                            onChangeText={setText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: text.trim() ? theme.primary : theme.muted }]}
                            onPress={handleSend}
                        >
                            <MessageSquare size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.loginPrompt}>
                    <Text style={{ color: theme.muted }}>Yorum yazmak için giriş yapmalısınız.</Text>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    loading: {
        padding: 24,
        textAlign: 'center',
    },
    emptyText: {
        padding: 24,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    commentCard: {
        padding: 16,
        borderBottomWidth: 1,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    userName: {
        fontWeight: 'bold',
    },
    commentText: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    commentActions: {
        flexDirection: 'row',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
    },
    inputContainer: {
        padding: 16,
        borderTopWidth: 1,
    },
    anonToggle: {
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        maxHeight: 100,
        minHeight: 40,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    loginPrompt: {
        padding: 24,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    }
});
