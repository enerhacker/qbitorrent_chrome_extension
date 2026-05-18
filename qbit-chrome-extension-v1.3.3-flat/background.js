importScripts("i18n.js");

const DEFAULTS = {
  language: "hu",
  baseUrl: "http://127.0.0.1:8080",
  username: "admin",
  password: "",
  savePath: "",
  paused: false,
  autoIntercept: true,
  interceptDownloads: true,
  keepChromeDownload: true,
  uploadTorrentFile: true,
  pageFetchTorrent: true,
  fallbackSendUrl: true,
  showNotifications: true,
  showToasts: true,
  toastPosition: "bottom-right",
  toastTheme: "auto",
  toastBg: "#172238",
  toastText: "#f3f5f7",
  toastSuccess: "#58d68d",
  toastError: "#ff6b6b",
  toastWarning: "#ffc857",
  toastInfo: "#4aa3ff",
  closeQbitTabAfterSend: true,
  closeExistingQbitTabAfterSend: false,
  authMode: "auto",
  sendMode: "bridge"
};

const handledDownloadIds = new Set();
const handledDownloadUrls = new Map();
const recentlyHandledUrls = new Map();

function sanitizeSettings(settings) {
  const cleaned = { ...DEFAULTS, ...(settings || {}) };
  // Az 1.3.2 verziótól csak az automatikus WebUI login és a WebUI fülből küldés marad.
  // Régi mentett beállításokat is ide terelünk, különben a Chrome megint régészeti leletként viselkedik.
  cleaned.authMode = "auto";
  cleaned.sendMode = "bridge";
  cleaned.baseUrl = normalizeBaseUrl(cleaned.baseUrl || DEFAULTS.baseUrl);
  return cleaned;
}

async function getSettings() {
  const data = await chrome.storage.local.get(DEFAULTS);
  return sanitizeSettings(data);
}

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}

function now() { return Date.now(); }

function tr(settings, key, vars = {}) {
  const lang = settings?.language || "hu";
  return QBIT_I18N.tr(lang, key, vars);
}

function createOrUpdateContextMenu(language = "hu") {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: "send-to-qbit",
      title: QBIT_I18N.tr(language, "sendUrl"),
      contexts: ["link"]
    });
  });
}

function cleanupMaps() {
  for (const [u, t] of recentlyHandledUrls.entries()) if (now() - t > 45000) recentlyHandledUrls.delete(u);
  for (const [u, t] of handledDownloadUrls.entries()) if (now() - t > 120000) handledDownloadUrls.delete(u);
}

function isTorrentUrl(url) {
  if (!url) return false;
  const lower = String(url).toLowerCase();
  const clean = lower.split("#")[0].split("?")[0];
  return clean.endsWith(".torrent") || lower.includes(".torrent?") || (lower.includes("torrent") && (lower.includes("download") || lower.includes("get") || lower.includes("passkey")));
}

function isTorrentFilename(filename) {
  return String(filename || "").toLowerCase().split("?")[0].endsWith(".torrent");
}

function isTorrentMime(mime) {
  const m = String(mime || "").toLowerCase();
  return m.includes("bittorrent") || m.includes("x-bittorrent") || m.includes("torrent");
}

function isMagnet(url) {
  return typeof url === "string" && url.toLowerCase().startsWith("magnet:");
}

function guessFileName(url, fallback = "download.torrent") {
  try {
    const u = new URL(url);
    let last = decodeURIComponent(u.pathname.split("/").pop() || fallback);
    if (!last || last === "/") last = fallback;
    return last.toLowerCase().endsWith(".torrent") ? last : `${last}.torrent`;
  } catch {
    return fallback;
  }
}

function markUrlHandled(url) {
  if (!url) return;
  cleanupMaps();
  recentlyHandledUrls.set(url, now());
}

function wasUrlHandled(url) {
  if (!url) return false;
  cleanupMaps();
  const t = recentlyHandledUrls.get(url);
  return !!t && now() - t < 45000;
}

function markDownloadUrlHandled(url) {
  if (!url) return;
  cleanupMaps();
  handledDownloadUrls.set(url, now());
}

function wasDownloadUrlHandled(url) {
  if (!url) return false;
  cleanupMaps();
  const t = handledDownloadUrls.get(url);
  return !!t && now() - t < 120000;
}

