# Kur'an-ı Kerim Diyor — Task List

## Phase 1 — MVP

### Setup
- [ ] `npx create-expo-app kuran-kerim-diyor --template blank-typescript` ile proje oluştur
- [ ] Expo Router kur (`expo-router`, `react-native-safe-area-context`, `react-native-screens`)
- [ ] Lucide React Native kur
- [ ] Zustand kur
- [ ] AsyncStorage kur
- [ ] Klasör yapısını oluştur (`app/`, `components/`, `hooks/`, `services/`, `store/`, `constants/`, `assets/`)
- [ ] `constants/colors.ts` — renk paletini tanımla (krem, bej, sıcak tonlar)
- [ ] `constants/languages.ts` — desteklenen dilleri tanımla

### Quran Data
- [ ] Açık kaynak Quran JSON verisini bul ve indir (alquran.cloud veya benzeri)
- [ ] Tüm 114 sure + tüm çevirileri (tr, en, de, fr, es) tek JSON'a derle
- [ ] `assets/quran/data.json` olarak yerleştir
- [ ] `services/quranData.ts` — sure ve ayet okuma fonksiyonlarını yaz
- [ ] Arapça metin için uygun font bul ve entegre et (örn. Amiri, Noto Naskh Arabic)

### Core UI
- [ ] `app/_layout.tsx` — Expo Router tab yapısını kur
- [ ] `app/(tabs)/index.tsx` — Ana feed ekranı (dikey swipe)
- [ ] `components/AyahCard.tsx` — Tam ekran ayet kartı (Arapça + çeviri + sure/ayet no)
- [ ] Yukarı/aşağı swipe ile ayet geçişi (FlatList ya da Pager)
- [ ] Cihaz dilini algıla, doğru çeviriyi göster
- [ ] Sure adı ve ayet numarası gösterimi
- [ ] `app/(tabs)/surahs.tsx` — Sure listesi ekranı (114 sure, tıklanınca feed'e git)

### Offline Progress
- [ ] `hooks/useProgress.ts` — ilerleme okuma/yazma hook'u
- [ ] Her ayet görüntülendiğinde AsyncStorage'a kaydet
- [ ] Uygulama açılışında son kaldığı ayetten başlat
- [ ] Tamamlanan sureler listesini AsyncStorage'da tut

---

## Phase 2 — Community

### Firebase Setup
> Detaylar için `firebase.md` dosyasına bak.

- [ ] Firebase projesi oluştur (Firebase Console)
- [ ] iOS ve Android uygulamalarını Firebase'e ekle
- [ ] `google-services.json` ve `GoogleService-Info.plist` dosyalarını projeye ekle
- [ ] Firebase JS SDK kur (`firebase` paketi)
- [ ] `services/firebase.ts` — Firebase config ve init
- [ ] Firestore'u etkinleştir
- [ ] Firebase Authentication'ı etkinleştir (Google, Apple, Email)
- [ ] Firestore güvenlik kurallarını yaz

### Authentication
- [ ] Google ile giriş
- [ ] Apple ile giriş (iOS için zorunlu)
- [ ] E-posta ile giriş
- [ ] `store/userStore.ts` — Zustand ile kullanıcı state'i
- [ ] Giriş yapmadan da uygulamayı kullanabilme (misafir modu)
- [ ] Giriş ekranı / modal

### Online Progress Sync
- [ ] `services/syncService.ts` — AsyncStorage → Firestore sync mantığı
- [ ] Giriş yapınca offline ilerlemeyi Firestore'a merge et
- [ ] Firestore daha ilerideyse onu koru

### Comment System
- [ ] `hooks/useComments.ts` — yorum yükleme/yazma/beğenme
- [ ] `components/CommentSheet.tsx` — bottom sheet yorum paneli
- [ ] Her ayete yorum listesi (dil filtreli)
- [ ] Yorum yazma (giriş gerekli)
- [ ] Anonimlik toggle'ı
- [ ] Yorumu beğenme
- [ ] "Tüm dilleri göster" seçeneği
- [ ] `ayahStats` Firestore koleksiyonunu güncelle (yorum/beğeni sayısı)

---

## Phase 3 — Audio & Achievements

### Audio Recitation
- [ ] `components/AudioPlayer.tsx` — ses oynatıcı
- [ ] alquran.cloud veya everyayah.com API entegrasyonu
- [ ] Her ayette play butonu
- [ ] Birden fazla okuyucu seçeneği
- [ ] Arka planda çalışmaya devam etme
- [ ] Kelime kelime Arapça metin takibi (opsiyonel, zor)

### Achievement System
- [ ] `constants/achievements.ts` — tüm rozet tanımları
- [ ] `hooks/useAchievements.ts` — rozet kontrol mantığı
- [ ] `components/AchievementCard.tsx` — rozet kartı
- [ ] `app/(tabs)/profile.tsx` — profil & rozetler ekranı
- [ ] Her rozet için tetikleyici koşulları yaz
- [ ] Rozet kazanınca bildirim / animasyon
- [ ] `components/HatimCelebration.tsx` — hatim kutlama ekranı (konfeti)

### Notifications
- [ ] Expo Notifications kurulumu
- [ ] Günlük okuma hatırlatıcısı
- [ ] Rozet kazanma bildirimi

---

## Phase 4 — Polish

### UX & Animations
- [ ] Ayet geçiş animasyonları (smooth swipe)
- [ ] Rozet kazanma animasyonu
- [ ] Loading skeleton'ları
- [ ] Haptic feedback (dokunma geri bildirimi)

### Dark Mode
- [ ] `constants/colors.ts` — dark mode renk tanımları
- [ ] Tüm ekranlara dark mode desteği ekle
- [ ] Sistem temasına göre otomatik geçiş

### Search
- [ ] `app/(tabs)/search.tsx` — arama ekranı
- [ ] Sure adıyla arama
- [ ] Kendi dilinde ayet içi kelime arama

### Settings
- [ ] `app/settings.tsx` — ayarlar ekranı
- [ ] Dil seçimi
- [ ] Yorum dil filtresi
- [ ] Font boyutu
- [ ] Tema seçimi
- [ ] Okuyucu seçimi
- [ ] Bildirim tercihleri

### Performance
- [ ] Büyük liste performansı (FlashList veya optimize FlatList)
- [ ] JSON veri yükleme optimizasyonu
- [ ] Firebase okuma sayısını minimize et

### Release
- [ ] App Store için gerekli görseller ve açıklamalar
- [ ] Play Store için gerekli görseller ve açıklamalar
- [ ] Expo EAS Build kurulumu
- [ ] iOS build & submit
- [ ] Android build & submit
