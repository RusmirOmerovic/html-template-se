# Dockerfile: Dev-Container mit Live-Reload + optional se-tools
FROM node:22-alpine
RUN apk update && apk upgrade --no-cache

# Optional: se-tools in PATH; kann per Build-Arg deaktiviert werden
ARG INSTALL_SE_TOOLS=true
ENV PATH="/usr/local/se-tools:${PATH}" \
    NODE_ENV=development

# Basis-Tools
RUN apk add --no-cache git bash curl

# Arbeitsverzeichnis
WORKDIR /workspace

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm ci || npm i

# Projektdateien
COPY . .

# Dev-Server-Tools (Vite) + Fallback (http-server), falls dev script fehlt
RUN npm i -D vite http-server

# Optional se-tools installieren
RUN if [ "$INSTALL_SE_TOOLS" = "true" ]; then \
      git clone https://github.com/RusmirOmerovic/se-tools.git /usr/local/se-tools && \
      chmod +x /usr/local/se-tools/*; \
    fi

# ✅ Entrypoint-Script ins Image + ausführbar machen
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Dev-Port
EXPOSE 5173

# ✅ Start über Entrypoint
CMD ["/entrypoint.sh"]
