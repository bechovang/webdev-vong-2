# Segment Extractor for SmartRoute

**Optimized version: NO Overpass API needed!**

Extract road segments within a bounding box from HCMC traffic dataset for SmartRoute PoC.

## 🎯 Purpose

Filter traffic segments from the research-traffic-AI dataset within a specific geographic bounding box. **Dataset already has coordinates** - extraction takes <5 seconds!

## ✨ Features

- ✅ Load HCMC traffic dataset (33,441 records, 10,027 segments)
- ✅ **NO Overpass API needed** - dataset has coordinates built-in
- ✅ Filter segments by bounding box using existing lat/lng columns
- ✅ Export filtered segments to JSON format
- ✅ Generate traffic_scraper configuration
- ⚡ **<5 seconds execution time** (vs 18+ hours with API approach)

## 📦 Installation

```bash
cd segment-extractor
python -m venv venv
# Windows:
venv\Scripts\pip install -r requirements.txt
# Linux/Mac:
source venv/bin/activate && pip install -r requirements.txt
```

## ⚙️ Configuration

Edit `config/bbox_config.yaml`:

```yaml
bounding_box:
  # Bounding box coordinates (decimal degrees)
  north: 10.86887        # Northern boundary
  south: 10.82887        # Southern boundary
  west: 106.75425        # Western boundary
  east: 106.79425        # Eastern boundary
  name: "Thu Duc Center Expanded"

data:
  research_data_path: "../ref app/data traffic hcm/data1/train.csv"
  output_dir: "output"

extraction:
  max_segments: 40       # Limit for PoC
  min_length: 50         # Min segment length (meters)
  max_length: 500        # Max segment length (meters)
  priority_levels: [1, 2] # 1=highest priority roads
```

## 🚀 Usage

### Step 1: Download Dataset

Download the HCMC traffic dataset from:
```
https://data.veronlabs.com/d-li-u-tai-n-giao-thong-tp-hcm-nam-2025
```

Extract and place `train.csv` in:
```
../ref app/data traffic hcm/data1/train.csv
```

### Step 2: Extract Segments

```bash
# Windows
venv\Scripts\python.exe main.py

# Linux/Mac
python main.py
```

**Output:**
```
============================================================
SEGMENT EXTRACTOR FOR SMARTROUTE (NO API NEEDED!)
============================================================

🔍 Loading research data...
   ✓ Loaded 33,441 records
   ✓ Unique segments: 10,027
   ✓ Coordinate columns found

📍 Filtering by bounding box...
   ✓ Segments in bbox: 40
   ✓ Final segment count: 40

💾 Creating output JSON...
   ✓ Saved to output/segments_in_bbox.json

⏱ Total time: <5 seconds
```

### Step 3: Check Results

```bash
# View extracted segments
type output\segments_in_bbox.json

# View statistics
type output\statistics.txt

# View API analysis
type output\api_analysis.txt
```

## 📊 Output Files

### `output/segments_in_bbox.json`

Filtered segments with coordinates:

```json
{
  "bounding_box": {
    "north": 10.86887,
    "south": 10.82887,
    "west": 106.75425,
    "east": 106.79425,
    "name": "Thu Duc Center Expanded"
  },
  "extraction_date": "2026-04-13T18:59:19.437696",
  "segments": [
    {
      "segment_id": 17306,
      "s_node_id": 1958801427,
      "e_node_id": 366435039,
      "s_lat": 10.8622914,
      "s_lng": 106.7948467,
      "e_lat": 10.8619363,
      "e_lng": 106.7942659,
      "length": 74,
      "street_level": 1,
      "max_velocity": 60.0,
      "street_name": "Xa Lộ Hà Nội"
    },
    ...
  ],
  "statistics": {
    "total_segments_in_dataset": 40,
    "segments_extracted": 40,
    "extraction_percentage": 100.0
  }
}
```

### `output/traffic_scraper_config.yaml`

Configuration for traffic_scraper (auto-generated):

```yaml
segments:
  - segment_id: 17306
    s_node_id: 1958801427
    e_node_id: 366435039
    s_lat: 10.8622914
    s_lng: 106.7948467
    e_lat: 10.8619363
    e_lng: 106.7942659
    length: 74
    street_level: 1
    max_velocity: 60.0
    street_name: Xa Lộ Hà Nội
scraper:
  interval_minutes: 30
  collection_days: 7
  mode: dual
```

## 📁 Project Structure

```
segment-extractor/
├── main.py                      # Main extraction script (OPTIMIZED)
├── config/
│   └── bbox_config.yaml         # Bounding box configuration
├── output/
│   ├── segments_in_bbox.json     # Extracted segments (main output)
│   ├── traffic_scraper_config.yaml  # Config for traffic_scraper
│   ├── statistics.txt            # Human-readable statistics
│   └── api_analysis.txt          # API quota analysis
├── setup.bat / setup.sh         # Setup scripts
├── requirements.txt
├── .gitignore
├── README.md                    # This file
├── PROJECT.md                   # Detailed project guide
└── SESSION_SUMMARY.md           # Session summary & lessons learned
```

## 📈 Results (40 Segments)

### Street Distribution:
| Street | Segments |
|--------|----------|
| Xa Lộ Hà Nội | 30 |
| Xa lộ Hà Nội | 4 |
| Quốc lộ 1 | 4 |
| Cầu vượt Ngã tư Thủ Đức | 2 |

### API Quota (Dual Mode):
- **Total calls/day:** 2,720
- Normal period (22h): 1,760 calls
- Priority period (2h): 960 calls

### Segment Details:
- Min length: 52m
- Max length: 431m
- Avg length: 126.0m
- Level 1 (highest): 36 segments
- Level 2: 4 segments

## 🔗 Integration Flow

```
segments_in_bbox.json (40 segments)
         ↓
    ┌────┴────┐
    ↓         ↓
traffic_scraper  XGBoost Model
TomTom API       (LOS prediction)
    └────┬────┘
         ↓
   osmapp Heatmap
```

## 📝 Key Discovery

**Dataset already has coordinates!**

The research dataset includes:
```csv
long_snode, lat_snode, long_enode, lat_enode
106.7687324, 10.8415062, 106.769254, 10.8424219
```

This eliminates the need for:
- ❌ Overpass API calls
- ❌ 18-20 hour wait time
- ❌ Rate limiting issues

## 📦 Dependencies

```
pandas==2.0.0
pyyaml==6.0.1
```

## 📄 License

MIT

---

**Status:** ✅ Ready for integration with traffic_scraper and XGBoost model

**Session:** 2026-04-13

**See also:** `SESSION_SUMMARY.md` for detailed session notes
