# Architecture - OsmAPP

## Executive Summary

OsmAPP is a **Progressive Web App (PWA)** built with **Next.js 15**, **React 19**, and **MapLibre GL**. It follows a **component-based architecture** with a clear service layer for external API integrations. The application supports server-side rendering (SSR), static export, and serverless deployment on Vercel.

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.3.8 | React framework with SSR/API routes |
| **React** | 19.1.0 | UI component library |
| **TypeScript** | 5.8.3 | Type-safe development |

### UI & Styling

| Technology | Version | Purpose |
|------------|---------|---------|
| **Material-UI** | 7.1.2 | Component library |
| **Emotion** | 11.14.0 | CSS-in-JS styling |

### Mapping & Geospatial

| Technology | Version | Purpose |
|------------|---------|---------|
| **MapLibre GL** | 5.6.0 | Vector map rendering |
| **MapLibre Indoor** | 1.3.0 | Indoor mapping |
| **@turf/turf** | 7.2.0 | Geospatial analysis |

### State & Data

| Technology | Version | Purpose |
|------------|---------|---------|
| **React Query** | 3.39.3 | Server state management |
| **js-cookie** | 3.0.5 | Cookie management |

---

## Architecture Pattern

### Component-Based with Service Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                   │
│  (React Components - src/components/)                       │
│  - Feature panels, Map, Directions, etc.                    │
├─────────────────────────────────────────────────────────────┤
│                        State Management                     │
│  (React Context + React Query)                              │
│  - Directions context, Climbing context, etc.              │
├─────────────────────────────────────────────────────────────┤
│                        Service Layer                        │
│  (src/services/)                                            │
│  - API clients, business logic, data transformation        │
├─────────────────────────────────────────────────────────────┤
│                        API Layer                            │
│  (Next.js API Routes - pages/api/)                          │
│  - Server-side endpoints, authentication, database         │
├─────────────────────────────────────────────────────────────┤
│                    External Services                        │
│  - OSM API, Overpass, MapTiler, GraphHopper, etc.         │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Data Flow

```
User Action → Component → Service → External API
                        ↓
                  State Update
                        ↓
                  Component Re-render
```

### Data Sources

| Source | Type | Purpose |
|--------|------|---------|
| **OSM API** | REST | Feature data, editing, OAuth |
| **Overpass API** | REST | Advanced queries, center coordinates |
| **Photon** | REST | Location search/geocoding |
| **MapTiler** | Tiles | Vector map tiles |
| **GraphHopper** | REST | Routing/directions |
| **SQLite** | Local | Climbing ticks storage |

### Data Models

**Feature Model:**
```typescript
interface Feature {
  type: 'Feature';
  skeleton: boolean;
  osmMeta: OsmId;
  center: LonLat | false;
  tags: Record<string, string>;
  properties: { class: string; subclass: string };
  memberFeatures?: Feature[];
  parentFeatures?: Feature[];
  imageDefs?: ImageDef[];
  countryCode?: string;
  error?: string;
}
```

**OSM Element:**
```typescript
interface OsmId {
  type: 'node' | 'way' | 'relation';
  id: number;
}
```

---

## API Design

### Internal API Routes

**Base Path:** `/api/`

