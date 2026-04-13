# Project Overview - Traffic Scraper

## Project Summary

**Traffic Scraper** is an automated traffic data collection system for Thu Duc, Ho Chi Minh City. It polls TomTom Routing API every 15 minutes for 7 days across 10 key routes, collecting real-time traffic data with fault-tolerant auto-recovery.

**Repository:** Part of call-api-traffic-thuduc
**License:** MIT
**Status:** ✅ Production Ready

---

## Executive Summary

This Python-based data scraper continuously monitors traffic conditions on major corridors in Thu Duc District. It uses APScheduler for automated polling, TomTom API for real-time traffic data, and implements robust retry logic with tenacity for fault tolerance.

### Key Features

| Feature | Description |
|---------|-------------|
| **10 Key Routes** | Monitors major traffic corridors in Thu Duc |
| **15-Minute Polling** | Consistent data collection intervals |
| **7-Day Continuous Run** | Fault-tolerant, auto-recovery system |
| **TomTom API Integration** | Real-time traffic data with retry logic |
| **CSV Storage** | Daily data files with validated schema |
| **JSON Logging** | Structured logs for debugging and monitoring |

### Data Collected

| Field | Description |
|-------|-------------|
| `timestamp` | ISO8601 with timezone |
| `route_id` | Route identifier |
| `route_name` | Human-readable name |
| `origin_lat`, `origin_lng` | Start coordinates |
| `dest_lat`, `dest_lng` | End coordinates |
| `current_speed` | Current speed (km/h) |
| `free_flow_speed` | Free flow speed (km/h) |
| `travel_time_seconds` | Travel time |
| `congestion_level` | A-F LOS classification |
| `los` | Level of Service |

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Language** | Python 3.11+ |
| **Scheduling** | APScheduler 3.10.4 |
| **HTTP Client** | requests 2.31.0 |
| **Retry Logic** | tenacity 8.2.3 |
| **Configuration** | pyyaml 6.0.1 |
| **Environment** | python-dotenv 1.0.0 |
| **Testing** | pytest 7.4.0 |
| **Code Quality** | flake8 6.1.0, pylint 2.17.0 |

---

## Architecture Type

**Pattern:** Scheduled Data Collection Pipeline

**Characteristics:**
- Background scheduler with APScheduler
- Fault-tolerant API client with retry logic
- Dead letter queue for failed routes
- Daily CSV file generation
- JSON structured logging
- Graceful shutdown handling

---

## Repository Structure

**Type:** Monolith (CLI application)

```
traffic_scraper/
├── src/                      # Source code
│   ├── config/              # Configuration management
│   │   ├── settings.py      # Config loader
│   │   └── routes.yaml      # Route definitions
│   ├── main.py              # Entry point
│   ├── api_client.py        # TomTom API client (with retry)
│   ├── data_processor.py    # Data validation & CSV storage
│   ├── scheduler.py         # APScheduler orchestration
│   ├── models.py            # Data models & LOS calculation
│   └── logger.py            # Logging setup
├── tests/                   # Unit tests
├── data/                    # Scraped data storage
│   ├── scraped_data/       # Daily CSV files
│   └── failed_routes.csv   # Dead letter queue
├── logs/                    # Application logs
├── config/                  # Route configurations
└── requirements.txt        # Dependencies
```

---

## Key Components

### API Client (`src/api_client.py`)

**Class:** `TrafficAPIClient`

**Features:**
- TomTom Routing API integration
- Automatic retry logic with exponential backoff
- Custom exception handling (`TomTomAPIError`)
- HTTP error handling (401, 403, 429, etc.)
- Timeout handling

**Retry Configuration:**
- Max attempts: 3
- Wait: Exponential backoff (1-4 seconds)
- Retry on: `RequestException`

### Scheduler (`src/scheduler.py`)

**Class:** `TrafficScheduler`

