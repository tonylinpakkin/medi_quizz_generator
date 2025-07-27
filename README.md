# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js (version 18 or later)


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key.
   Vite exposes this value in the code as `process.env.API_KEY` (and also as
   `process.env.GEMINI_API_KEY`).
3. Run the app:
  `npm run dev`

## Run Tests

Execute unit tests with [Vitest](https://vitest.dev/):

```
npm test
```

The test suite mocks the Gemini API so it does not require a real API key or network access.

## Export Saved MCQs

In the **Saved MCQs** tab you can now export all questions to Word or PDF files.  
Click **Export Word** or **Export PDF** to download the document.
