import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BookOpen, Cloud, Heart, ArrowRight, Check } from 'lucide-react-native';
import { Colors } from '../constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: "Kur'an-ı Kerim Diyor",
        description: "Modern, akıcı ve size özel tasarlanmış yepyeni bir okuma deneyimi.",
        icon: <BookOpen size={100} color={Colors.light.primary} strokeWidth={1.5} />
    },
    {
        id: '2',
        title: "Kaldığınız Yer Güvende",
        description: "Okuma ilerlemeniz buluta otomatik kaydedilir. Cihaz değiştirin ama kaldığınız yeri hiç kaybetmeyin.",
        icon: <Cloud size={100} color={Colors.light.primary} strokeWidth={1.5} />
    },
    {
        id: '3',
        title: "Toplulukla Paylaşın",
        description: "Ayetleri dinleyin, hislerinizi isimsiz (anonim) bir şekilde diğer okurlarla anında paylaşın.",
        icon: <Heart size={100} color={Colors.light.primary} strokeWidth={1.5} />
    }
];

export default function OnboardingScreen() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const router = useRouter();
    const theme = Colors.light;

    const handleNext = async () => {
        if (currentIndex < SLIDES.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            // Finish Onboarding
            await AsyncStorage.setItem('hasOnboarded', 'true');
            router.replace('/(tabs)');
        }
    };

    const currentSlide = SLIDES[currentIndex];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.slideContainer}>
                <View style={styles.iconContainer}>
                    {currentSlide.icon}
                </View>
                <Text style={[styles.title, { color: theme.text }]}>{currentSlide.title}</Text>
                <Text style={[styles.description, { color: theme.muted }]}>{currentSlide.description}</Text>
            </View>

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
                        {currentIndex === SLIDES.length - 1 ? "Bismillahirrahmanirrahim" : "Devam Et"}
                    </Text>
                    {currentIndex === SLIDES.length - 1 ? (
                        <Check size={20} color="#fff" style={{ marginLeft: 8 }} />
                    ) : (
                        <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slideContainer: {
        flex: 1,
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
    }
});
