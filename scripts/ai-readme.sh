#!/usr/bin/env bash
#
# scripts/ai-readme.sh
# Erzeugt README.md aus Repo-Kontext via OpenAI Responses API.
#
# Voraussetzungen:
# - env OPENAI_API_KEY muss gesetzt sein (Repository Secrets)
# - jq muss installiert sein (im Workflow-Step erfolgt das)
# - repo_context.txt muss existieren (von scripts/generate-docs.mjs erzeugt)
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "jq ist nicht installiert. Bitte 'sudo apt-get install -y jq' ausführen." >&2
  exit 1
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "OPENAI_API_KEY ist nicht gesetzt." >&2
  exit 1
fi

if [ ! -s repo_context.txt ]; then
  echo "repo_context.txt fehlt oder ist leer." >&2
  exit 1
fi

# Prompt-Body (Deutsch, technisch, kompakt)
BODY=$'Du bist technischer Redakteur. Lies den Repo-Kontext und erstelle ein\nvollständiges, korrektes, **deutschsprachiges** README.md für dieses Projekt.\n\nMindestinhalte:\n- Kurze Projektbeschreibung (max. 2 Absätze)\n- Features-Liste\n- Installation (macOS/Linux)\n- Lokaler Start (Docker **und** ohne Docker, falls zutreffend)\n- Nutzung mit Beispielen (npm scripts, Container-Start)\n- CI/CD-Beschreibung (Preview, Lint/Tests, Releases auf main)\n- Ordnerstruktur (kurz)\n- Contribution-Hinweise\n- Lizenz-Abschnitt (falls nicht ermittelbar: "TODO: Lizenz ergänzen")\n\nSchreibe kompakt, aber informativ. Nutze Markdown-Überschriften und Codeblöcke.'

INPUT="$(cat repo_context.txt)"

# Request im Messages-Format an /v1/responses
REQ_JSON="$(jq -n \
  --arg model "gpt-5" \
  --arg sys   "$BODY" \
  --arg user  "REPO-KONTEXT:\n$INPUT" \
  --argjson max_output_tokens 5000 \
  '{
     model: $model,
     max_output_tokens: $max_output_tokens,
     input: [
       {role:"system", content:$sys},
       {role:"user",   content:$user}
     ]
   }'
)"

# Call – HTTP-Fehler inklusive Body sichtbar machen
RESP="$(curl --fail-with-body -sS https://api.openai.com/v1/responses \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d "$REQ_JSON" \
)"

# Explizit auf OpenAI-Fehler prüfen
if echo "$RESP" | jq -e '.error? // empty' >/dev/null; then
  echo "OpenAI-Fehler: $(echo "$RESP" | jq -r '.error.message // .error.type')" >&2
  echo "Voller Response:" >&2
  echo "$RESP" | jq . >&2
  exit 1
fi

# Text extrahieren – robust mit Fallback
README_CONTENT="$(echo "$RESP" | jq -r '
  if .output_text? then .output_text
  else .output[0].content[0].text // empty
  end')"

if [ -z "$README_CONTENT" ]; then
  echo "README generation returned empty output. Voller Response folgt:" >&2
  echo "$RESP" | jq . >&2
  exit 1
fi

printf "%s\n" "$README_CONTENT" > README.md

if [ ! -s README.md ]; then
  echo "README ist leer." >&2
  exit 1
fi

echo "README.md erfolgreich generiert."