**Features:**
- APScheduler background scheduling
- Configurable polling interval (default: 15 minutes)
- Signal handlers for graceful shutdown
- Dead letter queue for failed routes
- Daily summary report generation
- Statistics tracking (total/successful/failed polls)

### Data Processor (`src/data_processor.py`)

**Class:** `DataProcessor`

**Features:**
- Data validation with schema checking
- Duplicate detection and prevention
- CSV file generation (daily files)
- Failed route logging (dead letter queue)
- Daily summary statistics

### Data Models (`src/models.py`)

**Classes:**
- `RouteConfig` - Route configuration structure
- `APIResponse` - TomTom API response data
- `TrafficData` - Validated traffic data record

**LOS Calculation:**
- Based on congestion ratio (current_speed / free_flow_speed)
- Thresholds: A≥0.9, B≥0.75, C≥0.6, D≥0.45, E≥0.3, F<0.3

---

## Configuration

### Environment Variables

Create `.env` file:

```bash
TOMTOM_API_KEY=your_api_key_here
LOG_LEVEL=INFO
DATA_DIR=data/scraped_data
LOGS_DIR=logs
POLLING_INTERVAL_MINUTES=15
COLLECTION_DAYS=7
```

### Route Configuration (`config/routes.yaml`)

```yaml
routes:
  - id: "route_01"
    name: "Lê Văn Việt - Quốc Lộ 1A"
    origin:
      lat: 10.7589
      lng: 106.6669
    destination:
      lat: 10.7689
      lng: 106.7769
    distance_km: 12.5
    description: "Main corridor"

scraper:
  interval_minutes: 15
  collection_days: 7

storage:
  reports_dir: data/reports

logging:
  format_json: true
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APScheduler                            │
│  Triggers every X minutes (default: 15)                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    TrafficScheduler                         │
│  - Iterates through all routes                                 │
│  - Calls API client for each route                             │
│  - Handles errors and retries                                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   TrafficAPIClient                          │
│  - Fetches data from TomTom API                                 │
│  - Retry logic with exponential backoff                         │
│  - HTTP error handling                                         │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  DataProcessor                             │
│  - Validates API response                                     │
│  - Calculates LOS and congestion level                         │
│  - Checks for duplicates                                       │
│  - Saves to CSV (daily files)                                  │
│  - Logs failed routes to dead letter queue                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Output Files                              │
│  - data/scraped_data/traffic_data_YYYYMMDD.csv               │
│  - data/failed_routes.csv                                    │
│  - logs/traffic_scraper_YYYYMMDD.log                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Usage

### Installation

```bash
cd traffic_scraper
python3.11 -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Configuration

1. Get TomTom API key from https://developer.tomtom.com/
2. Copy `.env.example` to `.env`
3. Add your `TOMTOM_API_KEY`
4. Configure routes in `config/routes.yaml`

### Running

```bash
python src/main.py
```

With custom log level:

```bash
LOG_LEVEL=DEBUG python src/main.py
```

### Testing

```bash
pytest tests/
```

---

## Monitoring

### Statistics Tracking

The scheduler tracks:
- Total polls
- Successful polls
- Failed polls
- Success rate (%)

### Dead Letter Queue

Failed routes are logged to `data/failed_routes.csv` with:
- Timestamp
- Route ID
- Route Name
- Error Type
- Error Message
- Retry Attempts

### Daily Summaries

Generated automatically at midnight (00:00-00:15):
- Total polls
- Successful count
- Failed count
- Success rate

---

## Documentation Index

- [Technology Stack](./traffic-scraper-technology-stack.md)
- [Architecture](./traffic-scraper-architecture.md)
- [Source Tree Analysis](./traffic-scraper-source-tree-analysis.md)
- [Data Models](./traffic-scraper-data-models.md)
- [Development Guide](./traffic-scraper-development-guide.md)

---

## Getting Started

See [Development Guide](./traffic-scraper-development-guide.md) for complete setup instructions.

**Quick Start:**
```bash
python src/main.py
```

Press Ctrl+C to stop gracefully.