function notify(title, message, kind = "info", tabId = null) {
  chrome.storage.local.get(DEFAULTS).then(settings => {
    if (settings.showNotifications) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon128.png",
        title,
        message: String(message || "").slice(0, 350)
      });
    }

    if (settings.showToasts && Number.isInteger(tabId) && tabId >= 0) {
      chrome.tabs.sendMessage(tabId, {
        type: "qbitToast",
        title,
        message: String(message || ""),
        kind,
        toast: {
          position: settings.toastPosition,
          theme: settings.toastTheme,
          bg: settings.toastBg,
          text: settings.toastText,
          success: settings.toastSuccess,
          error: settings.toastError,
          warning: settings.toastWarning,
          info: settings.toastInfo
        }
      }).catch(() => {});
    }
  });
}

async function safeText(res) {
  try { return await res.text(); } catch { return ""; }
}

function qbitErrorForLogin(status, text) {
  let extra = "";
  if (status === 401 || status === 403) {
    extra = " Valószínű ok: a qBittorrent WebUI elutasítja a Chrome bővítményből érkező bejelentkezést. Ellenőrizd a WebUI URL-t, a felhasználónevet, a jelszót és a qBittorrent WebUI biztonsági beállításait.";
  }
  return new Error(`qBittorrent bejelentkezés sikertelen. HTTP ${status}, válasz: ${text || "üres"}.${extra}`);
}

async function checkSession(settings) {
  // Az app/version több qBittorrent verziónál nem elég hitelesítés-tesztre.
  // A torrents/info már valódi WebAPI jogosultságot kér, nem csak udvariasan visszaköszön.
  const res = await fetch(`${settings.baseUrl}/api/v2/torrents/info?limit=1`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });
  if (!res.ok) return { ok: false, status: res.status, text: await safeText(res) };

  const versionRes = await fetch(`${settings.baseUrl}/api/v2/app/version`, {
    method: "GET",
    credentials: "include",
    cache: "no-store"
  });
  const version = versionRes.ok ? (await versionRes.text()).trim() : "ismeretlen";
  return { ok: true, version };
}

async function forceLogin(settings) {
  const body = new URLSearchParams();
  body.set("username", settings.username || "");
  body.set("password", settings.password || "");

  const res = await fetch(`${settings.baseUrl}/api/v2/auth/login`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: body.toString()
  });

  const text = await safeText(res);
  if (!res.ok || text.trim() !== "Ok.") throw qbitErrorForLogin(res.status, text.trim());
  return { ok: true, mode: "login" };
}

async function login(settings) {
  const existing = await checkSession(settings);
  if (existing.ok) return { ok: true, mode: "existing-session", version: existing.version };

  return await forceLogin(settings);
}

async function qbitAddFetchWithRetry(settings, form) {
  // FONTOS: qBittorrent WebUI CSRF/Origin ellenőrzése miatt a chrome-extension:// eredetű
  // POST gyakran 401/403 lesz. Ezért az alapértelmezett út a WebUI fülből küldés.
  let res = await fetch(`${settings.baseUrl}/api/v2/torrents/add`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    body: form
  });

  if ((res.status === 401 || res.status === 403) && settings.authMode === "auto") {
    try {
      await forceLogin(settings);
      res = await fetch(`${settings.baseUrl}/api/v2/torrents/add`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        body: form
      });
    } catch (_) {
      // A hívó majd WebUI-híd módra vált.
    }
  }
  return res;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForTabComplete(tabId, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === "complete") return tab;
    } catch (_) {
      break;
    }
    await sleep(250);
  }
  try { return await chrome.tabs.get(tabId); } catch (_) { return null; }
}

async function ensureQbitTab(settings) {
  const base = normalizeBaseUrl(settings.baseUrl);
  let pattern;
  try {
    const u = new URL(base);
    pattern = `${u.origin}/*`;
  } catch {
    throw new Error("Érvénytelen qBittorrent szerver URL.");
  }

  let tabs = [];
  try { tabs = await chrome.tabs.query({ url: pattern }); } catch (_) { tabs = []; }

  let openedByExtension = false;
  let tab = tabs.find(t => !t.discarded) || tabs[0];
  if (!tab) {
    tab = await chrome.tabs.create({ url: base, active: false });
    openedByExtension = true;
    tab = await waitForTabComplete(tab.id);
  } else if (tab.status !== "complete") {
    tab = await waitForTabComplete(tab.id);
  }

  if (!tab || !tab.id) {
    throw new Error("Nem sikerült qBittorrent WebUI fület létrehozni vagy megtalálni.");
  }
  return { tab, openedByExtension };
}

