import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { searchAyahs } from '../../services/quranData';
import { useUserStore } from '../../store/userStore';
import { useProgress } from '../../hooks/useProgress';
import { useAyahStats } from '../../hooks/useAyahStats';
import { formatFavCount } from '../../services/statsService';
import { Heart } from 'lucide-react-native';

const SearchResultItem = ({ item, theme, language, onPress }: any) => {
    const ayahId = `${item.surahNumber}:${item.ayah.number}`;
    const { count } = useAyahStats(ayahId);
    const { favorites } = useUserStore();
    
    // Eğer daha önceden(bu özellik yokken) lokal olarak favladıysa ama global 0 ise en az 1 göster
    const displayCount = Math.max(count, favorites[ayahId] ? 1 : 0);
    
    return (
        <TouchableOpacity
            style={[styles.resultCard, { borderBottomColor: theme.border }]}
            onPress={onPress}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.meta, { color: theme.primary, marginBottom: 0 }]}>
                    {item.surahName} • Ayet {item.ayah.number}
                </Text>
                {displayCount > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: theme.primary, marginRight: 4, fontSize: 12, fontWeight: 'bold' }}>
                            {formatFavCount(displayCount)} kişi
                        </Text>
                        <Heart size={14} color={theme.primary} fill={theme.primary} />
                    </View>
                )}
            </View>
            <Text style={[styles.arabic, { color: theme.text }]} numberOfLines={2}>
                {item.ayah.arabic}
            </Text>
            <Text style={[styles.translation, { color: theme.secondary }]} numberOfLines={3}>
                {item.ayah.translations[language]}
            </Text>
        </TouchableOpacity>
    );
};

export default function SearchScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { language } = useUserStore();
    const router = useRouter();
    const { setProgress } = useProgress();

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = (text: string) => {
        setQuery(text);
        // Sondaki kısım rakamla bitiyorsa referans olabilir (sebe 50, 34:50 vb.)
        const endsWithDigit = /\d$/.test(text.trim());
        if (text.length > 2 || (endsWithDigit && text.trim().length >= 3)) {
            const res = searchAyahs(text, language);
            setResults(res);
        } else {
            setResults([]);
        }
    };

    const handleResultPress = (surahNumber: number, ayahNumber: number) => {
        setProgress(surahNumber, ayahNumber);
        router.push('/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.searchBox}>
                <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.card }]}
                    placeholder="Kur'an'da ara..."
                    placeholderTextColor={theme.muted}
                    value={query}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={results}
                keyExtractor={(item) => item.ayah.globalNumber.toString()}
                renderItem={({ item }) => (
                    <SearchResultItem 
                        item={item} 
                        theme={theme} 
                        language={language} 
                        onPress={() => handleResultPress(item.surahNumber, item.ayah.number)} 
                    />
                )}
                ListEmptyComponent={
                    query.length > 2 ? (
                        <Text style={[styles.empty, { color: theme.muted }]}>Sonuç bulunamadı.</Text>
                    ) : (
                        <Text style={[styles.empty, { color: theme.muted }]}>Aramak için en az 3 harf girin.</Text>
                    )
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchBox: { padding: 16 },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    resultCard: {
        padding: 16,
        borderBottomWidth: 1,
    },
    meta: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    arabic: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 22,
        textAlign: 'right',
        marginBottom: 8,
    },
    translation: {
        fontSize: 14,
        lineHeight: 20,
    },
    empty: {
        textAlign: 'center',
        padding: 24,
        fontStyle: 'italic',
    }
});
