# Technology Stack - Traffic Scraper

## Overview

Traffic Scraper uses a **Python-based scheduled task system** for automated traffic data collection from TomTom API.

## Core Technologies

### Python Environment
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Programming language |
| **pip** | Latest | Package management |

### Scheduling
| Technology | Version | Purpose |
|------------|---------|---------|
| **APScheduler** | 3.10.4 | Background task scheduling |
| **BackgroundScheduler** | - | Non-daemon scheduler for graceful shutdown |

### HTTP Client
| Technology | Version | Purpose |
|------------|---------|---------|
| **requests** | 2.31.0 | HTTP client for API calls |
| **requests.Session** | - | Session for connection pooling |

### Retry Logic
| Technology | Version | Purpose |
|------------|---------|---------|
| **tenacity** | 8.2.3 | Retry with exponential backoff |
| - stop_after_attempt(3) | - | Max 3 retry attempts |
| - wait_exponential(multiplier=1, min=1, max=4) | - | Exponential backoff 1-4 seconds |

### Configuration
| Technology | Version | Purpose |
|------------|---------|---------|
| **pyyaml** | 6.0.1 | YAML configuration parsing |
| **python-dotenv** | 1.0.0 | Environment variable loading |

### Data Processing (Optional)
| Technology | Version | Purpose |
|------------|---------|---------|
| **pandas** | 2.0.0 | Data analysis (optional) |

### Testing
| Technology | Version | Purpose |
|------------|---------|---------|
| **pytest** | 7.4.0 | Test framework |
| **pytest-cov** | 4.1.0 | Coverage reporting |
| **pytest-mock** | 3.11.1 | Mocking for tests |

### Code Quality
| Technology | Version | Purpose |
|------------|---------|---------|
| **flake8** | 6.1.0 | Python linting |
| **pylint** | 2.17.0 | Code analysis |
| **mypy** | 1.5.0 | Type checking |

---

## Architecture Pattern

**Scheduled Data Collection Pipeline**

```
┌─────────────────────────────────────────────────────────────┐
│                  APScheduler (Background)                    │
│  - Cron/Interval-based scheduling                              │
│  - Non-daemon mode for graceful shutdown                       │
│  - Timezone: Asia/Ho_Chi_Minh                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              TrafficScheduler (Orchestrator)                   │
│  - Manages polling lifecycle                                    │
│  - Coordinates API client and data processor                   │
│  - Tracks statistics (success/failure rates)                   │
│  - Generates daily summaries                                    │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────┴──────────────┐
        ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  TrafficAPIClient  │          │  DataProcessor    │
│  - TomTom API      │          │  - Validation    │
│  - Retry logic     │          │  - CSV storage   │
│  - Error handling  │          │  - Deduplication │
└──────────────────┘          └──────────────────┘
```

---

## Key Dependencies

### TomTom API Integration

**Base URL:** `https://api.tomtom.com/routing/1/calculateRoute`

**Endpoint Format:** `{base_url}/{origin}:{destination}/json`

**Query Parameters:**
- `key` - TomTom API key
- `traffic` - Include traffic data (true)
- `avoid` - Avoid ferries (ferries)

**Response Parsing:**
```python
routes[0].summary.lengthInMeters      # Distance in meters
routes[0].summary.travelTimeSeconds  # Free-flow travel time
routes[0].summary.trafficTimeSeconds # Traffic-adjusted time
```

### Retry Configuration

**Library:** tenacity

**Decorator-based retry:**
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

---

## File Formats

### Configuration Files

**YAML (`config/routes.yaml`):**
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

**Environment (`.env`):**
```bash
TOMTOM_API_KEY=your_key_here
LOG_LEVEL=INFO
DATA_DIR=data/scraped_data
LOGS_DIR=logs
```

### Output Files

**CSV Schema (`data/scraped_data/traffic_data_YYYYMMDD.csv`):**
```csv
timestamp,route_id,route_name,origin_lat,origin_lng,dest_lat,dest_lng,current_speed,free_flow_speed,travel_time_seconds,congestion_level,los
```

**Failed Routes (`data/failed_routes.csv`):**
```csv
timestamp,route_id,route_name,error_type,error_message,retry_attempts
```

**Daily Summary (`data/reports/summary_YYYYMMDD.csv`):**
```csv
date,total_polls,successful,failed,success_rate
```

---

## Development Requirements

### Python Version
- **Required:** Python 3.11+
- **Recommended:** Python 3.11 or 3.12

### Platform Support
- **Linux:** Full support (recommended for production)
- **Windows:** Full support
- **macOS:** Full support