async function maybeCloseQbitTab(settings, tabInfo) {
  if (!tabInfo?.tab?.id) return;
  const shouldClose = settings.closeQbitTabAfterSend && (tabInfo.openedByExtension || settings.closeExistingQbitTabAfterSend);
  if (!shouldClose) return;
  try { await chrome.tabs.remove(tabInfo.tab.id); } catch (_) {}
}

async function addViaQbitTab(settings, payload) {
  payload = {
    ...payload,
    auth: {
      mode: settings.authMode,
      username: settings.username || "",
      password: settings.password || ""
    }
  };
  const tabInfo = await ensureQbitTab(settings);
  const tab = tabInfo.tab;
  try {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async (payload) => {
      function bytesToBlob(bytes) {
        const arr = new Uint8Array(bytes || []);
        return new Blob([arr], { type: "application/x-bittorrent" });
      }
      function appendCommonFields(form, settings) {
        if (settings.savePath) form.append("savepath", settings.savePath);
        form.append("paused", settings.paused ? "true" : "false");
      }
      function makeForm() {
        const form = new FormData();
        if (payload.kind === "url") {
          form.append("urls", payload.url);
        } else if (payload.kind === "file") {
          form.append("torrents", bytesToBlob(payload.bytes), payload.filename || "download.torrent");
        } else {
          throw new Error("Ismeretlen qBittorrent híd művelet.");
        }
        appendCommonFields(form, payload.settings || {});
        return form;
      }
      async function doAdd() {
        return await fetch("/api/v2/torrents/add", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          body: makeForm()
        });
      }
      async function doLogin() {
        const body = new URLSearchParams();
        body.set("username", payload.auth?.username || "");
        body.set("password", payload.auth?.password || "");
        return await fetch("/api/v2/auth/login", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
          headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
          body: body.toString()
        });
      }
      try {
        let res = await doAdd();
        let text = await res.text().catch(() => "");
        if ((res.status === 401 || res.status === 403) && payload.auth?.mode === "auto") {
          const loginRes = await doLogin();
          const loginText = await loginRes.text().catch(() => "");
          if (!loginRes.ok || loginText.trim() !== "Ok.") {
            return { ok: false, status: loginRes.status, text: `WebUI híd login sikertelen: ${loginText || "üres"}` };
          }
          res = await doAdd();
          text = await res.text().catch(() => "");
        }
        return { ok: res.ok && (!text || text.includes("Ok.") || text.trim() === ""), status: res.status, text };
      } catch (err) {
        return { ok: false, status: 0, text: err && err.message ? err.message : String(err) };
      }
    },
    args: [payload]
  });

  if (!result?.ok) {
    const statusText = result?.status ? `HTTP ${result.status}` : "belső hiba";
    throw new Error(`qBittorrent WebUI híd mód sikertelen. ${statusText}, válasz: ${result?.text || "üres"}. Nyisd meg a qBittorrent WebUI-t egy fülön, jelentkezz be, majd próbáld újra.`);
  }
  return result.text;
  } finally {
    await maybeCloseQbitTab(settings, tabInfo);
  }
}

function blobToBytes(blob) {
  return blob.arrayBuffer().then(buf => Array.from(new Uint8Array(buf)));
}

function appendCommonFields(form, settings) {
  if (settings.savePath) form.append("savepath", settings.savePath);
  form.append("paused", settings.paused ? "true" : "false");
}

function assertLikelyTorrentBlob(blob, contentType) {
  if (!blob || blob.size === 0) throw new Error("A torrent fájl üresnek tűnik.");
  const ct = String(contentType || "").toLowerCase();
  if (ct.includes("html") || ct.includes("text/html")) {
    throw new Error("A letöltött tartalom HTML oldalnak tűnik, nem .torrent fájlnak. Ilyenkor az oldal session/cookie/referer védelme akadályozhatja a háttérletöltést.");
  }
}

function commonPayloadSettings(settings) {
  return {
    savePath: settings.savePath,
    paused: settings.paused
  };
}

function qbitAddSucceeded(res, text) {
  // Régebbi qBittorrent: "Ok.". Újabb/eltérő build: néha üres 200 is lehet.
  return res.ok && (!text || text.includes("Ok.") || text.trim() === "");
}

