#!/usr/bin/env bash
# Run a command with environment variables pulled from 1Password secrets.
set -euo pipefail

TEMPLATE=".devcontainer/secrets.template"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --template)
      shift
      [[ $# -gt 0 ]] || { echo "Missing value for --template" >&2; exit 1; }
      TEMPLATE="$1"
      shift
      ;;
    --help|-h)
      cat <<'USAGE'
Usage: run-with-secrets.sh [--template path] -- <command> [args...]

Example:
  .devcontainer/run-with-secrets.sh -- npm run dev

The template file should contain entries such as:
  OPENAI_API_KEY=op://Development/OpenAI/api_key
USAGE
      exit 0
      ;;
    --)
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

if ! command -v op >/dev/null 2>&1; then
  echo "1Password CLI (op) is not installed or not on PATH" >&2
  exit 1
fi

if ! op account get >/dev/null 2>&1; then
  echo "Not signed in to 1Password. Run: eval \"$(op signin)\"" >&2
  exit 1
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "Template file '$TEMPLATE' not found" >&2
  exit 1
fi

if [[ $# -eq 0 ]]; then
  echo "No command provided. Use --help for usage." >&2
  exit 1
fi

# op run resolves op:// references from the template and scopes them to the spawned command.
op run --env-file="$TEMPLATE" -- "$@"
