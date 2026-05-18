const ids = [
  "language", "baseUrl", "username", "password", "savePath",
  "autoIntercept", "interceptDownloads", "keepChromeDownload", "uploadTorrentFile",
  "pageFetchTorrent", "fallbackSendUrl", "paused", "showNotifications", "showToasts",
  "closeQbitTabAfterSend", "closeExistingQbitTabAfterSend",
  "authMode", "sendMode", "toastPosition", "toastTheme", "toastBg", "toastText",
  "toastSuccess", "toastError", "toastWarning", "toastInfo"
];

const statusEl = document.getElementById("status");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const languageSelect = document.getElementById("language");
const i18n = window.QBIT_I18N;
let currentLanguage = "hu";

function t(key, vars) {
  return i18n.tr(currentLanguage, key, vars);
}

function populateLanguages() {
  languageSelect.innerHTML = "";
  for (const [code, name] of Object.entries(i18n.LANGUAGES)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    languageSelect.appendChild(option);
  }
}

function applyLanguage(lang) {
  currentLanguage = i18n.normalizeLanguage(lang);
  document.documentElement.lang = currentLanguage;
  document.title = t("optionsTitle");
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  updatePasswordButtonText();
  updateToastPreview();
}

function eyeIcon(visible) {
  if (visible) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3.8 4.3 2.5 21.5 19.7 20.2 21l-3.1-3.1A11.2 11.2 0 0 1 12 19C5.6 19 2 12.8 1.9 12.5L1.6 12l.3-.5c.1-.2 1.5-2.7 4.1-4.6L3 3.8Zm7 7 3.2 3.2A2.4 2.4 0 0 0 10 10.8Zm2-5.8c6.4 0 10 6.2 10.1 6.5l.3.5-.3.5a14.8 14.8 0 0 1-2.6 3.2l-2.2-2.2A5.4 5.4 0 0 0 10.5 6.7L8.8 5A10.8 10.8 0 0 1 12 5Z"/></svg>`;
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5c6.4 0 10 6.2 10.1 6.5l.3.5-.3.5C22 12.8 18.4 19 12 19S2 12.8 1.9 12.5l-.3-.5.3-.5C2 11.2 5.6 5 12 5Zm0 2C7.4 7 4.5 10.7 3.9 12c.7 1.3 3.5 5 8.1 5s7.4-3.7 8.1-5C19.4 10.7 16.6 7 12 7Zm0 2.2a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"/></svg>`;
}

function updatePasswordButtonText() {
  if (!togglePasswordBtn || !passwordInput) return;
  const visible = passwordInput.type === "text";
  togglePasswordBtn.innerHTML = eyeIcon(visible);
  togglePasswordBtn.setAttribute("aria-label", visible ? t("hidePasswordLabel") : t("showPasswordLabel"));
  togglePasswordBtn.title = visible ? t("hidePasswordLabel") : t("showPasswordLabel");
}

if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener("click", () => {
    const visible = passwordInput.type === "text";
    passwordInput.type = visible ? "password" : "text";
    updatePasswordButtonText();
  });
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.className = `status ${isError ? "error" : "ok"}`;
}

function getToastPositionValue() {
  const checked = document.querySelector('input[name="toastPositionOption"]:checked');
  return checked?.value || "bottom-right";
}

function setToastPositionValue(value) {
  const allowed = new Set(["top-left", "top-right", "bottom-left", "bottom-right"]);
  const normalized = allowed.has(value) ? value : "bottom-right";
  const radio = document.querySelector(`input[name="toastPositionOption"][value="${normalized}"]`);
  if (radio) radio.checked = true;
}

function readForm() {
  const obj = {};
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (id === "toastPosition") obj[id] = getToastPositionValue();
    else obj[id] = el.type === "checkbox" ? el.checked : String(el.value || "").trim();
  }
  obj.toastPosition = getToastPositionValue();
  obj.language = i18n.normalizeLanguage(obj.language || currentLanguage);
  obj.authMode = "auto";
  obj.sendMode = "bridge";
  return obj;
}

function fillForm(settings) {
  const cleaned = { ...(settings || {}), authMode: "auto", sendMode: "bridge" };
  for (const id of ids) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (id === "toastPosition") setToastPositionValue(cleaned[id] || "bottom-right");
    else if (id === "language") el.value = i18n.normalizeLanguage(cleaned[id] || navigator.language || "hu");
    else if (el.type === "checkbox") el.checked = Boolean(cleaned[id]);
    else el.value = cleaned[id] ?? "";
  }
  setToastPositionValue(cleaned.toastPosition || "bottom-right");
  applyLanguage(document.getElementById("language").value);
}

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

  if (theme === "custom") {
    return {
      bg: config.bg || "#172238",
      text: config.text || "#f3f5f7",
      accent: config[kind] || config.info || "#4aa3ff",
      subText: config.text || "#f3f5f7"
    };
  }

  const dark = theme === "dark" || (theme === "auto" && isDark);
  const accents = { success: "#58d68d", error: "#ff6b6b", warning: "#ffc857", info: "#4aa3ff" };

  if (dark) {
    const backgrounds = { success: "#0f3d2e", error: "#431b1b", warning: "#4a3715", info: "#172238" };
    return { bg: backgrounds[kind] || backgrounds.info, text: "#f3f5f7", accent: accents[kind] || accents.info, subText: "#d9e1ef" };
  }

  const backgrounds = { success: "#eefaf3", error: "#fff0f0", warning: "#fff8e5", info: "#eef6ff" };
  return { bg: backgrounds[kind] || backgrounds.info, text: "#172033", accent: accents[kind] || accents.info, subText: "#405064" };
}

