# Source Tree Analysis - Traffic Scraper

## Directory Structure

```
traffic_scraper/
├── src/                           # Application source code
│   ├── __init__.py                # Package initialization
│   ├── main.py                    # Application entry point
│   ├── api_client.py              # TomTom API client with retry logic
│   ├── data_processor.py          # Data validation and CSV storage
│   ├── scheduler.py               # APScheduler orchestration
│   ├── models.py                  # Data models and LOS calculation
│   ├── logger.py                  # JSON structured logging
│   └── config/                    # Configuration management
│       ├── __init__.py
│       ├── settings.py            # Config loader (YAML + .env)
│       └── routes.yaml            # Route definitions
│
├── tests/                         # Unit tests
│   ├── __init__.py
│   └── test_data_processor.py     # Data processor tests
│
├── data/                          # Data storage (generated at runtime)
│   ├── scraped_data/              # Daily CSV files
│   ├── failed_routes.csv          # Dead letter queue
│   └── reports/                   # Daily summary reports
│
├── logs/                          # Application logs (generated at runtime)
│   └── traffic_scraper_*.log
│
├── config/                        # Route configurations (backup)
│   └── routes.yaml
│
├── venv/                          # Virtual environment (gitignored)
│
├── .env.example                   # Environment template
├── .env                           # Actual environment (gitignored)
├── .gitignore                     # Git ignore rules
├── requirements.txt               # Python dependencies
└── README.md                      # Project documentation
```

## File-by-File Analysis

### Entry Point

**`src/main.py`** (52 lines)
- **Purpose**: Application entry point and initialization
- **Key Functions**:
  - `main()` - Initialize config, setup logger, start scheduler
- **Dependencies**: `config.settings`, `logger`, `scheduler`
- **Error Handling**: Configuration errors, keyboard interrupts, fatal errors
- **Exit Codes**: 0 (success), 1 (error)

```python
# Key flow
config = get_config()
logger = setup_logger(...)
scheduler = TrafficScheduler()
scheduler.start()
scheduler.run_forever()
```

### Core Components

**`src/scheduler.py`** (285 lines)
- **Purpose**: APScheduler orchestration and polling lifecycle
- **Class**: `TrafficScheduler`
- **Key Methods**:
  - `start()` - Initialize components, configure scheduler
  - `_poll_all_routes()` - Main polling loop for all routes
  - `_generate_daily_summary()` - Daily summary at midnight
  - `stop()` - Graceful shutdown
  - `run_forever()` - Keep main thread alive
- **Signal Handlers**: SIGINT, SIGTERM for graceful shutdown
- **Statistics Tracking**: `total_polls`, `successful_polls`, `failed_polls`
- **Dependencies**: `apscheduler`, `api_client`, `data_processor`, `config`

**`src/api_client.py`** (150+ lines, estimated)
- **Purpose**: TomTom API integration with fault tolerance
- **Class**: `TrafficAPIClient`
- **Key Methods**:
  - `fetch_route_data()` - Fetch route data from TomTom API
  - `calculate_traffic_metrics()` - Compute speed, congestion, LOS
- **Decorator**: `@retry` from tenacity for exponential backoff
- **Error Handling**: HTTP 401/403 (fatal), 429 (log and continue)
- **Dependencies**: `requests`, `tenacity`

**`src/data_processor.py`** (200+ lines, estimated)
- **Purpose**: Data validation, storage, and quality control
- **Class**: `DataProcessor`
- **Key Methods**:
  - `validate_record()` - Schema validation
  - `check_duplicate()` - Duplicate detection
  - `save_to_csv()` - Append to daily CSV
  - `save_failed_route()` - Dead letter queue
  - `generate_daily_summary()` - Daily statistics
  - `save_daily_summary()` - Write summary report
- **Dependencies**: `pandas` (for CSV operations), `models`

**`src/models.py`** (166 lines)
- **Purpose**: Data models and LOS calculation
- **Classes**:
  - `RouteConfig` - Route configuration dataclass
  - `APIResponse` - TomTom API response dataclass
  - `TrafficData` - Validated traffic data dataclass
- **Functions**:
  - `calculate_los()` - LOS classification (A-F)
  - `calculate_congestion_level()` - Congestion level description
