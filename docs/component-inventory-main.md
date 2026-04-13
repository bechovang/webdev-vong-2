# Component Inventory - OsmAPP

## Overview

OsmAPP uses a **feature-based component architecture** organized by functionality. Components are primarily React functional components with TypeScript, using Material-UI (MUI) as the base design system.

## Component Categories

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `App/Loading` | `src/components/App/Loading.tsx` | Loading screen/skeleton |
| `App/helpers` | `src/components/App/helpers.ts` | App-level utility functions |

---

### Map Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Map/` | `src/components/Map/` | MapLibre GL map integration |
| `LayerSwitcher/` | `src/components/LayerSwitcher/` | Layer selection control |

**Map Sub-components:**
- Vector tile rendering
- 3D terrain support
- Indoor mapping overlay
- Marker management
- Interaction handlers

---

### Feature Panel Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `FeaturePanel/` | `src/components/FeaturePanel/` | Main feature details panel |
| `FeaturePanel/EditDialog/` | `src/components/FeaturePanel/EditDialog/` | Edit feature dialog |
| `FeaturePanel/EditDialog/EditContent/` | `src/components/FeaturePanel/EditDialog/EditContent/` | Edit form content |

**Edit Sub-components:**
| Component | Purpose |
|-----------|---------|
| `FeatureEditSection/` | Base edit section component |
| `LocationEditor/` | Edit coordinates/geometry |
| `OpeningHoursEditor/` | Opening hours editor |
| `MembersEditor/` | Relation members editor |
| `ClimbingEditor/` | Climbing-specific attributes |

---

### Climbing Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Climbing/` | `src/components/Climbing/` | Climbing feature view |
| `ClimbingAreasPanel/` | `src/components/ClimbingAreasPanel/` | Climbing areas panel |
| `FeaturePanel/Climbing/` | `src/components/FeaturePanel/Climbing/` | Climbing details in feature panel |

**Climbing Sub-components:**
| Component | Purpose |
|-----------|---------|
| `ClimbingView.tsx` | Main climbing view component |
| `ClimbingViewContent.tsx` | Content renderer |
| `ClimbingBadges.tsx` | Difficulty/grade badges |
| `ClimbingGuideInfo.tsx` | Guide information display |
| `ClimbingRestriction.tsx` | Access restrictions |
| `ClimbingCragDialog.tsx` | Crag detail dialog |
| `ClimbingCragDialogHeader.tsx` | Crag dialog header |
| `ClimbingEditorHelperText.tsx` | Editor helper text |
| `ClimbingGradesTable/` | Grades comparison table |
| `CragsInAreaSort/` | Sort/filter crags in area |
| `RouteList/` | List of climbing routes |
| `Ticks/` | User tick management |
| `Editor/` | Climbing-specific editor |
| `Filter/` | Route filtering |
| `AreaIcon.tsx` | Area type icon |
| `CragIcon.tsx` | Crag type icon |
| `CameraMarker.tsx` | Photo location marker |
| `CragMap.tsx` | Mini map for crag |

**Climbing Context:**
- `contexts/ClimbingContext.tsx` - State management for climbing features
- `contexts/osmToClimbingRoutes.ts` - OSM data to climbing routes transformation

---

### Directions Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `Directions/` | `src/components/Directions/` | Navigation/routing panel |
| `Directions/Directions.tsx` | Main directions component |
| `Directions/DirectionsBox.tsx` | Direction input container |
| `Directions/DirectionsForm.tsx` | Route planning form |
| `Directions/DirectionsAutocomplete.tsx` | Location autocomplete |
| `Directions/DirectionsButton.tsx` | Toggle directions panel |
| `Directions/ModeToggler.tsx` | Transport mode selector |
| `Directions/Instructions.tsx` | Turn-by-turn instructions |
| `Directions/Result.tsx` | Route result display |
| `Directions/TextMarker.tsx` | Text label on map |
| `Directions/DirectionsContext.tsx` | Routing state context |

**Routing Services:**
| Service | Purpose |
|---------|---------|
| `routing/getGraphhopperResults.ts` | GraphHopper routing API |
| `routing/getBrouterResults.ts` | Brouter routing API |
| `routing/handleRouting.ts` | Routing orchestration |
| `routing/instructions.ts` | Turn instruction parsing |
| `routing/types.ts` | Routing type definitions |

---

### Search Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `SearchBox/` | `src/components/SearchBox/` | Location search input |

**Features:**
- Photon search integration
- Category search (iD presets)
- Overpass query support
- Recent searches

---

### Homepage Panel

| Component | Location | Purpose |
|-----------|----------|---------|
| `HomepagePanel/` | `src/components/HomepagePanel/` | Landing page content |

---

### My Ticks Panel

