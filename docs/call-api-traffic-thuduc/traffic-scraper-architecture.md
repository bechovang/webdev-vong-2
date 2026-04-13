# Architecture - Traffic Scraper

## Overview

Traffic Scraper follows a **Scheduled Data Collection Pipeline** architecture pattern designed for automated, fault-tolerant, continuous data collection from external APIs.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Scheduler Layer                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    APScheduler BackgroundScheduler                    │   │
│  │  - Non-daemon mode for graceful shutdown                              │   │
│  │  - Timezone: Asia/Ho_Chi_Minh                                          │   │
│  │  - Interval-based triggers (default: 15 minutes)                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Orchestration Layer                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          TrafficScheduler                             │   │
│  │  - Manages polling lifecycle                                          │   │
│  │  - Coordinates API client and data processor                          │   │
│  │  - Tracks statistics (success/failure rates)                          │   │
│  │  - Generates daily summaries                                          │   │
│  │  - Handles graceful shutdown (SIGINT/SIGTERM)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
┌───────────────────────────────┐           ┌───────────────────────────────┐
│        API Client Layer        │           │      Data Processing Layer     │
│  ┌───────────────────────────┐ │           │  ┌───────────────────────────┐ │
│  │    TrafficAPIClient        │ │           │  │    DataProcessor          │ │
│  │  - TomTom API integration  │ │           │  │  - Data validation        │ │
│  │  - Retry logic (tenacity)  │ │           │  │  - Duplicate detection    │ │
│  │  - Error handling          │ │           │  │  - CSV storage            │ │
│  │  - Metrics calculation     │ │           │  │  - Dead letter queue      │ │
│  └───────────────────────────┘ │           │  │  - Daily summaries        │ │
└───────────────────────────────┘           │  └───────────────────────────┘ │
                                            └───────────────────────────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Storage Layer                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐  │
│  │  Daily CSV Files  │  │ Failed Routes    │  │   Daily Summaries        │  │
│  │  traffic_data_*   │  │ failed_routes.csv│  │   summary_*              │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Logging Layer                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Custom JSON Logger                                │   │
│  │  - Structured JSON logging                                            │   │
│  │  - Extra context (route_id, metrics, etc.)                            │   │
│  │  - Console (stderr) + File (daily rotation)                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Scheduler Layer (APScheduler)

**File:** `src/scheduler.py`

**Responsibility:** Time-based job scheduling

**Key Features:**
- **BackgroundScheduler**: Non-daemon mode for graceful shutdown
- **Interval Triggers**: Configurable polling interval (default: 15 minutes)
- **Timezone Awareness**: Asia/Ho_Chi_Minh timezone
- **Signal Handling**: SIGINT and SIGTERM for graceful shutdown

**Configuration:**
```python
BackgroundScheduler(
    timezone="Asia/Ho_Chi_Minh",
    daemon=False  # Critical for graceful shutdown
)
```

**Job Definition:**
```python
scheduler.add_job(
    _poll_all_routes,
    trigger="interval",
    minutes=15,  # Configurable
    id="traffic_polling",
    name="Poll all routes for traffic data"
)
```

### 2. Orchestration Layer (TrafficScheduler)

**File:** `src/scheduler.py`

**Class:** `TrafficScheduler`

**Responsibility:** Coordinate all components

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `start()` | Initialize components, configure scheduler, run initial poll |
| `_poll_all_routes()` | Iterate through routes, fetch data, handle errors |
| `_generate_daily_summary()` | Create daily summary report at midnight |
| `stop()` | Graceful shutdown with final statistics |
| `run_forever()` | Keep main thread alive |

**Statistics Tracking:**
```python
self.total_polls = 0
self.successful_polls = 0
self.failed_polls = 0
```

**Error Handling Strategy:**
- **ValidationError**: Log to dead letter queue, continue with next route
- **TomTomAPIError**: Log to dead letter queue (with retry count), continue
- **UnexpectedError**: Log with traceback, continue

### 3. API Client Layer (TrafficAPIClient)

**File:** `src/api_client.py`

**Class:** `TrafficAPIClient`

**Responsibility:** TomTom API integration with fault tolerance

