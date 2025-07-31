# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js (version 18 or later)


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key

3. Run the app:
  `npm run dev`

## Input Sources

You can paste text directly into the app or upload PDF, Word, or text files. The
content from the file will be extracted automatically for question generation.

## Medical Content Only

The generator verifies that your input relates to medicine. If the text is not medical, an error is displayed and no question is produced.

## Run Tests

Execute unit tests with [Vitest](https://vitest.dev/):

```
npm test
```

The test suite mocks the Gemini API so it does not require a real API key or network access.

## Export Saved MCQs

In the **Saved MCQs** tab you can now export all questions to Word or PDF files.  
Click **Export Word** or **Export PDF** to download the document.
