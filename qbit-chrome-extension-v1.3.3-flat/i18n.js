(function (global) {
  const LANGUAGES = {
    hu: "Magyar",
    en: "English",
    de: "Deutsch",
    fr: "Français",
    es: "Español",
    it: "Italiano",
    pl: "Polski",
    ro: "Română",
    sk: "Slovenčina",
    cs: "Čeština"
  };

  const T = {
    hu: {
      appName: "qBittorrent Torrent Sender",
      optionsTitle: "qBittorrent Torrent Sender beállítások",
      optionsLead: "Beállítások. Mert nyilván a torrent linknek is külön protokoll-diplomácia kell.",
      language: "Nyelv",
      serverUrl: "Szerver URL",
      username: "Felhasználónév",
      password: "Jelszó",
      showPassword: "Mutat",
      hidePassword: "Elrejt",
      showPasswordLabel: "Jelszó megjelenítése",
      hidePasswordLabel: "Jelszó elrejtése",
      authMode: "Hitelesítési mód",
      authAuto: "Automatikus: meglévő böngészős session, majd WebUI login",
      sendMode: "Küldési mód",
      sendBridge: "Ajánlott: mindig qBittorrent WebUI fülből küldje",
      category: "Kategória",
      tags: "Tag-ek",
      savePath: "Mentési útvonal, opcionális",
      autoIntercept: "Torrent és magnet linkek automatikus figyelése kattintáskor",
      interceptDownloads: "Chrome letöltések figyelése: .torrent letöltéskor küldés qBittorrentbe",
      keepChromeDownload: "A Chrome is töltse le a .torrent fájlt, ne szakítsa meg a letöltést",
      uploadTorrentFile: ".torrent fájl háttérletöltése és feltöltése qBittorrentbe",
      pageFetchTorrent: "Privát oldali mód: a torrent fájlt az aktuális oldal sessionjével olvassa ki és úgy küldi qBittorrentbe",
      fallbackSendUrl: "Hiba esetén küldje tovább csak URL-ként",
      paused: "Hozzáadás szüneteltetett állapotban",
      showNotifications: "Rendszerértesítések mutatása",
      showToasts: "Beúszó oldali toast visszajelzés mutatása",
      closeQbitTabAfterSend: "A bővítmény által megnyitott qBittorrent fület zárja be sikeres hozzáadás után",
      closeExistingQbitTabAfterSend: "Már nyitva lévő qBittorrent fület is zárja be küldés után",
      toastLook: "Toast értesítés kinézete",
      toastLead: "Alapból a böngésző/rendszer világos vagy sötét témájához igazodik. Mert néha a gép legalább a színeket eltalálja.",
      toastPosition: "Toast helye",
      posBottomRight: "Jobb alsó",
      posBottomLeft: "Bal alsó",
      posTopRight: "Jobb felső",
      posTopLeft: "Bal felső",
      posTopCenter: "Fent középen",
      posBottomCenter: "Lent középen",
      toastTheme: "Toast téma",
      themeAuto: "Automatikus: böngésző/rendszer témája alapján",
      themeDark: "Sötét",
      themeLight: "Világos",
      themeCustom: "Egyéni színek",
      bg: "Háttér",
      text: "Szöveg",
      success: "Siker",
      error: "Hiba",
      warning: "Figyelmeztetés",
      info: "Információ",
      previewToast: "Toast próba",
      livePreview: "Élő előnézet",
      previewTitle: "qBittorrent",
      previewMessage: "Toast próba: így fog kinézni a visszajelzés.",
      save: "Mentés",
      test: "Kapcsolat tesztelése",
      saved: "Mentve.",
      savingError: "Mentési hiba.",
      testing: "Tesztelés...",
      connectionOk: "Kapcsolat rendben. qBittorrent verzió: {version}. Hitelesítés: {authModeUsed}",
      connectionError: "Kapcsolati hiba.",
      popupTitle: "qBittorrent küldés",
      popupLead: "Link, magnet vagy kézi .torrent feltöltés. A civilizáció csúcsa.",
      torrentUrl: "Torrent / magnet URL",
      sendUrl: "URL küldése",
      chooseTorrent: ".torrent fájl kiválasztása",
      sendFile: "Fájl feltöltése",
      openOptions: "Beállítások",
      needUrl: "Adj meg egy URL-t vagy magnet linket.",
      sending: "Küldés...",
      sent: "Elküldve qBittorrentbe.",
      sendError: "Küldési hiba.",
      needFile: "Válassz ki egy .torrent fájlt.",
      uploading: "Feltöltés...",
      uploaded: "Fájl feltöltve qBittorrentbe.",
      uploadError: "Feltöltési hiba.",
      magnetAdded: "Magnet link bekerült a letöltési listába.",
      fileAdded: "Torrent fájl bekerült a letöltési listába.",
      downloadAdded: "Torrent letöltés észlelve, fájl bekerült a letöltési listába.",
      urlAdded: "Torrent URL bekerült a letöltési listába.",
      fallbackSent: "Torrent URL elküldve tartalék módban. {error}",
      qbitError: "qBittorrent hiba",
      unknownError: "Ismeretlen hiba"
    },
    en: {
      optionsLead: "Settings. Because even torrent links apparently need diplomatic protocol.", language: "Language", serverUrl: "Server URL", username: "Username", password: "Password", showPassword: "Show", hidePassword: "Hide", showPasswordLabel: "Show password", hidePasswordLabel: "Hide password", authMode: "Authentication mode", authAuto: "Automatic: existing browser session, then WebUI login", sendMode: "Send mode", sendBridge: "Recommended: always send from qBittorrent WebUI tab", category: "Category", tags: "Tags", savePath: "Save path, optional", autoIntercept: "Automatically watch torrent and magnet links on click", interceptDownloads: "Watch Chrome downloads: send .torrent downloads to qBittorrent", keepChromeDownload: "Let Chrome download the .torrent file too", uploadTorrentFile: "Download .torrent in background and upload to qBittorrent", pageFetchTorrent: "Private-site mode: read torrent file with the current page session", fallbackSendUrl: "On error, send as URL only", paused: "Add in paused state", showNotifications: "Show system notifications", showToasts: "Show page toast feedback", closeQbitTabAfterSend: "Close qBittorrent tab opened by the extension after successful add", closeExistingQbitTabAfterSend: "Also close an already open qBittorrent tab after sending", toastLook: "Toast notification appearance", toastLead: "By default it follows the browser/system theme. Miracles, but with colors.", toastPosition: "Toast position", posBottomRight: "Bottom right", posBottomLeft: "Bottom left", posTopRight: "Top right", posTopLeft: "Top left", posTopCenter: "Top center", posBottomCenter: "Bottom center", toastTheme: "Toast theme", themeAuto: "Automatic: based on browser/system theme", themeDark: "Dark", themeLight: "Light", themeCustom: "Custom colors", bg: "Background", text: "Text", success: "Success", error: "Error", warning: "Warning", info: "Info", previewToast: "Toast test", livePreview: "Live preview", previewTitle: "qBittorrent", previewMessage: "Toast test: this is how feedback will look.", save: "Save", test: "Test connection", saved: "Saved.", savingError: "Save error.", testing: "Testing...", connectionOk: "Connection OK. qBittorrent version: {version}. Auth: {authModeUsed}", connectionError: "Connection error.", popupTitle: "qBittorrent send", popupLead: "Link, magnet or manual .torrent upload. Humanity peaked here.", torrentUrl: "Torrent / magnet URL", sendUrl: "Send URL", chooseTorrent: "Choose .torrent file", sendFile: "Upload file", openOptions: "Settings", needUrl: "Enter a URL or magnet link.", sending: "Sending...", sent: "Sent to qBittorrent.", sendError: "Send error.", needFile: "Choose a .torrent file.", uploading: "Uploading...", uploaded: "File uploaded to qBittorrent.", uploadError: "Upload error.", magnetAdded: "Magnet link was added to the download list.", fileAdded: "Torrent file was added to the download list.", downloadAdded: "Torrent download detected and added to the list.", urlAdded: "Torrent URL was added to the download list.", fallbackSent: "Torrent URL sent in fallback mode. {error}", qbitError: "qBittorrent error", unknownError: "Unknown error"
    },
    de: { language:"Sprache", optionsLead:"Einstellungen. Weil selbst Torrent-Links offenbar Diplomatie brauchen.", serverUrl:"Server-URL", username:"Benutzername", password:"Passwort", showPassword:"Anzeigen", hidePassword:"Verbergen", authMode:"Authentifizierung", sendMode:"Sendemodus", category:"Kategorie", tags:"Tags", savePath:"Speicherpfad, optional", toastLook:"Toast-Benachrichtigung", toastPosition:"Toast-Position", toastTheme:"Toast-Design", themeAuto:"Automatisch", themeDark:"Dunkel", themeLight:"Hell", themeCustom:"Eigene Farben", bg:"Hintergrund", text:"Text", success:"Erfolg", error:"Fehler", warning:"Warnung", info:"Info", previewToast:"Toast-Test", livePreview:"Live-Vorschau", previewMessage:"Toast-Test: So sieht die Rückmeldung aus.", save:"Speichern", test:"Verbindung testen", saved:"Gespeichert.", testing:"Teste...", popupTitle:"qBittorrent senden", popupLead:"Link, Magnet oder manuelle .torrent-Datei.", torrentUrl:"Torrent-/Magnet-URL", sendUrl:"URL senden", chooseTorrent:".torrent-Datei auswählen", sendFile:"Datei hochladen", openOptions:"Einstellungen" },
    fr: { language:"Langue", optionsLead:"Paramètres. Même un lien torrent réclame sa petite diplomatie.", serverUrl:"URL du serveur", username:"Nom d’utilisateur", password:"Mot de passe", showPassword:"Afficher", hidePassword:"Masquer", authMode:"Authentification", sendMode:"Mode d’envoi", category:"Catégorie", tags:"Tags", savePath:"Chemin d’enregistrement, optionnel", toastLook:"Apparence des notifications toast", toastPosition:"Position du toast", toastTheme:"Thème du toast", themeAuto:"Automatique", themeDark:"Sombre", themeLight:"Clair", themeCustom:"Couleurs personnalisées", bg:"Fond", text:"Texte", success:"Succès", error:"Erreur", warning:"Avertissement", info:"Info", previewToast:"Test toast", livePreview:"Aperçu en direct", previewMessage:"Test toast : voici le rendu du message.", save:"Enregistrer", test:"Tester la connexion", saved:"Enregistré.", testing:"Test...", popupTitle:"Envoi qBittorrent", popupLead:"Lien, magnet ou fichier .torrent manuel.", torrentUrl:"URL torrent / magnet", sendUrl:"Envoyer l’URL", chooseTorrent:"Choisir un fichier .torrent", sendFile:"Téléverser", openOptions:"Paramètres" },
    es: { language:"Idioma", optionsLead:"Configuración. Porque hasta un enlace torrent necesita protocolo diplomático.", serverUrl:"URL del servidor", username:"Usuario", password:"Contraseña", showPassword:"Mostrar", hidePassword:"Ocultar", authMode:"Autenticación", sendMode:"Modo de envío", category:"Categoría", tags:"Etiquetas", savePath:"Ruta de guardado, opcional", toastLook:"Aspecto de la notificación toast", toastPosition:"Posición del toast", toastTheme:"Tema del toast", themeAuto:"Automático", themeDark:"Oscuro", themeLight:"Claro", themeCustom:"Colores personalizados", bg:"Fondo", text:"Texto", success:"Éxito", error:"Error", warning:"Advertencia", info:"Info", previewToast:"Probar toast", livePreview:"Vista previa", previewMessage:"Prueba de toast: así se verá el aviso.", save:"Guardar", test:"Probar conexión", saved:"Guardado.", testing:"Probando...", popupTitle:"Enviar a qBittorrent", popupLead:"Enlace, magnet o subida manual .torrent.", torrentUrl:"URL torrent / magnet", sendUrl:"Enviar URL", chooseTorrent:"Elegir archivo .torrent", sendFile:"Subir archivo", openOptions:"Configuración" },
    it: { language:"Lingua", optionsLead:"Impostazioni. Perché anche un link torrent vuole il suo protocollo diplomatico.", serverUrl:"URL server", username:"Nome utente", password:"Password", showPassword:"Mostra", hidePassword:"Nascondi", authMode:"Autenticazione", sendMode:"Modalità invio", category:"Categoria", tags:"Tag", savePath:"Percorso di salvataggio, opzionale", toastLook:"Aspetto notifiche toast", toastPosition:"Posizione toast", toastTheme:"Tema toast", themeAuto:"Automatico", themeDark:"Scuro", themeLight:"Chiaro", themeCustom:"Colori personalizzati", bg:"Sfondo", text:"Testo", success:"Successo", error:"Errore", warning:"Avviso", info:"Info", previewToast:"Test toast", livePreview:"Anteprima live", previewMessage:"Test toast: ecco come apparirà il messaggio.", save:"Salva", test:"Test connessione", saved:"Salvato.", testing:"Test...", popupTitle:"Invia a qBittorrent", popupLead:"Link, magnet o caricamento manuale .torrent.", torrentUrl:"URL torrent / magnet", sendUrl:"Invia URL", chooseTorrent:"Scegli file .torrent", sendFile:"Carica file", openOptions:"Impostazioni" },
    pl: { language:"Język", optionsLead:"Ustawienia. Bo nawet link torrent potrzebuje protokołu dyplomatycznego.", serverUrl:"URL serwera", username:"Nazwa użytkownika", password:"Hasło", showPassword:"Pokaż", hidePassword:"Ukryj", authMode:"Uwierzytelnianie", sendMode:"Tryb wysyłania", category:"Kategoria", tags:"Tagi", savePath:"Ścieżka zapisu, opcjonalnie", toastLook:"Wygląd powiadomień toast", toastPosition:"Pozycja toast", toastTheme:"Motyw toast", themeAuto:"Automatycznie", themeDark:"Ciemny", themeLight:"Jasny", themeCustom:"Własne kolory", bg:"Tło", text:"Tekst", success:"Sukces", error:"Błąd", warning:"Ostrzeżenie", info:"Info", previewToast:"Test toast", livePreview:"Podgląd na żywo", previewMessage:"Test toast: tak będzie wyglądać komunikat.", save:"Zapisz", test:"Testuj połączenie", saved:"Zapisano.", testing:"Testowanie...", popupTitle:"Wyślij do qBittorrent", popupLead:"Link, magnet lub ręczne przesłanie .torrent.", torrentUrl:"URL torrent / magnet", sendUrl:"Wyślij URL", chooseTorrent:"Wybierz plik .torrent", sendFile:"Prześlij plik", openOptions:"Ustawienia" },
    ro: { language:"Limbă", optionsLead:"Setări. Fiindcă și un link torrent cere protocol diplomatic.", serverUrl:"URL server", username:"Utilizator", password:"Parolă", showPassword:"Arată", hidePassword:"Ascunde", authMode:"Autentificare", sendMode:"Mod trimitere", category:"Categorie", tags:"Etichete", savePath:"Cale salvare, opțional", toastLook:"Aspect notificare toast", toastPosition:"Poziție toast", toastTheme:"Temă toast", themeAuto:"Automat", themeDark:"Întunecat", themeLight:"Luminos", themeCustom:"Culori personalizate", bg:"Fundal", text:"Text", success:"Succes", error:"Eroare", warning:"Avertisment", info:"Info", previewToast:"Test toast", livePreview:"Previzualizare live", previewMessage:"Test toast: așa va arăta mesajul.", save:"Salvează", test:"Testează conexiunea", saved:"Salvat.", testing:"Se testează...", popupTitle:"Trimite către qBittorrent", popupLead:"Link, magnet sau încărcare manuală .torrent.", torrentUrl:"URL torrent / magnet", sendUrl:"Trimite URL", chooseTorrent:"Alege fișier .torrent", sendFile:"Încarcă fișier", openOptions:"Setări" },
    sk: { language:"Jazyk", optionsLead:"Nastavenia. Lebo aj torrent odkaz zjavne potrebuje diplomatický protokol.", serverUrl:"URL servera", username:"Používateľ", password:"Heslo", showPassword:"Ukázať", hidePassword:"Skryť", authMode:"Overenie", sendMode:"Režim odoslania", category:"Kategória", tags:"Tagy", savePath:"Cesta uloženia, voliteľné", toastLook:"Vzhľad toast oznámenia", toastPosition:"Pozícia toastu", toastTheme:"Téma toastu", themeAuto:"Automaticky", themeDark:"Tmavá", themeLight:"Svetlá", themeCustom:"Vlastné farby", bg:"Pozadie", text:"Text", success:"Úspech", error:"Chyba", warning:"Upozornenie", info:"Info", previewToast:"Test toastu", livePreview:"Živý náhľad", previewMessage:"Test toastu: takto bude vyzerať spätná väzba.", save:"Uložiť", test:"Test spojenia", saved:"Uložené.", testing:"Testujem...", popupTitle:"Odoslať do qBittorrent", popupLead:"Odkaz, magnet alebo manuálny .torrent súbor.", torrentUrl:"Torrent / magnet URL", sendUrl:"Odoslať URL", chooseTorrent:"Vybrať .torrent súbor", sendFile:"Nahrať súbor", openOptions:"Nastavenia" },
    cs: { language:"Jazyk", optionsLead:"Nastavení. Protože i torrent odkaz zjevně potřebuje diplomatický protokol.", serverUrl:"URL serveru", username:"Uživatel", password:"Heslo", showPassword:"Zobrazit", hidePassword:"Skrýt", authMode:"Ověření", sendMode:"Režim odeslání", category:"Kategorie", tags:"Tagy", savePath:"Cesta uložení, volitelné", toastLook:"Vzhled toast oznámení", toastPosition:"Pozice toastu", toastTheme:"Motiv toastu", themeAuto:"Automaticky", themeDark:"Tmavý", themeLight:"Světlý", themeCustom:"Vlastní barvy", bg:"Pozadí", text:"Text", success:"Úspěch", error:"Chyba", warning:"Varování", info:"Info", previewToast:"Test toastu", livePreview:"Živý náhled", previewMessage:"Test toastu: takto bude vypadat zpráva.", save:"Uložit", test:"Test připojení", saved:"Uloženo.", testing:"Testuji...", popupTitle:"Odeslat do qBittorrent", popupLead:"Odkaz, magnet nebo ruční nahrání .torrent.", torrentUrl:"Torrent / magnet URL", sendUrl:"Odeslat URL", chooseTorrent:"Vybrat .torrent soubor", sendFile:"Nahrát soubor", openOptions:"Nastavení" }
  };

  for (const lang of Object.keys(T)) {
    T[lang] = { ...T.hu, ...T[lang] };
  }

  function normalizeLanguage(lang) {
    lang = String(lang || "hu").toLowerCase();
    if (T[lang]) return lang;
    const short = lang.split("-")[0];
    return T[short] ? short : "hu";
  }

  function tr(lang, key, vars) {
    const dict = T[normalizeLanguage(lang)];
    let value = dict[key] || T.hu[key] || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, String(v ?? ""));
    }
    return value;
  }

  global.QBIT_I18N = { LANGUAGES, T, normalizeLanguage, tr };
})(typeof globalThis !== "undefined" ? globalThis : window);
