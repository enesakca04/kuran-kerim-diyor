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
    // Arapca kullanicilar icin ceviri ayarlari
    showArabicTranslation: boolean;
    arabicTranslationLang: AppLanguage;

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
    setShowArabicTranslation: (show: boolean) => void;
    setArabicTranslationLang: (lang: AppLanguage) => void;
    addCollection: (name: string) => void;
    deleteCollection: (colId: string) => void;
    addAyahToCollection: (ayahId: string, colId: string) => void;
    removeAyahFromCollection: (ayahId: string, colId: string) => void;
    removeFromAllCollections: (ayahId: string) => void; // Called when removed from general favs
    setCollections: (cols: Record<string, Collection>) => void;
}

const saveLocal = (key: string, data: any) => {
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
        AsyncStorage.default.setItem(key, JSON.stringify(data));
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
    showArabicTranslation: false,
    arabicTranslationLang: 'en',

    userId: null,
    isAnonymous: false,
    displayName: null,
    email: null,

    setLanguage: (lang) => {
        set({ language: lang });
        // i18n ve AsyncStorage'i de senkronize et
        import('../services/i18n').then(({ default: i18n, applyRTL }) => {
            i18n.changeLanguage(lang);
            applyRTL(lang);
        });
        import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
            AsyncStorage.setItem('@app_language', lang);
        });
    },
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
            
            if (newFavs[id]) {
                delete newFavs[id];
                removing = true;
            } else {
                newFavs[id] = Date.now();
            }
            
            saveLocal('userFavorites', newFavs);
            
            // API CALL
            import('../services/apiClient').then(apiClient => {
                if (removing) {
                    apiClient.default.delete(`/favorites/${id}`).catch(() => {});
                } else {
                    const [surah, ayah] = id.split('_');
                    apiClient.default.post('/favorites', {
                        ayahId: id,
                        surahNumber: parseInt(surah),
                        ayahNumber: parseInt(ayah)
                    }).catch(() => {});
                }
            });

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

            const storedArabicTranslation = await AsyncStorage.getItem('@arabic_show_translation');
            if (storedArabicTranslation !== null) set({ showArabicTranslation: storedArabicTranslation === 'true' });

            const storedArabicLang = await AsyncStorage.getItem('@arabic_translation_lang');
            if (storedArabicLang) set({ arabicTranslationLang: storedArabicLang as AppLanguage });

        } catch (e) {
            console.error('Failed to load favorites/collections', e);
        }
    },

    setHideFavoriteDeleteWarning: (hide: boolean) => {
        set({ hideFavoriteDeleteWarning: hide });
        saveLocal('hideFavWarning', hide);
    },

    setShowArabicTranslation: (show: boolean) => {
        set({ showArabicTranslation: show });
        import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
            AsyncStorage.setItem('@arabic_show_translation', show ? 'true' : 'false');
        });
    },

    setArabicTranslationLang: (lang: AppLanguage) => {
        set({ arabicTranslationLang: lang });
        import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
            AsyncStorage.setItem('@arabic_translation_lang', lang);
        });
    },

    addCollection: (name: string) => {
        set((state) => {
            const id = 'col_' + Date.now().toString(); // Temporary local ID
            const newCols = { ...state.collections, [id]: { id, name, ayahs: {} } };
            saveLocal('userCollections', newCols);
            
            // API CALL
            import('../services/apiClient').then(apiClient => {
                apiClient.default.post('/collections', { name }).catch(() => {});
                // Note: The real ID from backend should replace the local ID, 
                // but for a smooth UI, we keep local ID for now. 
                // In a robust implementation, we'd fetch collections on app load to sync IDs.
            });
            
            return { collections: newCols };
        });
    },

    deleteCollection: (colId: string) => {
        set((state) => {
            const newCols = { ...state.collections };
            delete newCols[colId];
            saveLocal('userCollections', newCols);
            
            // API CALL
            import('../services/apiClient').then(apiClient => {
                // Assuming colId is the database integer ID. If it's the 'col_' string, 
                // we'd need to map it. For simplicity, if we sync properly, it will be the real ID.
                apiClient.default.delete(`/collections/${colId}`).catch(() => {});
            });

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
                
                // Add to global favorites API
                import('../services/apiClient').then(apiClient => {
                    const [surah, ayah] = ayahId.split('_');
                    apiClient.default.post('/favorites', {
                        ayahId, surahNumber: parseInt(surah), ayahNumber: parseInt(ayah)
                    }).catch(() => {});
                });
            }

            saveLocal('userCollections', newCols);
            
            // API CALL
            import('../services/apiClient').then(apiClient => {
                // To do this, we need the favorite ID from the backend.
                // For a fully synced app, we would fetch the list of favorites and their IDs.
                // This will be handled during the sync/fetch flow in the future.
            });

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
            
            // API CALL
            import('../services/apiClient').then(apiClient => {
                // Again, requires favoriteId. Will be implemented fully when data structures are fully mapped.
            });
            
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
            }

            if (changed) {
                saveLocal('userCollections', newCols);
                return { collections: newCols, favorites: newFavs };
            }
            if (favsChanged) {
                return { favorites: newFavs };
            }
            return state;
        });
    },

    setCollections: (cols) => set({ collections: cols })
}));