**Key Features:**

#### Retry Logic (Tenacity)
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((requests.exceptions.RequestException,))
)
def _fetch_route_data_with_retry(...):
    # API call logic
```

**Behavior:**
- Max 3 attempts per API call
- Exponential backoff: 1s, 2s, 4s waits
- Retries on: `RequestException` (network errors, timeouts)

#### HTTP Error Handling
| Status Code | Action |
|-------------|--------|
| 401 | Fatal error - stop scraper |
| 403 | Fatal error - stop scraper |
| 429 | Log as failed, continue |
| Other | Log as failed, continue |

#### Metrics Calculation
```python
def calculate_traffic_metrics(api_response, route_name, origin_lat, origin_lng, dest_lat, dest_lng):
    distance_meters = api_response["routes"][0]["summary"]["lengthInMeters"]
    travel_time_seconds = api_response["routes"][0]["summary"]["travelTimeSeconds"]
    traffic_time_seconds = api_response["routes"][0]["summary"]["trafficTimeSeconds"]

    current_speed = (distance_meters / 1000) / (traffic_time_seconds / 3600)
    free_flow_speed = (distance_meters / 1000) / (travel_time_seconds / 3600)
    congestion_ratio = current_speed / free_flow_speed
```

### 4. Data Processing Layer (DataProcessor)

**File:** `src/data_processor.py`

**Class:** `DataProcessor`

**Responsibility:** Data validation, storage, and quality control

**Key Methods:**

| Method | Purpose |
|--------|---------|
| `validate_record()` | Schema validation, required field checks |
| `check_duplicate()` | Prevent duplicate records based on timestamp+route_id |
| `save_to_csv()` | Append to daily CSV file |
| `save_failed_route()` | Log to dead letter queue |
| `generate_daily_summary()` | Calculate daily statistics |
| `save_daily_summary()` | Write summary report |

**Data Validation:**
```python
required_fields = [
    "timestamp", "route_id", "route_name", "origin_lat", "origin_lng",
    "dest_lat", "dest_lng", "current_speed", "free_flow_speed",
    "travel_time_seconds", "congestion_level", "los"
]
```

**Duplicate Detection:**
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

### 5. Data Models Layer

**File:** `src/models.py`

**Classes:**
- `RouteConfig`: Route configuration structure
- `APIResponse`: TomTom API response data
- `TrafficData`: Validated traffic data record

**LOS Calculation:**
```python
def calculate_los(congestion_ratio: float) -> str:
    if congestion_ratio >= 0.9:
        return "A"  # Thông thoáng
    elif congestion_ratio >= 0.75:
        return "B"  # Khá thông thoáng
    elif congestion_ratio >= 0.6:
        return "C"  # Bình thường
    elif congestion_ratio >= 0.45:
        return "D"  # Bắt đầu chậm
    elif congestion_ratio >= 0.3:
        return "E"  # Kẹt xe
    else:
        return "F"  # Kẹt xe nặng
