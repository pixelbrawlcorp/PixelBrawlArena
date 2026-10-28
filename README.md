# Pixel Brawl Arena - Online (Claude olmadan)

## Nasıl çalışıyor
- Oyun zaten "host belirleyici" mimaride: **host** dövüşü simüle eder ve ~30 kez/sn durum gönderir, **misafir** sadece tuş girdisi gönderir.
- Claude'un hazır "room" servisi yerine küçük bir **WebSocket aktarma sunucusu** (`server.js`) iki oyuncu arasında bu mesajları iletir. Oyun kuralları sunucuda yok, sadece mesaj taşır.
- Claude içinde açılırsa oyun eskisi gibi Claude'un room servisini kullanır. Dışarıda açılırsa otomatik olarak bu sunucuya bağlanır.
- Trafik çok düşük: host ~8 KB/sn, misafir daha az.

## Yerelde deneme
```
npm install
node server.js          # http://localhost:8080
```
İki tarayıcı sekmesinde `http://localhost:8080` aç. Birinde ONLINE CREATE ROOM, diğerinde ONLINE JOIN ROOM + kod.

## Yayınlama (A: tek parça, önerilen)
`server.js`, `package.json` ve `index.html` (oyun) aynı klasörde. Render / Railway / Fly.io / herhangi bir VPS üzerinde **Node web servisi** olarak çalıştır:
- Build: `npm install`   Start: `node server.js`
- Platform PORT'u kendisi verir, kod bunu okur.
- Çıkan adres (https://...) hem oyunu hem online'ı sunar. Başka ayar gerekmez.

## Yayınlama (B: oyun başka yerde)
Oyun itch.io / GitHub Pages gibi statik bir yerdeyse relay'i ayrı yayınla, sonra `index.html` içinde şunu doldur:
```
const PBA_SERVER='wss://senin-relay-adresin.example.com';
```
Ve relay'de `ALLOWED_ORIGINS=https://senin-oyun-adresin` ayarla (başka siteler bağlanamasın). Geçici test için adrese `?server=wss://...` eklemek de yeter.

## Bilinmesi gerekenler
- Ücretsiz planlarda sunucu boşta uyuyabilir; ilk bağlantı 30-60 sn sürebilir. Oyun 12 sn sonra "CANNOT REACH SERVER" der.
- Gecikme, sunucunun oyunculara uzaklığına bağlı. Oyuncuların çoğuna yakın bir bölge seç.
- Host belirleyici olduğu için host hile yapabilir (arkadaş maçı için sorun değil, sıralamalı/ödüllü mod için uygun değil).
- Oda kodu 4 haneli. Aynı kodu üreten iki host olursa sunucu ikincisini reddeder, oyun otomatik yeni kod üretir.
- Bağlantı koparsa karşı tarafa "OPPONENT LEFT" / "CONNECTION LOST" gösterilir ve menüye dönülür.
