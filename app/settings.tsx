import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    ScrollView,
    useColorScheme,
    Modal,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
    Bell,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Globe,
    Check,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useUserStore } from '../store/userStore';
import { LANGUAGES, AppLanguage } from '../constants/languages';

// Arapca kullanicilar icin meal dilinden hariclenenler
const TRANSLATION_LANGS = (Object.keys(LANGUAGES) as AppLanguage[]).filter(l => l !== 'ar');

export default function SettingsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { t } = useTranslation();

    const {
        language,
        showArabicTranslation,
        arabicTranslationLang,
        setShowArabicTranslation,
        setArabicTranslationLang,
    } = useUserStore();

    const isArabicUser = language === 'ar';
    const [showLangPicker, setShowLangPicker] = useState(false);

    const handleNotificationPress = () => {
        // Bildirim izni isteme - ilerleyen sureclerde implement edilecek
        Alert.alert('', t('settings.coming_soon'));
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border, backgroundColor: theme.background }]}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ChevronLeft size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>
                    {t('settings.title')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* ── BİLDİRİMLER ── */}
                <Text style={[styles.sectionHeader, { color: theme.muted }]}>
                    {t('settings.notifications_section')}
                </Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <TouchableOpacity style={styles.row} onPress={handleNotificationPress}>
                        <View style={styles.rowLeft}>
                            <View style={[styles.iconWrap, { backgroundColor: 'rgba(255, 149, 0, 0.12)' }]}>
                                <Bell size={20} color="#FF9500" />
                            </View>
                            <View>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>
                                    {t('settings.notification_permission')}
                                </Text>
                                <Text style={[styles.rowSub, { color: theme.muted }]}>
                                    {t('settings.notification_permission_sub')}
                                </Text>
                            </View>
                        </View>
                        <ChevronRight size={18} color={theme.muted} />
                    </TouchableOpacity>
                </View>

                {/* ── OKUMA TERCİHLERİ ── */}
                <Text style={[styles.sectionHeader, { color: theme.muted }]}>
                    {t('settings.reading_section')}
                </Text>
                <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

                    {/* Arapça kullanıcıya özel: Meal Toggle */}
                    {isArabicUser && (
                        <>
                            <View style={[styles.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}>
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(182, 154, 115, 0.12)' }]}>
                                        <BookOpen size={20} color={theme.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginRight: 8 }}>
                                        <Text style={[styles.rowTitle, { color: theme.text }]}>
                                            {t('settings.show_translation')}
                                        </Text>
                                        <Text style={[styles.rowSub, { color: theme.muted }]}>
                                            {t('settings.show_translation_sub')}
                                        </Text>
                                    </View>
                                </View>
                                <Switch
                                    value={showArabicTranslation}
                                    onValueChange={setShowArabicTranslation}
                                    trackColor={{ false: theme.border, true: theme.primary }}
                                    thumbColor="#fff"
                                />
                            </View>

                            {/* Meal dili seçici — sadece toggle açıkken aktif */}
                            <TouchableOpacity
                                style={[styles.row, !showArabicTranslation && styles.rowDisabled]}
                                onPress={() => showArabicTranslation && setShowLangPicker(true)}
                                activeOpacity={showArabicTranslation ? 0.6 : 1}
                            >
                                <View style={styles.rowLeft}>
                                    <View style={[styles.iconWrap, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
                                        <Globe size={20} color={showArabicTranslation ? '#34C759' : theme.muted} />
                                    </View>
                                    <View>
                                        <Text style={[styles.rowTitle, { color: showArabicTranslation ? theme.text : theme.muted }]}>
                                            {t('settings.translation_lang')}
                                        </Text>
                                        <Text style={[styles.rowSub, { color: theme.muted }]}>
                                            {LANGUAGES[arabicTranslationLang]?.nativeName}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight size={18} color={showArabicTranslation ? theme.muted : theme.border} />
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Arapça değilse bilgi mesajı */}
                    {!isArabicUser && (
                        <View style={[styles.row, { paddingVertical: 18 }]}>
                            <Text style={[styles.rowSub, { color: theme.muted, textAlign: 'center', flex: 1 }]}>
                                {t('settings.reading_no_extra')}
                            </Text>
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* ── Meal Dili Seçici Modal ── */}
            <Modal
                visible={showLangPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLangPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowLangPicker(false)}
                >
                    <View style={[styles.langModal, { backgroundColor: theme.card }]}>
                        <Text style={[styles.langModalTitle, { color: theme.text }]}>
                            {t('settings.translation_lang')}
                        </Text>
                        {TRANSLATION_LANGS.map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[styles.langItem, { borderBottomColor: theme.border }]}
                                onPress={() => {
                                    setArabicTranslationLang(lang);
                                    setShowLangPicker(false);
                                }}
                            >
                                <View>
                                    <Text style={[styles.langName, { color: theme.text }]}>
                                        {LANGUAGES[lang].nativeName}
                                    </Text>
                                    <Text style={[styles.langSub, { color: theme.muted }]}>
                                        {LANGUAGES[lang].name}
                                    </Text>
                                </View>
                                {arabicTranslationLang === lang && (
                                    <Check size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 56,
        paddingBottom: 16,
        paddingHorizontal: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionHeader: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginTop: 24,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        minHeight: 64,
    },
    rowDisabled: {
        opacity: 0.4,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    iconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowTitle: {
        fontSize: 15,
        fontWeight: '500',
    },
    rowSub: {
        fontSize: 12,
        marginTop: 2,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    langModal: {
        width: 300,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    langModalTitle: {
        fontSize: 16,
        fontWeight: '700',
        padding: 16,
        paddingBottom: 10,
    },
    langItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    langName: {
        fontSize: 15,
        fontWeight: '500',
    },
    langSub: {
        fontSize: 12,
        marginTop: 2,
    },
});
