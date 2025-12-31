# URL Shortener (Bun) [![CI](https://github.com/aburkut/urlshotener-bun/actions/workflows/ci.yml/badge.svg)](https://github.com/aburkut/urlshotener-bun/actions/workflows/ci.yml)

Fast and modern URL shortener built with Bun, Hono, and PostgreSQL.

## Features

- ⚡️ Built with [Bun](https://bun.com) runtime
- 🚀 Lightweight [Hono](https://hono.dev) framework
- 🗄️ PostgreSQL database with Prisma ORM
- 📚 OpenAPI/Swagger documentation with Scalar UI
- ✅ Full test coverage (unit + integration)
- 🔍 Biome linter and formatter
- 🐳 Docker support
- 🤖 GitHub Actions CI/CD
- 🌐 CORS support

## Tech Stack

- **Runtime**: Bun 1.3.5
- **Framework**: Hono
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Validation**: Zod
- **Testing**: Bun test + snapshots
- **Linting**: Biome

## Installation

```bash
bun install
```

## Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/urlshortener
PORT=8080
CORS_ORIGIN=*  # or specific domain like https://example.com
```

## Database Setup

```bash
# Generate Prisma client
bunx prisma generate

# Run migrations
bunx prisma migrate deploy
```

## Development

```bash
# Start dev server with hot reload
bun run dev

# Run linter
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

## Testing

```bash
# Unit tests
bun test

# Integration tests (Docker required)
bun run test:integration
```

## Docker

```bash
# Start application with PostgreSQL
bun run docker:up

# Stop and remove containers
bun run docker:down

# Run integration tests in Docker
bun run test:integration
```

## API Documentation

Interactive API documentation powered by [Scalar](https://scalar.com/) is available at:

- **📖 Scalar UI**: `http://localhost:8080/docs` - Beautiful interactive API documentation
- **📄 OpenAPI Spec**: `http://localhost:8080/openapi.json` - Raw OpenAPI 3.0 specification

The documentation includes:
- Try-it-out functionality for all endpoints
- Request/response examples
- Schema definitions
- Authentication details

### API Endpoints

#### Create Short URL

```bash
POST /create_short_url
Content-Type: application/json

{
  "url": "https://example.com",
  "expires_in_days": 30  # optional
}
```

**Response:**
```json
{
  "short_url": "abc123",
  "original_url": "https://example.com",
  "expires_at": "2025-01-28T12:00:00.000Z"
}
```

#### Redirect

```bash
GET /:short_url
```

Redirects to the original URL with 301 status code and increments the click counter.

**Error responses:**
- `404` - URL not found
- `410` - URL has expired

## Project Structure

```
.
├── src/
│   ├── index.ts                 # Application entry point
│   ├── schemas.ts               # Zod validation schemas
│   ├── middlewares/
│   │   ├── middlewares.ts       # CORS configuration
│   │   └── logger.ts            # LogTape configuration
│   ├── routes/
│   │   ├── openapi-routes.ts    # OpenAPI routes with Zod validation
│   │   ├── routes.ts            # Standard route handlers
│   │   └── routes-config.ts     # Route configuration
│   └── services/
│       ├── url-service.ts       # Business logic for URL management
│       └── short-code-generator.ts # Short code generation utility
├── tests/
│   ├── unit/
│   │   └── routes.test.ts       # Unit tests
│   └── integration/
│       └── integration.test.ts  # Integration tests
├── prisma/
│   ├── schema.prisma            # Database schema
│   ├── db.ts                    # Prisma client with Accelerate
│   ├── prisma.config.ts         # Prisma configuration
│   ├── generated/               # Generated Prisma client
│   └── migrations/              # Database migrations
├── .github/
│   └── workflows/
│       └── ci.yml               # CI/CD pipeline
├── biome.json                   # Linter configuration
├── docker-compose.yml           # Docker setup
└── Dockerfile                   # Docker image
```

## CI/CD

GitHub Actions automatically runs on every commit:

1. **Lint** - Code style and quality checks
2. **Unit Tests** - Fast isolated tests
3. **Integration Tests** - Full API tests with PostgreSQL

## License

MIT