**Authentication:** OSM OAuth token (cookie-based)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/user` | GET | Get authenticated user |
| `/api/climbing-ticks` | GET/POST | List/create ticks |
| `/api/climbing-ticks/[id]` | GET/PUT/DELETE | Manage single tick |
| `/api/climbing-tiles/*` | GET | Vector tile endpoints |
| `/api/og-image` | GET | Generate OpenGraph image |

### External Service Integration

**Service Layer Location:** `src/services/`

| Service | API | Purpose |
|---------|-----|---------|
| `osm/osmApi.ts` | OSM API | Feature fetching, editing |
| `overpass/` | Overpass API | Advanced queries |
| `fetch.ts` | Universal | HTTP client with caching |
| `tagging/` | iD schema | POI type definitions |

---

## Component Architecture

### Component Organization

**Feature-Based Structure:**
```
src/components/
├── App/                    # App-level components
├── Map/                    # Map integration
├── FeaturePanel/           # Feature details
│   ├── EditDialog/         # Editing UI
│   └── Climbing/           # Climbing-specific
├── Directions/             # Navigation
├── SearchBox/              # Search
├── HomepagePanel/          # Landing page
├── ClimbingAreasPanel/     # Climbing browser
└── MyTicksPanel/           # User ticks
```

### Component Patterns

**Feature Panels Pattern:**
- Slide-out panel from right
- Map integration (center on feature)
- Open/close state management
- Responsive sizing

**Edit Dialog Pattern:**
- Modal with multi-step form
- Preset-based field selection
- OSM API integration for saves
- Validation and error handling

**Context-Based State:**
- `DirectionsContext` - Routing state
- `ClimbingContext` - Climbing features
- EditDialog contexts - Form state

---

## Source Tree Structure

```
osmapp/
├── pages/                  # Next.js routes
│   ├── api/               # API endpoints
│   ├── feature/           # Feature detail pages
│   ├── directions/        # Directions pages
│   ├── _app.tsx           # App wrapper
│   └── _document.tsx      # HTML structure
├── src/
│   ├── components/        # React components
│   ├── services/          # Business logic
│   ├── server/            # Server-only code
│   ├── helpers/           # Utilities
│   ├── locales/           # i18n
│   ├── config.mjs         # App config
│   ├── types.ts           # Type definitions
│   └── utils.ts           # Utilities
└── public/                # Static assets
```

---

## Development Workflow

**File-Based Routing:** Next.js Pages Router
- Dynamic routes: `[...all].tsx`
- API routes: `api/*.ts`

**Hot Reload:** Automatic on file change

**Linting:** ESLint + Prettier with Husky pre-commit hooks

**Testing:** Jest with React Testing Library

---

## Deployment Architecture

### Platform: Vercel

**Compute:** Serverless Functions (API routes)
**Static:** CDN for static assets
**Database:** SQLite (server-side, climbing ticks)

### Deployment Flow

```
Git Push → GitHub → Vercel Build → Deploy → CDN
                ↓
           Run Tests
                ↓
           Lint Code
```

---

## State Management

### Client State
- React Context for complex state
- Component state for local UI

### Server State
- React Query for API caching
- In-memory fetch cache

### Persistence
- HTTP-only cookies (OAuth tokens)
- LocalStorage (user preferences)
- SQLite (climbing ticks)

---

## Security Architecture

### Authentication
- **Provider:** OpenStreetMap OAuth
- **Flow:** Authorization code grant
- **Token Storage:** HTTP-only cookie
- **Verification:** Server-side on each API call

### API Key Management
- Client-side keys: `NEXT_PUBLIC_*` prefix
- Server-side secrets: Environment variables only
- Rotation: Regular key updates recommended

### Data Protection
- No sensitive data in localStorage
- Secure cookie flags (production)
- HTTPS enforcement

---

## Performance Optimization

### Code Splitting
- Next.js automatic page-based splitting
- Dynamic imports for heavy components

### Caching Strategy
- API response caching (session-based)
- CDN caching for static assets
- Map tile caching (provider-side)

### Bundle Optimization
- Tree-shaking (Webpack)
- Emotion compiler (CSS purging)
- Image optimization (Next.js Image)

---

## Internationalization

**Supported Languages:** 12+
- English, Czech, German, Polish, Spanish, Italian, French, Japanese, Chinese, Russian, Amharic

**Implementation:**
- Translation files: `src/locales/`
- Service: `src/services/intl.tsx`
- Locale detection: Browser + URL parameter

---

## Error Handling

### Client Errors
- Sentry integration (browser)
- Error boundaries (React)
- User-friendly error messages

### Server Errors
- Sentry integration (server)
- API error responses
- Graceful degradation

### External API Failures
- Retry logic with exponential backoff
- Fallback to cached data
- User notifications

---

## Testing Strategy

### Unit Tests
- Service functions
- Utility functions
- Custom hooks

### Integration Tests
- API routes
- Component interactions

### E2E Tests
- Not currently implemented
- Manual testing via preview deployments

---

## Monitoring & Observability

### Error Tracking
- Sentry (client + server)
- Release tracking
- Performance monitoring

### Analytics (Optional)
- Google Analytics
- Umami
- Hotjar

---

## Scalability Considerations

### Current Limitations
- SQLite for user data (single-server)
- In-memory caching (no shared cache)
- Serverless function timeouts

### Scaling Options
- Migrate to PostgreSQL/RDS
- Add Redis for shared cache
- Move heavy processing to background jobs

---

## Technical Debt & Known Issues

### TypeScript Strict Mode
- Currently disabled
- Gradual migration in progress

### Test Coverage
- Not comprehensive
- Focus on critical paths

### Large Page Data Warning
- Some features exceed Next.js limits
- Optimization needed for complex relations

---

## Future Architecture Considerations

### Potential Improvements
- Migrate to Next.js App Router
- Implement GraphQL for data fetching
- Add Redis caching layer
- Migrate to serverful deployment for heavy features

### Technical Alternatives Considered
- **Mapbox GL** → Replaced with MapLibre GL (open source)
- **Redux** → Replaced with React Query + Context
- **REST** → Considered GraphQL, stayed with REST for simplicity
