// Content script: watches for text selections, shows a small "Define" pill
// near the selection, and on click asks the background worker for a
// definition, then displays it in a floating card.

const MAX_SELECTION_WORDS = 30;
const CONTEXT_RADIUS = 400; // characters of surrounding text to send as context

let trigger: HTMLButtonElement | null = null;
let card: HTMLDivElement | null = null;

function removeTrigger() {
  trigger?.remove();
  trigger = null;
}

function removeCard() {
  card?.remove();
  card = null;
}

function getSurroundingContext(range: Range): string {
  const node = range.startContainer;
  const text = node.textContent ?? node.parentElement?.textContent ?? "";
  if (!text) return "";

  const idx = Math.max(0, text.indexOf(range.toString()));
  const start = Math.max(0, idx - CONTEXT_RADIUS);
  const end = Math.min(text.length, idx + range.toString().length + CONTEXT_RADIUS);
  return text.slice(start, end).replace(/\s+/g, " ").trim();
}

function placeNear(el: HTMLElement, rect: DOMRect) {
  const top = window.scrollY + rect.top - el.offsetHeight - 10;
  const left = window.scrollX + rect.left;
  el.style.top = `${Math.max(window.scrollY + 4, top)}px`;
  el.style.left = `${Math.max(4, left)}px`;
}

const TRIGGER_CLASSES =
  "define-it-trigger absolute z-[2147483647] rounded-full bg-neutral-900 text-neutral-50 " +
  "text-xs font-semibold tracking-wide px-3 py-1.5 shadow-lg cursor-pointer border-0 " +
  "hover:-translate-y-0.5 transition-transform font-sans";

const CARD_CLASSES =
  "define-it-card absolute z-[2147483647] max-w-xs rounded-lg bg-neutral-900 text-neutral-50 " +
  "shadow-2xl px-3.5 py-3 text-[13.5px] leading-relaxed font-sans";

function showTrigger(selectionText: string, rect: DOMRect, context: string) {
  removeTrigger();
  removeCard();

  trigger = document.createElement("button");
  trigger.className = TRIGGER_CLASSES;
  trigger.type = "button";
  trigger.textContent = "Define";
  document.body.appendChild(trigger);
  placeNear(trigger, rect);

  trigger.addEventListener("mousedown", (e) => {
    // mousedown (not click) so it fires before the selection is cleared.
    e.preventDefault();
    requestDefinition(selectionText, context, rect);
  });
}

function createResultUI(term: string, body: string): string {
  const sections = body.split(/\n(?=MEANING:|IN CONTEXT:|EXAMPLE:)/);

  let meaning = "";
  let context = "";
  let example = "";

  for (const section of sections) {
    if (section.startsWith("MEANING:")) {
      meaning = section.replace("MEANING:", "").trim();
    }

    if (section.startsWith("IN CONTEXT:")) {
      context = section.replace("IN CONTEXT:", "").trim();
    }

    if (section.startsWith("EXAMPLE:")) {
      example = section.replace("EXAMPLE:", "").trim();
    }
  }

  return `
    <div class="flex items-start justify-between gap-4 mb-4">
      <div>
        <div class="flex items-center gap-2">
          <div class="h-7 w-7 rounded-lg bg-orange-400/10 flex items-center justify-center text-orange-400 text-sm">
            ✦
          </div>

          <div>
            <div class="text-[15px] font-semibold text-zinc-100">
              ${escapeHtml(term)}
            </div>

            <div class="text-[11px] text-zinc-500">
              Contextual explanation
            </div>
          </div>
        </div>
      </div>
    </div>

    ${
      meaning
        ? `
      <div class="text-[14px] leading-6 text-zinc-200">
        ${escapeHtml(meaning)}
      </div>
    `
        : ""
    }

    ${
      context
        ? `
      <div class="border-t border-zinc-800 my-4"></div>

      <div class="text-[11px] font-medium uppercase tracking-wider text-orange-400 mb-1.5">
        In this context
      </div>

      <div class="text-[13px] leading-6 text-zinc-400">
        ${escapeHtml(context)}
      </div>
    `
        : ""
    }

    ${
      example
        ? `
      <div class="mt-4 rounded-xl bg-zinc-800/70 border border-zinc-700/40 px-3 py-2.5">

        <div class="text-[11px] font-medium uppercase tracking-wider text-zinc-500 mb-1">
          Example
        </div>

        <div class="text-[12.5px] leading-5 text-zinc-300">
          ${escapeHtml(example)}
        </div>

      </div>
    `
        : ""
    }
  `;
}

function showCard(
  rect: DOMRect,
  state: "loading" | "result" | "error",
  body: string,
  term: string
) {
  removeCard();
  removeTrigger();

  card = document.createElement("div");

  card.className =
    "define-it-card absolute z-[2147483647] w-[380px] " +
    "rounded-2xl bg-[#18181b] text-zinc-100 " +
    "border border-zinc-700/60 shadow-2xl " +
    "px-4 py-4 font-sans";

  if (state === "loading") {
    card.innerHTML = `
      <div class="flex items-center gap-2.5">
        <div class="h-4 w-4 rounded-full border-2 border-orange-400/30 border-t-orange-400 animate-spin"></div>

        <div>
          <div class="text-[13px] font-semibold text-zinc-100">
            Understanding "${escapeHtml(term)}"
          </div>

          <div class="text-[12px] text-zinc-400 mt-0.5">
            Looking at the context...
          </div>
        </div>
      </div>
    `;
  } else if (state === "error") {
    card.innerHTML = `
      <div class="flex gap-3">
        <div class="text-red-400 text-lg">!</div>

        <div>
          <div class="text-sm font-semibold text-zinc-100">
            Something went wrong
          </div>

          <div class="mt-1 text-[13px] leading-relaxed text-red-300">
            ${escapeHtml(body)}
          </div>
        </div>
      </div>
    `;
  } else {
    card.innerHTML = createResultUI(term, body);
  }

  document.body.appendChild(card);
  placeNear(card, rect);

  if (state !== "loading") {
    const dismiss = (e: MouseEvent) => {
      if (card && !card.contains(e.target as Node)) {
        removeCard();
        document.removeEventListener("mousedown", dismiss);
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", dismiss);
    }, 0);
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function requestDefinition(term: string, context: string, rect: DOMRect) {
  showCard(rect, "loading", "", term);

  chrome.runtime.sendMessage({ type: "DEFINE", term, context }, (response) => {
    if (chrome.runtime.lastError) {
      showCard(rect, "error", chrome.runtime.lastError.message ?? "Something went wrong.", term);
      return;
    }
    if (response?.ok) {
      showCard(rect, "result", response.definition, term);
    } else {
      showCard(rect, "error", response?.error ?? "Something went wrong.", term);
    }
  });
}

document.addEventListener("mouseup", (e) => {
  // Don't reopen the trigger for clicks inside our own UI.
  if ((e.target as HTMLElement)?.closest?.(".define-it-trigger, .define-it-card")) return;

  const selection = window.getSelection();
  const text = selection?.toString().trim() ?? "";

  if (!text || text.split(/\s+/).length > MAX_SELECTION_WORDS || !selection?.rangeCount) {
    removeTrigger();
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;

  const context = getSurroundingContext(range);
  showTrigger(text, rect, context);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    removeTrigger();
    removeCard();
  }
});

document.addEventListener("mousedown", (e) => {
  if ((e.target as HTMLElement)?.closest?.(".define-it-trigger, .define-it-card")) return;
  removeTrigger();
});