async function addTorrentFile(settings, blob, filename) {
  const payload = {
    kind: "file",
    bytes: await blobToBytes(blob),
    filename: filename || "download.torrent",
    settings: commonPayloadSettings(settings)
  };

  if (settings.sendMode === "bridge") {
    return await addViaQbitTab(settings, payload);
  }

  const form = new FormData();
  form.append("torrents", blob, filename || "download.torrent");
  appendCommonFields(form, settings);

  const res = await qbitAddFetchWithRetry(settings, form);
  const text = await safeText(res);
  if (!qbitAddSucceeded(res, text)) {
    if (res.status === 401 || res.status === 403) {
      return await addViaQbitTab(settings, payload);
    }
    throw new Error(`Torrent feltöltés sikertelen. HTTP ${res.status}, válasz: ${text || "üres"}`);
  }
  return text || "Ok.";
}

async function addTorrentUrl(settings, url) {
  const payload = {
    kind: "url",
    url,
    settings: commonPayloadSettings(settings)
  };

  if (settings.sendMode === "bridge") {
    return await addViaQbitTab(settings, payload);
  }

  const form = new FormData();
  form.append("urls", url);
  appendCommonFields(form, settings);

  const res = await qbitAddFetchWithRetry(settings, form);
  const text = await safeText(res);
  if (!qbitAddSucceeded(res, text)) {
    if (res.status === 401 || res.status === 403) {
      return await addViaQbitTab(settings, payload);
    }
    throw new Error(`Torrent URL/magnet küldés sikertelen. HTTP ${res.status}, válasz: ${text || "üres"}`);
  }
  return text || "Ok.";
}

async function downloadTorrentFile(url) {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    redirect: "follow",
    headers: {
      "Accept": "application/x-bittorrent,application/octet-stream,*/*"
    }
  });
  if (!res.ok) throw new Error(`A torrent fájl háttérletöltése sikertelen. HTTP ${res.status}`);
  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const blob = await res.blob();
  assertLikelyTorrentBlob(blob, contentType);
  return { blob, contentType };
}

async function handleUrl(url, source = "manual", options = {}) {
  const settings = await getSettings();
  if (!settings.baseUrl) throw new Error("Nincs qBittorrent szerver URL beállítva.");

  if (!options.allowDuplicate && wasDownloadUrlHandled(url)) {
    return { ok: true, mode: "already_handled" };
  }

  markUrlHandled(url);
  await login(settings);

  if (isMagnet(url)) {
    await addTorrentUrl(settings, url);
    notify("qBittorrent", tr(settings, "magnetAdded"), "success", options.tabId);
    return { ok: true, mode: "magnet" };
  }

  if (settings.uploadTorrentFile) {
    try {
      const { blob } = await downloadTorrentFile(url);
      await addTorrentFile(settings, blob, guessFileName(url));
      markDownloadUrlHandled(url);
      notify("qBittorrent", source === "download" ? tr(settings, "downloadAdded") : tr(settings, "fileAdded"), "success", options.tabId);
      return { ok: true, mode: "file" };
    } catch (err) {
      if (!settings.fallbackSendUrl) throw err;
      await addTorrentUrl(settings, url);
      markDownloadUrlHandled(url);
      notify("qBittorrent", tr(settings, "fallbackSent", { error: err.message || "" }), "warning", options.tabId);
      return { ok: true, mode: "url_fallback", warning: err.message };
    }
  }

  await addTorrentUrl(settings, url);
  markDownloadUrlHandled(url);
  notify("qBittorrent", tr(settings, "urlAdded"), "success", options.tabId);
  return { ok: true, mode: "url" };
}

async function handleFileUpload(data, tabId = null) {
  const settings = await getSettings();
  await login(settings);
  const raw = data.bytes instanceof ArrayBuffer ? data.bytes : data.bytes;
  const bytes = raw instanceof ArrayBuffer ? new Uint8Array(raw) : new Uint8Array(raw || []);
  const blob = new Blob([bytes], { type: "application/x-bittorrent" });
  await addTorrentFile(settings, blob, data.filename || "manual.torrent");
  notify("qBittorrent", tr(settings, "fileAdded"), "success", tabId);
  return { ok: true, mode: "manual_file" };
}

