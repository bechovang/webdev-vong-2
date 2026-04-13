# Source Tree Analysis - OsmAPP

## Project Root Structure

```
osmapp/
├── .github/                    # GitHub configuration
│   ├── CODE_OF_CONDUCT.md      # Community guidelines
│   └── pull_request_template.md # PR template
│
├── .devcontainer/              # Development container config
├── data/                       # Static data files
│   └── README.md
│
├── pages/                      # Next.js Pages Router (Entry Point)
│   ├── _app.tsx                # App wrapper (global styles, providers)
│   ├── _document.tsx           # HTML document structure
│   ├── index.ts                # Home page alias
│   ├── start.ts                # Start page
│   ├── install.ts              # PWA installation page
│   ├── sitemap.txt.tsx         # Sitemap generator
│   ├── sentry-example-page.tsx # Error tracking test
│   ├── my-ticks.ts             # User ticks page
│   ├── climbing-grades.ts      # Climbing grades reference
│   ├── climbing-areas.tsx      # Climbing areas map
│   ├── directions/             # Directions pages
│   ├── feature/                # Feature detail pages (dynamic routes)
│   └── api/                    # API Routes (Server-side endpoints)
│       ├── user.ts
│       ├── og-image.tsx
│       ├── load-og-image.tsx
│       ├── climbing-ticks/     # Ticks CRUD API
│       ├── climbing-tiles/     # Climbing vector tiles API
│       └── sentry-example-api.js
│
├── public/                     # Static assets (served at root)
│   ├── icons/                  # General icons
│   ├── icons-climbing/         # Climbing-specific icons
│   ├── icons-emotes/           # Emote icons
│   ├── sprites.md              # Sprite sheet documentation
│   └── (other static files)
│
├── src/                        # Main source code
│   ├── components/             # React components (see Component Inventory)
│   ├── services/               # Business logic & API clients
│   ├── server/                 # Server-side utilities
│   ├── helpers/                # Shared helper functions
│   ├── locales/                # i18n translations
│   ├── assets/                 # Source assets
│   ├── config.mjs              # App configuration
│   ├── types.ts                # TypeScript type definitions
│   └── utils.ts                # Utility functions
│
├── __mocks__/                  # Jest mocks
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── next.config.mjs             # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
├── jest.config.js              # Jest test configuration
├── Dockerfile                  # Docker container build
└── ARCHITECTURE.md             # Architecture docs (link to wiki)
```

---

## Critical Directories Explained

### `/pages/` - Next.js Pages Router

**Purpose:** File-based routing and API routes

**Entry Points:**
- `_app.tsx` → Global app wrapper, initializes providers
- `_document.tsx` → HTML structure, meta tags
- `index.ts` → Home page (redirects to start)

**Dynamic Routes:**
- `feature/[...all].tsx` → Catches all feature URLs (e.g., `/way/123`, `/relation/456`)
- `directions/[...all].tsx` → Directions page with route parameters

**API Routes:**
- `pages/api/*` → Server-side endpoints (see API Contracts)

---

### `/src/components/` - React Components

**Purpose:** UI components organized by feature

**Main Component Groups:**
| Directory | Purpose |
|-----------|---------|
| `App/` | App-level components (Loading, Analytics) |
| `Map/` | MapLibre GL integration |
| `LayerSwitcher/` | Map layer selection |
| `SearchBox/` | Location search |
| `FeaturePanel/` | Feature details panel |
| `Directions/` | Navigation/routing |
| `HomepagePanel/` | Landing page content |
| `ClimbingAreasPanel/` | Climbing areas browser |
| `MyTicksPanel/` | User ticks management |
| `Climbing/` | Climbing-specific components |

---

### `/src/services/` - Business Logic Layer

**Purpose:** API clients, data fetching, business logic

**Key Services:**
| Directory | Purpose |
|-----------|---------|
| `osm/` | OpenStreetMap API integration |
| `overpass/` | Overpass API integration |
| `tagging/` | iD editor tagging schema |
| `images/` | Image fetching (Wikimedia, Mapillary, etc.) |
| `climbing-areas/` | Climbing data management |
| `my-ticks/` | User ticks service |
| `fetch.ts` | Universal fetch wrapper |
| `fetchCache.ts` | Response caching |
| `intl.tsx` | Client-side i18n |
| `helpers.ts` | Service utilities |

---

### `/src/server/` - Server-Side Utilities

**Purpose:** Server-only code (database, authentication)

