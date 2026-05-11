# Kur'an-ı Kerim Diyor — Project Document

## Vision
Dini, dili, ülkesi fark etmeksizin tüm insanlığın Kur'an-ı Kerim'i kendi dilinde anlayabileceği,
topluluk yorumlarıyla zenginleşen, gönüllü tabanlı bir mobil uygulama.

---

## App Name (Multi-language)

| Language   | Name                    |
|------------|-------------------------|
| Türkçe     | Kur'an-ı Kerim Diyor    |
| English    | The Holy Quran Says     |
| العربية    | القرآن الكريم يقول      |
| Deutsch    | Der Heilige Koran Sagt  |
| Français   | Le Saint Coran Dit      |
| Español    | El Sagrado Corán Dice   |

> App name is shown automatically based on the user's device language.

---

## Tech Stack

### Mobile
- **React Native** with Expo
- **iOS + Android** simultaneously

### Backend (no custom server)
- **Firebase Firestore** — Comments, user data, progress
- **Firebase Authentication** — Google, Apple, email login
- **Firebase JS SDK** — Used via Expo (no native modules needed)
- **AsyncStorage** — Offline progress storage

### Icons
- **Lucide React Native** — No emojis, all icons from Lucide

### Quran Data
- Open-source Quran JSON (alquran.cloud API or local JSON)
- All surahs and ayahs embedded in the app (offline support)
- Multi-language translations in JSON format

### Audio Recitation
- **alquran.cloud** or **everyayah.com** API for streaming
- Download selected surahs for offline listening

---

## Design System

### Color Palette
- Skin tones, cream, warm beige base
- Calm, easy-on-the-eyes colors
- Dark mode support (warm tones even in dark version)

### UI Philosophy
- **TikTok / page-turn** metaphor — swipe up to go to next ayah
- Full-screen ayah experience
- Minimum buttons, maximum content
- Everything usable with one hand

---

## Screens & Features

### 1. Main Screen (Feed)
- User continues from where they left off
- Swipe up → next ayah
- Swipe down → previous ayah
- Each ayah shows:
  - Arabic text (large, beautiful font)
  - Translation in user's language
  - Surah name + ayah number
  - Comment count (tap to open)
  - Audio button (listen to recitation)
  - Like / Save button

### 2. Comment System
- Comment section per ayah (opens as bottom sheet)
- **Language filter:** defaults to device language — user can change in settings
- Access other languages via "Show all languages"
- Login required to write comments
- **Anonymity option:** "Hide my name" toggle when commenting
  - If hidden, shows as "Anonim" / "Anonymous" / "مجهول" across all languages
- Like comments

### 3. User Progress
- Read ayahs are automatically marked
- **Offline progress:** stored in AsyncStorage
- **On login:** offline progress synced to Firestore, no data lost
- App resumes from where the user left off on every open

### 4. Surah List
- All 114 surahs listed
- Visual indicator for read / unread
- Tap surah → go to first ayah

### 5. Audio Recitation
- Play button on every ayah
- Multiple reciter options
- Word-by-word highlight in Arabic text while playing
- Continues playing in the background

