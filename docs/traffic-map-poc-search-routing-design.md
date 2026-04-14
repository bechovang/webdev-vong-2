# Traffic Map PoC - Search and Routing Design

## Purpose

This document defines the most practical way to add:

- place search
- route planning

to `traffic-map-poc`.

The goal is not to build full navigation. The goal is to add a clean PoC flow that proves:

1. a user can find a place
2. a user can choose start and end points
3. the app can request a route
4. the route can be rendered on the map
5. the app can show route summary information

---

## Product Goal

For this PoC, routing only needs one simple flow:

1. choose origin
2. choose destination
3. request route
4. draw route polyline
5. show distance, ETA, and basic steps

This is enough to demonstrate value without building full turn-by-turn navigation.

---

## What We Learned From `osmapp`

The reference app already contains strong patterns for both search and routing:

- Search:
  - `ref app/osmapp/src/components/SearchBox`
  - geocoder integration in `options/geocoder.tsx`
  - debounced suggestion loading in `useGetOptions.tsx`
- Routing:
  - `ref app/osmapp/src/components/Directions`
  - normalized route result in `routing/types.ts`
  - route rendering via `GeoJSON source + line layer` in `routing/handleRouting.ts`

These patterns are useful.

However, the actual `osmapp` implementation is too heavy to port directly into `traffic-map-poc` because it depends on:

- MUI-heavy UI structure
- app-specific global map storage and contexts
- URL-driven routing state
- multi-stop routing
- drag-and-drop destination editing
- GraphHopper-specific integration

So the correct strategy is:

- reuse the architecture ideas
- write a much smaller implementation for this PoC

---

## Design Decision

### Search

Use a simple search input with debounced suggestions.

Do not build the full `osmapp` search stack.

The PoC version should:

- call a project-owned API endpoint
- receive normalized place results
- let the user select one result
- move the map to the selected place
- optionally use the result as origin or destination

### Routing

Use a simple two-point route flow.

Do not build full navigation.

The PoC version should:

- support one origin
- support one destination
- call `POST /api/route`
- render the returned route geometry as a line layer
- fit the route into the viewport
- show route summary and a short step list

---

## Recommended User Flow

### Phase 1 Flow

1. user searches for a place or clicks on the map
2. user sets start point
3. user searches for another place or clicks on the map
4. user sets end point
5. app requests route
6. app renders route
7. app shows distance and ETA

### Interaction Rules

- first selected point becomes origin
- second selected point becomes destination
- if both already exist, the UI should force the user to explicitly replace one
- clear route action resets origin, destination, route, and summary

---

## Scope Boundaries

### In Scope

- place search suggestions
- place selection
- map-based origin/destination picking
- route request
- route rendering
- route summary panel
- basic instruction list

### Out of Scope

- live navigation
- rerouting
- traffic-aware routing
- route alternatives
- multi-stop trips
- voice guidance
- lane guidance
- progress tracking along the route

---

## Architecture

## Frontend

Add these pieces to `traffic-map-poc`:

- `searchQuery`
- `searchResults`
- `origin`
- `destination`
- `route`
- `routeSummary`
- `routeSteps`
- `pickingMode: 'origin' | 'destination' | null`

### Suggested State Shape

```ts
type Coordinate = [number, number];

interface SearchResult {
  id: string;
  label: string;
  secondaryText?: string;
  center: Coordinate;
  bbox?: [number, number, number, number];
}

interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

interface RouteData {
  distanceMeters: number;
  durationSeconds: number;
  geometry: GeoJSON.LineString;
  steps: RouteStep[];
}
```

### Frontend Components

- `SearchBox`
  - input
  - suggestion list
  - select result
- `RouteControls`
  - set start
  - set end
  - get route
  - clear route
- `RouteLayer`
  - map source + line layer for route
- `RouteSummaryPanel`
  - distance
  - ETA
  - basic instructions

---

## Backend

Two endpoints are enough for the PoC:

### Search

```http
GET /api/search?q=ben thanh
```

### Route

```http
POST /api/route
```

Request body:

```json
{
  "origin": [106.7009, 10.7769],
  "destination": [106.6822, 10.7626]
}
```

Response body:

```json
{
  "status": "success",
  "data": {
    "distanceMeters": 5200,
    "durationSeconds": 940,
    "geometry": {
      "type": "LineString",
      "coordinates": [
        [106.7009, 10.7769],
        [106.699, 10.775],
        [106.6822, 10.7626]
      ]
    },
    "steps": [
      {
        "instruction": "Go straight",
        "distanceMeters": 300
      },
      {
        "instruction": "Turn right onto Road X",
        "distanceMeters": 500
      }
    ]
  }
}
```

---

