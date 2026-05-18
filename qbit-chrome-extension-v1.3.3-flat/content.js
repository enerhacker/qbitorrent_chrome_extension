
function getDefaultToastConfig() {
  return {
    position: "bottom-right",
    theme: "auto",
    bg: "#172238",
    text: "#f3f5f7",
    success: "#58d68d",
    error: "#ff6b6b",
    warning: "#ffc857",
    info: "#4aa3ff"
  };
}

function getToastPalette(kind, cfg = {}) {
  const config = { ...getDefaultToastConfig(), ...(cfg || {}) };
  const isDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = config.theme || "auto";
  const useCustom = theme === "custom";

  if (useCustom) {
    return {
      bg: config.bg || "#172238",
      text: config.text || "#f3f5f7",
      accent: config[kind] || config.info || "#4aa3ff",
      subText: config.text || "#f3f5f7"
    };
  }

  const dark = theme === "dark" || (theme === "auto" && isDark);
  const accents = {
    success: "#58d68d",
    error: "#ff6b6b",
    warning: "#ffc857",
    info: "#4aa3ff"
  };

  if (dark) {
    const backgrounds = {
      success: "#0f3d2e",
      error: "#431b1b",
      warning: "#4a3715",
      info: "#172238"
    };
    return { bg: backgrounds[kind] || backgrounds.info, text: "#f3f5f7", accent: accents[kind] || accents.info, subText: "#d9e1ef" };
  }

  const backgrounds = {
    success: "#eefaf3",
    error: "#fff0f0",
    warning: "#fff8e5",
    info: "#eef6ff"
  };
  return { bg: backgrounds[kind] || backgrounds.info, text: "#172033", accent: accents[kind] || accents.info, subText: "#405064" };
}

function getToastStackCss(position) {
  const base = [
    "position: fixed",
    "z-index: 2147483647",
    "display: grid",
    "gap: 10px",
    "max-width: min(420px, calc(100vw - 44px))",
    "font-family: Arial, Helvetica, sans-serif",
    "pointer-events: none"
  ];
  const pos = position || "bottom-right";
  const map = {
    "bottom-right": ["right: 22px", "bottom: 22px"],
    "bottom-left": ["left: 22px", "bottom: 22px"],
    "top-right": ["right: 22px", "top: 22px"],
    "top-left": ["left: 22px", "top: 22px"],
    "top-center": ["left: 50%", "top: 22px", "transform: translateX(-50%)"],
    "bottom-center": ["left: 50%", "bottom: 22px", "transform: translateX(-50%)"]
  };
  return base.concat(map[pos] || map["bottom-right"]).join(";");
}

function showQbitToast(title, message, kind = "info", toastConfig = null) {
  try {
    const cfg = { ...getDefaultToastConfig(), ...(toastConfig || {}) };
    const existing = document.getElementById("qbit-toast-stack");
    const stack = existing || document.createElement("div");
    if (!existing) {
      stack.id = "qbit-toast-stack";
      document.documentElement.appendChild(stack);
    }
    stack.style.cssText = getToastStackCss(cfg.position);

    const toast = document.createElement("div");
    const palette = getToastPalette(kind, cfg);
    const fromLeft = String(cfg.position || "").includes("left");
    const isCenter = String(cfg.position || "").includes("center");
    const startTransform = isCenter ? "translateY(18px)" : (fromLeft ? "translateX(-24px)" : "translateX(24px)");
    toast.style.cssText = [
      "background: " + palette.bg,
      "color: " + palette.text,
      "border: 1px solid " + palette.accent,
      "box-shadow: 0 16px 38px rgba(0,0,0,.35)",
      "border-radius: 14px",
      "padding: 12px 14px",
      "min-width: 280px",
      "transform: " + startTransform,
      "opacity: 0",
      "transition: transform .22s ease, opacity .22s ease",
      "pointer-events: auto",
      "border-left: 5px solid " + palette.accent
    ].join(";");

    const titleEl = document.createElement("div");
    titleEl.textContent = title || "qBittorrent";
    titleEl.style.cssText = "font-weight:700;font-size:14px;margin-bottom:4px;color:" + palette.text + ";";

    const msgEl = document.createElement("div");
    msgEl.textContent = message || "Művelet kész.";
    msgEl.style.cssText = "font-size:13px;line-height:1.35;color:" + palette.subText + ";";

    toast.appendChild(titleEl);
    toast.appendChild(msgEl);
    stack.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = "translateX(0) translateY(0)";
      toast.style.opacity = "1";
    });

    setTimeout(() => {
      toast.style.transform = startTransform;
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 260);
    }, kind === "error" ? 7000 : 4200);
  } catch (_) {}
}

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "qbitToast") {
    showQbitToast(message.title, message.message, message.kind || "info", message.toast || null);
  }
});

