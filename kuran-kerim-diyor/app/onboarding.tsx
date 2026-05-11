import React, { useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, FlatList, Modal, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Cloud, Heart, ArrowRight, Check, Globe } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { useTranslation } from 'react-i18next';
import i18n, { applyRTL } from '../services/i18n';
import { useUserStore } from '../store/userStore';
import { LANGUAGES, AppLanguage } from '../constants/languages';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showLangPicker, setShowLangPicker] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { t } = useTranslation();
    const { language, setLanguage } = useUserStore();

    const SLIDES = useMemo(() => [
        {
            id: '1',
            title: t('onboarding.slide1_title'),
            description: t('onboarding.slide1_desc'),
            icon: <BookOpen size={100} color={theme.primary} strokeWidth={1.5} />
        },
        {
            id: '2',
            title: t('onboarding.slide2_title'),
            description: t('onboarding.slide2_desc'),
            icon: <Cloud size={100} color={theme.primary} strokeWidth={1.5} />
        },
        {
            id: '3',
            title: t('onboarding.slide3_title'),
            description: t('onboarding.slide3_desc'),
            icon: <Heart size={100} color={theme.primary} strokeWidth={1.5} />
        }
    ], [t, theme.primary]);

    const finishOnboarding = async () => {
        await AsyncStorage.setItem('hasOnboarded', 'true');
        router.replace('/(tabs)');
    };

    const handleNext = () => {
        if (currentIndex < SLIDES.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
            setCurrentIndex(nextIndex);
        } else {
            finishOnboarding();
        }
    };

    const handleLanguageChange = async (lang: AppLanguage) => {
        await AsyncStorage.setItem('@app_language', lang);
        await i18n.changeLanguage(lang);
        applyRTL(lang);
        setLanguage(lang);
        setShowLangPicker(false);
    };

    const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
        if (viewableItems && viewableItems.length > 0) {
            const newIndex = viewableItems[0].index;
            if (typeof newIndex === 'number') {
                setCurrentIndex(newIndex);
            }
        }
    }).current;

    const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header: Language Selector & Skip Button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => setShowLangPicker(true)} style={styles.headerBtn}>
                    <Globe size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={finishOnboarding} style={styles.headerBtn}>
                    <Text style={[styles.skipText, { color: theme.muted }]}>{t('onboarding.skip')}</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={SLIDES}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                renderItem={({ item }) => (
                    <View style={[styles.slideContainer, { width }]}>
                        <View style={styles.iconContainer}>
                            {item.icon}
                        </View>
                        <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
                        <Text style={[styles.description, { color: theme.muted }]}>{item.description}</Text>
                    </View>
                )}
            />

            <View style={styles.footer}>
                <View style={styles.dotsContainer}>
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                { backgroundColor: index === currentIndex ? theme.primary : theme.border },
                                index === currentIndex ? { width: 24 } : {}
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primary }]}
                    onPress={handleNext}
                >
                    <Text style={styles.buttonText}>
                        {currentIndex === SLIDES.length - 1 ? t('onboarding.btn_start') : t('onboarding.btn_continue')}
                    </Text>
                    {currentIndex === SLIDES.length - 1 ? (
                        <Check size={20} color="#fff" style={{ marginLeft: 8 }} />
                    ) : (
                        <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Language Picker Modal */}
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
                        {(Object.keys(LANGUAGES) as AppLanguage[]).map(lang => (
                            <TouchableOpacity
                                key={lang}
                                style={[styles.langItem, { borderBottomColor: theme.border }]}
                                onPress={() => handleLanguageChange(lang)}
                            >
                                <View>
                                    <Text style={[styles.langName, { color: theme.text }]}>
                                        {LANGUAGES[lang].nativeName}
                                    </Text>
                                    <Text style={[styles.langSub, { color: theme.muted }]}>
                                        {LANGUAGES[lang].name}
                                    </Text>
                                </View>
                                {language === lang && (
                                    <Check size={20} color={theme.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    headerBtn: {
        padding: 8,
    },
    skipText: {
        fontSize: 16,
        fontWeight: '500',
    },
    slideContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: 'rgba(182, 154, 115, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        padding: 40,
        paddingBottom: 60,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 4,
    },
    button: {
        flexDirection: 'row',
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
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
