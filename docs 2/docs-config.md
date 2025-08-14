# Dokumentation der docs-Konfiguration

Die Datei [`docs-config.json`](./docs-config.json) steuert, ob Inhalte aus
Vorlagenverzeichnissen in generierte Dokumente und den Repository-Kontext
einfließen.

## Template-Inhalte deaktivieren

1. Öffne `docs/docs-config.json`.
2. Setze `includeTemplate` auf `false`.
3. Optional kann das Skript `scripts/generate-docs.mjs` mit der Option
   `--user-only` aufgerufen werden, um Vorlagen unabhängig von der
   Konfiguration auszuschließen. Mit `--all` werden alle Verzeichnisse
   berücksichtigt.

Die Liste `templateDirs` enthält Verzeichnisse, die als Vorlagen behandelt
werden.
