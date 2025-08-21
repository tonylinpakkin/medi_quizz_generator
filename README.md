# Medical Quiz Generator

This is a medical quiz generator that creates multiple choice, true/false, and short answer questions from medical texts using Google's Generative AI.

## Run Locally

**Prerequisites:**  Node.js (version 18 or later)

1. Install dependencies:
   ```
   npm install
   ```

2. Set up your API key:
   - Copy `.env.local.example` to `.env.local`
   - Get your Google AI API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Set `GEMINI_API_KEY` in `.env.local` to your API key

3. Run the app:
   ```
   npm run dev
   ```

## Medical Content Only

The generator verifies that your input relates to medicine. If the text is not medical, an error is displayed and no question is produced.

You can now paste text **or upload PDF, Word and text files** in the Generate Question tab. Uploaded documents are parsed in the browser and their content is placed in the text area for review before generating questions.

## Run Tests

Execute unit tests with [Vitest](https://vitest.dev/):

```
npm run test
```

The test suite mocks the Google Generative AI API so it does not require a real API key or network access.

## Export Saved Questions

In the **Saved Questions** tab you can now export all questions to Word or PDF files.
Click **Export Word** or **Export PDF** to download the document.
