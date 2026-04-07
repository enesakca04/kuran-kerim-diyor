import { create } from 'zustand';
import { AppLanguage } from '../constants/languages';

export interface Collection {
    id: string;
    name: string;
    ayahs: Record<string, number>;
}

interface UserState {
    language: AppLanguage;
    currentSurah: number;
    currentAyah: number;
    completedSurahs: number[];
    favorites: Record<string, number>;
    collections: Record<string, Collection>;
    hideFavoriteDeleteWarning: boolean;

    // Auth state
    userId: string | null;
    isAnonymous: boolean;
    displayName: string | null;
    email: string | null;

    setLanguage: (lang: AppLanguage) => void;
    setProgress: (surah: number, ayah: number) => void;
    addCompletedSurah: (surah: number) => void;
    setCompletedSurahs: (surahs: number[]) => void;
    setAuth: (userId: string | null, isAnonymous: boolean, displayName: string | null, email: string | null) => void;
    
    toggleFavorite: (id: string) => void; // Used for general
    setFavorites: (favs: Record<string, number>) => void;
    loadFavorites: () => Promise<void>;

    // Collection specific actions
    setHideFavoriteDeleteWarning: (hide: boolean) => void;
    addCollection: (name: string) => void;
    deleteCollection: (colId: string) => void;
    addAyahToCollection: (ayahId: string, colId: string) => void;
    removeAyahFromCollection: (ayahId: string, colId: string) => void;
    removeFromAllCollections: (ayahId: string) => void; // Called when removed from general favs
    setCollections: (cols: Record<string, Collection>) => void;
}

// Helper block to avoid repetition
const saveFavoritesAndCollectionsToCloud = (userId: string | null, favs: Record<string, number>, cols?: Record<string, Collection>) => {
    if (userId) {
        import('../services/syncService').then(sync => {
            sync.syncFavoritesToCloud(favs, cols);
        });
    }
};

const saveLocal = (key: string, data: any) => {
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
        AsyncStorage.default.setItem(key, JSON.stringify(data));
    });
};

const notifyGlobalStat = (ayahId: string, diff: number) => {
    import('../services/statsService').then(stats => {
        stats.updateGlobalFavCount(ayahId, diff);
    });
};

