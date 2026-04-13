# Project Documentation Index - OsmAPP

## Project Overview

- **Type:** Monolith
- **Primary Language:** TypeScript
- **Architecture:** Component-based with service layer, Server-side rendering (SSR)

### Quick Reference

- **Tech Stack:** Next.js 15.3.8 + React 19.1.0 + TypeScript 5.8.3
- **Entry Point:** `pages/_app.tsx`
- **Architecture Pattern:** Component-based with service layer
- **Package Manager:** Yarn
- **Deployment:** Vercel

---

## Generated Documentation

### Core Documentation
- [Project Overview](./project-overview.md)
- [Architecture](./architecture-main.md)
- [Technology Stack](./technology-stack.md)
- [Source Tree Analysis](./source-tree-analysis.md)

### Detailed Guides
- [Component Inventory](./component-inventory-main.md)
- [API Contracts](./api-contracts-main.md)
- [Development Guide](./development-guide-main.md)
- [Deployment Guide](./deployment-guide-main.md)

---

## Existing Documentation

- [README](../ref app/osmapp/README.md) - Main project documentation
- [ARCHITECTURE](../ref app/osmapp/ARCHITECTURE.md) - Architecture documentation (links to wiki)
- [data/README](../ref app/osmapp/data/README.md) - Data directory documentation
- [src/locales/README](../ref app/osmapp/src/locales/README.md) - Localization documentation
- [CODE_OF_CONDUCT](../ref app/osmapp/.github/CODE_OF_CONDUCT.md) - Community guidelines
- [pull_request_template](../ref app/osmapp/.github/pull_request_template.md) - PR template

---

## Getting Started

### Quick Start

```bash
# Clone repository
git clone https://github.com/zbycz/osmapp.git
cd osmapp

# Install dependencies
yarn install

# Start development server
yarn dev
```

Visit http://localhost:3000

### Prerequisites

- Node.js ^20
- Yarn (latest)
- Git

### Environment Setup

1. Copy `.env` to `.env.local`
2. Configure API keys (see [Development Guide](./development-guide-main.md))
3. Set `NEXT_PUBLIC_OSM_CLIENT_ID` for OAuth

---

## Project Structure

```
osmapp/
├── pages/              # Next.js routes + API endpoints
├── src/
│   ├── components/     # React components (feature-based)
│   ├── services/       # Business logic & API clients
│   ├── server/         # Server-only code
│   ├── helpers/        # Utility functions
│   └── locales/        # i18n translations
└── public/             # Static assets
```

See [Source Tree Analysis](./source-tree-analysis.md) for complete structure.

---

## Key Technologies

### Frontend
- **Next.js 15.3.8** - React framework with SSR
- **React 19.1.0** - UI library
- **TypeScript 5.8.3** - Type safety
- **Material-UI 7.1.2** - Component library
- **Emotion 11.14.0** - CSS-in-JS

### Mapping
- **MapLibre GL 5.6.0** - Vector map rendering
- **MapTiler** - Vector tiles provider
- **Thunderforest** - Raster tiles

### APIs & Services
- **OpenStreetMap API** - Map data & OAuth
- **Overpass API** - Advanced queries
- **Photon** - Location search
- **GraphHopper** - Routing/directions

---

## Development Workflow

1. Create feature branch: `git checkout -b feature/name`
2. Make changes (components, services, API routes)
3. Test: `yarn dev` + `yarn test`
4. Format: `yarn prettify` + `yarn lint`
5. Commit (pre-commit hooks run automatically)
6. Push and create PR

See [Development Guide](./development-guide-main.md) for complete workflow.

---

## Component Categories

- **App** - App-level components (Loading, Analytics)
- **Map** - MapLibre GL integration
- **FeaturePanel** - Feature details panel with editing
- **Directions** - Navigation/routing
- **Climbing** - Climbing-specific features
- **SearchBox** - Location search
- **LayerSwitcher** - Map layer selection

See [Component Inventory](./component-inventory-main.md) for complete list.

---

## API Endpoints

### Internal APIs
- `GET /api/user` - Get authenticated user
- `GET/POST /api/climbing-ticks` - List/create ticks
- `PUT/DELETE /api/climbing-ticks/[id]` - Update/delete tick
- `GET /api/climbing-tiles/*` - Vector tiles

### External Services
- OpenStreetMap API (OSM data, editing, OAuth)
- Overpass API (advanced queries)
- MapTiler (vector tiles)
- GraphHopper (routing)

See [API Contracts](./api-contracts-main.md) for complete API documentation.

---

## Deployment

### Production
- **Platform:** Vercel
- **URL:** https://osmapp.org
- **Auto-deploy:** On push to main branch

### Environment Variables
- `NEXT_PUBLIC_OSM_CLIENT_ID` - OSM OAuth
- `NEXT_PUBLIC_API_KEY_MAPTILER` - Map tiles
- `NEXT_PUBLIC_API_KEY_GRAPHHOPPER` - Routing
- (See .env for complete list)

See [Deployment Guide](./deployment-guide-main.md) for details.

---

## Special Features

### Climbing Integration
- Comprehensive climbing route database
- Grade conversion tables
- Crag/area management
- User ticks tracking

### Multi-language Support
12+ languages including English, Czech, German, Polish, Spanish, Italian, French, Japanese, Chinese, Russian

### Editing Capabilities
- Full OSM editing with OAuth
- iD editor tagging schema
- Opening hours editor
- Relation hierarchy editor

---

## Related Projects

- **OpenClimbing.org** - Forked from OsmAPP (March 2026)
- **Facilmap.org** - OSM relation viewer
- **Cartes.app** - French OSM app

---

## Support

- **GitHub Issues:** https://github.com/zbycz/osmapp/issues
- **Architecture Wiki:** https://github.com/zbycz/osmapp/wiki/Architecture
- **Sentry Dashboard:** Error tracking

---

## Brownfield PRD Usage

When planning new features for OsmAPP, reference:

1. **UI-only features** → [Architecture](./architecture-main.md) + [Component Inventory](./component-inventory-main.md)
2. **API-only features** → [API Contracts](./api-contracts-main.md) + [Architecture](./architecture-main.md)
3. **Full-stack features** → [Architecture](./architecture-main.md) + [API Contracts](./api-contracts-main.md) + [Component Inventory](./component-inventory-main.md)

---

## License

GNU GPL
