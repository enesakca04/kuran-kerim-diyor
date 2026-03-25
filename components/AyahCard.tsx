import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Colors } from '../constants/colors';
import { Ayah } from '../services/quranData';
import { useUserStore } from '../store/userStore';
import { MessageSquare } from 'lucide-react-native';
import { CommentSheet } from './CommentSheet';
import { AudioPlayer } from './AudioPlayer';

interface AyahCardProps {
    ayah: Ayah;
    surahName: string;
    surahNumber: number;
}

export function AyahCard({ ayah, surahName, surahNumber }: AyahCardProps) {
    const language = useUserStore((state) => state.language);
    const theme = Colors.light;
    const [showComments, setShowComments] = useState(false);

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                <Text style={[styles.arabicText, { color: theme.text }]}>
                    {ayah.arabic}
                </Text>
                <Text style={[styles.translationText, { color: theme.secondary }]}>
                    {ayah.translations[language]}
                </Text>
            </ScrollView>

            <View style={styles.footer}>
                <AudioPlayer globalAyahNumber={ayah.globalNumber} />

                <Text style={[styles.metaText, { color: theme.muted, marginHorizontal: 16 }]}>
                    {surahName} • Ayet {ayah.number}
                </Text>

                <TouchableOpacity style={styles.commentBtn} onPress={() => setShowComments(true)}>
                    <MessageSquare size={24} color={theme.primary} />
                </TouchableOpacity>
            </View>

            <Modal visible={showComments} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowComments(false)}>
                <View style={{ flex: 1, backgroundColor: theme.background }}>
                    <View style={styles.sheetHeader}>
                        <TouchableOpacity onPress={() => setShowComments(false)}>
                            <Text style={{ color: theme.primary, fontSize: 16, padding: 16, fontWeight: 'bold' }}>Kapat</Text>
                        </TouchableOpacity>
                    </View>
                    <CommentSheet surahNo={surahNumber} ayahNo={ayah.number} onClose={() => setShowComments(false)} />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 24,
        paddingLeft: 24,
        paddingRight: 64,
    },
    content: {
        flex: 1,
        width: '100%',
    },
    contentInner: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    arabicText: {
        fontFamily: 'Amiri_700Bold',
        fontSize: 42,
        lineHeight: 80,
        textAlign: 'center',
        writingDirection: 'rtl',
        marginBottom: 40,
    },
    translationText: {
        fontSize: 18,
        lineHeight: 28,
        textAlign: 'center',
    },
    footer: {
        paddingVertical: 24,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    metaText: {
        fontSize: 14,
        fontWeight: '600',
    },
    commentBtn: {
        padding: 8,
    },
    sheetHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        alignItems: 'flex-start',
    }
});
