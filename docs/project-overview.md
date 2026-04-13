# Project Overview - OsmAPP

## Project Summary

**OsmAPP** is a universal web application for the OpenStreetMap ecosystem. It aims to be as easy to use as Google Maps while providing powerful OpenStreetMap features including clickable POIs and editing capabilities.

**Live Site:** https://osmapp.org
**Repository:** https://github.com/zbycz/osmapp
**License:** GNU GPL

---

## Executive Summary

OsmAPP is a modern Progressive Web App (PWA) built with Next.js, React, and MapLibre GL. It provides an intuitive interface for browsing and editing OpenStreetMap data, with special focus on climbing areas and outdoor activities.

### Key Features
- **Interactive Map:** Vector-based map with 3D terrain support
- **POI Details:** Clickable points of interest with rich information panels
- **Editing Capabilities:** Edit OpenStreetMap data directly in the app
- **Climbing Features:** Comprehensive climbing route and crag database
- **Directions:** Turn-by-turn routing via GraphHopper
- **Multi-language:** Support for 12+ languages
- **Mobile-First:** PWA with installable mobile apps

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15.3.8 |
| **Frontend** | React 19.1.0 |
| **Language** | TypeScript 5.8.3 |
| **UI Library** | Material-UI 7.1.2 |
| **Mapping** | MapLibre GL 5.6.0 |
| **State** | React Query 3.39.3 |
| **Styling** | Emotion 11.14.0 |
| **Testing** | Jest 30.0.2 |

---

## Architecture Type

**Pattern:** Component-based architecture with service layer

**Characteristics:**
- Server-side rendering (SSR) via Next.js
- API routes for server-side logic
- Service layer for external API integrations
- Feature-based component organization

---

## Repository Structure

**Type:** Monolith (single cohesive codebase)

```
osmapp/
├── pages/           # Next.js pages router + API routes
├── src/
│   ├── components/  # React components (feature-based)
│   ├── services/    # Business logic & API clients
│   ├── server/      # Server-only code
│   └── locales/     # i18n translations
└── public/          # Static assets
```

---

## Key Integrations

### OpenStreetMap
- OAuth authentication
- Feature fetching/editing
- Notes API for anonymous edits

### External Services
- **MapTiler:** Vector tiles provider
- **Thunderforest:** Raster map tiles
- **GraphHopper:** Routing/directions
- **Mapillary:** Street imagery
- **Photon:** Location search
- **Overpass API:** Advanced queries

---

## Special Features

### Climbing Integration
- Comprehensive climbing route database
- Grade conversion tables
- Crag/area management
- User ticks tracking
- Route difficulty badges

### Multi-language Support
English, Czech, German, Polish, Spanish, Italian, French, Japanese, Chinese (Simplified & Traditional), Russian, Amharic

### Editing Capabilities
- Full OSM editing with OAuth
- iD editor tagging schema integration
- Opening hours editor
- Relation hierarchy editor
- Anonymous notes for unauthenticated users

---

## Documentation Index

- [Technology Stack](./technology-stack.md)
- [API Contracts](./api-contracts-main.md)
- [Component Inventory](./component-inventory-main.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Development Guide](./development-guide-main.md)
- [Deployment Guide](./deployment-guide-main.md)
- [Architecture](./architecture-main.md)

---

## Getting Started

See [Development Guide](./development-guide-main.md) for setup instructions.

**Quick Start:**
```bash
git clone https://github.com/zbycz/osmapp.git
cd osmapp
yarn install
yarn dev
```

Visit http://localhost:3000

---

## Contributing

OsmAPP welcomes contributions! See existing documentation:
- [GitHub Issues](https://github.com/zbycz/osmapp/issues)
- [PR Template](ref app/osmapp/.github/pull_request_template.md)
- [Code of Conduct](ref app/osmapp/.github/CODE_OF_CONDUCT.md)

**Easy Contribution:** Edit code online with pencil icon (opens pull-request)

---

## Related Projects

- **OpenClimbing.org** - Forked from OsmAPP in March 2026
- **Facilmap.org** - Relation viewer, POIs filtering
- **Cartes.app** - French OSM app by @leam

---

## Sponsors & Supporters

- MapTiler (vector tiles)
- Thunderforest (raster maps)
- GraphHopper (routing API)
- JetBrains (WebStorm IDE)
- Sentry (error tracking)
- Vercel (hosting)
