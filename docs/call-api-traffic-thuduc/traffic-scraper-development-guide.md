# Development Guide - Traffic Scraper

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Python** | 3.11+ | Programming language |
| **pip** | Latest | Package management |
| **Git** | Latest | Version control |

### Installation

#### 1. Clone Repository

```bash
cd "ref app/call-api-traffic-thuduc/traffic_scraper"
```

#### 2. Create Virtual Environment

**Linux/macOS:**
```bash
python3.11 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

#### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API key
# TOMTOM_API_KEY=your_api_key_here
```

#### 5. Configure Routes

Edit `config/routes.yaml`:

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

## Running the Application

### Start Scraper

```bash
python src/main.py
```

### With Custom Log Level

```bash
LOG_LEVEL=DEBUG python src/main.py
```

### Expected Output

```
{"timestamp": "2026-04-13T09:00:00+07:00", "level": "INFO", "message": "Traffic Scraper starting..."}
{"timestamp": "2026-04-13T09:00:00+07:00", "level": "INFO", "message": "Starting Traffic Scraper scheduler"}
{"timestamp": "2026-04-13T09:00:00+07:00", "level": "INFO", "message": "Running initial poll..."}
{"timestamp": "2026-04-13T09:00:00+07:00", "level": "INFO", "message": "Scheduler started successfully"}
{"timestamp": "2026-04-13T09:00:00+07:00", "level": "INFO", "message": "Press Ctrl+C to stop the scheduler"}
```

### Stop Scraper

Press `Ctrl+C` for graceful shutdown:

```
^C{"timestamp": "2026-04-13T09:15:00+07:00", "level": "INFO", "message": "Keyboard interrupt received"}
{"timestamp": "2026-04-13T09:15:00+07:00", "level": "INFO", "message": "Stopping scheduler..."}
{"timestamp": "2026-04-13T09:15:00+07:00", "level": "INFO", "message": "Scheduler stopped. Final statistics:", ...}
```

---

## Development Workflow

### Project Structure

```
traffic_scraper/
├── src/                      # Source code
│   ├── main.py              # Entry point
│   ├── api_client.py        # TomTom API client
│   ├── data_processor.py    # Data validation & storage
│   ├── scheduler.py         # APScheduler orchestration
│   ├── models.py            # Data models
│   ├── logger.py            # Logging setup
│   └── config/              # Configuration
│       ├── settings.py      # Config loader
│       └── routes.yaml      # Route definitions
├── tests/                   # Unit tests
├── data/                    # Generated data
├── logs/                    # Generated logs
├── requirements.txt         # Dependencies
└── README.md               # Documentation
```

### Adding a New Route

Edit `config/routes.yaml`:

```yaml
routes:
  - id: "route_01"
    name: "Existing Route"
    origin: {lat: 10.7589, lng: 106.6669}
    destination: {lat: 10.7689, lng: 106.7769}
    distance_km: 12.5

  # Add new route below
  - id: "route_02"
    name: "Your New Route"
    origin: {lat: 10.1234, lng: 106.5678}
    destination: {lat: 10.2345, lng: 106.6789}
    distance_km: 8.3
    description: "Route description"
```

Restart the scraper to apply changes.

### Changing Polling Interval

Edit `config/routes.yaml`:

```yaml
scraper:
  interval_minutes: 30  # Change from 15 to 30 minutes
```

Or set environment variable:

```bash
POLLING_INTERVAL_MINUTES=30 python src/main.py
```

### Extending Collection Duration

Edit `config/routes.yaml`:

```yaml
scraper:
  collection_days: 14  # Change from 7 to 14 days
```

---

## Testing

### Run All Tests

```bash
pytest tests/
```

### Run with Coverage

```bash
pytest --cov=src tests/
```

### Run Specific Test

```bash
pytest tests/test_data_processor.py
```

### Run with Verbose Output

```bash
pytest -v tests/
```

### Writing Tests

Create `tests/test_<module>.py`:

```python
import pytest
from src.models import calculate_los

def test_los_calculation():
    # Test LOS A
    assert calculate_los(0.95) == "A"

    # Test LOS B
    assert calculate_los(0.80) == "B"

    # Test LOS F
    assert calculate_los(0.2) == "F"

def test_los_boundaries():
    # Test boundary conditions
    assert calculate_los(0.9) == "A"
    assert calculate_los(0.75) == "B"
    assert calculate_los(0.6) == "C"
    assert calculate_los(0.45) == "D"
    assert calculate_los(0.3) == "E"
    assert calculate_los(0.29) == "F"
```

---

## Code Quality

### Linting

**Flake8:**
```bash
flake8 src/
```

**Pylint:**
```bash
pylint src/
```

**Type Checking:**
```bash
mypy src/
```

### Code Formatting

Install `black`:
```bash
pip install black
```

Format code:
```bash
black src/
```

---

## Debugging

### Enable Debug Logging

```bash
LOG_LEVEL=DEBUG python src/main.py
```

### Debug with IDE

Set breakpoints in:
- `src/scheduler.py:_poll_all_routes()`
- `src/api_client.py:fetch_route_data()`
- `src/data_processor.py:validate_record()`

### Common Issues

