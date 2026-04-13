# Development Guide - OsmAPP

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ^20 | JavaScript runtime |
| **Yarn** | Latest | Package manager |
| **Git** | Latest | Version control |

### Optional Tools

| Tool | Purpose |
|------|---------|
| Docker | Containerized development |
| VS Code / WebStorm | IDE |
| GitHub Codespaces / Gitpod | Cloud development environment |

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/zbycz/osmapp.git
cd osmapp
```

### 2. Install Dependencies

```bash
yarn install
```

This will also run `postinstall` script to copy indoor sprite files.

### 3. Environment Configuration

Create `.env.local` file in project root:

```bash
# Copy from .env and customize
cp .env .env.local
```

**Required Environment Variables:**

```bash
# OpenStreetMap OAuth (get from https://www.openstreetmap.org/oauth2/applications)
NEXT_PUBLIC_OSM_CLIENT_ID=your_client_id_here

# Optional: Enable test API
NEXT_PUBLIC_ENABLE_TEST_API=true

# Map provider API keys (obtain your own for production)
NEXT_PUBLIC_API_KEY_MAPTILER=your_maptiler_key
NEXT_PUBLIC_API_KEY_THUNDERFOREST=your_thunderforest_key
NEXT_PUBLIC_API_KEY_GRAPHHOPPER=your_graphhopper_key
NEXT_PUBLIC_API_KEY_MAPILLARY=your_mapillary_key
NEXT_PUBLIC_API_KEY_INDOOREQUAL=your_indoorequal_key

# Analytics (optional)
NEXT_PUBLIC_UMAMI_ID_OSMAPP=
```

---

## Development Commands

### Start Development Server

```bash
yarn dev
```

Opens at http://localhost:3000

**Features:**
- Hot reload enabled
- Source maps for debugging
- Error overlay

### Build for Production

```bash
yarn build
```

Creates optimized production build in `.next/` directory.

### Start Production Server

```bash
yarn start
```

Starts production server (must run `yarn build` first).

---

## Testing

### Run Tests

```bash
yarn test
```

Runs Jest test suite.

### Test Coverage

Tests are located in `__tests__/` directories alongside source code.

**Tested Areas:**
- Service functions
- Utility functions
- Context providers
- Component rendering

---

## Linting & Formatting

### Run Linter

```bash
yarn lint
```

Exits with error if issues found (max-warnings=0).

### Auto-fix Lint Issues

```bash
yarn lintfix
```

Runs Prettier and ESLint auto-fix.

### Format Code

```bash
yarn prettify
```

Formats all files with Prettier.

---

## Project Structure

### Key Directories

```
osmapp/
├── pages/              # Next.js routes
│   ├── api/           # API endpoints
│   ├── feature/       # Feature detail pages
│   └── ...
├── src/
│   ├── components/    # React components
│   ├── services/      # API clients & business logic
│   ├── server/        # Server-only code
│   ├── helpers/       # Utility functions
│   └── locales/       # Translations
└── public/            # Static assets
```

---

## Development Workflow

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Edit components in `src/components/`
- Add services in `src/services/`
- Create API routes in `pages/api/`

### 3. Test Changes

```bash
yarn dev
# Test in browser at http://localhost:3000
yarn test
```

### 4. Format & Lint

```bash
yarn prettify
yarn lint
```

### 5. Commit Changes

Pre-commit hooks (Husky) will run:
- lint-staged (lints only staged files)
- Prettier format
- ESLint check

### 6. Push & Create PR

```bash
git push origin feature/your-feature-name
```

Create pull request on GitHub.

---

## Common Development Tasks

### Add New API Service

1. Create service file in `src/services/`
2. Use `fetch.ts` for HTTP requests
3. Export functions
4. Add tests in `__tests__/` subdirectory

**Example:**
```typescript
// src/services/myService.ts
import { fetchJson } from './fetch';

export const getMyData = async (id: string) => {
  const url = `https://api.example.com/data/${id}`;
  return fetchJson<MyData>(url);
};
```

### Add New Component

1. Create component directory in `src/components/`
2. Create `ComponentName.tsx`
3. Export from index if needed
4. Add tests

**Example:**
```typescript
// src/components/MyComponent/MyComponent.tsx
import React from 'react';

export const MyComponent: React.FC<Props> = ({ prop }) => {
  return <div>{prop}</div>;
};
```

### Add New API Route

1. Create file in `pages/api/`
2. Export default handler function
3. Use TypeScript types

**Example:**
```typescript
// pages/api/my-endpoint.ts
import type { NextApiRequest, NextApiResponse } from 'next';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ message: 'Hello' });
};
```

### Add Translation

1. Edit locale file in `src/locales/`
2. Use `intl` service to access translations

**Example:**
```typescript
import { t } from '../services/intl';

const message = t('my_feature.key');
```

---

## Debugging

### Client-Side Debugging

- Use browser DevTools (F12)
- React DevTools extension
- Source maps available in dev mode

### Server-Side Debugging

- Add `console.log()` in API routes
- Check terminal output
- Use Next.js debug mode

### Map Debugging

- MapLibre GL has built-in debug tools
- Check network tab for tile requests
- Use Maptiler Inspector for tile debugging

---

## Performance Optimization

### Code Splitting

- Next.js automatically splits by page
- Use dynamic imports for heavy components:

```typescript
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

### Image Optimization

- Use Next.js Image component for static images
- Lazy load map imagery

### Bundle Analysis

```bash
yarn build
# Analyze .next/analyze/ output
```

---

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules yarn.lock
yarn install
```

### Build Fails

1. Check Node.js version: `node --version` (must be ^20)
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `yarn build`

### Map Not Displaying

- Check API keys in `.env.local`
- Verify MapTiler/Thunderforest quotas
- Check browser console for errors

---

## CI/CD

### GitHub Actions

- Runs on every push
- Lints and tests code
- Deploys preview on Vercel

### Vercel Deployment

- Automatic deployment on main branch
- Preview deployments for PRs
- Environment variables configured in Vercel dashboard

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MapLibre GL Documentation](https://maplibre.org/maplibre-gl-js-docs/)
- [Material-UI Documentation](https://mui.com/)
- [OpenStreetMap Wiki](https://wiki.openstreetmap.org/)
- [OsmAPP GitHub Wiki](https://github.com/zbycz/osmapp/wiki)
