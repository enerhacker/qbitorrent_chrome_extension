# qBittorrent Chrome Extension

Egy egyszerű, testreszabható Chrome bővítmény, amellyel magnet linkeket és torrent hivatkozásokat lehet gyorsan továbbítani a qBittorrent WebUI felé.

A bővítmény célja, hogy a torrentküldés kényelmesebb legyen, miközben a felhasználó saját beállításai szerint kezelhető a kapcsolat, az értesítés, a nyelv és a megjelenés.

## Fő funkciók

- Magnet linkek küldése qBittorrent WebUI-ra
- qBittorrent szerver URL megadása
- Felhasználónév és jelszó alapú hitelesítés
- Jelszó megjelenítése/elrejtése szem ikonnal
- Többnyelvű felület
- Beállítások oldal
- Egyedi toast értesítések
- Toast színek testreszabása
- Toast élőnézet valós időben
- Toast pozíció kiválasztása 2×2-es radioboxos elrendezéssel
- Gyökérbe csomagolt ZIP struktúra Chrome telepítéshez

## Támogatott nyelvek

A bővítmény jelenleg legalább 10 nyelvet támogat:

- Magyar
- Angol
- Német
- Francia
- Spanyol
- Olasz
- Lengyel
- Román
- Szlovák
- Cseh

A nyelv a beállítások oldalon választható ki.

## Beállítási lehetőségek

A bővítmény beállításai között megadható:

- qBittorrent WebUI címe
- Felhasználónév
- Jelszó
- Felület nyelve
- Toast értesítés színei
- Toast pozíciója
- Értesítések megjelenítésének módja

## Toast értesítések

A toast értesítések teljesen testreszabhatók.

Beállítható többek között:

- háttérszín
- szövegszín
- sikeres értesítés színe
- hibás értesítés színe
- megjelenítési pozíció

A pozíció kiválasztása már nem legördülő listából történik, hanem egy 2×2-es radioboxos elrendezésből:

- bal felső
- jobb felső
- bal alsó
- jobb alsó

Pozíció vagy szín módosításakor a toast előnézet azonnal megjelenik, majd automatikusan eltűnik.

## Telepítés Chrome-ban fejlesztői módban

1. Töltsd le vagy csomagold ki a bővítmény ZIP fájlját.
2. Nyisd meg Chrome-ban:

   ```text
   chrome://extensions/
   ```

3. Kapcsold be a jobb felső sarokban a **Fejlesztői módot**.
4. Kattints a **Kicsomagolt bővítmény betöltése** gombra.
5. Válaszd ki azt a mappát, amelyben közvetlenül megtalálható a `manifest.json`.

Fontos: a ZIP úgy van csomagolva, hogy a fájlok közvetlenül a gyökérben legyenek, ne egy plusz almappában.

## ZIP struktúra

Helyes csomagolás:

```text
qbit-chrome-extension.zip
├── manifest.json
├── background.js
├── content.js
├── popup.html
├── popup.js
├── options.html
├── options.js
├── i18n.js
└── icons/
```

Helytelen csomagolás:

```text
qbit-chrome-extension.zip
└── qbit-chrome-extension/
    ├── manifest.json
    ├── background.js
    └── ...
```

A Chrome kicsomagolt bővítményként az első megoldást kezeli kényelmesebben.

## Használat

1. Állítsd be a qBittorrent WebUI címét.
2. Add meg a belépési adatokat.
3. Válaszd ki a nyelvet.
4. Állítsd be az értesítések kinézetét.
5. Magnet link vagy torrent link küldésekor a bővítmény továbbítja az adatot a qBittorrent WebUI felé.

## qBittorrent WebUI követelmény

A bővítmény használatához szükséges:

- működő qBittorrent kliens
- bekapcsolt WebUI
- elérhető WebUI cím
- megfelelő felhasználónév és jelszó

Példa WebUI cím:

```text
http://192.168.1.100:8080
```

## Verzió

Aktuális verzió:

```text
1.3.3
```

## Változások

### 1.3.3

- Toast pozíció kiválasztása dropdown helyett 2×2-es radioboxos felületen
- Toast pozícióváltáskor automatikus élőnézet
- Színválasztáskor valós idejű toast előnézet
- ZIP továbbra is gyökérbe csomagolva

### 1.3.2

- Felesleges hitelesítési módok eltávolítása
- Felesleges küldési módok eltávolítása
- Toast élőnézet javítása

### 1.3.1

- ZIP csomagolás javítása
- Jelszó mutatása szem ikonnal
- Kategória és tag mezők eltávolítása
- Toast szín élőnézet javítása

### 1.3.0

- Többnyelvű támogatás hozzáadása
- Beállítások oldal javítása
- Toast előnézet beépítése
- Manifest frissítése

## Fejlesztési cél

A projekt célja egy letisztult, könnyen használható Chrome bővítmény készítése qBittorrent felhasználóknak, ahol a fölösleges opciók helyett a gyors működés, az átlátható beállítások és a testreszabható visszajelzések kapnak szerepet.

## Rövid GitHub leírás

```text
Chrome extension for sending magnet and torrent links directly to qBittorrent WebUI with multilingual settings and customizable toast notifications.
```

Magyar rövid leírás:

```text
Chrome bővítmény magnet és torrent linkek qBittorrent WebUI-ra küldéséhez, többnyelvű beállításokkal és testreszabható toast értesítésekkel.
```

## Licenc

Jelenleg nincs megadott licenc.

Ha nyílt forráskódú projektként szeretnéd publikálni, ajánlott például:

- MIT License
- GPL-3.0 License
- Apache-2.0 License

## Megjegyzés

Ez a bővítmény nem hivatalos qBittorrent termék. A qBittorrent név és logó a saját tulajdonosaihoz tartozik.

A bővítmény saját használatra és fejlesztési célokra készült.
