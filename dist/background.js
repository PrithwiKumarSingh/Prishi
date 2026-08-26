"use strict";
(() => {
  // src/background.ts
  var GEMINI_MODEL = "gemini-3.1-flash-lite";
  var GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  async function getApiKey() {
    const stored = await chrome.storage.sync.get("geminiApiKey");
    return stored.geminiApiKey;
  }
  function buildPrompt(term, context) {
    return `
You help a software developer understand English and technical documentation.

The user is still learning English.

Selected text:
"${term}"

Context:
"""${context}"""

Explain the selected text in VERY SIMPLE ENGLISH.

Use this exact format:

MEANING:
Explain the meaning using very easy English.
Use only 1 short sentence.

IN CONTEXT:
Explain what it means in this specific sentence.
Use simple words and short sentences.

EXAMPLE:
Give one very simple programming example.

IMPORTANT RULES:
- Use very easy English.
- Write like you are explaining to a beginner.
- Use short sentences.
- Avoid difficult words.
- Do not use dictionary-style language.
- Do not use advanced synonyms.
- If you use a difficult word, explain it with an easier word.
- Focus on understanding, not grammar.
- If the selected text is a sentence, explain the whole sentence simply.
- If it is a technical term, explain what it does in simple words.
- Keep the entire answer under 70 words.
- Do not use Markdown symbols such as **, #, or bullet points.
`;
  }
  async function fetchDefinition(term, context) {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return {
        ok: false,
        error: "No Gemini API key set."
      };
    }
    console.log("Starting Gemini request...");
    console.log("Model:", GEMINI_MODEL);
    console.log("Term:", term);
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 15e3);
    try {
      const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(term, context)
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 200
          }
        }),
        signal: controller.signal
      });
      console.log("Gemini response status:", res.status);
      if (!res.ok) {
        const body = await res.text();
        console.error("Gemini error:", body);
        return {
          ok: false,
          error: `Gemini API error (${res.status}): ${body.slice(0, 300)}`
        };
      }
      const data = await res.json();
      console.log("Gemini response:", data);
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        return {
          ok: false,
          error: "Gemini returned an empty response."
        };
      }
      return {
        ok: true,
        definition: text.trim()
      };
    } catch (err) {
      console.error("Gemini request failed:", err);
      if (err.name === "AbortError") {
        return {
          ok: false,
          error: "Gemini request timed out after 15 seconds."
        };
      }
      return {
        ok: false,
        error: `Request failed: ${err.message}`
      };
    } finally {
      clearTimeout(timeout);
    }
  }
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "DEFINE") return;
    fetchDefinition(message.term, message.context).then(sendResponse);
    return true;
  });
})();
