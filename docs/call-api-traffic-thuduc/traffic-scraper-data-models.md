# Data Models - Traffic Scraper

## Overview

Traffic Scraper uses a layered data model approach:
1. **Configuration Models** - Route definitions and settings
2. **API Response Models** - Raw TomTom API data
3. **Domain Models** - Validated traffic data with LOS calculation
4. **Storage Models** - CSV schemas for persistence

## Data Model Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Layer                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  RouteConfig                                            │ │
│  │  - id, name, origin, destination, distance_km           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                       API Layer                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  APIResponse                                            │ │
│  │  - route_id, distance_meters, travel_time_seconds,      │ │
│  │    traffic_time_seconds, raw_response                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Processing Layer                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Metrics Calculation                                    │ │
│  │  - current_speed, free_flow_speed, congestion_ratio     │ │
│  │  - LOS calculation (A-F)                                │ │
│  │  - congestion_level                                     │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  TrafficData                                            │ │
│  │  - timestamp, route_id, route_name, coordinates,        │ │
│  │    speeds, travel_time, congestion_level, los           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    Storage Layer                            │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────┐ │
│  │  Traffic Data    │  │  Failed Routes   │  │  Summary   │ │
│  │  CSV             │  │  CSV             │  │  CSV       │ │
│  └──────────────────┘  └──────────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Core Data Models

### 1. RouteConfig

**File:** `src/models.py`

**Purpose:** Configuration for a single route to monitor

**Schema:**
```python
@dataclass
class RouteConfig:
    id: str                      # Unique route identifier (e.g., "route_01")
    name: str                    # Human-readable name
    origin: dict                 # {"lat": float, "lng": float}
    destination: dict            # {"lat": float, "lng": float}
    distance_km: float           # Route distance in kilometers
    description: str             # Route description
```

**Example:**
```python
RouteConfig(
    id="route_01",
    name="Lê Văn Việt - Quốc Lộ 1A",
    origin={"lat": 10.7589, "lng": 106.6669},
    destination={"lat": 10.7689, "lng": 106.7769},
    distance_km=12.5,
    description="Main corridor from Lê Văn Việt to Quốc Lộ 1A"
)
```

**Source:** Loaded from `config/routes.yaml`

---

### 2. APIResponse

**File:** `src/models.py`

**Purpose:** Raw TomTom API response data

**Schema:**
```python
@dataclass
class APIResponse:
    route_id: str                      # Route identifier
    distance_meters: int               # Distance in meters
    travel_time_seconds: int           # Free-flow travel time
    traffic_time_seconds: int          # Traffic-adjusted travel time
    raw_response: dict                 # Full API response
```

**TomTom API Response Structure:**
```json
{
  "routes": [
    {
      "summary": {
        "lengthInMeters": 12500,
        "travelTimeInSeconds": 1800,
        "trafficTimeInSeconds": 2400
      }
    }
  ]
}
```

**Mapping:**
```python
distance_meters = routes[0].summary.lengthInMeters
travel_time_seconds = routes[0].summary.travelTimeSeconds
traffic_time_seconds = routes[0].summary.trafficTimeSeconds
```

---

### 3. TrafficData

**File:** `src/models.py`

**Purpose:** Validated traffic data record (domain model)

**Schema:**
```python
@dataclass
class TrafficData:
    timestamp: str                # ISO8601 with timezone
    route_id: str                 # Route identifier
    route_name: str               # Human-readable name
    origin_lat: float             # Origin latitude
    origin_lng: float             # Origin longitude
    dest_lat: float               # Destination latitude
    dest_lng: float               # Destination longitude
    current_speed: float          # Current speed (km/h)
    free_flow_speed: float        # Free flow speed (km/h)
    travel_time_seconds: int      # Travel time in seconds
    congestion_level: str         # Congestion level (A-F)
    los: str                      # Level of Service (A-F)
```

**Methods:**
```python
def to_dict(self) -> dict:
    """Convert to dictionary for CSV writing."""

def to_csv_row(self) -> str:
    """Convert to CSV row string."""
```

**Example:**
```python
TrafficData(
    timestamp="2026-04-13T09:00:00+07:00",
    route_id="route_01",
    route_name="Lê Văn Việt - Quốc Lộ 1A",
    origin_lat=10.7589,
    origin_lng=106.6669,
    dest_lat=10.7689,
    dest_lng=106.7769,
    current_speed=18.75,
    free_flow_speed=25.00,
    travel_time_seconds=2400,
    congestion_level="Low",
    los="B"
)
```

---

## Metrics Calculation

### Speed Calculations

**Current Speed:**
```python
current_speed = (distance_meters / 1000) / (traffic_time_seconds / 3600)
# Units: km/h
# Represents: Speed under current traffic conditions
```

**Free Flow Speed:**
```python
free_flow_speed = (distance_meters / 1000) / (travel_time_seconds / 3600)
# Units: km/h
# Represents: Speed under ideal conditions (no traffic)
```

