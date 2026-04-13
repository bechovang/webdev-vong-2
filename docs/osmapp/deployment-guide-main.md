# Deployment Guide - OsmAPP

## Overview

OsmAPP is deployed on **Vercel** with automatic deployments from the main branch. The application uses Next.js with static export support and server-side API routes.

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel Edge                          │
├─────────────────────────────────────────────────────────────┤
│  Static Assets (CDN)  │  Serverless Functions (API routes)  │
│  - JS/CSS bundles     │  - /api/user                        │
│  - Images             │  - /api/climbing-ticks              │
│  - Public files       │  - /api/climbing-tiles              │
│  - Map tiles          │  - Other endpoints                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                        │
├─────────────────────────────────────────────────────────────┤
│  OSM API  │  MapTiler  │  GraphHopper  │  Overpass API     │
└─────────────────────────────────────────────────────────────┘
```

---

## Vercel Deployment

### Automatic Deployment

**Main Branch:** https://osmapp.org
- Automatic deployment on push to `main`
- Zero-downtime deployments
- CDN caching

**Pull Requests:** Preview URLs
- Automatic preview deployments
- Unique URL for each PR
- Full testing environment

### Environment Variables (Vercel)

Configure in Vercel Dashboard:

```bash
# Required
NEXT_PUBLIC_OSM_CLIENT_ID=your_production_client_id
NEXT_PUBLIC_OSM_TEST_CLIENT_ID=your_test_client_id

# Map Providers (obtain your own keys)
NEXT_PUBLIC_API_KEY_MAPTILER=your_key
NEXT_PUBLIC_API_KEY_THUNDERFOREST=your_key
NEXT_PUBLIC_API_KEY_GRAPHHOPPER=your_key
NEXT_PUBLIC_API_KEY_MAPILLARY=your_key
NEXT_PUBLIC_API_KEY_INDOOREQUAL=your_key

# Optional
NEXT_PUBLIC_ENABLE_CLIMBING_TILES=true
NEXT_PUBLIC_UMAMI_ID_OSMAPP=
```

### Build Configuration

**Build Command:**
```bash
yarn build
```

**Output Directory:** `.next/`

**Install Command:**
```bash
yarn install
```

---

## Manual Deployment

### Using Docker

**Dockerfile:** Included in project root

```bash
# Build Docker image
docker build -t osmapp .

# Run container
docker run -p 3000:3000 --env-file .env.local osmapp
```

### Static Export

For static hosting (e.g., GitHub Pages, S3):

1. Set environment variable:
```bash
NEXTJS_OUTPUT=export
```

2. Build:
```bash
yarn build
yarn export  # generates static files in 'out' directory
```

**Limitations:**
- API routes not available
- Server-side features disabled
- OSM OAuth requires external handler

---

## Infrastructure Requirements

### Minimum Requirements

| Resource | Requirement |
|----------|-------------|
| **Node.js** | ^20 |
| **RAM** | 1 GB+ |
| **CPU** | 1 core+ |
| **Storage** | 500 MB+ (mostly node_modules) |

### Recommended

| Resource | Requirement |
|----------|-------------|
| **RAM** | 2 GB+ |
| **CPU** | 2 cores+ |
| **CDN** | Yes (for map tiles) |

---

## External Service Configuration

### OpenStreetMap OAuth

1. Register application at https://www.openstreetmap.org/oauth2/applications
2. Set callback URL: `https://yourdomain.com/api/auth/callback`
3. Copy client ID to environment variables

### MapTiler

1. Sign up at https://www.maptiler.com/
2. Create access key
3. Set `NEXT_PUBLIC_API_KEY_MAPTILER`

### Thunderforest

1. Register at https://www.thunderforest.com/
2. Get API key
3. Set `NEXT_PUBLIC_API_KEY_THUNDERFOREST`

### GraphHopper

1. Sign up at https://www.graphhopper.com/
2. Create API key
3. Set `NEXT_PUBLIC_API_KEY_GRAPHHOPPER`

### Mapillary

1. Register at https://www.mapillary.com/dashboard/developers
2. Get client ID
3. Set `NEXT_PUBLIC_API_KEY_MAPILLARY`

---

## CI/CD Pipeline

### GitHub Actions

**Location:** `.github/workflows/`

**Workflows:**
- Lint on push
- Test on push
- Deploy to Vercel (automatic via integration)

### Pre-commit Hooks

**Tools:** Husky + lint-staged

**Checks:**
- Prettier format
- ESLint validation
- TypeScript compilation

---

## Monitoring & Error Tracking

### Sentry Integration

**Config Files:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**Features:**
- Error tracking
- Performance monitoring
- Release tracking
- Source maps upload

**Sentry Dashboard:** https://sentry.io/

### Analytics

**Optional:**
- Google Analytics (`src/components/App/google-analytics.tsx`)
- Umami (`src/components/App/umami.tsx`)
- Hotjar (`src/components/App/hotjar.tsx`)

---

## Performance Optimization

### Caching Strategy

| Cache Type | Duration | Notes |
|------------|----------|-------|
| Static assets | 1 year | CDN cache |
| API responses | 5-60 min | Varies by endpoint |
| Map tiles | 1 week | Provider cache |
| Feature data | Session | In-memory cache |

### CDN Configuration

- **Vercel Edge Network:** Automatic
- **Map Tiles:** Served from MapTiler CDN
- **Static Assets:** Served from Vercel CDN

---

## Security Considerations

### Environment Variables

- **Never commit** `.env.local` to git
- Use `.env` for template (included in repo)
- Store secrets in Vercel environment variables

### OAuth Tokens

- Stored as HTTP-only cookies
- Server-side verification
- Secure flag enabled (production)

### API Keys

- `NEXT_PUBLIC_*` keys are exposed to client
- Use rate limits on external services
- Rotate keys regularly

---

## Scaling Considerations

### Vertical Scaling

- Increase serverless function timeout
- Add more memory for heavy operations
- Consider serverful deployment for heavy features

### Horizontal Scaling

- Vercel handles automatic scaling
- Consider dedicated database for user data
- Use Redis for shared cache

---

## Backup & Recovery

### Database Backup

**Climbing Ticks Database:**
- SQLite file location: Server-side only
- Backup strategy: Export to JSON periodically
- Consider migration to PostgreSQL for scale

### Code Backup

- Git repository (GitHub)
- Vercel deployments (immutable)
- Local development copies

---

## Troubleshooting Deployment

### Build Failures

1. Check Node.js version (must be ^20)
2. Verify environment variables
3. Check build logs in Vercel dashboard
4. Test locally: `yarn build`

### Runtime Errors

1. Check Sentry dashboard
2. Verify API keys are valid
3. Check external service status
4. Review serverless function logs

### Performance Issues

1. Check Vercel Analytics
2. Monitor CDN cache hit rate
3. Review external API response times
4. Optimize images and bundles

---

## Production Checklist

- [ ] All environment variables configured
- [ ] API keys obtained and set
- [ ] OAuth callback URLs configured
- [ ] Sentry integration tested
- [ ] Analytics configured (optional)
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] CDN caching enabled
- [ ] Error monitoring active
- [ ] Backup strategy in place
- [ ] Scaling limits configured
