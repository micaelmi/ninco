import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/sign-in', '/sign-up', '/terms', '/privacy'],
      disallow: ['/home/', '/manage/', '/transactions/'],
    },
    sitemap: 'https://ninco.app/sitemap.xml',
  }
}
