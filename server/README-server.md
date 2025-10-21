    # Server README - RivalismeUniverse Integration


    ## Overview

This server provides an API endpoint to generate persona data using Deepseek (primary), with Gemini and OpenRouter as fallbacks. It will fetch or fallback to an image, build NFT-ready metadata, upload to Pinata using API key + secret, and return the result for the frontend to display and persist.

## Setup

1. Copy `.env.example` to `.env` and fill in the values for:

```
DEEPSEEK_KEY=
DEEPSEEK_URL=
GEMINI_API_KEY=
OPENROUTER_API_KEY=
FREEPIK_KEY=
PINATA_API_KEY=
PINATA_SECRET=
SERVER_BASE_URL=http://localhost:3000
PORT=3000
```

2. Install dependencies (run in project root):

```bash
npm install express dotenv body-parser node-fetch
```

3. Start the server:

```bash
node server/index.js
```

## Usage

- Open `http://localhost:3000/index.html` and click **Generate Persona**.
- After generation completes, open `http://localhost:3000/personas.html` to see the new persona card.

## Notes & Troubleshooting
- Ensure your API keys are valid.
- If Deepseek endpoint URL differs, update `DEEPSEEK_URL` in `.env`.
- Pinata upload uses `pinata_api_key` and `pinata_secret_api_key` in headers.
- AI responses may not return perfect JSON; server attempts to extract JSON from model responses.