export const useUserStore = create<UserState>((set) => ({
    language: 'tr', // Default
    currentSurah: 1,
    currentAyah: 1,
    completedSurahs: [],
    favorites: {},
    collections: {},
    hideFavoriteDeleteWarning: false,

    userId: null,
    isAnonymous: false,
    displayName: null,
    email: null,

    setLanguage: (lang) => set({ language: lang }),
    setProgress: (surah, ayah) => set({ currentSurah: surah, currentAyah: ayah }),
    addCompletedSurah: (surah) => set((state) => {
        const list = state.completedSurahs || [];
        if (!list.includes(surah)) {
            return { completedSurahs: [...list, surah] };
        }
        return state;
    }),
    setCompletedSurahs: (surahs) => set({ completedSurahs: surahs }),
    setAuth: (userId, isAnonymous, displayName, email) => set({ userId, isAnonymous, displayName, email }),
    
    toggleFavorite: (id: string) => {
        set((state) => {
            const newFavs = { ...state.favorites };
            let removing = false;
            let globalDiff = 0;
            if (newFavs[id]) {
                delete newFavs[id];
                removing = true;
                globalDiff = -1;
            } else {
                newFavs[id] = Date.now();
                globalDiff = 1;
            }
            
            saveLocal('userFavorites', newFavs);
            saveFavoritesAndCollectionsToCloud(state.userId, newFavs);
            if (state.userId) { // Or universally, let Firebase handle it if not logged in (anonymous writes usually allowed if setup)
                notifyGlobalStat(id, globalDiff);
            }

            // If removing from global, also remove from all collections immediately
            if (removing) {
                const newCols = { ...state.collections };
                let  changedCols = false;
                Object.keys(newCols).forEach(colId => {
                    if (newCols[colId].ayahs[id]) {
                        delete newCols[colId].ayahs[id];
                        changedCols = true;
                    }
                });
                
                if (changedCols) {
                    saveLocal('userCollections', newCols);
                    saveFavoritesAndCollectionsToCloud(state.userId, newFavs, newCols);
                    return { favorites: newFavs, collections: newCols };
                }
            }

            return { favorites: newFavs };
        });
    },

    setFavorites: (favs) => set({ favorites: favs }),
    
    loadFavorites: async () => {
        try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            
            const storedFavs = await AsyncStorage.getItem('userFavorites');
            if (storedFavs) set({ favorites: JSON.parse(storedFavs) });
            
            const storedCols = await AsyncStorage.getItem('userCollections');
            if (storedCols) set({ collections: JSON.parse(storedCols) });

            const storedWarn = await AsyncStorage.getItem('hideFavWarning');
            if (storedWarn) set({ hideFavoriteDeleteWarning: storedWarn === 'true' });

        } catch (e) {
            console.error('Failed to load favorites/collections', e);
        }
    },

    setHideFavoriteDeleteWarning: (hide: boolean) => {
        set({ hideFavoriteDeleteWarning: hide });
        saveLocal('hideFavWarning', hide);
    },

    addCollection: (name: string) => {
        set((state) => {
            const id = 'col_' + Date.now().toString();
            const newCols = { ...state.collections, [id]: { id, name, ayahs: {} } };
            saveLocal('userCollections', newCols);
            saveFavoritesAndCollectionsToCloud(state.userId, state.favorites, newCols);
            return { collections: newCols };
        });
    },

    deleteCollection: (colId: string) => {
        set((state) => {
            const newCols = { ...state.collections };
            delete newCols[colId];
            saveLocal('userCollections', newCols);
            saveFavoritesAndCollectionsToCloud(state.userId, state.favorites, newCols);
            return { collections: newCols };
        });
    },

    addAyahToCollection: (ayahId: string, colId: string) => {
        set((state) => {
            const col = state.collections[colId];
            if (!col) return state;

            const newCols = {
                ...state.collections,
                [colId]: { ...col, ayahs: { ...col.ayahs, [ayahId]: Date.now() } }
            };

            // Also ensure it is in global favorites
            const newFavs = { ...state.favorites };
            let favsChanged = false;
            if (!newFavs[ayahId]) {
                newFavs[ayahId] = Date.now();
                favsChanged = true;
                saveLocal('userFavorites', newFavs);
            }

            saveLocal('userCollections', newCols);
            saveFavoritesAndCollectionsToCloud(state.userId, newFavs, newCols);

            if (favsChanged) {
                return { collections: newCols, favorites: newFavs };
            }
            return { collections: newCols };
        });
    },

    removeAyahFromCollection: (ayahId: string, colId: string) => {
        set((state) => {
            const col = state.collections[colId];
            if (!col || !col.ayahs[ayahId]) return state;

            const newColAyahs = { ...col.ayahs };
            delete newColAyahs[ayahId];

            const newCols = {
                ...state.collections,
                [colId]: { ...col, ayahs: newColAyahs }
            };

            saveLocal('userCollections', newCols);
            saveFavoritesAndCollectionsToCloud(state.userId, state.favorites, newCols);
            return { collections: newCols };
        });
    },

    removeFromAllCollections: (ayahId: string) => {
        set((state) => {
            const newCols = { ...state.collections };
            let changed = false;
            Object.keys(newCols).forEach(colId => {
                if (newCols[colId].ayahs[ayahId]) {
                    delete newCols[colId].ayahs[ayahId];
                    changed = true;
                }
            });

            // Remove from global favorites
            const newFavs = { ...state.favorites };
            let favsChanged = false;
            if (newFavs[ayahId]) {
                delete newFavs[ayahId];
                favsChanged = true;
                saveLocal('userFavorites', newFavs);
                if (state.userId) notifyGlobalStat(ayahId, -1);
            }

            if (changed) {
                saveLocal('userCollections', newCols);
                saveFavoritesAndCollectionsToCloud(state.userId, newFavs, newCols);
                return { collections: newCols, favorites: newFavs };
            }
            if (favsChanged) {
                saveFavoritesAndCollectionsToCloud(state.userId, newFavs);
                return { favorites: newFavs };
            }
            return state;
        });
    },

    setCollections: (cols) => set({ collections: cols })
}));
