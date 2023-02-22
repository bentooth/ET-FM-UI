FROM node:16-alpine AS BUILD
WORKDIR /src
COPY package*.json .
RUN npm install
COPY . .
COPY /src/ET.ts .
RUN npm run build

FROM node:16-alpine AS RUNTIME
WORKDIR /app
RUN mkdir public
COPY src/public/ ./public/
COPY --from=BUILD /src/dist/public/js/ ./public/js/
COPY src/manifest.json .
COPY src/index.html .

FROM nginx:1.21-alpine
COPY --from=RUNTIME /app/ /usr/share/nginx/html