**Example:**
```python
# Distance: 12.5 km
# Traffic time: 2400 seconds (40 minutes)
# Free flow time: 1800 seconds (30 minutes)

current_speed = 12.5 / (2400 / 3600) = 18.75 km/h
free_flow_speed = 12.5 / (1800 / 3600) = 25.00 km/h
```

---

## LOS (Level of Service) Calculation

### LOS Levels

**File:** `src/models.py`

**Class:** `LOS_LEVELS`

| LOS | Congestion Ratio | Description (Vietnamese) | Description (English) |
|-----|------------------|-------------------------|----------------------|
| **A** | ≥ 0.90 | Thông thoáng | Free flow |
| **B** | ≥ 0.75 | Khá thông thoáng | Reasonably free flow |
| **C** | ≥ 0.60 | Bình thường | Stable flow |
| **D** | ≥ 0.45 | Bắt đầu chậm | Approaching unstable |
| **E** | ≥ 0.30 | Kẹt xe | Unstable flow |
| **F** | < 0.30 | Kẹt xe nặng | Forced flow |

**Implementation:**
```python
class LOS_LEVELS:
    A = {"min_ratio": 0.9, "description": "Thông thoáng"}
    B = {"min_ratio": 0.75, "description": "Khá thông thoáng"}
    C = {"min_ratio": 0.6, "description": "Bình thường"}
    D = {"min_ratio": 0.45, "description": "Bắt đầu chậm"}
    E = {"min_ratio": 0.3, "description": "Kẹt xe"}
    F = {"min_ratio": 0.0, "description": "Kẹt xe nặng"}
```

### LOS Calculation Function

**Function:** `calculate_los(congestion_ratio: float) -> str`

**Algorithm:**
```python
def calculate_los(congestion_ratio: float) -> str:
    if congestion_ratio >= 0.9:
        return "A"
    elif congestion_ratio >= 0.75:
        return "B"
    elif congestion_ratio >= 0.6:
        return "C"
    elif congestion_ratio >= 0.45:
        return "D"
    elif congestion_ratio >= 0.3:
        return "E"
    else:
        return "F"
```

**Calculation:**
```python
congestion_ratio = current_speed / free_flow_speed

# Example:
# current_speed = 18.75 km/h
# free_flow_speed = 25.00 km/h
# congestion_ratio = 18.75 / 25.00 = 0.75
# LOS = "B" (Reasonably free flow)
```

### Congestion Level

**Function:** `calculate_congestion_level(los: str) -> str`

**Mapping:**
```python
los_map = {
    "A": "Very Low",
    "B": "Low",
    "C": "Moderate",
    "D": "High",
    "E": "Very High",
    "F": "Extreme"
}
```

---

## CSV Storage Models

### 1. Traffic Data CSV

**File:** `data/scraped_data/traffic_data_YYYYMMDD.csv`

**Schema:**
```python
CSV_HEADERS = [
    "timestamp",              # ISO8601 with timezone
    "route_id",               # Route identifier
    "route_name",             # Human-readable name
    "origin_lat",             # Origin latitude
    "origin_lng",             # Origin longitude
    "dest_lat",               # Destination latitude
    "dest_lng",               # Destination longitude
    "current_speed",          # Current speed (km/h)
    "free_flow_speed",        # Free flow speed (km/h)
    "travel_time_seconds",    # Travel time in seconds
    "congestion_level",       # Congestion level description
    "los"                     # Level of Service (A-F)
]
```

**Example Row:**
```csv
2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt - Quốc Lộ 1A,10.7589,106.6669,10.7689,106.7769,18.75,25.00,2400,Low,B
```

**File Rotation:** Daily (one file per day)

---

### 2. Failed Routes CSV

**File:** `data/failed_routes.csv`

**Purpose:** Dead letter queue for failed API calls

**Schema:**
```python
FAILED_ROUTES_HEADERS = [
    "timestamp",              # ISO8601 with timezone
    "route_id",               # Route identifier
    "route_name",             # Human-readable name
    "error_type",             # Error class (e.g., TomTomAPIError)
    "error_message",          # Error message
    "retry_attempts"          # Number of retry attempts
]
```

**Example Row:**
```csv
2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt - Quốc Lộ 1A,TomTomAPIError,Connection timeout after 3 attempts,3
```

**File Format:** Append-only (single file)

---

### 3. Daily Summary CSV

**File:** `data/reports/summary_YYYYMMDD.csv`

**Purpose:** Daily statistics report

**Schema:**
```csv
date,total_polls,successful,failed,success_rate
```

**Example Row:**
```csv
2026-04-13,960,950,10,98.96
```

**Calculation:**
```python
total_polls = successful + failed
success_rate = (successful / total_polls) * 100
```

**Generation Time:** Midnight (00:00-00:15)

---

## Data Validation

### Required Fields

**Validation in `DataProcessor.validate_record()`:**

