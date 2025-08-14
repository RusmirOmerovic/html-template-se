# Dockerfile – Dev-Container mit Live-Reload + optional se-tools
FROM node:20-alpine

# Optional: se-tools in PATH; kann per Build-Arg deaktiviert werden
ARG INSTALL_SE_TOOLS=true # build arg to skip se-tools if set to false
ENV PATH="/usr/local/se-tools:${PATH}" \
    NODE_ENV=development

# Basis-Tools
RUN apk add --no-cache git bash curl

# Arbeitsverzeichnis
WORKDIR /workspace

# Abhängigkeiten installieren (schneller durch separaten Copy der package-files)
COPY package*.json ./
RUN npm ci || npm i # use lockfile when available, otherwise regular install

# Projektdateien
COPY . .

# Dev-Server-Tools (Vite) + Fallback (http-server), falls dev script fehlt
RUN npm i -D vite http-server # dev servers for local preview

# Optional se-tools installieren
RUN if [ "$INSTALL_SE_TOOLS" = "true" ]; then \
      git clone https://github.com/RusmirOmerovic/se-tools.git /usr/local/se-tools && \
      chmod +x /usr/local/se-tools/*; \
    fi # optional tooling for Software Engineering course

# Dev-Port
EXPOSE 5173

# Start: erst npm script, sonst Vite, sonst http-server als Fallback
CMD ["sh","-c","npm run dev || npx vite --host 0.0.0.0 --port 5173 || npx http-server -p 5173 ."] # try project dev script first

