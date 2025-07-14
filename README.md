# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js (version 18 or later)


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
  `npm run dev`

## Run Tests

Execute unit tests with [Vitest](https://vitest.dev/):

```
npm test
```

The test suite mocks the Gemini API so it does not require a real API key or network access.
