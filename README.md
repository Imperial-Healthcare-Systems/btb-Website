# Beyond The Body — Coming Soon (Next.js)

Production-ready Next.js 14 (App Router, TypeScript) port of the original `index (4).html` coming-soon page.

## Stack
- Next.js 14 App Router
- React 18 + TypeScript (strict)
- `next/font/google` (Fraunces + Jost, self-hosted at build)
- API route stub at `/api/subscribe`

## Run locally
```bash
npm install
cp .env.example .env.local   # edit NEXT_PUBLIC_LAUNCH_DATE
npm run dev                  # http://localhost:3000
```

## Configure the launch date
Set `NEXT_PUBLIC_LAUNCH_DATE` in `.env.local` (or in your hosting provider's env panel) to an ISO 8601 UTC timestamp, e.g.:
```
NEXT_PUBLIC_LAUNCH_DATE="2026-08-01T00:00:00Z"
```
If unset, the countdown falls back to 45 days from build time.

## Email signup
The form posts to `app/api/subscribe/route.ts`. By default it validates the email and logs it server-side. Wire it to your ESP (Klaviyo, Mailchimp, Shopify, etc.) by extending that route and adding the appropriate env vars to `.env.example`.

## Build & deploy

### Vercel (zero-config)
1. Push this folder to a Git repo.
2. Import into Vercel — it auto-detects Next.js.
3. Set `NEXT_PUBLIC_LAUNCH_DATE` in Project → Settings → Environment Variables.

### Any Node host (Render, Railway, Fly, self-hosted)
```bash
npm install
npm run build
npm start          # starts on $PORT (default 3000)
```

### Docker
A minimal Dockerfile:
```dockerfile
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci || npm install

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

## Notes
- Assets are served from `public/`:
  - `public/logo.png` — brand mark (~128 KB)
  - `public/hero.jpg` — hero image (~220 KB)
  - `public/corner.svg` — gold-thread ornament (animations are embedded in the SVG so it works via `<img>`)
  - `public/favicon.svg`
- The original `index (4).html` and `updated_UI_BTB.html` are preserved next to this folder for reference.
- Ember animation is canvas-based and runs inside `app/ComingSoon.tsx` via a `useEffect` hook.
