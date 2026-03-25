import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../constants/colors';

interface Props {
    visible: boolean;
    onClose: () => void;
}

export function HatimCelebration({ visible, onClose }: Props) {
    const scale = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (visible) {
            scale.setValue(0.5);
            Animated.loop(
                Animated.sequence([
                    Animated.spring(scale, {
                        toValue: 1.5,
                        useNativeDriver: true,
                        speed: 12,
                        bounciness: 8
                    }),
                    Animated.spring(scale, {
                        toValue: 1.2,
                        useNativeDriver: true,
                        speed: 12,
                        bounciness: 8
                    })
                ])
            ).start();
        } else {
            scale.stopAnimation();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <Animated.View style={{ transform: [{ scale }] }}>
                        <Star size={80} color={Colors.light.primary} fill="#F1C40F" />
                    </Animated.View>
                    <Text style={styles.title}>Tebrikler!</Text>
                    <Text style={styles.subtitle}>Kur'an-ı Kerim'i baştan sona okuyarak Hatim ettiniz. Allah kabul etsin.</Text>
                    <TouchableOpacity style={styles.btn} onPress={onClose}>
                        <Text style={styles.btnText}>Teşekkürler</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 16,
        alignItems: 'center',
        width: '80%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginVertical: 16,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 24,
        lineHeight: 24,
    },
    btn: {
        backgroundColor: Colors.light.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});