- **Constants**:
  - `LOS_LEVELS` - LOS thresholds (0.9, 0.75, 0.6, 0.45, 0.3)
  - `CSV_HEADERS` - CSV column names
  - `FAILED_ROUTES_HEADERS` - Failed routes CSV columns

### Configuration

**`src/config/settings.py`** (100+ lines, estimated)
- **Purpose**: Centralized configuration management
- **Class**: `Config`
- **Configuration Sources**:
  - `config/routes.yaml` - Route definitions
  - `.env` - API keys, paths, settings
- **Key Methods**:
  - `get_interval_minutes()` - Get polling interval
  - `get_collection_days()` - Get collection duration
  - `ensure_directories()` - Create required directories
- **Environment Variables**:
  - `TOMTOM_API_KEY` - TomTom API key
  - `LOG_LEVEL` - Logging level
  - `DATA_DIR` - Data directory path
  - `LOGS_DIR` - Logs directory path

**`src/config/routes.yaml`**
- **Purpose**: Route definitions
- **Structure**:
```yaml
routes:
  - id: "route_01"
    name: "Route Name"
    origin: {lat: 10.7589, lng: 106.6669}
    destination: {lat: 10.7689, lng: 106.7769}
    distance_km: 12.5

scraper:
  interval_minutes: 15
  collection_days: 7

storage:
  reports_dir: data/reports

logging:
  format_json: true
```

### Logging

**`src/logger.py`** (80+ lines, estimated)
- **Purpose**: JSON structured logging
- **Functions**:
  - `setup_logger()` - Initialize logger with JSON formatting
  - `get_logger()` - Get existing logger instance
- **Features**:
  - JSON output format
  - Extra context support (route_id, metrics)
  - Console (stderr) + File output
  - Daily log rotation

### Tests

**`tests/test_data_processor.py`**
- **Purpose**: Unit tests for DataProcessor
- **Test Areas**:
  - Data validation
  - Duplicate detection
  - CSV writing
  - Failed route logging

### Configuration Files

**`.env.example`**
- **Purpose**: Environment variable template
- **Variables**:
```bash
TOMTOM_API_KEY=your_api_key_here
LOG_LEVEL=INFO
DATA_DIR=data/scraped_data
LOGS_DIR=logs
```

**`requirements.txt`**
- **Purpose**: Python dependencies
- **Key Packages**:
  - `apscheduler==3.10.4` - Background scheduling
  - `requests==2.31.0` - HTTP client
  - `tenacity==8.2.3` - Retry logic
  - `pyyaml==6.0.1` - YAML parsing
  - `python-dotenv==1.0.0` - Environment variables
  - `pandas==2.0.0` - Data processing (optional)

**`.gitignore`**
- **Purpose**: Git ignore rules
- **Ignored**:
  - `venv/` - Virtual environment
  - `.env` - Environment variables
  - `__pycache__/` - Python cache
  - `*.pyc` - Compiled Python
  - `data/` - Scraped data
  - `logs/` - Log files

**`README.md`**
- **Purpose**: Project documentation
- **Sections**:
  - Project overview
  - Installation instructions
  - Configuration guide
  - Usage instructions
  - Data format description

## Component Dependencies

```
main.py
├── config.settings (Config)
├── logger (setup_logger)
└── scheduler (TrafficScheduler)
    ├── api_client (TrafficAPIClient)
    │   └── requests, tenacity
    ├── data_processor (DataProcessor)
    │   └── models (TrafficData, calculate_los)
    └── apscheduler (BackgroundScheduler)
```

## Data Flow Through Files

```
1. main.py starts
   └─> scheduler.py: TrafficScheduler.start()

2. APScheduler triggers every X minutes
   └─> scheduler.py: _poll_all_routes()
       ├─> api_client.py: fetch_route_data()
       │   └─> TomTom API (with retry)
       ├─> api_client.py: calculate_traffic_metrics()
       │   └─> models.py: calculate_los()
       ├─> data_processor.py: validate_record()
       ├─> data_processor.py: check_duplicate()
       └─> data_processor.py: save_to_csv()
           └─> data/scraped_data/traffic_data_YYYYMMDD.csv

3. On error
   └─> data_processor.py: save_failed_route()
       └─> data/failed_routes.csv

4. At midnight
   └─> scheduler.py: _generate_daily_summary()
       ├─> data_processor.py: generate_daily_summary()
       └─> data_processor.py: save_daily_summary()
           └─> data/reports/summary_YYYYMMDD.csv
```