function isTorrentOrMagnet(href) {
  if (!href) return false;
  const lower = href.toLowerCase();
  const noHash = lower.split("#")[0];
  const noQuery = noHash.split("?")[0];
  return lower.startsWith("magnet:") || noQuery.endsWith(".torrent") || lower.includes(".torrent?") || (lower.includes("torrent") && (lower.includes("download") || lower.includes("get") || lower.includes("passkey")));
}

function isMagnet(href) {
  return typeof href === "string" && href.toLowerCase().startsWith("magnet:");
}

function findLink(start) {
  let el = start;
  while (el && el !== document.documentElement) {
    if (el.tagName === "A" && el.href) return el;
    if (el.getAttribute) {
      const dataHref = el.getAttribute("data-href") || el.getAttribute("data-url") || el.getAttribute("data-download") || el.getAttribute("href");
      if (dataHref) return { href: new URL(dataHref, location.href).href };
    }
    el = el.parentElement;
  }
  return null;
}

function filenameFromContentDisposition(value) {
  if (!value) return "";
  const utf = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utf) {
    try { return decodeURIComponent(utf[1].replace(/"/g, "")); } catch (_) {}
  }
  const normal = /filename="?([^";]+)"?/i.exec(value);
  return normal ? normal[1] : "";
}

function guessFileName(url) {
  try {
    const u = new URL(url, location.href);
    let name = decodeURIComponent(u.pathname.split("/").pop() || "download.torrent");
    if (!name.toLowerCase().endsWith(".torrent")) name += ".torrent";
    return name;
  } catch (_) {
    return "download.torrent";
  }
}

async function sendTorrentFileFromPage(url) {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    redirect: "follow",
    headers: {
      "Accept": "application/x-bittorrent,application/octet-stream,*/*"
    }
  });

  if (!res.ok) throw new Error(`Oldali torrent letöltés sikertelen. HTTP ${res.status}`);

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const cdName = filenameFromContentDisposition(res.headers.get("content-disposition") || "");
  const buffer = await res.arrayBuffer();

  if (!buffer || buffer.byteLength === 0) throw new Error("Az oldalon letöltött torrent fájl üres.");
  if (contentType.includes("html") || contentType.includes("text/html")) {
    throw new Error("Az oldal HTML-t adott vissza .torrent helyett. Valószínű session/referer védelem van.");
  }

  return await chrome.runtime.sendMessage({
    type: "uploadFile",
    file: {
      filename: cdName || guessFileName(url),
      bytes: Array.from(new Uint8Array(buffer))
    }
  });
}

function showLocalError(message, cfg) {
  const lang = cfg?.settings?.language || "hu";
  const title = (globalThis.QBIT_I18N && QBIT_I18N.tr) ? QBIT_I18N.tr(lang, "qbitError") : "qBittorrent hiba";
  const fallback = (globalThis.QBIT_I18N && QBIT_I18N.tr) ? QBIT_I18N.tr(lang, "unknownError") : "Ismeretlen hiba";
  showQbitToast(title, message || fallback, "error", cfg?.settings ? {
    position: cfg.settings.toastPosition,
    theme: cfg.settings.toastTheme,
    bg: cfg.settings.toastBg,
    text: cfg.settings.toastText,
    success: cfg.settings.toastSuccess,
    error: cfg.settings.toastError,
    warning: cfg.settings.toastWarning,
    info: cfg.settings.toastInfo
  } : null);
}

document.addEventListener("click", async (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.shiftKey || event.altKey || event.metaKey) return;
  const link = findLink(event.target);
  if (!link || !isTorrentOrMagnet(link.href)) return;

  const cfg = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!cfg?.settings?.autoIntercept) return;

  if (isMagnet(link.href)) {
    event.preventDefault();
    event.stopPropagation();
    chrome.runtime.sendMessage({ type: "sendUrl", url: link.href, source: "click" }, (response) => {
      if (!response?.ok) showLocalError(response?.error || "Ismeretlen hiba", cfg);
    });
    return;
  }

  if (cfg.settings.pageFetchTorrent !== false) {
    if (!cfg.settings.keepChromeDownload) {
      event.preventDefault();
      event.stopPropagation();
    }

    sendTorrentFileFromPage(link.href).then((response) => {
      if (!response?.ok && !cfg.settings.keepChromeDownload) {
        showLocalError(response?.error || "Ismeretlen hiba", cfg);
      }
    }).catch((err) => {
      if (!cfg.settings.keepChromeDownload) {
        chrome.runtime.sendMessage({ type: "sendUrl", url: link.href, source: "click-fallback" }, (response) => {
          if (!response?.ok) showLocalError(response?.error || err.message || "Ismeretlen hiba", cfg);
        });
      }
    });
    return;
  }

  if (!cfg.settings.keepChromeDownload) {
    event.preventDefault();
    event.stopPropagation();
  }

  chrome.runtime.sendMessage({ type: "sendUrl", url: link.href, source: "click" }, (response) => {
    if (!response?.ok && !cfg.settings.keepChromeDownload) {
      showLocalError(response?.error || "Ismeretlen hiba", cfg);
    }
  });
}, true);