```

### 6. Configuration Layer

**File:** `src/config/settings.py`

**Class:** `Config`

**Responsibility:** Centralized configuration management

**Configuration Sources:**
1. **YAML** (`config/routes.yaml`): Route definitions, scraper settings
2. **Environment** (`.env`): API keys, paths, log level

**Hierarchy:**
```
Config
├── routes: List[RouteConfig]
├── tomtom_api_key: str
├── interval_minutes: int
├── collection_days: int
├── data_dir: Path
├── logs_dir: Path
└── storage_config: dict
```

### 7. Logging Layer

**File:** `src/logger.py`

**Features:**
- **JSON Structured Logging**: Machine-readable format
- **Extra Context**: Route ID, metrics, timestamps
- **Dual Output**: Console (stderr) + File (daily rotation)
- **Log Levels**: DEBUG, INFO, WARNING, ERROR

**Example Log Entry:**
```json
{
  "timestamp": "2026-04-13T09:00:00Z",
  "level": "INFO",
  "message": "Successfully fetched traffic data",
  "route_id": "route_01",
  "distance_meters": 12500,
  "travel_time_seconds": 1800,
  "traffic_time_seconds": 2400
}
```

## Data Flow

### Normal Operation Flow

```
┌─────────────────┐
│  APScheduler    │
│  Trigger fires  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      TrafficScheduler._poll_all_routes() │
│  ┌────────────────────────────────────┐ │
│  │  For each route in config.routes:  │ │
│  │                                    │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  TrafficAPIClient            │  │ │
│  │  │  fetch_route_data()          │  │ │
│  │  │  [Retry logic: 3 attempts]   │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │             ▼                       │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  calculate_traffic_metrics() │  │ │
│  │  │  - current_speed             │  │ │
│  │  │  - free_flow_speed           │  │ │
│  │  │  - congestion_ratio          │  │ │
│  │  │  - LOS calculation           │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │             ▼                       │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  DataProcessor               │  │ │
│  │  │  validate_record()           │  │ │
│  │  │  check_duplicate()           │  │ │
│  │  │  save_to_csv()               │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │             ▼                       │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  successful_polls += 1       │  │ │
│  │  └──────────────────────────────┘  │ │
│  │                                    │ │
│  │  [On Error]                        │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  DataProcessor               │  │ │
│  │  │  save_failed_route()         │  │ │
│  │  └──────────┬───────────────────┘  │ │
│  │             │                       │ │
│  │             ▼                       │ │
│  │  ┌──────────────────────────────┐  │ │
│  │  │  failed_polls += 1           │  │ │
│  │  └──────────────────────────────┘  │ │
│  │                                    │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Log polling cycle summary              │
│  - total_polls                          │
│  - successful_polls                     │
│  - failed_polls                         │
│  - success_rate                         │
└─────────────────────────────────────────┘
```

### Error Recovery Flow

```
┌─────────────────────┐
│  API Call Fails     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  Tenacity Retry Logic                   │
│  ┌────────────────────────────────────┐ │
│  │  Attempt 1: Fail                   │ │
│  │  Wait: 1 second (exponential)      │ │
│  │  Attempt 2: Fail                   │ │
│  │  Wait: 2 seconds                   │ │
│  │  Attempt 3: Fail                   │ │
│  │  Wait: 4 seconds                   │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Exhausted Retries - Raise Exception    │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  TrafficScheduler Exception Handler     │
│  ┌────────────────────────────────────┐ │
│  │  Log error with route_id context  │ │
│  │  Increment failed_polls           │ │
│  │  Call save_failed_route()         │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  DataProcessor.save_failed_route()      │
│  ┌────────────────────────────────────┐ │
│  │  Append to data/failed_routes.csv │ │
│  │  - timestamp                      │ │
│  │  - route_id                       │ │
│  │  - route_name                     │ │
│  │  - error_type                     │ │
│  │  - error_message                  │ │
│  │  - retry_attempts                 │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  Continue with next route               │
│  (Don't stop the scheduler)             │
└─────────────────────────────────────────┘
```

### Graceful Shutdown Flow

```
┌─────────────────┐
│  SIGINT/SIGTERM │
│  (Ctrl+C or     │
│   kill signal)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  TrafficScheduler._signal_handler()     │
│  ┌────────────────────────────────────┐ │
│  │  Log: "Received signal X,         │ │
│  │        initiating graceful        │ │
│  │        shutdown..."               │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  TrafficScheduler.stop()                │
│  ┌────────────────────────────────────┐ │
│  │  scheduler.shutdown(wait=True)    │ │
│  │    [Wait for running jobs]        │ │
│  │                                  │ │
│  │  Calculate final statistics       │ │
│  │  - total_polls                    │ │
│  │  - successful_polls               │ │
│  │  - failed_polls                   │ │
│  │  - success_rate                   │ │
│  │                                  │ │
│  │  Log final statistics             │ │
│  └──────────┬─────────────────────────┘ │
└─────────────┼───────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────┐
│  sys.exit(0)                            │
│  [Clean exit]                           │
└─────────────────────────────────────────┘
```

## Storage Architecture

### File Organization

```
traffic_scraper/
├── data/
│   ├── scraped_data/
│   │   ├── traffic_data_20260413.csv    # Today's data
│   │   ├── traffic_data_20260412.csv    # Yesterday
│   │   └── traffic_data_YYYYMMDD.csv    # Historical
│   │
│   ├── failed_routes.csv                 # Dead letter queue
│   │
│   └── reports/
│       ├── summary_20260413.csv         # Daily summary
│       └── summary_YYYYMMDD.csv
│
└── logs/
    ├── traffic_scraper_20260413.log     # Today's logs
    └── traffic_scraper_YYYYMMDD.log
```

### CSV Schema

**Traffic Data (`traffic_data_*.csv`):**
```csv
timestamp,route_id,route_name,origin_lat,origin_lng,dest_lat,dest_lng,current_speed,free_flow_speed,travel_time_seconds,congestion_level,los
2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt - Quốc Lộ 1A,10.7589,106.6669,10.7689,106.7769,18.75,25.00,2400,Low,B
```

**Failed Routes (`failed_routes.csv`):**
```csv
timestamp,route_id,route_name,error_type,error_message,retry_attempts
2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt - Quốc Lộ 1A,TomTomAPIError,Connection timeout,3
```

**Daily Summary (`summary_*.csv`):**
```csv
date,total_polls,successful,failed,success_rate
2026-04-13,960,950,10,98.96
```

## Error Handling Strategy

### Error Categories

| Error Type | Handler | Action | Retry |
|------------|---------|--------|-------|
| Network timeout | Tenacity | Retry with backoff | Yes (3x) |
| HTTP 429 | Scheduler | Log to DLQ, continue | No |
| HTTP 401/403 | Scheduler | Fatal error, stop | No |
| Validation error | Scheduler | Log to DLQ, continue | No |
| Unexpected | Scheduler | Log to DLQ, continue | No |

### Dead Letter Queue Pattern

Failed routes are logged to `data/failed_routes.csv` for:
- Post-mortem analysis
- Retry processing (offline)
- Error trend monitoring

## Concurrency Model

**Single-threaded execution:**
- APScheduler runs in background thread
- Main thread handles signal handling
- Route polling is sequential (not parallel)

**Why sequential?**
- TomTom API rate limits
- Simpler error handling
- No race conditions on file writes

**Future enhancement:**
- Consider async/concurrent polling for large route counts
- Implement rate limiting per route

## Security Architecture

### API Key Management
```
.env file (gitignored)
    ↓
Config loader (python-dotenv)
    ↓
TrafficAPIClient
    ↓
HTTPS requests to TomTom
```

### Network Security
- **HTTPS only**: All API calls use HTTPS
- **Timeout**: 10-second timeout prevents hanging
- **No credentials in logs**: API key redacted from logs

## Monitoring & Observability

### Metrics Tracked
- Total polls (cumulative)
- Successful polls
- Failed polls
- Success rate (%)

### Log Analysis
**Key patterns to monitor:**
- `Successfully fetched traffic data` - Normal operation
- `API error for {route_id}` - API issues
- `Validation failed for {route_id}` - Data issues
- `Polling cycle completed` - Health check

### Daily Summaries
Generated at midnight (00:00-00:15):
- Total polls for the day
- Success/failure counts
- Success rate percentage

## Scalability Considerations

### Current Limitations
- Single-machine deployment
- Sequential route polling
- File-based storage (CSV)

### Scaling Options
1. **Horizontal scaling**: Deploy multiple scrapers with route sharding
2. **Database migration**: Replace CSV with PostgreSQL/SQLite
3. **Message queue**: Use Redis/RabbitMQ for async processing
4. **Load balancing**: Distribute routes across workers

## Architecture Trade-offs

| Decision | Benefit | Trade-off |
|----------|---------|-----------|
| Sequential polling | Simple, reliable | Slower for many routes |
| CSV storage | Human-readable, portable | No indexing, slower queries |
| In-memory retry | Fast, simple | Lost on crash |
| Single scheduler | Easy deployment | Single point of failure |

---

**Related Documentation:**
- [Technology Stack](./traffic-scraper-technology-stack.md)
- [Data Models](./traffic-scraper-data-models.md)
- [Development Guide](./traffic-scraper-development-guide.md)