## Runtime Generated Files

| File | Generated By | Frequency | Purpose |
|------|--------------|-----------|---------|
| `data/scraped_data/traffic_data_*.csv` | DataProcessor | Every poll | Traffic data |
| `data/failed_routes.csv` | DataProcessor | On error | Dead letter queue |
| `data/reports/summary_*.csv` | DataProcessor | Daily | Daily summary |
| `logs/traffic_scraper_*.log` | Logger | Continuous | Application logs |

## Import Analysis

### Core Imports

**`src/scheduler.py`**
```python
import signal, sys
from datetime import datetime
from typing import Optional
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from src.api_client import TrafficAPIClient, TomTomAPIError
from src.config.settings import get_config
from src.data_processor import DataProcessor, ValidationError
from src.logger import get_logger
```

**`src/models.py`**
```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional
```

**`src/api_client.py`** (inferred)
```python
import requests
from tenacity import retry, stop_after_attempt, wait_exponential
from src.models import calculate_los
```

**`src/data_processor.py`** (inferred)
```python
import pandas as pd
from pathlib import Path
from datetime import datetime
from src.models import TrafficData, CSV_HEADERS
```

## Code Organization Patterns

### Separation of Concerns
- **Entry point**: `main.py` - Initialization only
- **Orchestration**: `scheduler.py` - Business logic flow
- **API integration**: `api_client.py` - External service
- **Data processing**: `data_processor.py` - Storage and validation
- **Data models**: `models.py` - Schema and calculations
- **Configuration**: `config/settings.py` - Settings management
- **Logging**: `logger.py` - Logging utilities

### Error Handling Pattern
```python
try:
    # Operation
except SpecificError as e:
    # Handle specific error
    logger.error(...)
except Exception as e:
    # Handle unexpected error
    logger.error(..., exc_info=True)
```

### Retry Pattern (Tenacity)
```python
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),
    retry=retry_if_exception_type((requests.exceptions.RequestException,))
)
def _fetch_route_data_with_retry(...):
    # API call
```

## File Size Metrics

| File | Lines (est.) | Purpose |
|------|--------------|---------|
| `main.py` | 52 | Entry point |
| `scheduler.py` | 285 | Orchestration |
| `api_client.py` | 150+ | API client |
| `data_processor.py` | 200+ | Data processing |
| `models.py` | 166 | Data models |
| `logger.py` | 80+ | Logging |
| `config/settings.py` | 100+ | Configuration |
| `tests/test_data_processor.py` | 100+ | Tests |

**Total**: ~1,100+ lines of code

## Module Coupling

### Low Coupling
- `models.py` - No dependencies on other modules
- `logger.py` - Standalone logging utility
- `config/settings.py` - Only depends on YAML/env files

### Medium Coupling
- `api_client.py` - Depends on `models.py` for LOS calculation
- `data_processor.py` - Depends on `models.py` for data classes

### High Coupling (Orchestrator)
- `scheduler.py` - Depends on all other modules (by design)
- `main.py` - Depends on `scheduler.py` only

## Extension Points

### Adding New API Providers
1. Create new API client class (e.g., `GoogleMapsAPIClient`)
2. Implement same interface as `TrafficAPIClient`
3. Update `scheduler.py` to use new client

### Adding New Storage Backends
1. Create new storage class (e.g., `DatabaseStorage`)
2. Implement same interface as `DataProcessor`
3. Update `scheduler.py` to use new storage

### Adding New Metrics
1. Update `models.py` with new calculation functions
2. Update `api_client.py` to call new functions
3. Update `CSV_HEADERS` in `models.py`

## Testing Strategy

### Unit Tests
- `tests/test_data_processor.py` - Data processor tests

### Missing Tests (Future Work)
- `tests/test_api_client.py` - API client tests (with mocking)
- `tests/test_models.py` - LOS calculation tests
- `tests/test_scheduler.py` - Scheduler orchestration tests
- `tests/test_config.py` - Configuration loading tests

---

**Related Documentation:**
- [Architecture](./traffic-scraper-architecture.md)
- [Data Models](./traffic-scraper-data-models.md)
- [Development Guide](./traffic-scraper-development-guide.md)
