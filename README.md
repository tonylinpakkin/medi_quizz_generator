# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

To start the backend API alongside Vite during development run:
   `npm run server`
The server listens on `http://localhost:3001` and provides REST endpoints
under `/mcqs` for storing generated questions.
