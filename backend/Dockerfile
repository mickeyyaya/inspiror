# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN echo '{"extends":"./tsconfig.json","compilerOptions":{"rootDir":"./src","outDir":"./dist","verbatimModuleSyntax":false,"module":"commonjs","moduleResolution":"node","esModuleInterop":true,"skipLibCheck":true,"strict":false,"exactOptionalPropertyTypes":false},"include":["src"]}' > tsconfig.build.json && npx tsc -p tsconfig.build.json

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/server.js"]
