# UAS Mobile Programming 2026

Aplikasi mobile untuk Ujian Akhir Semester Mobile Programming dengan fitur:
- Firebase Authentication (Login & Register)
- CRUD Firestore (Catatan/Notes)
- Cek Cuaca Real-time (OpenWeather API)
- Analisis Cuaca Regional Jawa Barat

## Struktur Proyek

```
uas-mobile-app/
├── App.js                      # Entry point aplikasi
├── app.json                    # Konfigurasi Expo
├── package.json                # Dependencies
├── babel.config.js             # Babel configuration
├── assets/                     # Gambar dan ikon
└── src/
    ├── config/
    │   └── firebase.js         # Konfigurasi Firebase & API
    ├── services/
    │   ├── authService.js      # Service Autentikasi
    │   ├── firestoreService.js # Service CRUD Firestore
    │   └── weatherService.js   # Service API Cuaca
    ├── screens/
    │   ├── LoginScreen.js      # Halaman Login
    │   ├── RegisterScreen.js   # Halaman Register
    │   ├── HomeScreen.js       # Halaman Beranda
    │   ├── NotesScreen.js      # Halaman Catatan (CRUD)
    │   └── WeatherScreen.js    # Halaman Cuaca
    ├── navigation/
    │   └── AppNavigator.js     # Navigasi aplikasi
    └── components/             # Komponen reusable (jika ada)
```

## Setup dan Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Firebase

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Buat project baru
3. Tambahkan aplikasi Android/iOS
4. Aktifkan **Authentication** (Email/Password)
5. Aktifkan **Firestore Database**
6. Copy config Firebase ke `src/config/firebase.js`

### 3. Konfigurasi Weather API

1. Daftar di [OpenWeatherMap](https://openweathermap.org/api)
2. Dapatkan API Key gratis
3. Copy API Key ke `src/config/firebase.js`

### 4. Jalankan Aplikasi

```bash
# Jalankan dengan Expo
npx expo start

# Jalankan di Android
npx expo start --android

# Jalankan di iOS
npx expo start --ios
```

## Fitur

### 1. Authentication 
- Login dengan email dan password
- Register akun baru
- Logout
- Validasi input
- Error handling
- Loading indicator
- UX yang baik

### 2. CRUD Firestore 
- Create: Tambah catatan baru
- Read: Tampilkan daftar catatan
- Update: Edit catatan
- Delete: Hapus catatan
- Real-time notification (snapshot listener)
- Struktur data rapi dengan timestamp
- Error handling

### 3. API Cuaca Real-time 
- API berjalan real-time
- Cari cuaca berdasarkan kota
- UI informatif dengan icon cuaca
- Informasi: suhu, kelembaban, tekanan, angin, visibilitas
- Informasi matahari terbit dan terbenam
- Quick cities (Jakarta, Surabaya, Bandung, Yogyakarta, Bali)

### 4. UI/UX Mobile 
-  Navigasi jelas dan konsisten
-  Desain modern dan menarik
-  Smooth UX dengan loading indicator
-  Bottom tab navigation
-  Empty state untuk daftar kosong
-  Confirmation dialog untuk delete/logout

## Library yang Digunakan

- `expo` ~50.0.0
- `@react-navigation/native` ^6.1.9
- `@react-navigation/native-stack` ^6.9.17
- `@react-navigation/bottom-tabs` ^6.5.11
- `firebase` ^10.7.0
- `axios` ^1.6.0
- `@expo/vector-icons` ^14.0.0

## Cara Penggunaan

1. **Login/Register**: Buka aplikasi, login atau buat akun baru
2. **Home**: Dashboard dengan akses ke semua fitur
3. **Catatan**: 
   - Tekan tombol + untuk tambah catatan
   - Tap catatan untuk edit
   - Swipe atau tekan ikon trash untuk hapus
4. **Cuaca**:
   - Masukkan nama kota dan tekan Cari
   - Atau pilih kota populer di bawah
   - Lihat detail cuaca lengkap

## Build APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login ke Expo
eas login

# Configure build
eas build:configure

# Build APK untuk Android
eas build -p android --profile preview

# Build AAB untuk Play Store
eas build -p android --profile production
```