### 6. Search
- Search by surah name
- Search by keyword within ayah (in user's language)

### 7. Settings
- Language selection (UI language)
- Comment language filter
- Font size
- Theme (light / dark)
- Reciter selection (for audio)
- Notification preferences

### 8. Profile & Achievements
- Viewable without login (local data)
- Progress statistics
- Earned badges

---

## Achievement System (Badges)
> All icons from Lucide. No emojis.

| Badge           | Lucide Icon           | Description                              |
|-----------------|-----------------------|------------------------------------------|
| İlk Adım        | `BookOpen`            | Read the first ayah                      |
| İlk Sure        | `BookMarked`          | Complete an entire surah                 |
| Sesini Duyur    | `MessageSquare`       | Write your first comment                 |
| Beğeni Aldın    | `Heart`               | Your comment received its first like     |
| Popüler         | `TrendingUp`          | Your comment reached 10 likes            |
| Yarı Yol        | `GitCommitHorizontal` | Read half of the Quran                   |
| Hatim           | `Star`                | Read the entire Quran                    |
| Evrensel        | `Globe`               | Read comments in 5 different languages   |
| Sabırlı Okuyucu | `Clock`               | Read 7 days in a row                     |
| Çeyrek          | `Circle`              | Read one quarter of the Quran            |
| İlk Kayıt       | `UserCheck`           | Create an account                        |
| Paylaşımcı      | `Share2`              | First ayah share                         |
| Gece Okuyucu    | `Moon`                | Read between 00:00–05:00                 |
| Erken Kuş       | `Sunrise`             | Read between 05:00–07:00                 |
| Keşifçi         | `Compass`             | Open 10 different surahs                 |

> More achievements will be added in future versions.

### Hatim Celebration
When all surahs are completed:
- Confetti animation (built with Lucide icons)
- "Tebrikler, Hatim Ettin!" message (in user's language)
- Hatim badge awarded
- Share option

---

## Firebase Data Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── displayName: string
│       ├── language: string
│       ├── isAnonymous: boolean
│       ├── createdAt: timestamp
│       ├── progress/
│       │   ├── lastSurah: number
│       │   ├── lastAyah: number
│       │   ├── readAyahs: array
│       │   └── completedSurahs: array
│       └── achievements/
│           └── {achievementId}: timestamp
│
├── comments/
│   └── {surahNo}_{ayahNo}/
│       └── {commentId}/
│           ├── userId: string
│           ├── text: string
│           ├── language: string
│           ├── isAnonymous: boolean
│           ├── likes: number
│           ├── createdAt: timestamp
│           └── likedBy: array
│
└── ayahStats/
    └── {surahNo}_{ayahNo}/
        ├── totalComments: number
        └── totalLikes: number
```

---

## Quran Data Structure (Local JSON)

```json
{
  "surah": 1,
  "name": {
    "ar": "الفاتحة",
    "tr": "Fatiha",
    "en": "Al-Fatiha"
  },
  "ayahs": [
    {
      "number": 1,
      "arabic": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
      "translations": {
        "tr": "Rahman ve Rahim olan Allah'ın adıyla.",
        "en": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "de": "Im Namen Allahs, des Allerbarmers, des Barmherzigen.",
        "fr": "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
        "es": "En el nombre de Dios, el Compasivo, el Misericordioso."
      }
    }
  ]
}
```

---

## Offline + Online Sync Logic

```
User is offline:
  → Progress saved to AsyncStorage
  → Comments not viewable (internet required)
  → Ayah reading works fully offline

User logs in / internet returns:
  → AsyncStorage progress merged to Firestore
  → If Firestore progress is ahead, that is kept
  → No data is ever lost
```

---

## Project Folder Structure

```
kuran-kerim-diyor/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx           # Main feed (ayah swipe)
│   │   ├── surahs.tsx          # Surah list
│   │   ├── search.tsx          # Search
│   │   └── profile.tsx         # Profile & achievements
│   └── _layout.tsx
├── components/
│   ├── AyahCard.tsx            # Full-screen ayah card
│   ├── CommentSheet.tsx        # Comment bottom sheet
│   ├── AudioPlayer.tsx         # Audio recitation
│   ├── AchievementCard.tsx     # Badge card
│   └── HatimCelebration.tsx    # Hatim celebration screen
├── hooks/
│   ├── useProgress.ts          # Progress management
│   ├── useAchievements.ts      # Achievement checks
│   └── useComments.ts          # Comment operations
├── services/
│   ├── firebase.ts             # Firebase config
│   ├── quranData.ts            # Quran data service
│   └── syncService.ts          # Offline-online sync
├── store/
│   └── userStore.ts            # Zustand global state
├── constants/
│   ├── colors.ts               # Color palette
│   ├── achievements.ts         # All achievement definitions
│   └── languages.ts            # Supported languages
└── assets/
    └── quran/
        └── data.json           # Full Quran data (offline)
```

---

## Development Phases

### Phase 1 — MVP
- Expo project setup
- Quran JSON data integration
- Ayah swipe UI (full screen)
- Multi-language translation display
- Offline progress (AsyncStorage)
- Surah list

### Phase 2 — Community
- Firebase setup
- User authentication (Google + Apple + email)
- Comment system
- Anonymity option
- Language-based comment filter
- Online progress sync

### Phase 3 — Audio & Achievements
- Audio recitation integration
- Achievement system
- Hatim celebration screen
- Notifications

### Phase 4 — Polish
- Animations
- Dark mode
- Performance optimization
- App Store & Play Store release