## Why a Project-Owned API Layer

Search and routing should go through our API layer instead of calling third-party services directly from the client.

Reasons:

- keeps the frontend contract stable
- allows provider swapping later
- avoids leaking provider-specific response shapes into UI code
- allows fake and real implementations behind the same contract

This is especially important for routing because Phase 1 and Phase 2 may use different providers.

---

## Search Design

### Recommendation

Implement a minimal geocoder flow inspired by `osmapp`, but much simpler.

### Provider Strategy

Use one provider behind `/api/search`, such as:

- Photon
- Nominatim

The frontend should never depend on the raw provider response.

### Search Result Contract

Normalize everything into:

- `id`
- `label`
- `secondaryText`
- `center`
- `bbox`

### Search Behavior

- debounce requests by `300-400ms`
- only search when input length is meaningful
- selecting a result should:
  - move map to result
  - optionally set origin or destination

### Why This Is Better Than Porting `osmapp` Search

`osmapp` search is a multi-source general map search engine.

`traffic-map-poc` only needs:

- one source
- one simple suggestion list
- one normalized contract

Anything beyond that is unnecessary complexity for the PoC.

---

## Routing Design

### Recommendation

Implement routing in three phases.

### Phase R1 - UI-first PoC

- pick origin and destination on the map
- call `POST /api/route`
- return a fake route if needed
- render route line
- fit route bounds
- show distance and ETA

This is the fastest path to a working PoC.

### Phase R2 - Real routing backend

- keep the same frontend contract
- replace fake route generation with Valhalla or another engine
- normalize route response on the backend
- include basic maneuvers as `steps`

### Phase R3 - Search-integrated routing

- select start and end from search results
- map search result directly into route endpoints

---

## Fake Route Strategy

If routing infrastructure is not ready yet, do not block the PoC.

Use a fake backend implementation that:

- accepts origin and destination
- returns a simple `LineString`
- optionally inserts one or two synthetic midpoints
- computes rough distance
- estimates rough duration
- returns simple placeholder steps

This is acceptable for PoC UI validation because it proves:

- request flow
- route drawing
- summary rendering
- fitBounds behavior

The frontend contract stays valid when the backend becomes real.

---

## Route Rendering

Render the route the same way `osmapp` does conceptually:

- one `GeoJSON source`
- one `line layer`
- optional white casing layer underneath

### Suggested Style

- blue route line
- width `4-6`
- opacity around `0.85`
- rounded caps and joins

### After Route Load

Always fit the route bounds to the viewport.

This is important because the route must feel immediate and visible.

---

## Picking Origin and Destination

### Recommended PoC UX

The simplest workable UX is:

- `Pick Start`
- `Pick End`
- click map to choose each point
- `Get Route`
- `Clear Route`

Alternative ultra-fast flow:

- first click = origin
- second click = destination
- auto-route after second click

The explicit button flow is safer and easier to understand.

---

## Summary Panel

The route summary panel should stay small.

Display:

- distance
- ETA
- 3-5 basic steps

The panel is only for route confirmation, not full navigation guidance.

---

## Data Contracts

### Search Result

```ts
interface SearchResult {
  id: string;
  label: string;
  secondaryText?: string;
  center: [number, number];
  bbox?: [number, number, number, number];
}
```

### Route Response

```ts
interface RouteResponse {
  status: 'success' | 'error';
  data?: {
    distanceMeters: number;
    durationSeconds: number;
    geometry: GeoJSON.LineString;
    steps: {
      instruction: string;
      distanceMeters: number;
    }[];
  };
  error?: string;
}
```

---

## Technical Decisions

### Decision 1

Search and routing will be implemented with project-owned API routes.

### Decision 2

Frontend contracts will be normalized and provider-agnostic.

### Decision 3

Route rendering will use `GeoJSON source + line layer`, not markers.

### Decision 4

The PoC will support only one origin and one destination.

### Decision 5

The first routing milestone can use a fake backend if real routing infra is not ready.

---

## Recommended Implementation Order

1. Add `GET /api/search`
2. Add minimal search UI
3. Add route state for origin, destination, and route
4. Add map click picking for origin and destination
5. Add `POST /api/route`
6. Render route line on the map
7. Add route summary panel
8. Connect search results to origin/destination setters

This order gives visible progress quickly and keeps the frontend contract stable.

---

## Final Recommendation

The best fit for `traffic-map-poc` is:

- a lightweight search flow inspired by `osmapp` geocoder behavior
- a lightweight routing flow inspired by `osmapp` route rendering behavior
- a fresh implementation tailored to PoC scope

In short:

**reuse the patterns, not the full codebase design**

That gives us the fastest path to a useful PoC without importing `osmapp` complexity into a much smaller project.
