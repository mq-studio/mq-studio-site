# Codespaces Guide

## Launch a Codespace
  - Open the repository in GitHub, select **Code**, switch to the **Codespaces** tab, and choose **Create codespace on main**.
  - Wait for the devcontainer build to finish; the terminal will open in `/workspaces/website-mq-studio` with Node.js tooling preinstalled.
  - Run `npm ci` if dependencies have not been installed automatically.

## Run the dev server on port 3100
  - Start the local server with `npm run dev`; the project is already configured to bind to `0.0.0.0:3100`.
  - Leave that terminal running so Stagehand can reach the site; open a second terminal for follow-up commands if needed.

## Share the dev server URL safely
  - In the Codespace sidebar, open the **Ports** tab, locate port `3100`, and change its visibility to **Public**.
  - Copy the generated HTTPS URL; this becomes the value for `MQ_STUDIO_URL` when running Stagehand.
  - After you finish external checks, toggle the port visibility back to **Private** to close public access.

## Capture Stagehand screenshots
  - Sign in to 1Password CLI (`eval "$(op signin)"`) so `op run` can load secrets.
  - Run the capture script from the repo root: `op run --env-file .env.local -- ./scripts/capture-browserbase.mjs` (replace the env file or add `--env` flags if the secrets live elsewhere).
  - By default the script captures `/`, `/artworks`, `/publications`, and `/musings`, saving files such as `tmp/home-browserbase.png` and `tmp/artworks-browserbase.png`.
  - If a teammate still expects the legacy `tmp/hero-browserbase.png` name, copy or rename `tmp/home-browserbase.png` before sharing.

## Download and share the screenshots
  - In the Codespace file explorer, right-click each `tmp/*-browserbase.png` asset and choose **Download**, or run `gh codespace cp $CODESPACE_NAME:/workspaces/website-mq-studio/tmp/home-browserbase.png .` from a local shell.
  - Share the HTTPS preview link and the downloaded PNG with Claude or Gemini to request visual QA feedback on the current build.
