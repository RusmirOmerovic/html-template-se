#!/usr/bin/env bash
# scripts/ai-readme.sh – README via OpenAI, mit Auto-Fallback gpt-4o -> gpt-3.5-turbo
set -euo pipefail

req() { curl --fail-with-body -sS "$@"; }

# --- Checks ---
command -v jq >/dev/null || { echo "jq fehlt." >&2; exit 1; }
[ -n "${OPENAI_API_KEY:-}" ] || { echo "OPENAI_API_KEY fehlt." >&2; exit 1; }
[ -s repo_context.txt ] || { echo "repo_context.txt fehlt/leer." >&2; exit 1; }

# --- Prompt ---
BODY=$'Du bist technischer Redakteur. Lies den Repo-Kontext und erstelle ein\nvollständiges, korrektes, **deutschsprachiges** README.md für dieses Projekt.\n\nMindestinhalte:\n- Kurze Projektbeschreibung (max. 2 Absätze)\n- Features-Liste\n- Installation (macOS/Linux)\n- Lokaler Start (Docker **und** ohne Docker, falls zutreffend)\n- Nutzung mit Beispielen (npm scripts, Container-Start)\n- CI/CD-Beschreibung (Preview, Lint/Tests, Releases auf main)\n- Ordnerstruktur (kurz)\n- Contribution-Hinweise\n- Lizenz-Abschnitt (falls nicht ermittelbar: "TODO: Lizenz ergänzen")\n\nSchreibe kompakt, aber informativ. Nutze Markdown-Überschriften und Codeblöcke.'
INPUT="$(cat repo_context.txt)"

AUTH=(-H "Authorization: Bearer ${OPENAI_API_KEY}" -H "Content-Type: application/json")

# --- Modelle prüfen ---
MODELS_JSON="$(req https://api.openai.com/v1/models "${AUTH[@]}")" || {
  echo "Konnte /v1/models nicht abrufen." >&2; exit 1;
}

have_model() { echo "$MODELS_JSON" | jq -e --arg m "$1" '.data[]?|select(.id==$m)' >/dev/null; }

MODEL="gpt-3.5-turbo" # Standard-Fallback
if have_model "gpt-4o"; then
  MODEL="gpt-4o"
fi

echo "📄 Verwende Modell: $MODEL"

# --- Request an /v1/chat/completions ---
SYS="$BODY"
USR="REPO-KONTEXT:\n$INPUT"

REQ_JSON="$(jq -n --arg model "$MODEL" --arg sys "$SYS" --arg user "$USR" \
  --argjson max_tokens 3500 \
  '{model:$model,max_tokens:$max_tokens,
    messages:[{role:"system",content:$sys},{role:"user",content:$user}] }')"

RESP="$(req https://api.openai.com/v1/chat/completions "${AUTH[@]}" -d "$REQ_JSON")" || {
  echo "API-Call fehlgeschlagen. Voller Response folgt:" >&2; echo "${RESP:-}" | jq . >&2
  exit 1
}

if echo "$RESP" | jq -e '.error? // empty' >/dev/null; then
  echo "OpenAI-Fehler: $(echo "$RESP" | jq -r '.error.message // .error.type')" >&2
  exit 1
fi

CONTENT="$(echo "$RESP" | jq -r '.choices[0].message.content // empty')"
[ -n "${CONTENT:-}" ] || { echo "Leere Antwort vom Modell." >&2; exit 1; }

printf "%s\n" "$CONTENT" > README.md
[ -s README.md ] || { echo "README ist leer." >&2; exit 1; }

echo "✅ README.md erfolgreich generiert mit Modell: $MODEL"