**Key Files:**
| File/Directory | Purpose |
|----------------|---------|
| `osmApiAuthServer.ts` | OSM OAuth verification (server-side) |
| `db/` | Database utilities (better-sqlite3) |
| `climbing-tiles/` | Vector tile generation |

---

### `/src/helpers/` - Shared Utilities

**Purpose:** Pure functions, helpers used across the app

**Examples:**
- Map projections
- Coordinate conversions
- URL parsing
- String formatting

---

### `/src/locales/` - Internationalization

**Purpose:** Translation files for all supported languages

**Languages:** English, Czech, German, Polish, Spanish, Italian, French, Japanese, Chinese, Russian, Amharic

---

### `/public/` - Static Assets

**Purpose:** Files served directly at root URL

**Contents:**
| Directory | Purpose |
|-----------|---------|
| `icons/` | POI type icons, UI icons |
| `icons-climbing/` | Climbing route icons |
| `icons-emotes/` | Emoticon icons |
| `sprites/` | Map sprite sheets |

---

## Data Flow Architecture

```
User Interaction
       ↓
Component (src/components/)
       ↓
Service Layer (src/services/)
       ↓
┌─────────────┬──────────────┬──────────────┐
│             │              │              │
OSM API    Overpass API   External APIs   API Routes
(external)  (external)    (external)     (/api/*)
       │             │              │             │
       └─────────────┴──────────────┴─────────────┘
                     ↓
              State Updates
                     ↓
              Component Re-render
```

---

## Entry Points

### Client-Side Entry
**File:** `pages/_app.tsx`

**Responsibilities:**
- Wrap app with providers (MUI, Emotion, Sentry)
- Initialize analytics (Google Analytics, Umami, Hotjar)
- Configure error boundaries

### Server-Side Entry
**File:** `pages/_document.tsx`

**Responsibilities:**
- HTML structure
- Meta tags
- External scripts
- CSS links

### API Entry Points
**Directory:** `pages/api/`

**Entry Point Pattern:** `pages/api/[resource]/[id].ts`

---

## Build Configuration

### Next.js Config (`next.config.mjs`)
- Emotion compiler enabled
- i18n locale configuration
- Sentry integration
- Environment variable injection

### TypeScript Config (`tsconfig.json`)
- Target: ES6
- Module: ESNext
- Strict mode: **disabled** (for gradual migration)
- JSX: preserve (for Next.js)

---

## Development Workflow

**File Watching:** Next.js dev server (`yarn dev`)

**Hot Reload:** Automatic for all source files

**Linting:**
- ESLint on save (pre-commit hook via Husky)
- Prettier formatting (pre-commit)

**Testing:**
- Jest for unit tests
- Tests in `__tests__/` directories
- Run with `yarn test`

---

## Static Export Support

**Output Mode:** Configurable via `NEXTJS_OUTPUT` env var

**Supported Modes:**
- Standard Next.js (default)
- Static export (requires `output: 'export'`)

**Note:** Some features (API routes) are not available in static export mode

---

## Integration Points

### Map Integration
- **Component:** `src/components/Map/`
- **Library:** MapLibre GL 5.6.0
- **Tile Sources:** MapTiler, Thunderforest, OSM
- **Data Sources:** Overpass API, OSM API

### Authentication
- **Provider:** OpenStreetMap OAuth
- **Service:** `src/server/osmApiAuthServer.ts`
- **Token Storage:** HTTP-only cookie

### Database
- **Engine:** SQLite (better-sqlite3)
- **Location:** Server-side only
- **Usage:** Climbing ticks storage

### External APIs
See `api-contracts-main.md` for complete list

---

## Critical Files for Development

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `src/config.mjs` | App configuration | Low |
| `src/services/fetch.ts` | API client base | Low |
| `src/components/Map/` | Map integration | Medium |
| `pages/api/` | API endpoints | Medium |
| `src/services/tagging/` | POI presets | Low |

---

## File Naming Conventions

- **Components:** PascalCase (`FeaturePanel.tsx`)
- **Services:** camelCase (`fetchFeature.ts`)
- **Utilities:** camelCase (`helpers.ts`)
- **Types:** PascalCase interfaces (`Feature.ts`)
- **Tests:** `*.test.ts`, `*.spec.ts`

---

## Code Organization Principles

1. **Feature-based:** Components grouped by feature (Climbing, Directions, etc.)
2. **Separation of concerns:** Services separated from components
3. **Server/client split:** Server-only code in `/src/server/`
4. **Co-location:** Tests alongside source code
5. **Clear entry points:** Pages for routes, API for endpoints