function currentToastConfig() {
  const settings = readForm();
  return {
    position: settings.toastPosition,
    theme: settings.toastTheme,
    bg: settings.toastBg,
    text: settings.toastText,
    success: settings.toastSuccess,
    error: settings.toastError,
    warning: settings.toastWarning,
    info: settings.toastInfo
  };
}

function updateToastPreview(kind = "success") {
  const box = document.getElementById("toastPreviewBox");
  const title = document.getElementById("toastPreviewTitle");
  const msg = document.getElementById("toastPreviewMessage");
  if (!box || !title || !msg) return;

  const palette = getToastPalette(kind, currentToastConfig());
  box.style.background = palette.bg;
  box.style.color = palette.text;
  box.style.borderColor = palette.accent;
  box.style.borderLeftColor = palette.accent;
  title.style.color = palette.text;
  msg.style.color = palette.subText;
  title.textContent = t("previewTitle");
  msg.textContent = t("previewMessage");
}

function getOrCreateLocalToast() {
  let stack = document.getElementById("qbit-options-live-toast");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "qbit-options-live-toast";

    const toast = document.createElement("div");
    toast.className = "qbit-options-toast-inner";
    toast.style.cssText = [
      "box-shadow:0 16px 38px rgba(0,0,0,.35)",
      "border-radius:14px",
      "padding:12px 14px",
      "min-width:280px",
      "opacity:0",
      "transform:translateY(18px)",
      "transition:transform .18s ease, opacity .18s ease, background .12s ease, color .12s ease, border-color .12s ease"
    ].join(";");

    const title = document.createElement("div");
    title.className = "qbit-options-toast-title";
    title.style.cssText = "font-weight:700;font-size:14px;margin-bottom:4px";

    const msg = document.createElement("div");
    msg.className = "qbit-options-toast-msg";
    msg.style.cssText = "font-size:13px;line-height:1.35";

    toast.appendChild(title);
    toast.appendChild(msg);
    stack.appendChild(toast);
    document.body.appendChild(stack);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });
  }
  return stack;
}

function updateLocalToast(kind = "success", autoHide = false) {
  const cfg = currentToastConfig();
  const palette = getToastPalette(kind, cfg);
  const stack = getOrCreateLocalToast();
  const toast = stack.querySelector(".qbit-options-toast-inner");
  const title = stack.querySelector(".qbit-options-toast-title");
  const msg = stack.querySelector(".qbit-options-toast-msg");

  stack.style.cssText = [
    "position:fixed",
    cfg.position?.includes("top") ? "top:22px" : "bottom:22px",
    cfg.position?.includes("left") ? "left:22px" : (cfg.position?.includes("center") ? "left:50%;transform:translateX(-50%)" : "right:22px"),
    "z-index:2147483647",
    "max-width:min(420px,calc(100vw - 44px))",
    "pointer-events:none"
  ].join(";");

  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";
  toast.style.background = palette.bg;
  toast.style.color = palette.text;
  toast.style.border = `1px solid ${palette.accent}`;
  toast.style.borderLeft = `5px solid ${palette.accent}`;
  title.textContent = t("previewTitle");
  title.style.color = palette.text;
  msg.textContent = t("previewMessage");
  msg.style.color = palette.subText;

  if (stack.hideTimer) clearTimeout(stack.hideTimer);
  if (autoHide) {
    stack.hideTimer = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(18px)";
      setTimeout(() => stack.remove(), 240);
    }, 3200);
  }
}

function showLocalToast(kind = "success") {
  updateLocalToast(kind, true);
}


function previewToast() {
  updateToastPreview("success");
  showLocalToast("success");
  setStatus(t("previewToast") + ".");
}

populateLanguages();

chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
  if (response?.ok) fillForm(response.settings);
  else {
    applyLanguage(navigator.language || "hu");
    setStatus(response?.error || t("unknownError"), true);
  }
});

languageSelect.addEventListener("change", () => {
  applyLanguage(languageSelect.value);
  chrome.runtime.sendMessage({ type: "saveSettings", settings: readForm() }, () => {});
});

function handleToastLiveChange(id) {
  if (["toastBg", "toastText", "toastSuccess", "toastError", "toastWarning", "toastInfo"].includes(id)) {
    const theme = document.getElementById("toastTheme");
    if (theme && theme.value !== "custom") theme.value = "custom";
  }
  updateToastPreview("success");
  showLocalToast("success");
}

for (const id of ["toastTheme", "toastBg", "toastText", "toastSuccess", "toastError", "toastWarning", "toastInfo"]) {
  document.getElementById(id)?.addEventListener("input", () => handleToastLiveChange(id));
  document.getElementById(id)?.addEventListener("change", () => handleToastLiveChange(id));
}

document.querySelectorAll('input[name="toastPositionOption"]').forEach((radio) => {
  radio.addEventListener("change", () => handleToastLiveChange("toastPosition"));
});

for (const id of ids) {
  document.getElementById(id)?.addEventListener("change", () => {
    if (id !== "language") updateToastPreview("success");
  });
}

document.getElementById("save").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "saveSettings", settings: readForm() }, (response) => {
    if (response?.ok) setStatus(t("saved"));
    else setStatus(response?.error || t("savingError"), true);
  });
});

document.getElementById("test").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "saveSettings", settings: readForm() }, () => {
    setStatus(t("testing"));
    chrome.runtime.sendMessage({ type: "testConnection" }, (response) => {
      if (response?.ok) setStatus(t("connectionOk", { version: response.version, authModeUsed: response.authModeUsed }));
      else setStatus(response?.error || t("connectionError"), true);
    });
  });
});

document.getElementById("previewToast")?.addEventListener("click", previewToast);
