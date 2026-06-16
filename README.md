# E-book Generator

A Next.js app for turning content into styled, themeable e-books and exporting them as PDFs. Supports interactive editing in the browser, server-side Puppeteer export for large documents, and event-driven PDF generation via Kafka for external services.

## Tech stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **UI** | React 18, TypeScript, Tailwind CSS |
| **PDF rendering** | Puppeteer (preview-accurate export via `/export-render`) |
| **Client PDF** | Browser print, jsPDF, html2canvas, `@react-pdf/renderer` |
| **PDF parsing** | pdfjs-dist |
| **Email templates** | MJML |
| **Job queue** | BullMQ + Redis (optional, large UI exports) |
| **Event bus** | Apache Kafka + KafkaJS |
| **File storage** | Cloudinary (Kafka PDF uploads; public URLs) |
| **AI / images** | Groq API, Pollinations API |
| **Runtime** | Node.js 20 |
| **Containers** | Docker Compose (Kafka, app, Kafka consumer worker) |

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser UI (Next.js :3000)                                     │
│  Upload PDF → edit themes → export (print or queued worker)     │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   Browser print      BullMQ worker         Kafka consumer
   (≤30 pages)        (Redis + Puppeteer)   (Puppeteer + Cloudinary)
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                    /export-render (React PageLayout)
                             │
                         PDF output
```

### PDF export paths

1. **Small exports (≤30 pages)** — browser print from the same React preview (`PageLayout`).
2. **Large UI exports** — BullMQ worker opens `/export-render` with Puppeteer and saves locally.
3. **Kafka newsletter flow** — external producer publishes to `NEWS_LETTER_PDF`; the consumer generates a PDF, uploads to Cloudinary, and replies on `NEWS_LETTER_PDF_COMPLETED` with a public `downloadUrl`.

## Docker services

| Service | Container | Port | Role |
|---------|-----------|------|------|
| `kafka` | `kafka` | **9092** | Kafka broker |
| `app` | `ebook-service` | **3000** | Next.js production app |
| `kafka-consumer` | `ebook-kafka-consumer` | — | PDF worker (Kafka → Puppeteer → Cloudinary) |

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f
```

Inside Docker, services reach each other by name (`kafka:29092`, `http://app:3000`). External producers use `<server-ip>:9092`.

## Local development

### Prerequisites

- Node.js 20+
- Chrome/Chromium (for Puppeteer): `npm run install:chrome`

### Setup

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at http://localhost:3000.

### Optional: Kafka (local, without full Docker stack)

```bash
docker compose up kafka -d
npm run kafka:consumer          # Terminal 1 — PDF consumer
npm run kafka:test-publish -- editorial   # Terminal 2 — test event
```

### Optional: BullMQ large exports

Requires Redis. Start the worker in a separate terminal:

```bash
npm run worker
```

## Environment variables

Copy `.env.example` to `.env`. Key settings:

| Variable | Purpose |
|----------|---------|
| `VITE_GROQ_API_KEY` | Groq API for content assistance |
| `VITE_POLLINATIONS_API_KEY` | AI image generation |
| `APP_URL` | Internal app URL (Puppeteer render target) |
| `PUBLIC_APP_URL` | Public URL in download links (set to server IP in production) |
| `EXPORT_RENDER_SECRET` | Auth token for `/export-render` |
| `KAFKA_BROKERS` | Kafka broker (`127.0.0.1:9092` local, `kafka:29092` in Docker) |
| `KAFKA_ADVERTISED_HOST` | Server IP for external Kafka clients (Docker) |
| `CLOUDINARY_*` | Cloudinary credentials for Kafka PDF uploads |
| `REDIS_URL` | Redis for BullMQ (optional) |

## Kafka integration

External systems (producers) publish PDF requests; this app consumes them and responds with a download URL.

| Setting | Value |
|---------|--------|
| Broker (external) | `<server-ip>:9092` |
| Publish topic | `NEWS_LETTER_PDF` |
| Success topic | `NEWS_LETTER_PDF_COMPLETED` |
| Failure topic | `NEWS_LETTER_PDF_FAILED` |

### Request event

```json
{
  "eventType": "NEWS_LETTER_PDF",
  "eventId": "unique-request-id",
  "blogId": "content-id",
  "title": "Newsletter Title",
  "content": "Plain text or HTML body",
  "author": "Optional",
  "theme": "editorial",
  "dimensions": "a4"
}
```

### Completed event

```json
{
  "eventType": "NEWS_LETTER_PDF_COMPLETED",
  "eventId": "unique-request-id",
  "blogId": "content-id",
  "filename": "Newsletter_Title.pdf",
  "pageCount": 12,
  "downloadUrl": "https://res.cloudinary.com/.../newsletter-pdfs/unique-request-id.pdf",
  "completedAt": "2026-06-15T10:00:00.000Z"
}
```

When Cloudinary is configured, `downloadUrl` is a public Cloudinary HTTPS link. Otherwise it falls back to `{PUBLIC_APP_URL}/api/blog-pdf/download/{eventId}`.

**Themes:** `editorial`, `botanical`, `modern`, `noir`, `wanderlust`, `softpink`, `comic`, `sporty`, `wellness`, `newspaper`, `bloodred`, `minimalblack`, `rose`, `lavender`, `bolddark`

## NPM scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run worker` | BullMQ PDF export worker |
| `npm run kafka:consumer` | Kafka newsletter PDF consumer |
| `npm run kafka:test-publish` | Publish a test Kafka event |
| `npm run kafka:create-topics` | Create Kafka topics |
| `npm run docker:up` | Build and start Docker stack |
| `npm run docker:down` | Stop Docker stack |
| `npm run install:chrome` | Install Puppeteer Chrome |

## Project structure

```
app/                    Next.js App Router (pages, API routes, components)
lib/
  kafka/                Kafka types, consumer handler, topic setup
  queue/                BullMQ queue and job types
  templates/            Page HTML templates
  themes/               Theme config and styles
  utils/                PDF export, Cloudinary, parsing, AI helpers
workers/
  kafka-blog-consumer.ts
  pdf-export-worker.ts
scripts/                Kafka test publisher, topic creation
Dockerfile              Next.js production image
Dockerfile.worker       Kafka consumer worker (Chromium + Puppeteer)
docker-compose.yml      Kafka + app + consumer
```

## Production notes

- Set `KAFKA_ADVERTISED_HOST` and `PUBLIC_APP_URL` to your server's reachable IP or domain before sharing Kafka access externally.
- Open firewall ports **9092** (Kafka) and **3000** (app) if producers/download clients are outside your network.
- Configure Cloudinary env vars on `kafka-consumer` for public PDF URLs without exposing your app server.
