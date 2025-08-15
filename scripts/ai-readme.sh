#!/usr/bin/env bash
set -euo pipefail

: "${OPENAI_API_KEY:?OPENAI_API_KEY not set}"

FORCE_REFRESH="${1:-false}"

# Falls per workflow_dispatch gesetzt:
if [ -n "${GITHUB_EVENT_PATH:-}" ] && [ -f "$GITHUB_EVENT_PATH" ]; then
  fr=$(jq -r '.inputs.force_refresh // empty' "$GITHUB_EVENT_PATH" || true)
  if [ -n "$fr" ]; then FORCE_REFRESH="$fr"; fi
fi

echo "Force refresh: $FORCE_REFRESH"

BODY=$(cat <<'EOF'
Du bist ein technischer Redakteur. Erstelle ein vollständiges, **deutschsprachiges** `README.md` für dieses Repository basierend auf dem bereitgestellten Repo-Kontext.
Schreibe präzise, pragmatisch und mit Codebeispielen. Verwende Markdown-Überschriften, Tabellen und Codeblöcke.

MUSS-ABSCHNITTE:
- Projektkurzbeschreibung (2 Absätze) + Ziel/Nutzen
- Featureliste (stichpunktartig)
- Schnellstart (npm + optional Docker)
- Installation (macOS/Linux) mit konkreten Befehlen
- Nutzung mit Beispielen (npm scripts Tabelle, Start/Build/Test)
- CI/CD (welche Workflows, was prüfen sie, was passiert auf main)
- Ordnerstruktur (kurze Tabelle)
- Troubleshooting (3–5 typische Stolpersteine + Lösungen)
- Contribution (kurz)
- Lizenz (falls unbekannt: "TODO: Lizenz ergänzen")

STIL:
- Kurze Sätze, aktive Sprache, klare Befehle.
- Keine Floskeln, lieber konkrete Kommandos/Beispiele.
- Kein Inhalt ins Wiki verschieben – dieses Dokument ist das Repo-README.

Gib NUR den Markdown-Inhalt aus, ohne Backticks drum herum.
EOF
)

INPUT="$(cat repo_context.txt)"

# JSON sicher quoten (ohne Bash-Erweiterungen, nur jq)
USER_PAYLOAD=$(printf '%s\n\n---\nREPO-KONTEXT:\n%s\n' "$BODY" "$INPUT" | jq -Rs .)

RESP="$(curl -sS https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d @- <<JSON
{
  "model": "gpt-4o-mini",
  "temperature": 0.3,
  "max_tokens": 4000,
  "messages": [
    {"role":"system","content":"Du bist ein präziser, technischer Redakteur."},
    {"role":"user","content": ${USER_PAYLOAD}}
  ]
}
JSON
)"

CONTENT="$(printf '%s' "$RESP" | jq -r '.choices[0].message.content // ""')"

if [ -z "$CONTENT" ]; then
  echo "README generation returned empty output." >&2
  echo "$RESP" | jq -r '.' >&2 || true
  exit 1
fi

# Falls kein Force-Refresh: nur schreiben, wenn sich etwas ändert
if [ "$FORCE_REFRESH" != "true" ] && [ -f README.md ]; then
  if printf '%s' "$CONTENT" | diff -q - README.md >/dev/null 2>&1; then
    echo "README unverändert – kein Schreibvorgang."
    exit 0
  fi
fi

printf '%s\n' "$CONTENT" > README.md
[ -s README.md ] || { echo "README is empty after write." >&2; exit 1; }
echo "README.md written."