import React, { useState, useEffect } from 'react';
import { TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import { Play, Pause } from 'lucide-react-native';
import { Colors } from '../constants/colors';

interface AudioPlayerProps {
    globalAyahNumber: number;
}

export function AudioPlayer({ globalAyahNumber }: AudioPlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const theme = Colors.light;

    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    const handlePlayPause = async () => {
        if (isLoading) return;

        if (sound) {
            if (isPlaying) {
                await sound.pauseAsync();
                setIsPlaying(false);
            } else {
                await sound.playAsync();
                setIsPlaying(true);
            }
            return;
        }

        setIsLoading(true);
        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
            });

            const url = `https://cdn.islamic.network/quran/audio/64/ar.alafasy/${globalAyahNumber}.mp3`;

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true }
            );

            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.isLoaded && status.didJustFinish) {
                    setIsPlaying(false);
                }
            });
        } catch (e) {
            console.error("Audio playback error:", e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableOpacity style={styles.button} onPress={handlePlayPause}>
            {isLoading ? (
                <ActivityIndicator color={theme.primary} />
            ) : isPlaying ? (
                <Pause size={28} color={theme.primary} />
            ) : (
                <Play size={28} color={theme.primary} />
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
    }
});