async function testConnection() {
  const settings = await getSettings();
  const auth = await login(settings);
  const session = await checkSession(settings);
  if (!session.ok) throw new Error(`Verziólekérés sikertelen. HTTP ${session.status}, válasz: ${session.text || "üres"}`);
  return { ok: true, version: session.version, authModeUsed: auth.mode };
}

function torrentCandidateFromDownload(item) {
  const url = item.finalUrl || item.url || "";
  const file = item.filename || item.suggestedFilename || "";
  return isTorrentUrl(url) || isTorrentFilename(file) || isTorrentMime(item.mime);
}

async function getDownloadItem(id) {
  const results = await chrome.downloads.search({ id });
  return results && results[0] ? results[0] : null;
}

async function processDownloadItem(item, reason = "download") {
  const settings = await getSettings();
  if (!settings.interceptDownloads) return;
  if (!item || !torrentCandidateFromDownload(item)) return;
  if (handledDownloadIds.has(item.id)) return;

  const url = item.finalUrl || item.url;
  if (!url || wasDownloadUrlHandled(url)) return;

  handledDownloadIds.add(item.id);

  if (!settings.keepChromeDownload) {
    try { await chrome.downloads.cancel(item.id); } catch (_) {}
  }

  try {
    await handleUrl(url, reason, { allowDuplicate: false, tabId: Number.isInteger(item.tabId) ? item.tabId : null });
    if (!settings.keepChromeDownload) {
      try { await chrome.downloads.erase({ id: item.id }); } catch (_) {}
    }
  } catch (err) {
    handledDownloadIds.delete(item.id);
    notify(tr(settings, "qbitError"), err.message || String(err), "error", Number.isInteger(item?.tabId) ? item.tabId : null);
  }
}

async function handleDownloadCreated(item) {
  const settings = await getSettings();
  if (!settings.interceptDownloads) return;

  // A Chrome sokszor még nem tudja a fájlnevet/MIME-ot onCreated pillanatban.
  // Várunk egy kicsit, aztán újrakérdezzük. Mert természetesen túl egyszerű lenne elsőre pontos adatot adni.
  setTimeout(async () => {
    const fresh = await getDownloadItem(item.id);
    await processDownloadItem(fresh || item, "download");
  }, 1200);
}

async function handleDownloadChanged(delta) {
  if (!delta || !delta.id) return;
  const interesting = delta.state || delta.filename || delta.mime || delta.url || delta.finalUrl;
  if (!interesting) return;
  const item = await getDownloadItem(delta.id);
  if (!item) return;

  // Ha már kész, biztosan megvan a végleges fájlnév/URL. Ekkor próbáljuk újra, ha onCreatedkor még nem volt felismerhető.
  if (item.state === "complete" || torrentCandidateFromDownload(item)) {
    await processDownloadItem(item, "download");
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const settings = await getSettings();
  createOrUpdateContextMenu(settings.language);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "send-to-qbit") return;
  const tabId = tab && Number.isInteger(tab.id) ? tab.id : null;
  handleUrl(info.linkUrl, "context", { allowDuplicate: true, tabId }).catch(err => notify("qBittorrent hiba", err.message, "error", tabId));
});

chrome.downloads.onCreated.addListener((item) => {
  handleDownloadCreated(item).catch(err => notify("qBittorrent hiba", err.message || String(err)));
});

chrome.downloads.onChanged.addListener((delta) => {
  handleDownloadChanged(delta).catch(err => notify("qBittorrent hiba", err.message || String(err)));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (message?.type === "getSettings") {
      sendResponse({ ok: true, settings: await getSettings() });
      return;
    }
    if (message?.type === "saveSettings") {
      const clean = sanitizeSettings(message.settings);
      await chrome.storage.local.set(clean);
      if (clean.language) createOrUpdateContextMenu(clean.language);
      sendResponse({ ok: true });
      return;
    }
    if (message?.type === "sendUrl") {
      const result = await handleUrl(message.url, message.source || "content", { allowDuplicate: true, tabId: sender?.tab?.id ?? null });
      sendResponse(result);
      return;
    }
    if (message?.type === "uploadFile") {
      const result = await handleFileUpload(message.file, sender?.tab?.id ?? null);
      sendResponse(result);
      return;
    }
    if (message?.type === "testConnection") {
      const result = await testConnection();
      sendResponse(result);
      return;
    }
    sendResponse({ ok: false, error: "Ismeretlen művelet." });
  })().catch(err => sendResponse({ ok: false, error: err.message || String(err) }));
  return true;
});
