# API Documentation

## Quick Start

1. Start the server:
   ```bash
   bun run dev
   ```

2. Open interactive documentation:
   ```
   http://localhost:8080/docs
   ```

## Endpoints

### POST /create_short_url

Create a new short URL or retrieve an existing one.

**Request:**
```json
{
  "url": "https://example.com",
  "expires_in_days": 30
}
```

**Response (201 Created):**
```json
{
  "short_url": "abc123",
  "original_url": "https://example.com",
  "expires_at": "2025-01-28T12:00:00.000Z"
}
```

**Response (200 OK - Existing URL):**
```json
{
  "short_url": "abc123",
  "original_url": "https://example.com",
  "clicks": 42,
  "expires_at": "2025-01-28T12:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid URL format

---

### GET /:short_url

Redirect to the original URL and increment the click counter.

**Parameters:**
- `short_url` (path) - The short URL code

**Response:**
- `301 Moved Permanently` - Redirects to original URL
- `404 Not Found` - Short URL doesn't exist
- `410 Gone` - Short URL has expired

**Example:**
```bash
curl -L http://localhost:8080/abc123
# Redirects to https://example.com
```

---

## Examples

### Using cURL

**Create short URL:**
```bash
curl -X POST http://localhost:8080/create_short_url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/anthropics/claude-code",
    "expires_in_days": 7
  }'
```

**Follow redirect:**
```bash
curl -L http://localhost:8080/abc123
```

### Using JavaScript/TypeScript

```typescript
// Create short URL
const response = await fetch('http://localhost:8080/create_short_url', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    expires_in_days: 30,
  }),
})

const data = await response.json()
console.log(data.short_url) // abc123

// Use short URL
window.location.href = `http://localhost:8080/${data.short_url}`
```

### Using Python

```python
import requests

# Create short URL
response = requests.post(
    'http://localhost:8080/create_short_url',
    json={
        'url': 'https://example.com',
        'expires_in_days': 30
    }
)

data = response.json()
print(f"Short URL: {data['short_url']}")

# Follow redirect
redirect = requests.get(f"http://localhost:8080/{data['short_url']}")
print(f"Redirected to: {redirect.url}")
```

## OpenAPI Specification

Download the full OpenAPI 3.0 specification:

```bash
curl http://localhost:8080/openapi.json > openapi.json
```

Use it with tools like:
- [Postman](https://www.postman.com/) - Import OpenAPI spec
- [Insomnia](https://insomnia.rest/) - Import OpenAPI spec
- [OpenAPI Generator](https://openapi-generator.tech/) - Generate client SDKs
