import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { useComments } from '../hooks/useComments';
import { useUserStore } from '../store/userStore';
import { Heart, MessageSquare, Trash2, Reply, Send } from 'lucide-react-native';
import { maskName } from '../utils/privacy';

interface CommentSheetProps {
    surahNo: number;
    ayahNo: number;
    onClose: () => void;
}

export function CommentSheet({ surahNo, ayahNo, onClose }: CommentSheetProps) {
    const { comments, loading, addComment, toggleLike, deleteComment } = useComments(surahNo, ayahNo);
    const { userId, isAnonymous, language, displayName } = useUserStore();
    const theme = Colors.light;
    const router = useRouter();

    const [text, setText] = useState('');
    const [sendAsAnonymous, setSendAsAnonymous] = useState(false);
    const [showAllLanguages, setShowAllLanguages] = useState(false);
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});
    const inputRef = useRef<TextInput>(null);

    const isRealUser = userId && !isAnonymous;
    const { email } = useUserStore();
    const effectiveName = displayName || (email ? email.split('@')[0] : 'Kullanıcı');

    // Grouping by reply structure could be done here if needed. For flat UI, replies just show up indented.
    const rawFiltered = showAllLanguages
        ? comments
        : comments.filter(c => c.language === language);

    const buildThreads = (commentsList: any[]) => {
        const rootItems = commentsList.filter(c => !c.replyToId);
        const childrenMap: Record<string, any[]> = {};

        commentsList.forEach(c => {
            if (c.replyToId) {
                if (!childrenMap[c.replyToId]) childrenMap[c.replyToId] = [];
                childrenMap[c.replyToId].push(c);
            }
        });

        // Ortak bir hiyerarşi oluştururken yanıtları eskiden yeniye sıralayalım
        Object.keys(childrenMap).forEach(key => {
            childrenMap[key].sort((a,b) => {
                const timeA = a.createdAt?.toMillis?.() || 0;
                const timeB = b.createdAt?.toMillis?.() || 0;
                return timeA - timeB; 
            });
        });

        const result: any[] = [];
        
        const addChildren = (parentId: string) => {
            if (childrenMap[parentId]) {
                childrenMap[parentId].forEach(child => {
                    result.push(child);
                    addChildren(child.id); 
                });
            }
        };

        rootItems.forEach(root => {
            root.replyCount = childrenMap[root.id] ? childrenMap[root.id].length : 0;
            result.push(root);
            
            if (expandedThreads[root.id]) {
                addChildren(root.id);
            }
        });

        return result;
    };

    const toggleThread = (id: string) => {
        setExpandedThreads(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const filteredComments = buildThreads(rawFiltered);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Az önce';
        const d = timestamp.toDate ? timestamp.toDate() : new Date();
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const handleSend = async () => {
        if (!text.trim() || !isRealUser) return;
        const currentText = text.trim();
        const currentReplyId = replyToId;
        
        // Optimistic UI: Kullanıcıyı bekletmemek için anında temizliyoruz.
        setText('');
        setReplyToId(null);
        
        try {
            await addComment(currentText, sendAsAnonymous, currentReplyId, effectiveName);
        } catch (e) {
            console.error(e);
            // Hata olursa metni geri getirebiliriz
            setText(currentText);
        }
    };

    const handleDelete = async (id: string) => {
        // Here we could add an Alert confirm before delete, but immediate delete is also fine for app prototype.
        await deleteComment(id);
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

            {loading && comments.length === 0 && (
                <View style={{ paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: theme.muted, fontSize: 12 }}>Yükleniyor...</Text>
                </View>
            )}
            <FlatList
                data={filteredComments}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isReply = !!item.replyToId;
                    return (
                        <View style={[styles.commentCard, { borderBottomColor: theme.border, marginLeft: isReply ? 32 : 0, borderLeftWidth: isReply ? 2 : 0, borderLeftColor: theme.border }]}>
                            <View style={styles.commentHeader}>
                                <Text style={[styles.userName, { color: item.isAnonymous ? theme.muted : theme.text }]}>
                                    {item.displayName} 
                                    {isReply && <Text style={{fontSize: 12, fontWeight: 'normal', color: theme.muted}}> (Yanıt)</Text>}
                                </Text>
                                <Text style={{ fontSize: 12, color: theme.muted }}>{item.language.toUpperCase()}</Text>
                            </View>
                            
                            {item.isDeletedUser ? (
                                <Text style={[styles.commentText, { color: theme.muted, fontStyle: 'italic' }]}>
                                    Bu yorum kullanıcı tarafından silinmiştir.
                                </Text>
                            ) : item.isDeletedMod ? (
                                <Text style={[styles.commentText, { color: '#e74c3c', fontStyle: 'italic' }]}>
                                    Bu yorum moderatör tarafından uygunsuz bulunduğu için kaldırılmıştır.
                                </Text>
                            ) : (
                                <Text style={[styles.commentText, { color: theme.text }]}>{item.text}</Text>
                            )}

                            <View style={styles.commentActions}>
                                <TouchableOpacity disabled={item.isDeletedUser || item.isDeletedMod} style={styles.actionBtn} onPress={() => {
                                    if (!isRealUser) return; // Uyarı verebiliriz
                                    toggleLike(item.id);
                                }}>
                                    <Heart
                                        size={16}
                                        color={item.likedBy?.includes(userId || '') ? '#e74c3c' : theme.muted}
                                        fill={item.likedBy?.includes(userId || '') ? '#e74c3c' : 'transparent'}
                                    />
                                    <Text style={[styles.actionText, { color: theme.muted }]}>{item.likes}</Text>
                                </TouchableOpacity>
                                
                                {!item.isDeletedUser && !item.isDeletedMod && (
                                    <TouchableOpacity style={styles.actionBtn} onPress={() => {
                                        if (!isRealUser) return;
                                        setReplyToId(item.id);
                                        inputRef.current?.focus();
                                    }}>
                                        <Reply size={16} color={theme.muted} />
                                        <Text style={[styles.actionText, { color: theme.muted }]}>Yanıtla</Text>
                                    </TouchableOpacity>
                                )}

                                {userId === item.userId && !item.isDeletedUser && !item.isDeletedMod ? (
                                    <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 11, color: theme.muted, marginRight: 12 }}>{formatDate(item.createdAt)}</Text>
                                        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                                            <Trash2 size={16} color={theme.muted} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={{ marginLeft: 'auto', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 11, color: theme.muted }}>{formatDate(item.createdAt)}</Text>
                                    </View>
                                )}
                            </View>
                            
                            {/* Yanıtları Göster / Gizle Butonu */}
                            {!isReply && item.replyCount > 0 && (
                                <TouchableOpacity 
                                    style={{ marginTop: 12, paddingVertical: 4 }} 
                                    onPress={() => toggleThread(item.id)}
                                >
                                    <Text style={{ color: theme.muted, fontWeight: 'bold', fontSize: 13 }}>
                                        {expandedThreads[item.id] ? '— Yanıtları Gizle' : `— ${item.replyCount} Yanıtı Göster`}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <Text style={[styles.emptyText, { color: theme.muted, fontSize: 16 }]}>Ayetin size ne hissettirdiğini ve merak ettiklerinizi diğer müslümanlar ile paylaşın.</Text>
                }
            />

            {isRealUser ? (
                <View style={[styles.inputContainer, { borderTopColor: theme.border }]}>
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                        <TouchableOpacity
                            style={styles.anonToggle}
                            onPress={() => setSendAsAnonymous(!sendAsAnonymous)}
                        >
                            <Text style={{ color: sendAsAnonymous ? theme.primary : theme.muted, fontSize: 12 }}>
                                {sendAsAnonymous ? '👁️ Kimliğimi Gizle' : 'Kendi İsmimle (Mahremiyet Korumalı)'}
                            </Text>
                        </TouchableOpacity>
                        {replyToId && (
                            <TouchableOpacity onPress={() => setReplyToId(null)}>
                                <Text style={{ color: '#e74c3c', fontSize: 12 }}>İptal</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <View style={styles.inputRow}>
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                            placeholder={replyToId ? "Yanıtınız..." : "Siz de hislerinizi paylaşın..."}
                            placeholderTextColor={theme.muted}
                            value={text}
                            onChangeText={setText}
                            multiline
                        />
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: text.trim() ? theme.primary : theme.muted }]}
                            onPress={handleSend}
                        >
                            <Send size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    {!sendAsAnonymous && (
                        <Text style={{ color: theme.muted, fontSize: 10, marginTop: 8, fontStyle: 'italic' }}>
                            🛡️ İçiniz rahat olsun, güvenliğiniz için isminiz ({maskName(effectiveName)}) şeklinde gizlenir.
                        </Text>
                    )}
                </View>
            ) : (
                <View style={[styles.loginPrompt, { backgroundColor: theme.card }]}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' }}>
                        Düşüncelerinizi Paylaşmak İster Misiniz?
                    </Text>
                    <Text style={{ color: theme.muted, textAlign: 'center', fontSize: 13, marginBottom: 16 }}>
                        Devam etmek için ücretsiz giriş yapmanız veya saniyeler içinde hesap oluşturmanız gerekiyor.
                    </Text>
                    {/* Yönlendirme butonu daha sonra Profile vs navigate ile bağlanabilir */}
                    <TouchableOpacity 
                        style={[styles.authBtn, { backgroundColor: theme.primary }]}
                        onPress={() => { onClose(); router.push('/(tabs)/profile'); }}
                    >
                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Hesap Oluştur / Giriş Yap</Text>
                    </TouchableOpacity>
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
    },
    authBtn: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    }
});
