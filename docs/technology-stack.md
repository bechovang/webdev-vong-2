# Technology Stack - OsmAPP

## Overview

OsmAPP is a **universal web application for OpenStreetMap ecosystem** built with modern web technologies.

## Core Technologies

### Frontend Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.8 | React framework with SSR and API routes |
| **React** | 19.1.0 | UI component library |
| **TypeScript** | 5.8.3 | Type-safe development |

### UI & Styling
| Technology | Version | Purpose |
|------------|---------|---------|
| **Material-UI (MUI)** | 7.1.2 | Component library |
| **Emotion** | 11.14.0 | CSS-in-JS styling |
| **React JSS** | 10.6.0 | JSS integration for React |

### Mapping & Geospatial
| Technology | Version | Purpose |
|------------|---------|---------|
| **MapLibre GL** | 5.6.0 | Vector map rendering |
| **MapLibre Indoor** | 1.3.0 | Indoor mapping |
| **@turf/turf** | 7.2.0 | Geospatial analysis |

### State Management & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| **React Query** | 3.39.3 | Server state management |
| **js-cookie** | 3.0.5 | Cookie management |

### External APIs Integration
| API | Purpose |
|-----|---------|
| **OpenStreetMap** | Map data & OAuth authentication |
| **Photon** | Location search |
| **MapTiler** | Vector tiles provider |
| **Thunderforest** | Raster map tiles |
| **GraphHopper** | Routing/directions API |
| **Mapillary** | Street imagery |
| **IndoorEqual** | Indoor mapping |
| **Overpass API** | Advanced OSM queries |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **ESLint** | 8.x | Code linting |
| **Prettier** | 3.6.0 | Code formatting |
| **Jest** | 30.0.2 | Testing framework |
| **Husky** | 4.x | Git hooks |
| **lint-staged** | 16.1.2 | Pre-commit linting |

### Deployment & Monitoring
| Technology | Version | Purpose |
|------------|---------|---------|
| **Sentry** | 8.34.0 | Error tracking |
| **Vercel** | - | Hosting & deployment |
| **Docker** | - | Containerization |

## Architecture Pattern

**Component-Based Architecture with Service Layer**

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer (pages/)     │  API Layer (pages/api/)        │
│  - Route-based pages      │  - Server-side endpoints       │
│  - getServerSideProps     │  - Data fetching               │
├─────────────────────────────────────────────────────────────┤
│  Components Layer (src/components/)                         │
│  - Feature panels (FeaturePanel, Directions, etc.)          │
│  - Map components (Map, LayerSwitcher)                      │
│  - UI components (SearchBox, etc.)                          │
├─────────────────────────────────────────────────────────────┤
│  Services Layer (src/services/)                             │
│  - API clients (fetch.ts, overpass/, osm/)                 │
│  - Business logic (getPoiClass, tagging/)                  │
│  - Data transformation (helpers, intl)                     │
├─────────────────────────────────────────────────────────────┤
│  Utilities (src/helpers/, src/utils/)                       │
│  - Shared functions and constants                          │
└─────────────────────────────────────────────────────────────┘
```

## Key Dependencies

### MapLibre GL Ecosystem
- `maplibre-gl`: Core map rendering engine
- `maplibre-gl-indoorequal`: Indoor mapping support
- `@teritorio/openmaptiles-gl-language`: Multi-language map labels

### OpenStreetMap Integration
- `@openstreetmap/id-tagging-schema`: iD editor tagging presets
- `osm-auth`: OAuth authentication for OSM
- `opening_hours`: Opening hours parsing

### Data Processing
- `better-sqlite3`: SQLite database for local data
- `isomorphic-unfetch`: Universal fetch API
- `isomorphic-xml2js`: XML parsing

### Internationalization
- `accept-language-parser`: Browser language detection
- `date-fns`: Date formatting

## Build Configuration

### TypeScript Configuration
- Target: ES6
- Module: ESNext with Node resolution
- JSX: preserve (for Next.js)
- Strict mode: disabled (for gradual migration)

### Next.js Configuration
- Output mode: Configurable via `NEXTJS_OUTPUT`
- i18n: Multi-language support with custom locale detection
- Compiler: Emotion for CSS-in-JS optimization
- Sentry integration: Automatic error tracking

## Development Requirements

### Node.js Version
- Required: `^20` (Node.js 20 or higher)

### Environment Variables
See `.env` file for required API keys:
- OpenStreetMap OAuth credentials
- MapTiler API key
- Thunderforest API key
- GraphHopper API key
- Mapillary API key
- IndoorEqual API key (optional)

### Package Scripts
```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn test         # Run tests
yarn lint         # Run linter
yarn prettify     # Format code
```
