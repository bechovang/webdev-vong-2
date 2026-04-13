# Traffic Scraper Documentation Index

## Overview

**Traffic Scraper** is an automated traffic data collection system for Thu Duc, Ho Chi Minh City. It polls TomTom Routing API every 15 minutes for 7 days across 10 key routes, collecting real-time traffic data with fault-tolerant auto-recovery.

**Repository:** `call-api-traffic-thuduc/traffic_scraper`
**License:** MIT
**Status:** ✅ Production Ready

---

## Quick Links

| Document | Description |
|----------|-------------|
| [Project Overview](#project-overview) | Executive summary and quick reference |
| [Technology Stack](#technology-stack) | Python 3.11 + APScheduler stack |
| [Architecture](#architecture) | Scheduled data collection pipeline |
| [Source Tree Analysis](#source-tree-analysis) | Annotated directory structure |
| [Data Models](#data-models) | Data schema and LOS calculation |
| [Development Guide](#development-guide) | Setup and workflow guide |

---

## Quick Start

```bash
# Navigate to project
cd "ref app/call-api-traffic-thuduc/traffic_scraper"

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your TOMTOM_API_KEY

# Run scraper
python src/main.py
```

Press `Ctrl+C` to stop gracefully.

---

## Documentation

### Project Overview

**[traffic-scraper-project-overview.md](./traffic-scraper-project-overview.md)**

Complete project summary including:
- Executive summary
- Key features (10 routes, 15-minute polling, 7-day run)
- Technology stack overview
- Architecture pattern
- Repository structure
- Usage instructions
- Monitoring guide

**Read this first** to understand what Traffic Scraper does and how it fits into your workflow.

---

### Technology Stack

**[traffic-scraper-technology-stack.md](./traffic-scraper-technology-stack.md)**

Detailed technology documentation including:

**Core Technologies:**
- Python 3.11+
- APScheduler 3.10.4 (Background task scheduling)
- requests 2.31.0 (HTTP client)
- tenacity 8.2.3 (Retry logic with exponential backoff)
- pyyaml 6.0.1 (YAML configuration)
- python-dotenv 1.0.0 (Environment variables)

**Key Topics:**
- Retry configuration (3 attempts, exponential backoff)
- API integration (TomTom Routing API)
- Configuration management (YAML + .env)
- File formats (CSV schemas)
- Performance considerations
- Error handling strategy
- Logging configuration
- Testing strategy
- Deployment configuration

**Read this** to understand the technical components and how they work together.

---

### Architecture

**[traffic-scraper-architecture.md](./traffic-scraper-architecture.md)**

Complete system architecture documentation including:

**Architecture Pattern:**
- Scheduled Data Collection Pipeline
- Layered architecture (Scheduler, Orchestration, API, Processing, Storage)

**Component Architecture:**
- Scheduler Layer (APScheduler BackgroundScheduler)
- Orchestration Layer (TrafficScheduler)
- API Client Layer (TrafficAPIClient with retry logic)
- Data Processing Layer (DataProcessor)
- Data Models Layer (RouteConfig, APIResponse, TrafficData)
- Configuration Layer (Config)
- Logging Layer (Custom JSON logger)

**Data Flow:**
- Normal operation flow
- Error recovery flow
- Graceful shutdown flow

**Storage Architecture:**
- File organization (CSV files, dead letter queue, summaries)
- CSV schemas (traffic data, failed routes, daily summaries)

**Key Topics:**
- Error handling strategy
- Concurrency model
- Security architecture
- Monitoring & observability
- Scalability considerations
- Architecture trade-offs

**Read this** to understand how the system works end-to-end.

---

### Source Tree Analysis

**[traffic-scraper-source-tree-analysis.md](./traffic-scraper-source-tree-analysis.md)**

Annotated directory structure and file-by-file analysis including:

**Directory Structure:**
- `src/` - Application source code
- `tests/` - Unit tests
- `data/` - Generated data storage
- `logs/` - Generated logs
- `config/` - Route configurations

**File Analysis:**
- `src/main.py` - Entry point (52 lines)
- `src/scheduler.py` - APScheduler orchestration (285 lines)
- `src/api_client.py` - TomTom API client (150+ lines)
- `src/data_processor.py` - Data validation and storage (200+ lines)
- `src/models.py` - Data models and LOS calculation (166 lines)
- `src/logger.py` - JSON structured logging (80+ lines)
- `src/config/settings.py` - Configuration management (100+ lines)

**Key Topics:**
- Component dependencies
- Data flow through files
- Import analysis
- Code organization patterns
- Extension points
- Testing strategy

**Read this** to navigate the codebase and understand file organization.

---

### Data Models

**[traffic-scraper-data-models.md](./traffic-scraper-data-models.md)**

Complete data model documentation including:

**Data Model Hierarchy:**
- Configuration Layer (RouteConfig)
- API Layer (APIResponse)
- Processing Layer (Metrics calculation)
- Domain Layer (TrafficData)
- Storage Layer (CSV schemas)

**Core Data Models:**
- `RouteConfig` - Route configuration
- `APIResponse` - TomTom API response
- `TrafficData` - Validated traffic data

**Metrics Calculation:**
- Current speed calculation
- Free flow speed calculation
- Congestion ratio calculation

**LOS (Level of Service) Calculation:**
- LOS levels (A-F)
- LOS thresholds (0.9, 0.75, 0.6, 0.45, 0.3)
- Congestion level mapping

**CSV Storage Models:**
- Traffic data CSV schema
- Failed routes CSV schema
- Daily summary CSV schema

**Key Topics:**
- Data validation rules
- Duplicate detection
- Error data models
- Data quality metrics

**Read this** to understand the data structures and calculations.

---

### Development Guide

**[traffic-scraper-development-guide.md](./traffic-scraper-development-guide.md)**

Complete development workflow guide including:

**Getting Started:**
- Prerequisites (Python 3.11+, pip, Git)
- Installation instructions
- Configuration guide

**Running the Application:**
- Start scraper
- Custom log levels
- Expected output
- Stop scraper

**Development Workflow:**
- Project structure
- Adding new routes
- Changing polling interval
- Extending collection duration

**Testing:**
- Run all tests
- Run with coverage
- Writing tests

**Code Quality:**
- Linting (flake8, pylint)
- Type checking (mypy)
- Code formatting (black)

**Debugging:**
- Enable debug logging
- Debug with IDE
- Common issues and solutions

**Deployment:**
- Linux (systemd)
- Windows (Task Scheduler)
- Docker (optional)

**Monitoring:**
- Log files
- Data files
- Statistics tracking

**Troubleshooting:**
- Check API key
- Test API connection
- Validate routes configuration

**Read this** to set up your development environment and start contributing.

---

## Key Concepts

### LOS (Level of Service)

Traffic conditions are classified into 6 levels:

| LOS | Ratio | Description |
|-----|-------|-------------|
| **A** | ≥ 0.90 | Thông thoáng (Free flow) |
| **B** | ≥ 0.75 | Khá thông thoáng (Reasonably free flow) |
| **C** | ≥ 0.60 | Bình thường (Stable flow) |
| **D** | ≥ 0.45 | Bắt đầu chậm (Approaching unstable) |
| **E** | ≥ 0.30 | Kẹt xe (Unstable flow) |
| **F** | < 0.30 | Kẹt xe nặng (Forced flow) |

**Calculation:**
```python
congestion_ratio = current_speed / free_flow_speed
los = calculate_los(congestion_ratio)
```

### Retry Logic

The API client uses tenacity for automatic retry:

- **Max attempts:** 3
- **Backoff:** Exponential (1s, 2s, 4s)
- **Retry on:** `RequestException` (network errors, timeouts)

### Dead Letter Queue

Failed API calls are logged to `data/failed_routes.csv` for:
- Post-mortem analysis
- Retry processing (offline)
- Error trend monitoring

### Graceful Shutdown

The scraper handles `SIGINT` (Ctrl+C) and `SIGTERM` signals:
1. Stop accepting new jobs
2. Wait for running jobs to complete
3. Log final statistics
4. Exit cleanly

---

## Configuration

### Environment Variables (.env)

```bash
TOMTOM_API_KEY=your_api_key_here
LOG_LEVEL=INFO
DATA_DIR=data/scraped_data
LOGS_DIR=logs
```

### Routes Configuration (config/routes.yaml)

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

## Data Output

### Traffic Data

**Location:** `data/scraped_data/traffic_data_YYYYMMDD.csv`

**Schema:**
```csv
timestamp,route_id,route_name,origin_lat,origin_lng,dest_lat,dest_lng,current_speed,free_flow_speed,travel_time_seconds,congestion_level,los
```

**Example:**
```csv
2026-04-13T09:00:00+07:00,route_01,Lê Văn Việt - Quốc Lộ 1A,10.7589,106.6669,10.7689,106.7769,18.75,25.00,2400,Low,B
```

### Failed Routes

**Location:** `data/failed_routes.csv`

**Schema:**
```csv
timestamp,route_id,route_name,error_type,error_message,retry_attempts
```

### Daily Summaries

**Location:** `data/reports/summary_YYYYMMDD.csv`

**Schema:**
```csv
date,total_polls,successful,failed,success_rate
```

---

## Troubleshooting

### Common Issues

**Configuration Error:**
- Create `.env` file from `.env.example`
- Add valid TomTom API key
- Verify `config/routes.yaml` exists

**API Authentication Failed:**
- Verify API key in `.env`
- Check API key validity at https://developer.tomtom.com/

**Network Timeout:**
- Check internet connection
- Verify TomTom API status
- Increase timeout in `api_client.py`

**Validation Failed:**
- Check API response format
- Verify LOS calculation logic

---

## Additional Resources

### TomTom API Documentation

- **Routing API:** https://developer.tomtom.com/routing-api/documentation
- **API Key Management:** https://developer.tomtom.com/user-administration

### Python Documentation

- **APScheduler:** https://apscheduler.readthedocs.io/
- **Tenacity:** https://tenacity.readthedocs.io/
- **Requests:** https://docs.python-requests.org/

---

## Support

For issues, questions, or contributions:

1. Check the [Development Guide](./traffic-scraper-development-guide.md)
2. Review [Architecture](./traffic-scraper-architecture.md) for system design
3. See [Data Models](./traffic-scraper-data-models.md) for data structures

---

**Documentation Version:** 1.0
**Last Updated:** 2026-04-13
**Project Status:** ✅ Production Ready
