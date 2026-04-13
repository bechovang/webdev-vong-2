# API Contracts - OsmAPP

## Overview

OsmAPP uses **Next.js API Routes** for server-side endpoints and external service integrations. The application follows a service-oriented architecture with client-side API services for external integrations.

## Internal API Routes

### Authentication & User

#### `GET /api/user`
Get current authenticated user information.

**Authentication:** Required (OSM token cookie)

**Response:**
```json
{
  "user": {
    "id": "number",
    "display_name": "string",
    "image_url": "string",
    "changesets_count": "number"
  }
}
```

**Error Response:**
- `500` - Server error

---

### Climbing Ticks API

#### `GET /api/climbing-ticks`
Get all climbing ticks for the authenticated user.

**Authentication:** Required (OSM token cookie)

**Response:**
```json
[
  {
    "id": "number",
    "osmUserId": "number",
    "osmType": "string",
    "osmId": "number",
    "timestamp": "string",
    "style": "string",
    "myGrade": "string",
    "note": "string",
    "pairing": "string"
  }
]
```

#### `POST /api/climbing-ticks`
Create a new climbing tick.

**Authentication:** Required (OSM token cookie)

**Request Body:**
```json
{
  "pairing": "string",
  "style": "string",
  "myGrade": "string",
  "osmType": "string",
  "osmId": "number",
  "note": "string",
  "timestamp": "string"
}
```

**Response:**
```json
{
  "id": "number"
}
```

#### `GET /api/climbing-ticks/[id]`
Get a specific climbing tick by ID.

**Authentication:** Required (OSM token cookie)

#### `PUT /api/climbing-ticks/[id]`
Update a specific climbing tick.

**Authentication:** Required (OSM token cookie + ownership verification)

**Request Body:** (Partial update allowed)
```json
{
  "osmType": "string",
  "osmId": "number",
  "timestamp": "string",
  "style": "string",
  "myGrade": "string",
  "note": "string",
  "pairing": "string"
}
```

#### `DELETE /api/climbing-ticks/[id]`
Delete a specific climbing tick.

**Authentication:** Required (OSM token cookie + ownership verification)

**Error Responses:**
- `404` - Tick not found
- `401` - Unauthorized (not owned by user)

---

### Climbing Tiles API

#### `GET /api/climbing-tiles/tile`
Get vector tile for climbing areas.

**Query Parameters:**
- Standard XYZ tile coordinates

#### `GET /api/climbing-tiles/search`
Search climbing areas.

#### `GET /api/climbing-tiles/stats`
Get climbing statistics.

#### `GET /api/climbing-tiles/refresh`
Refresh climbing tiles cache.

---

### Image Generation API

#### `GET /api/load-og-image`
Load OpenGraph image for social sharing.

#### `GET /api/og-image`
Generate OpenGraph image.

**Response:** Image (PNG/JPEG)

---

## External Service Integrations

### OpenStreetMap API

**Base URL:** `https://api.openstreetmap.org/api/0.6/`

**Service Location:** `src/services/osm/`

| Service | Description |
|---------|-------------|
| `osmApi.ts` | Core OSM API integration (fetch features, history) |
| `fetchParentFeatures.ts` | Fetch relation members |
| `fetchWays.ts` | Fetch way geometries |
| `insertOsmNote.ts` | Create OSM notes (anonymous edits) |
| `offlineItems.tsx` | Test data for development |

**Key Functions:**
- `fetchFeature(apiId)` - Fetch complete feature with members and parents
- `clearFeatureCache(apiId)` - Clear cached feature data
- `fetchOverpassCenter(apiId)` - Get feature center via Overpass API

---

### Overpass API

**Base URL:** `https://overpass-api.de/api/interpreter`

**Service Location:** `src/services/overpass/`

| Service | Description |
|---------|-------------|
| `fetchOverpass.ts` | Execute Overpass QL queries |
| `fetchOverpassCenter.ts` | Get feature center coordinates |
| `overpassSearch.ts` | Search POIs with custom queries |
| `fetchAroundFeatures.ts` | Fetch features around a point |

**Example Query:**
```javascript
const query = `[out:json];node(50.1,14.3,50.2,14.4);out;`;
```

---

### Photon Search API

**Base URL:** `https://photon.komoot.io/api/`

**Description:** Location/geocoding search

**Usage:** Type-ahead search for places, addresses, POIs

---

### MapTiler API

**Base URL:** `https://api.maptiler.com/`

**Services:**
- Vector tiles (map rendering)
- Geocoding
- Terrain data for 3D views

**Environment Variable:** `NEXT_PUBLIC_API_KEY_MAPTILER`

---

### GraphHopper Directions API

**Base URL:** `https://graphhopper.com/api/1/`

**Service Location:** `src/components/Directions/routing/getGraphhopperResults.ts`

**Services:**
- Route planning
- Turn-by-turn directions
- Multiple routing profiles (car, bike, foot, public transport)

**Environment Variable:** `NEXT_PUBLIC_API_KEY_GRAPHHOPPER`

---

### Mapillary API

**Base URL:** `https://graph.mapillary.com/`

**Service Location:** `src/services/images/`

