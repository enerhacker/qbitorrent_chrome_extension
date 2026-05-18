const statusEl = document.getElementById("status");
const i18n = window.QBIT_I18N;
let currentLanguage = "hu";

function t(key, vars) {
  return i18n.tr(currentLanguage, key, vars);
}

function applyLanguage(lang) {
  currentLanguage = i18n.normalizeLanguage(lang);
  document.documentElement.lang = currentLanguage;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
}

function setStatus(text, isError = false) {
  statusEl.textContent = text;
  statusEl.className = `status ${isError ? "error" : "ok"}`;
}

chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
  applyLanguage(response?.settings?.language || navigator.language || "hu");
});

document.getElementById("sendUrl").addEventListener("click", () => {
  const url = document.getElementById("url").value.trim();
  if (!url) return setStatus(t("needUrl"), true);
  setStatus(t("sending"));
  chrome.runtime.sendMessage({ type: "sendUrl", url }, (response) => {
    if (response?.ok) setStatus(t("sent"));
    else setStatus(response?.error || t("sendError"), true);
  });
});

document.getElementById("sendFile").addEventListener("click", async () => {
  const input = document.getElementById("file");
  const file = input.files?.[0];
  if (!file) return setStatus(t("needFile"), true);
  setStatus(t("uploading"));
  const buffer = await file.arrayBuffer();
  chrome.runtime.sendMessage({
    type: "uploadFile",
    file: {
      filename: file.name,
      bytes: Array.from(new Uint8Array(buffer))
    }
  }, (response) => {
    if (response?.ok) setStatus(t("uploaded"));
    else setStatus(response?.error || t("uploadError"), true);
  });
});

document.getElementById("openOptions").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("options.html") });
});
