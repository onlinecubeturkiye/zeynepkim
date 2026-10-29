#!/usr/bin/env bash
# ZY-11 APK derleyici.
# Gerekenler (Ubuntu/Debian): sudo apt install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23 default-jdk
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$HERE")"
BUILD="$HERE/build"
ANDROID_JAR="${ANDROID_JAR:-/usr/lib/android-sdk/platforms/android-23/android.jar}"
DX="${DX:-/usr/lib/android-sdk/build-tools/debian/dx}"
KEYSTORE="${KEYSTORE:-$HERE/zy11.keystore}"
KS_PASS="${KS_PASS:-zy11zy11}"
OUT="${OUT:-$ROOT/apk/ZeynepKim.apk}"

rm -rf "$BUILD"
mkdir -p "$BUILD/www" "$BUILD/gen" "$BUILD/classes" "$(dirname "$OUT")"

echo "• Oyun dosyaları kopyalanıyor"
cp "$ROOT"/index.html "$ROOT"/vaka*.html "$BUILD/www/"
cp -r "$ROOT/assets" "$BUILD/www/assets"
mkdir -p "$BUILD/apkassets" && mv "$BUILD/www" "$BUILD/apkassets/www"

echo "• Kaynaklar paketleniyor (aapt)"
aapt package -f -m -0 arsc \
  -M "$HERE/AndroidManifest.xml" -S "$HERE/res" -I "$ANDROID_JAR" \
  -J "$BUILD/gen" -A "$BUILD/apkassets" -F "$BUILD/app.unsigned.apk"

echo "• Java derleniyor"
javac -nowarn -Xlint:-options -source 8 -target 8 -encoding UTF-8 \
  -bootclasspath "$ANDROID_JAR" -d "$BUILD/classes" \
  "$BUILD"/gen/com/zeynepkim/zy11/R.java "$HERE"/src/com/zeynepkim/zy11/*.java

echo "• DEX oluşturuluyor"
"$DX" --dex --min-sdk-version=21 --output="$BUILD/classes.dex" "$BUILD/classes"
(cd "$BUILD" && aapt add -f app.unsigned.apk classes.dex >/dev/null)

echo "• Hizalanıyor ve imzalanıyor"
if [ ! -f "$KEYSTORE" ]; then
  keytool -genkeypair -v -keystore "$KEYSTORE" -alias zy11 -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass "$KS_PASS" -keypass "$KS_PASS" -dname "CN=ZY-11, O=Zeynep Kim, C=TR" >/dev/null 2>&1
fi
zipalign -f -p 4 "$BUILD/app.unsigned.apk" "$BUILD/app.aligned.apk"
apksigner sign --ks "$KEYSTORE" --ks-key-alias zy11 --ks-pass "pass:$KS_PASS" --key-pass "pass:$KS_PASS" \
  --out "$OUT" "$BUILD/app.aligned.apk"
apksigner verify "$OUT"
rm -f "$OUT.idsig"
echo "✓ APK hazır: $OUT ($(du -h "$OUT" | cut -f1))"