**Services:**
- Street-level imagery
- Image search by location

**Environment Variable:** `NEXT_PUBLIC_API_KEY_MAPILLARY`

---

### IndoorEqual API

**Base URL:** `https://indoorequal.com/`

**Services:**
- Indoor mapping data
- Indoor routing

**Environment Variable:** `NEXT_PUBLIC_API_KEY_INDOOREQUAL`

---

### Thunderforest API

**Base URL:** `https://tile.thunderforest.com/`

**Services:**
- Raster map tiles
- Multiple map styles (Outdoor, Transport, Landscape, etc.)

**Environment Variable:** `NEXT_PUBLIC_API_KEY_THUNDERFOREST`

---

## Client-Side API Services

### Fetch Service

**Location:** `src/services/fetch.ts`

**Features:**
- Universal fetch (isomorphic-unfetch)
- Response caching
- Error handling with custom FetchError class
- JSON parsing helpers

### Fetch Cache

**Location:** `src/services/fetchCache.ts`

**Features:**
- In-memory response caching
- Cache invalidation
- Offline support helpers

### Tagging Service

**Location:** `src/services/tagging/`

**Services:**
- `idTaggingScheme.ts` - iD editor tagging schema integration
- `presets.ts` - POI type presets
- `fields.ts` - Form field definitions
- `translations.ts` - Tag translations

### Internationalization Service

**Location:** `src/services/intl.tsx`, `src/services/intlServer.tsx`

**Services:**
- Client-side translations
- Server-side translations
- Locale detection

### Climbing Areas Service

**Location:** `src/services/climbing-areas/`

**Services:**
- Climbing area data management
- Crag/route information
- Area boundaries

---

## Authentication Flow

1. **Client initiates OAuth** → Redirects to `https://www.openstreetmap.org/oauth2/authorize`
2. **User approves** → Redirects back with authorization code
3. **Server exchanges code** → Gets access token from OSM
4. **Token stored in cookie** → `OSM_TOKEN_COOKIE`
5. **API routes verify token** → Call `serverFetchOsmUser()`

**Cookie Configuration:**
- Name: `OSM_TOKEN_COOKIE` (defined in `src/services/osm/consts.ts`)
- HttpOnly: true
- Secure: true (production)

---

## Data Models

### Feature Model

**Location:** `src/services/types.ts`

```typescript
interface Feature {
  type: 'Feature';
  skeleton: boolean;
  nonOsmObject: boolean;
  osmMeta: OsmId;
  center: LonLat | false;
  tags: Record<string, string>;
  properties: {
    class: string;
    subclass: string;
  };
  error?: string;
  memberFeatures?: Feature[];
  parentFeatures?: Feature[];
  imageDefs?: ImageDef[];
  countryCode?: string;
}
```

### OSM Element Model

```typescript
interface OsmId {
  type: 'node' | 'way' | 'relation';
  id: number;
}

interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  changeset: number;
  timestamp: string;
  version: number;
  user: string;
  uid: number;
  tags: Record<string, string>;
  members?: Array<{
    type: string;
    ref: number;
    role: string;
  }>;
}
```

### Climbing Tick Model

```typescript
interface ClimbingTickDb {
  id: number;
  osmUserId: number;
  osmType: string;
  osmId: number;
  timestamp: string;
  style: string;
  myGrade: string;
  note: string;
  pairing: string;
}
```

---

## Rate Limiting & Caching

### Caching Strategy

| Cache Type | Location | Duration |
|------------|----------|----------|
| Feature data | In-memory (fetchCache) | Session-based |
| Overpass queries | In-memory | Session-based |
| Center coordinates | featureCenterCache | Session-based |
| API responses | Vercel edge cache | Varies |

### Rate Limits

- **Overpass API:** No strict limit, but excessive requests may be throttled
- **GraphHopper:** Included in commercial plan
- **MapTiler:** Based on subscription tier
- **Mapillary:** Based on usage tier

---

## Error Handling

### Error Types

| Error Code | Description |
|------------|-------------|
| `404` | Resource not found |
| `401` | Unauthorized / Invalid token |
| `410` | Feature deleted (OSM) - supports undelete |
| `429` | Rate limit exceeded |
| `500` | Server error |
| `503` | Service unavailable |

### Custom Errors

```typescript
class FetchError extends Error {
  code: string;
  constructor(message: string, code: string);
}
```

**Common Error Codes:**
- `410` - Feature deleted from OSM (can fetch last version from history)
- `504` - Gateway timeout (Overpass API overloaded)

---

## WebSocket / Real-time

**Status:** Not implemented

All data fetching is currently HTTP-based with polling for updates if needed.

---

## GraphQL

**Status:** Not used

OsmAPP uses REST APIs exclusively (OSM API, Overpass, external services).

---

## Testing Endpoints

### Test Mode

Enable test API by setting:
```bash
NEXT_PUBLIC_ENABLE_TEST_API=true
```

This enables test endpoints like `/api/sentry-example-api` for development.

### Offline Test Data

Test features available:
- `relation/6` - Test crag
- `node/6` - Test node

Defined in `src/services/osm/offlineItems.tsx`
