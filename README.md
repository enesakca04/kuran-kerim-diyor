<div align="center">
  <img src="assets/images/icon.png" width="120" alt="Logo">
  <h1>Kur'an-ı Kerim Diyor</h1>
  <p><b>Modern, Akıcı ve Topluluk Odaklı Bir Kutsal Kitap Deneyimi</b></p>
  
  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
</div>

---

## 📖 Proje Hakkında
**Kur'an-ı Kerim Diyor**, klasik ve karmaşık Kur'an uygulamalarının aksine, modern kullanıcılara hitap eden sosyal medya sadeliğinde (dikey kaydırmalı / *swipe feed*) bir okuma deneyimi sunar. Kar amacı gütmeyen, tamamen açık kaynaklı ve reklamsız bir topluluk projesidir.

### ✨ Temel Özellikler
* **Dikey Okuma Akışı (Swipe Feed):** Ayetleri cihaz ekran boyutuna uyumlu, pürüzsüz kaydırma animasyonlarıyla alt alta okuma rahatlığı.
* **Hızlı Sarma (Scrubbing):** Sağdaki ilerleme çubuğuna basılı tutarak tepkisel animasyonlar eşliğinde yüzlerce ayet içerisinde anında gezinme.
* **Sesli Dinleme:** Dünyaca ünlü hafızlardan her bir ayeti anında yüksek kaliteli olarak dinleme. 
* **Topluluk ve Yorumlar:** Seçtiğiniz dildeki (TR/EN/AR) diğer okurların ayet hakkındaki tefekkürlerini isimsiz (anonim) şekilde okuyun ve kendi hislerinizi ekleyin.
* **Oyunlaştırma (Gamification) ve Başarımlar:** Okudukça rozetler (İlk Sure, Hatim vs.) kazanın, ana ekranda konfetilerle (Hatim Celebration) kutlayın! 
* **Bulut Senkronizasyonu:** Firebase altyapısı ile okuma yüzdeniz (çevrimdışı da olsanız) tüm cihazlarınızla güvende ve senkronize.
* **Gelişmiş Arama:** Türkçe veya Arapça dillerinde akıllı sure ve kelime arama.
* **Karanlık Mod (Dark Mode):** Telefonunuzun sistemiyle %100 uyumlu göz yormayan özel renk paleti.

---

## 🛠 Kullanılan Teknolojiler

Projemiz en güncel mobil uygulama pratikleri ile kodlanmıştır:

- **Frontend:** React Native, Expo Router (SDK 54)
- **State Management:** Zustand
- **Backend & Database:** Firebase Auth, Firestore
- **Lokal Depolama:** AsyncStorage
- **İkonlar ve UI:** Lucide React Native, PanResponder, Animated API
- **Veri Kaynağı:** Alquran.cloud API

---

## 🚀 Geliştirici Ortamı Kurulumu (Local Development)

Projeyi kendi bilgisayarınızda derlemek veya geliştirmek (Open Source Contribution) için aşağıdaki adımları izleyebilirsiniz. 

### 1️⃣ Ön Gereksinimler
- Bilgisayarınızda `Node.js` (v18+) ve `git` kurulu olmalıdır.
- Telefonunuzda `Expo Go` uygulaması veya bilgisayarınızda iOS/Android Emülatör bulunmalıdır.

### 2️⃣ Depoyu Klonlama ve Yükleme
Masaüstü veya çalışma dizinini açıp komut satırına şunları yazın:
```bash
git clone https://github.com/kullanici-adiniz/kuran-kerim-diyor.git
cd kuran-kerim-diyor
```
Bağımlılık paketlerini yükleyin:
```bash
npm install
```

### 3️⃣ Çevresel Değişkenler (Firebase Setup)
Bu proje kullanıcı verilerini, yorumları ve başarımları tutmak için Google Firebase kullanır.
1. Proje kök dizinindeki şablon dosyasını kopyalayarak bir `.env` dosyası oluşturun:
   ```bash
   cp .env.example .env
   ```
2. Oluşturduğunuz `.env` dosyasının içini standart bir Firebase Console'dan (Proje Ayarları) aldığınız anahtarlarla değiştirin. *(Lütfen `google-services.json` gibi şifre içeren doyalarınızı repoya göndermeyin).*

### 4️⃣ Uygulamayı Çalıştırma
```bash
npx expo start --clear
```
- Tarayıcıda veya konsolda açılan karekodu QR kod telefonunuzun **Expo Go** uygulamasına veya **iOS Kamera'sına** okutarak anında canlı test edebilirsiniz.
- `i` tuşuna basarak iOS Simulator'da (Mac), `a` tuşuna basarak Android Emulator'de başlatabilirsiniz.

---

## 🤝 Katkıda Bulunma (Contributing)
Açık kaynak kültürüne inanıyoruz! Yeni bir özellik eklemek ("Feature") veya hata ("Bug") düzeltmek isterseniz her zaman bir **Pull Request (PR)** açabilirsiniz.
1. Depoyu `Fork` edin.
2. Üzerinde çalışacağınız yeni bir dal (branch) açın: `git checkout -b feature/harika-ozellik`
3. Değişikliklerinizi commit yapın: `git commit -m "Projeye x özelliği eklendi"`
4. Fork'unuza (Github hesabınıza) gönderin: `git push origin feature/harika-ozellik`
5. Buraya gelip **Pull Request** açın!

---

## 📄 Lisans
Bu yazılım ve tüm kaynak kodları **[MIT Lisansı](LICENSE)** ile dağıtılmaktadır. Her türlü kişisel (kâr amacı olmaksızın) ve geliştirme odaklı kullanım serbesttir. Detaylar için lisans dosyasına göz atabilirsiniz.