```python
required_fields = [
    "timestamp", "route_id", "route_name",
    "origin_lat", "origin_lng", "dest_lat", "dest_lng",
    "current_speed", "free_flow_speed", "travel_time_seconds",
    "congestion_level", "los"
]
```

### Validation Rules

| Field | Type | Range/Format | Example |
|-------|------|--------------|---------|
| `timestamp` | string | ISO8601 | `2026-04-13T09:00:00+07:00` |
| `route_id` | string | Non-empty | `route_01` |
| `route_name` | string | Non-empty | `Lê Văn Việt - Quốc Lộ 1A` |
| `origin_lat` | float | -90 to 90 | `10.7589` |
| `origin_lng` | float | -180 to 180 | `106.6669` |
| `dest_lat` | float | -90 to 90 | `10.7689` |
| `dest_lng` | float | -180 to 180 | `106.7769` |
| `current_speed` | float | > 0 | `18.75` |
| `free_flow_speed` | float | > 0 | `25.00` |
| `travel_time_seconds` | int | > 0 | `2400` |
| `congestion_level` | string | Very Low to Extreme | `Low` |
| `los` | string | A-F | `B` |

---

## Duplicate Detection

### Duplicate Key

**Composite key:** `(timestamp, route_id)`

**Implementation:**
```python
def check_duplicate(self, record: dict) -> bool:
    """Check if record already exists based on timestamp + route_id"""
    today_csv = self._get_today_csv_path()
    if not today_csv.exists():
        return False

    df = pd.read_csv(today_csv)
    duplicates = df[
        (df["timestamp"] == record["timestamp"]) &
        (df["route_id"] == record["route_id"])
    ]
    return len(duplicates) > 0
```

**Rationale:**
- Same route should not have duplicate timestamps
- Prevents data corruption from retry attempts
- Ensures data integrity

---

## Data Flow Example

### Complete Data Transformation

```
┌─────────────────────────────────────────────────────────────┐
│  1. RouteConfig (from YAML)                                 │
├─────────────────────────────────────────────────────────────┤
│  route_id: "route_01"                                       │
│  origin: {lat: 10.7589, lng: 106.6669}                      │
│  destination: {lat: 10.7689, lng: 106.7769}                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  2. APIResponse (from TomTom API)                           │
├─────────────────────────────────────────────────────────────┤
│  distance_meters: 12500                                     │
│  travel_time_seconds: 1800                                  │
│  traffic_time_seconds: 2400                                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Metrics Calculation                                     │
├─────────────────────────────────────────────────────────────┤
│  current_speed = 12.5 / (2400/3600) = 18.75 km/h            │
│  free_flow_speed = 12.5 / (1800/3600) = 25.00 km/h          │
│  congestion_ratio = 18.75 / 25.00 = 0.75                    │
│  los = "B"                                                  │
│  congestion_level = "Low"                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  4. TrafficData (validated domain model)                    │
├─────────────────────────────────────────────────────────────┤
│  timestamp: "2026-04-13T09:00:00+07:00"                     │
│  route_id: "route_01"                                       │
│  route_name: "Lê Văn Việt - Quốc Lộ 1A"                     │
│  origin_lat: 10.7589, origin_lng: 106.6669                  │
│  dest_lat: 10.7689, dest_lng: 106.7769                      │
│  current_speed: 18.75                                       │
│  free_flow_speed: 25.00                                     │
│  travel_time_seconds: 2400                                  │
│  congestion_level: "Low"                                    │
│  los: "B"                                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  5. CSV Storage (persisted data)                            │
├─────────────────────────────────────────────────────────────┤
│  2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt...          │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Data Models

### Error Types

| Error Type | Source | Retry | Action |
|------------|--------|-------|--------|
| `TomTomAPIError` | API client | Yes (3x) | Log to DLQ |
| `ValidationError` | Data processor | No | Log to DLQ |
| `UnexpectedError` | Any | No | Log to DLQ |

### Failed Route Record

**Schema:**
```python
{
    "timestamp": "2026-04-13T09:00:00+07:00",
    "route_id": "route_01",
    "route_name": "Lê Văn Việt - Quốc Lộ 1A",
    "error_type": "TomTomAPIError",
    "error_message": "Connection timeout after 3 attempts",
    "retry_attempts": 3
}
```

---

## Data Quality Metrics

### Success Rate

**Calculation:**
```python
success_rate = (successful_polls / total_polls) * 100
```

**Target:** > 95%

### Data Completeness

**Metrics:**
- Missing fields per record
- Invalid LOS values
- Coordinate validation

### Duplicate Rate

**Calculation:**
```python
duplicate_rate = (duplicates / total_records) * 100
```

**Target:** 0%

---

## Related Documentation

- [Architecture](./traffic-scraper-architecture.md)
- [Technology Stack](./traffic-scraper-technology-stack.md)
- [Development Guide](./traffic-scraper-development-guide.md)