#### Issue 1: Configuration Error

**Error:**
```
Configuration error: ...
Please ensure:
1. .env file exists with TOMTOM_API_KEY set
2. config/routes.yaml exists with valid route definitions
```

**Solution:**
- Create `.env` file from `.env.example`
- Add valid TomTom API key
- Verify `config/routes.yaml` exists

#### Issue 2: API Authentication Failed

**Error:**
```
API error for route_01: HTTP 401 - Unauthorized
```

**Solution:**
- Verify API key in `.env`
- Check API key validity at https://developer.tomtom.com/
- Ensure API key has Routing API permissions

#### Issue 3: Network Timeout

**Error:**
```
API error for route_01: Connection timeout after 3 attempts
```

**Solution:**
- Check internet connection
- Verify TomTom API status
- Increase timeout in `api_client.py`

#### Issue 4: Validation Failed

**Error:**
```
Validation failed for route_01: Missing required field: los
```

**Solution:**
- Check API response format
- Verify LOS calculation logic
- Check for API changes

---

## Deployment

### Linux (systemd)

Create `/etc/systemd/system/traffic-scraper.service`:

```ini
[Unit]
Description=Traffic Scraper
After=network.target

[Service]
Type=simple
User=traffic_scraper
WorkingDirectory=/path/to/traffic_scraper
Environment="PATH=/path/to/traffic_scraper/venv/bin"
ExecStart=/path/to/traffic_scraper/venv/bin/python src/main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable traffic-scraper
sudo systemctl start traffic-scraper
```

Check status:
```bash
sudo systemctl status traffic-scraper
```

View logs:
```bash
sudo journalctl -u traffic-scraper -f
```

### Windows (Task Scheduler)

1. Open Task Scheduler
2. Create Basic Task
3. Trigger: At startup
4. Action: Start a program
   - Program: `C:\path\to\traffic_scraper\venv\Scripts\python.exe`
   - Arguments: `src/main.py`
   - Start in: `C:\path\to\traffic_scraper`
5. Finish

### Docker (Optional)

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["python", "src/main.py"]
```

Build and run:
```bash
docker build -t traffic-scraper .
docker run -d --name scraper --env-file .env traffic-scraper
```

---

## Monitoring

### Log Files

**Location:** `logs/traffic_scraper_YYYYMMDD.log`

**View live logs:**
```bash
tail -f logs/traffic_scraper_$(date +%Y%m%d).log
```

**Filter errors:**
```bash
grep "ERROR" logs/traffic_scraper_$(date +%Y%m%d).log
```

### Data Files

**Traffic data:** `data/scraped_data/traffic_data_YYYYMMDD.csv`
**Failed routes:** `data/failed_routes.csv`
**Daily summaries:** `data/reports/summary_YYYYMMDD.csv`

### Statistics Tracking

The scheduler tracks:
- `total_polls` - Total number of polls
- `successful_polls` - Successful API calls
- `failed_polls` - Failed API calls
- `success_rate` - Success percentage

View statistics in logs or daily summaries.

---

## Troubleshooting

### Check API Key

```bash
python -c "from src.config.settings import get_config; print(get_config().tomtom_api_key[:10] + '...')"
```

### Test API Connection

```python
from src.api_client import TrafficAPIClient
client = TrafficAPIClient(api_key="your_key")
response = client.fetch_route_data(
    route_id="test",
    origin_lat=10.7589,
    origin_lng=106.6669,
    dest_lat=10.7689,
    dest_lng=106.7769
)
print(response)
```

### Validate Routes Configuration

```python
from src.config.settings import get_config
config = get_config()
for route in config.routes:
    print(f"Route {route['id']}: {route['name']}")
```

---

## Contributing

### Code Style

- Follow PEP 8
- Use type hints
- Write docstrings
- Keep functions focused

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `refactor`: Code refactoring
- `test`: Test updates
- `chore`: Maintenance

---

## Additional Resources

### TomTom API Documentation

- **Routing API:** https://developer.tomtom.com/routing-api/documentation
- **API Key Management:** https://developer.tomtom.com/user-administration
- **Rate Limits:** Check your API dashboard

### Python Documentation

- **APScheduler:** https://apscheduler.readthedocs.io/
- **Tenacity:** https://tenacity.readthedocs.io/
- **Requests:** https://docs.python-requests.org/

---

## FAQ

### Q: How do I add more routes?

A: Edit `config/routes.yaml` and add new route entries. Restart the scraper.

### Q: Can I change the polling interval while running?

A: No, you must restart the scraper. Edit `config/routes.yaml` and restart.

### Q: What happens if the API is down?

A: The retry logic will attempt 3 times with exponential backoff. Failed routes are logged to `data/failed_routes.csv`.

### Q: How do I backfill missing data?

A: Check `data/failed_routes.csv` for failed routes. Manually retry or implement backfill logic.

### Q: Can I run multiple scrapers in parallel?

A: Yes, but you must shard routes across scrapers to avoid duplicate API calls.

---

**Related Documentation:**
- [Project Overview](./traffic-scraper-project-overview.md)
- [Architecture](./traffic-scraper-architecture.md)
- [Data Models](./traffic-scraper-data-models.md)
