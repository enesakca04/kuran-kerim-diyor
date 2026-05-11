# Firebase Setup — Kur'an-ı Kerim Diyor

## Kullanılacak Firebase Servisleri
- **Firestore** — Yorumlar, kullanıcı verileri, ilerleme
- **Authentication** — Google, Apple, e-posta girişi

---

## Adım 1 — Firebase Projesi Oluştur

1. [Firebase Console](https://console.firebase.google.com) aç
2. **"Add project"** → proje adı: `kuran-kerim-diyor`
3. Google Analytics: kapatabilirsin (şimdilik gereksiz)
4. **"Create project"** tıkla

---

## Adım 2 — iOS ve Android Uygulamaları Ekle

### Android
1. Project Overview → **"Add app"** → Android ikonu
2. Android package name: `com.kurankerimdiyor` (Expo'da `app.json`'dan alınır)
3. **"Register app"** → `google-services.json` indir
4. Dosyayı projeye ekle: `android/app/google-services.json`
   > Expo managed workflow'da `app.json`'a eklemen yeterli olabilir — aşağıya bak.

### iOS
1. Project Overview → **"Add app"** → iOS ikonu
2. iOS bundle ID: `com.kurankerimdiyor` (Expo'da `app.json`'dan alınır)
3. **"Register app"** → `GoogleService-Info.plist` indir
4. Dosyayı projeye ekle: `ios/GoogleService-Info.plist`

### Expo ile Kullanım (JS SDK — native modül yok)
Expo managed workflow'da `react-native-firebase` yerine **Firebase JS SDK** kullanıyoruz.
Bu sayede `google-services.json` ve `plist` dosyasına ihtiyaç duymuyoruz.
Sadece Firebase Console'dan **config objesi** alman yeterli.

```
Project Settings → General → Your apps → Config (seçeneği seç) → kopyala
```

Config şöyle görünür:
```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

---

## Adım 3 — Firebase JS SDK Kur

```bash
npm install firebase
```

---

## Adım 4 — `services/firebase.ts` Dosyasını Yaz

```ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "BURAYA_YAZ",
  authDomain: "BURAYA_YAZ",
  projectId: "BURAYA_YAZ",
  storageBucket: "BURAYA_YAZ",
  messagingSenderId: "BURAYA_YAZ",
  appId: "BURAYA_YAZ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
```

> Config değerlerini `.env` dosyasına taşı, asla commit etme.

---

## Adım 5 — Authentication Aktif Et

Firebase Console → **Authentication** → **Sign-in method**:

| Provider | Durum | Not |
|----------|-------|-----|
| Email/Password | Etkinleştir | |
| Google | Etkinleştir | SHA-1 fingerprint gerekebilir (Android) |
| Apple | Etkinleştir | iOS App Store için zorunlu |

### Expo ile Google Auth
```bash
npm install expo-auth-session expo-crypto
```

### Expo ile Apple Auth
```bash
npx expo install expo-apple-authentication
```

---

## Adım 6 — Firestore Aktif Et

Firebase Console → **Firestore Database** → **Create database**
- Production mode seç (güvenlik kuralları açık)
- Region: `europe-west1` (Türkiye'ye en yakın)

---

## Adım 7 — Güvenlik Kuralları

Firebase Console → Firestore → **Rules** sekmesi → şunu yapıştır:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Kullanıcılar sadece kendi verilerine erişebilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Yorumları herkes okuyabilir, sadece giriş yapmış yazabilir
    match /comments/{ayahId}/comments/{commentId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.userId ||
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['likes', 'likedBy']));
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }

    // Ayet istatistiklerini herkes okuyabilir
    match /ayahStats/{ayahId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Adım 8 — Firestore Index'ler

Yorumları dile göre + tarihe göre sıralayacağız. İndex gerekiyor:

Firebase Console → Firestore → **Indexes** → **Add index**:

| Collection | Field 1 | Field 2 | Order |
|------------|---------|---------|-------|
| `comments/{ayahId}/comments` | `language` (Ascending) | `createdAt` (Descending) | — |

> Alternatif: uygulamayı çalıştırınca Firebase konsol hatasında otomatik index oluşturma linki verir, ona tıklaman yeterli.

---

## Adım 9 — Ortam Değişkenleri (.env)

Proje kökünde `.env` dosyası oluştur:

```
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

`services/firebase.ts` içinde şöyle kullan:

```ts
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

`.gitignore`'a ekle:
```
.env
.env.local
```

---

## Özet — Yapılacaklar Listesi

- [ ] Firebase projesi oluştur
- [ ] iOS ve Android uygulamalarını ekle (ya da sadece config al)
- [ ] `npm install firebase` çalıştır
- [ ] `services/firebase.ts` dosyasını yaz
- [ ] `.env` dosyasını oluştur, config'i oraya taşı
- [ ] Authentication'ı etkinleştir (Email, Google, Apple)
- [ ] Firestore'u etkinleştir (europe-west1)
- [ ] Güvenlik kurallarını yapıştır
- [ ] Firestore index'ini oluştur
- [ ] `.gitignore`'a `.env` ekle