### Hardware Requirements
- **RAM:** 512MB+ (minimal)
- **CPU:** Any modern processor
- **Storage:** 10MB+ per day (data files)
- **Network:** Required for TomTom API calls

---

## Build Configuration

### No Build Step Required

This is a pure Python application with no compilation step.

### Package Installation

**Primary:** pip (via requirements.txt)
**Virtual Environment:** venv (recommended)

---

## Performance Considerations

### API Rate Limits

**TomTom API Constraints:**
- Rate limit may apply (429 errors handled)
- Retry logic prevents data loss on transient failures
- 3 retry attempts with exponential backoff

### Polling Frequency

**Default:** Every 15 minutes

**Configuration:**
```bash
# Environment variable
POLLING_INTERVAL_MINUTES=15

# Or in routes.yaml
scraper:
  interval_minutes: 15
```

### Data Storage Efficiency

**CSV Format:**
- Plain text, human-readable
- Efficient for sequential writes
- Compatible with pandas/data analysis tools

**File Rotation:**
- Daily CSV files (auto-created)
- Prevents excessively large files
- Easy to archive or delete old data

---

## Error Handling Strategy

### Retry Logic

**Scenario 1: Network Errors**
- `RequestException` → Retry with exponential backoff
- Max 3 attempts
- Log failed routes to dead letter queue

**Scenario 2: HTTP Errors**
- 401 (Invalid API key) → Fatal error, stop scraper
- 403 (Forbidden) → Fatal error, stop scraper
- 429 (Rate limit) → Log as failed, continue
- Other → Log as failed, continue

**Scenario 3: Validation Errors**
- Missing required fields → Log as failed
- Invalid coordinates → Log as failed
- Invalid LOS → Log as failed

**Scenario 4: Unexpected Errors**
- Catch-all exception handler
- Log with full traceback
- Log as failed, continue with next route

---

## Logging Configuration

### JSON Structured Logging

**Logger:** Custom logger in `src/logger.py`

**Format:** JSON with extra fields

**Log Levels:**
- DEBUG - Detailed diagnostic information
- INFO - General informational messages
- WARNING - Warning messages (rate limits, etc.)
- ERROR - Error messages (API failures, etc.)

**Log Output:**
- Console: stderr (structured JSON)
- File: `logs/traffic_scraper_YYYYMMDD.log`

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

---

## Testing Strategy

### Unit Tests

**Framework:** pytest

**Test Areas:**
- Configuration loading
- Data validation
- LOS calculation
- CSV writing

**Mocking:**
- pytest-mock for API client mocking
- Prevent real API calls during tests

### Test Coverage

**Tool:** pytest-cov

**Target:** 80%+ coverage

---

## Deployment Configuration

### Environment Setup

**Production Considerations:**
- Run as systemd service (Linux) or task scheduler (Windows)
- Ensure `.env` file is secured (API keys)
- Configure log rotation
- Monitor disk space for data files

### Running as Service

**Linux (systemd):**
```ini
[Unit]
Description=Traffic Scraper
After=network.target

[Service]
Type=simple
User=traffic_scraper
WorkingDirectory=/path/to/traffic_scraper
ExecStart=/path/to/venv/bin/python src/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Windows (Task Scheduler):**
- Trigger: At startup
- Program: `venv\Scripts\python.exe`
- Arguments: `src/main.py`
- Start in: project directory

---

## Monitoring & Observability

### Metrics to Track

**Polling Statistics:**
- Total polls (cumulative)
- Successful polls
- Failed polls
- Success rate (%)

**Error Tracking:**
- Failed routes by type
- Failed routes by route
- Retry exhaustion events

**Data Quality:**
- Duplicate rate
- Validation failure rate
- Data completeness

### Log Analysis

**Key Patterns:**
- `Successfully fetched traffic data` - Normal operation
- `API error for {route_id}` - API issues
- `Validation failed for {route_id}` - Data issues
- `Duplicate record detected` - Deduplication working

---

## Security Considerations

### API Key Management

**Storage:** `.env` file (gitignored)

**Best Practices:**
- Never commit `.env` to version control
- Rotate API keys periodically
- Use separate keys for dev/staging/production
- Monitor API usage to detect abuse

### Network Security

**HTTPS Only:** All API calls use HTTPS (TomTom requirement)

**Timeout:** 10-second timeout prevents hanging requests

---

## Future Enhancements

### Potential Improvements
- Add database storage (PostgreSQL, SQLite)
- Implement real-time dashboard
- Add email/SMS alerts for critical failures
- Support multiple API providers (fallback)
- Add data validation and quality checks
- Implement data compression/archival
