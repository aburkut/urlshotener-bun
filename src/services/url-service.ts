import { prisma } from '../../prisma/db'

export interface CreateUrlParams {
  url: string
  expires_in_days?: number
}

export interface UrlResponse {
  short_url: string
  original_url: string
  clicks?: number
  expires_at: Date | null
}

export class UrlService {
  async findByUrl(url: string) {
    return prisma.url.findUnique({
      where: { url },
    })
  }

  async findByShortCode(shortCode: string) {
    return prisma.url.findUnique({
      where: { short: shortCode },
    })
  }

  async createShortUrl({ url, expires_in_days }: CreateUrlParams): Promise<UrlResponse> {
    const existing = await this.findByUrl(url)

    if (existing) {
      return {
        short_url: existing.short,
        original_url: existing.url,
        clicks: existing.clicks,
        expires_at: existing.expires_at,
      }
    }

    const short = await this.generateUniqueShortCode()
    const expires_at = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : null

    const created = await prisma.url.create({
      data: {
        url,
        short,
        expires_at,
      },
    })

    return {
      short_url: created.short,
      original_url: created.url,
      expires_at: created.expires_at,
    }
  }

  async incrementClicks(shortCode: string) {
    await prisma.url.update({
      where: { short: shortCode },
      data: {
        clicks: {
          increment: 1,
        },
      },
    })
  }

  private async generateUniqueShortCode(): Promise<string> {
    const { generateShortCode } = await import('./short-code-generator')

    let short = generateShortCode()
    let attempts = 0

    while (attempts < 10) {
      const exists = await this.findByShortCode(short)
      if (!exists) break
      short = generateShortCode()
      attempts++
    }

    return short
  }
}

export const urlService = new UrlService()
