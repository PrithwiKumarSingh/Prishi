# Prishi

**Don't stop reading. Just understand.**

Prishi is a Chrome extension that helps you understand difficult English words, sentences, and technical documentation without leaving the page.

Select a word, phrase, or sentence while reading, click **Define**, and Prishi uses AI to explain it in simple English based on the surrounding context.

## Features

* Select words, phrases, or sentences on any webpage
* Get AI-powered explanations based on context
* Simple English explanations for easier understanding
* Programming and technical concepts explained in beginner-friendly language
* Shows:

  * Meaning
  * Explanation in context
  * Simple example
* Uses the Gemini API
* API key stored locally using Chrome extension storage
* Built with TypeScript and Manifest V3

## Tech Stack

* TypeScript
* Chrome Extension Manifest V3
* Gemini API
* Tailwind CSS
* esbuild

## Project Structure

```text
prishi/
├── src/
│   ├── background.ts     # Handles Gemini API requests
│   ├── content.ts        # Detects selected text and displays UI
│   ├── options.ts        # Handles API key settings
│   └── styles.css        # Tailwind CSS
│
├── dist/                 # Generated build files
├── icons/                # Extension icons
├── manifest.json
├── options.html
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/prishi.git
```

### 2. Go to the project folder

```bash
cd prishi
```

### 3. Install dependencies

```bash
npm install
```

### 4. Build the extension

```bash
npm run build
```

This generates the required files inside the `dist` folder.

## Load the Extension in Chrome

1. Open Chrome.
2. Go to:

```text
chrome://extensions
```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `prishi` project folder.

The extension should now appear in Chrome.

## Setup Gemini API Key
   - Click the extension icon in the toolbar → it opens the options page
     (or right-click the icon → **Options**)
   - Paste your Gemini API key → **Save key**

You can get a Gemini API key from Google AI Studio.

## How to Use

1. Open any normal webpage.
2. Select a word, phrase, or sentence.
3. Click the **Define** button.
4. Prishi will analyze the selected text and its surrounding context.
5. Read the explanation in simple English.

Example:

```text
Selected text:
deprecated

Meaning:
Old and no longer recommended to use.

In Context:
This feature may still work, but developers should use a newer option because it may be removed later.

Example:
If an old API is deprecated, update your code to use the newer API.
```

## Development

Build the project:

```bash
npm run build
```

Watch for JavaScript and TypeScript changes:

```bash
npm run watch:js
```

Watch for CSS changes:

```bash
npm run watch:css
```

Or run both:

```bash
npm run watch
```

After making changes, reload the extension from:

```text
chrome://extensions
```

Then reload the webpage you are testing on.

## How It Works

```text
Select text on a webpage
        ↓
Content script detects the selection
        ↓
Prishi displays the Define button
        ↓
User clicks Define
        ↓
Message sent to background service worker
        ↓
Background worker calls Gemini API
        ↓
AI generates a simple explanation
        ↓
Prishi displays the result
```

## Why Prishi?

Technical documentation can be difficult when you understand programming concepts but struggle with English vocabulary or complex sentences.

Prishi was built to solve that problem.

Instead of leaving the documentation, opening a dictionary, translating text, and losing context, you can select the difficult text and get a simple explanation directly on the page.

## Roadmap

* [ ] Explain full paragraphs
* [ ] "Explain simpler" option
* [ ] Save difficult words
* [ ] Personal vocabulary list
* [ ] Word history
* [ ] Keyboard shortcuts
* [ ] Better popup animations
* [ ] Copy explanation
* [ ] Dark and light themes
* [ ] Support for more AI providers

## Contributing

Contributions, issues, and feature requests are welcome.

If you have an idea that can make Prishi more useful for developers and English learners, feel free to open an issue or submit a pull request.

## License

This project is open source and available under the MIT License.

---

Built to make reading technical documentation easier.

**Prishi — Don't stop reading. Just understand.**
