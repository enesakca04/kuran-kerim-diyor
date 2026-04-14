import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, useColorScheme, FlatList, TouchableOpacity, Modal, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { useUserStore } from '../../store/userStore';
import { getSurah } from '../../services/quranData';
import { useNavigation, useRouter } from 'expo-router';
import { ChevronDown, Heart, MoreVertical, Check } from 'lucide-react-native';
import { CollectionManagerModal } from '../../components/CollectionManagerModal';
import { DeleteWarningModal } from '../../components/DeleteWarningModal';

export default function FavoritesScreen() {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    const { 
        favorites, collections, toggleFavorite, removeAyahFromCollection, 
        setProgress, language, hideFavoriteDeleteWarning, setHideFavoriteDeleteWarning 
    } = useUserStore();
    
    const router = useRouter();
    const navigation = useNavigation();

    // States
    const [selectedCol, setSelectedCol] = useState<string>('general');
    const [showColDropdown, setShowColDropdown] = useState(false);
    const [managerAyahId, setManagerAyahId] = useState<string | null>(null);
    const [warningAyahId, setWarningAyahId] = useState<string | null>(null);

    // Dynamic header definition
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <TouchableOpacity 
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                    onPress={() => setShowColDropdown(true)}
                >
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginRight: 6 }}>
                        {selectedCol === 'general' ? 'Favorilerim' : collections[selectedCol]?.name || 'Favorilerim'}
                    </Text>
                    <ChevronDown size={20} color={theme.text} />
                </TouchableOpacity>
            )
        });
    }, [navigation, selectedCol, collections, theme]);

    // Data selector
    const sortedData = useMemo(() => {
        const sourceMap = selectedCol === 'general' ? favorites : collections[selectedCol]?.ayahs;
        if (!sourceMap) return [];
        return Object.entries(sourceMap)
            .map(([id, timestamp]) => {
                const [surahNoStr, ayahNoStr] = id.split(':');
                return { id, timestamp, surahNo: parseInt(surahNoStr, 10), ayahNo: parseInt(ayahNoStr, 10) };
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [favorites, collections, selectedCol]);

    const handlePress = (surahNo: number, ayahNo: number) => {
        setProgress(surahNo, ayahNo);
        router.push('/');
    };

    const handleHeartClick = (ayahId: string) => {
        if (selectedCol === 'general') {
            if (!hideFavoriteDeleteWarning) {
                setWarningAyahId(ayahId);
            } else {
                toggleFavorite(ayahId);
            }
        } else {
            removeAyahFromCollection(ayahId, selectedCol);
        }
    };

    const confirmGlobalDelete = (dontAskAgain: boolean) => {
        if (dontAskAgain) {
            setHideFavoriteDeleteWarning(true);
        }
        if (warningAyahId) {
            toggleFavorite(warningAyahId);
        }
        setWarningAyahId(null);
    };

    const renderItem = ({ item }: { item: any }) => {
        const surah = getSurah(item.surahNo);
        const ayah = surah?.ayahs.find((a: any) => a.number === item.ayahNo);
        if (!surah || !ayah) return null;

        return (
            <TouchableOpacity 
                style={[styles.ayahCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => handlePress(item.surahNo, item.ayahNo)}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.surahName, { color: theme.primary }]}>
                        {surah.name.tr} - {item.ayahNo}. Ayet
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); setManagerAyahId(item.id); }} style={{ padding: 4, marginRight: 8 }}>
                            <MoreVertical size={20} color={theme.muted} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={(e) => { e.stopPropagation(); handleHeartClick(item.id); }} style={{ padding: 4 }}>
                            <Heart size={20} color={theme.primary} fill={theme.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <Text style={[styles.arabicText, { color: theme.text }]} numberOfLines={2}>{ayah.arabic}</Text>
                <Text style={[styles.turkishText, { color: theme.secondary }]} numberOfLines={3}>{ayah.translations[language]}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {sortedData.length === 0 ? (
                <View style={[styles.placeholderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Text style={{ color: theme.muted, textAlign: 'center' }}>
                        Bu listede henüz kayıtlı bir ayet bulunmuyor.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={sortedData}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 24, paddingTop: 16 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Dropdown for category selection */}
            <Modal visible={showColDropdown} transparent animationType="fade" onRequestClose={() => setShowColDropdown(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowColDropdown(false)}>
                    <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border }]}>
                        <TouchableOpacity 
                            style={[styles.dropdownItem, selectedCol === 'general' && { backgroundColor: theme.background }]} 
                            onPress={() => { setSelectedCol('general'); setShowColDropdown(false); }}
                        >
                            <Text style={[{ color: theme.text }, selectedCol === 'general' && { fontWeight: 'bold' }]}>Favorilerim</Text>
                            {selectedCol === 'general' && <Check size={18} color={theme.primary} />}
                        </TouchableOpacity>
                        {Object.values(collections)
                            .sort((a, b) => a.name.localeCompare(b.name))
                            .map(col => (
                            <TouchableOpacity 
                                key={col.id}
                                style={[styles.dropdownItem, selectedCol === col.id && { backgroundColor: theme.background }]} 
                                onPress={() => { setSelectedCol(col.id); setShowColDropdown(false); }}
                            >
                                <Text style={[{ color: theme.text }, selectedCol === col.id && { fontWeight: 'bold' }]}>{col.name}</Text>
                                {selectedCol === col.id && <Check size={18} color={theme.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            <CollectionManagerModal 
                visible={!!managerAyahId} 
                ayahId={managerAyahId} 
                onClose={() => setManagerAyahId(null)} 
            />

            <DeleteWarningModal 
                visible={!!warningAyahId}
                onCancel={() => setWarningAyahId(null)}
                onConfirm={confirmGlobalDelete}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    placeholderCard: {
        padding: 24,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        marginTop: 40
    },
    ayahCard: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    surahName: { fontSize: 16, fontWeight: 'bold' },
    arabicText: {
        fontFamily: 'Amiri_400Regular',
        fontSize: 22,
        textAlign: 'right',
        marginBottom: 8,
        lineHeight: 36,
    },
    turkishText: { fontSize: 15, lineHeight: 22 },
    
    // Dropdown styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.2)',
        paddingTop: Platform.OS === 'ios' ? 100 : 80,
        alignItems: 'center',
    },
    dropdownMenu: {
        width: 250,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#eee'
    }
});