| Component | Location | Purpose |
|-----------|----------|---------|
| `MyTicksPanel/` | `src/components/MyTicksPanel/` | User's climbing ticks |

---

## Shared Components

### Utilities

| Component | Location | Purpose |
|-----------|----------|---------|
| `components/helpers.tsx` | Shared helper functions |
| `components/utils/` | Utility functions |

---

## Design System

### Base Library: Material-UI (MUI) v7.1.2

**Key MUI Components Used:**
- `Box`, `Stack`, `Grid` - Layout
- `Button`, `IconButton` - Actions
- `TextField`, `Select`, `Autocomplete` - Forms
- `Dialog`, `Drawer`, `Popover` - Overlays
- `Card`, `Paper` - Containers
- `Typography` - Text
- `Icon`, `SvgIcon` - Icons
- `Tooltip` - Tooltips
- `Divider` - Separators
- `Tabs`, `Tab` - Navigation
- `Badge` - Notifications
- `Chip` - Tags/labels
- `Accordion` - Expandable sections
- `Slider` - Range input
- `Switch`, `Checkbox`, `Radio` - Selection

### Custom Components Built on MUI

| Component | Base | Customization |
|-----------|------|---------------|
| FeaturePanel | Dialog/Drawer | Slide panel, map integration |
| EditDialog | Dialog | Multi-step form, validation |
| LayerSwitcher | Popover | Layer selection, custom UI |
| DirectionsBox | Paper/Collapse | Collapsible routing panel |

### Styling Approach

**Primary:** Emotion (CSS-in-JS)
- `@emotion/styled` for styled components
- `@emotion/react` for css prop
- MUI Emotion compiler integration

**Theming:** Custom MUI theme (location: likely in theme configuration)

---

## Component Patterns

### Feature Panels

**Pattern:** Slide-out panel from right side

**Components:** FeaturePanel, Directions, HomepagePanel, MyTicksPanel, ClimbingAreasPanel

**Shared Behavior:**
- Open/close state management
- Map integration (center on feature)
- Responsive sizing
- Back button navigation

### Edit Dialogs

**Pattern:** Modal dialog with multi-step form

**Components:** EditDialog, ClimbingCragDialog

**Shared Behavior:**
- Form validation
- OSM API integration for saves
- Preset-based field selection
- Opening hours editor
- Relation members editor

### Context-Based State

**Pattern:** React Context for complex state

**Contexts:**
- `DirectionsContext` - Routing state
- `ClimbingContext` - Climbing feature state
- EditDialog contexts - Form state

---

## Icon System

**Sources:**
1. MUI Icons (`@mui/icons-material`)
2. Custom SVG icons (public/icons/)
3. Map markers (public/icons-climbing/)
4. Weather icons (public/icons-weather/)

**Icon Categories:**
- POI type icons (from tagging schema)
- Action icons (edit, save, delete, etc.)
- Navigation icons
- Climbing-specific icons

---

## Map Integration Components

### MapLibre GL Integration

**Location:** `src/components/Map/`

**Features:**
- Vector tile rendering
- 3D terrain (when tilted)
- Indoor mapping overlay
- Custom markers
- GeoJSON layers
- Interaction handlers (click, hover)

### Layer Management

**Layer Types:**
- Base layers (MapTiler, Thunderforest, OSM)
- Overlay layers (climbing, indoor, weather)
- User-defined layers
- Editor layers

---

## Testing Components

**Test Location:** `__tests__/` directories alongside components

**Testing Framework:** Jest + React Testing Library

**Tested Components:**
- Utility functions
- Context providers
- Service functions
- Component rendering

---

## Component Hierarchy Summary

```
App (pages/_app.tsx)
├── Map/
│   ├── MapLibreGL map
│   ├── LayerSwitcher
│   └── Markers/Overlays
├── SearchBox
├── FeaturePanel (open/close)
│   ├── EditDialog
│   ├── Climbing view (conditional)
│   └── Standard POI view
├── Directions (open/close)
│   ├── DirectionsForm
│   ├── Instructions
│   └── Result
├── HomepagePanel
├── ClimbingAreasPanel
└── MyTicksPanel
```

---

## Reusable vs Feature-Specific

### Reusable Components
- Map components
- SearchBox
- Form editors (opening hours, members)
- Utility components

### Feature-Specific Components
- Climbing components (large feature set)
- Directions components
- Homepage panel
- Ticks management

---

## Performance Considerations

### Code Splitting
- Next.js automatic code splitting by page
- Dynamic imports for heavy components
- Separate bundles for feature panels

### Lazy Loading
- Map library (loaded on demand)
- Feature panels (opened on demand)
- Image galleries

### Memoization
- React.memo for expensive components
- useMemo/useCallback for event handlers
