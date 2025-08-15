#!/usr/bin/env bash
set -euo pipefail

: "${OPENAI_API_KEY:?OPENAI_API_KEY not set}"

# -------- Prompt-Body --------
BODY=$(
  cat <<'EOF'
Du bist ein technischer Redakteur. Erstelle ein vollständiges, **deutschsprachiges** README.md für dieses Repository basierend auf dem bereitgestellten Repo-Kontext.
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

# -------- Repo-Kontext laden --------
INPUT="$(cat repo_context.txt)"

# -------- User-Content vorbereiten & JSON-escapen --------
USER_CONTENT="$(printf '%s\n\n---\nREPO-KONTEXT:\n%s' "$BODY" "$INPUT" | jq -Rs .)"

# -------- API-Call --------
RESP="$(
  curl -sS https://api.openai.com/v1/chat/completions \
    -H "Authorization: Bearer ${OPENAI_API_KEY}" \
    -H "Content-Type: application/json" \
    -d @- <<JSON
{
  "model": "gpt-4o-mini",
  "temperature": 0.3,
  "max_tokens": 4000,
  "messages": [
    { "role": "system", "content": "Du bist ein präziser, technischer Redakteur." },
    { "role": "user",   "content": ${USER_CONTENT} }
  ]
}
JSON
)"

# -------- Inhalt extrahieren --------
CONTENT="$(printf '%s' "$RESP" | jq -r '.choices[0].message.content // ""')"

if [ -z "$CONTENT" ]; then
  echo "README generation returned empty output." >&2
  printf '%s\n' "$RESP" | jq -r '.' >&2 || true
  exit 1
fi

printf '%s\n' "$CONTENT" > README.md
if [ ! -s README.md ]; then
  echo "README is empty after write." >&2
  exit 1
fi

echo "README.md written."
