const input = document.getElementById("apiKey") as HTMLInputElement;
const saveBtn = document.getElementById("save") as HTMLButtonElement;
const status = document.getElementById("status") as HTMLDivElement;

async function load() {
  const stored = await chrome.storage.sync.get("geminiApiKey");
  if (stored.geminiApiKey) {
    input.value = stored.geminiApiKey;
  }
}

function setStatus(message: string, tone: "error" | "success") {
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
