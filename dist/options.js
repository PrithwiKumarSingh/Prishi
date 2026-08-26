"use strict";
(() => {
  // src/options.ts
  var input = document.getElementById("apiKey");
  var saveBtn = document.getElementById("save");
  var status = document.getElementById("status");
  async function load() {
    const stored = await chrome.storage.sync.get("geminiApiKey");
    if (stored.geminiApiKey) {
      input.value = stored.geminiApiKey;
    }
  }
  function setStatus(message, tone) {
    status.textContent = message;
    status.classList.remove("text-red-400", "text-emerald-400");
    status.classList.add(tone === "error" ? "text-red-400" : "text-emerald-400");
  }
  saveBtn.addEventListener("click", async () => {
    const key = input.value.trim();
    if (!key) {
      setStatus("Enter a key first.", "error");
      return;
    }
    await chrome.storage.sync.set({ geminiApiKey: key });
    setStatus("Saved. Select any word on a page to try it.", "success");
  });
  load();
})();
