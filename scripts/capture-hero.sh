#!/usr/bin/env bash

# Capture a full-page screenshot of the hero using Stagehand/Playwright
npx playwright test tests/stagehand/homepage-hero.capture.js --reporter=list
