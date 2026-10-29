# ZY-11 · Zeynep Gerçekten Kim?

Mantar panoya iğnelenmiş dosyalar temalı, 11 bölümlük küçük bir dedektif oyunu.

- `index.html` – dosya panosu, kod defteri, kilit açma
- `vaka1.html` … `vaka10.html` – her vakada kanıtlar + bir mini oyun (1-3 ⭐) + kod
- `vaka11.html` – final: 10 kodluk ana şifre → son sorgu → büyük açıklama ve mektup
- `vaka12.html` – gizli dosya: ilk 10 vakadan 30 yıldızın hepsiyle açılır
- `assets/style.css`, `assets/zy11.js`, `assets/fonts/` – ortak tasarım, oyun motoru ve gömülü fontlar
- `android/` – APK kaynağı ve derleme betiği

Son mektubu değiştirmek için `vaka11.html` içindeki `LETTER` ve `SIGN` metinlerini düzenle.
İlerleme tarayıcıda (localStorage) saklanır; ana sayfanın altındaki "ilerlemeyi sıfırla" ile baştan başlanır.

## Android uygulaması (APK)

Hazır APK: `apk/ZeynepKim.apk` — telefona indirip kur ("bilinmeyen kaynaklara izin ver" gerekebilir).
Oyun internetsiz çalışır; fontlar ve tüm dosyalar uygulamanın içinde.

Yeniden derlemek için (Ubuntu/Debian):

```bash
sudo apt install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23 default-jdk
bash android/build-apk.sh
```

`android/zy11.keystore` (şifre `zy11zy11`) aynı imzayla güncelleme kurabilmek için repoda tutuluyor.
