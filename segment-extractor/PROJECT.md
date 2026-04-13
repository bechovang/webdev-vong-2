# Segment Extractor Project

## 🎯 Purpose

Extract road segments within a bounding box from HCMC traffic dataset for SmartRoute PoC.

## 📁 Project Structure

```
segment-extractor/
├── main.py                      # Main extraction script
├── config/
│   └── bbox_config.yaml         # Bounding box configuration
├── output/                      # Generated output files
│   ├── segments_in_bbox.json     # Extracted segments (main output)
│   ├── traffic_scraper_config.yaml  # Config for traffic_scraper
│   ├── statistics.txt            # Human-readable statistics
│   └── example_output.json       # Example output format
├── setup.sh                     # Linux/mac setup script
├── setup.bat                    # Windows setup script
├── requirements.txt             # Python dependencies
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

## 🚀 Quick Start

### Windows
```bash
# 1. Run setup
setup.bat

# 2. Download dataset
# Download from: https://data.veronlabs.com/d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025
# Extract train.csv to: ../research-traffic-AI/data/train.csv

# 3. Run extraction
python main.py

# 4. Check results
type output\statistics.txt
```

### Linux/macOS
```bash
# 1. Run setup
chmod +x setup.sh
./setup.sh

# 2. Download dataset
wget https://data.veronlabs.com/d-li-u-tai-n-giao-thong-tp-hcm-nam-2025
unzip d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025
mv train.csv ../research-traffic-AI/data/

# 3. Run extraction
source venv/bin/activate
python main.py

# 4. Check results
cat output/statistics.txt
```

## 📋 Configuration

Edit `config/bbox_config.yaml`:

```yaml
bounding_box:
  north: 10.89880        # Your bounding box
  south: 10.83390
  west: 106.74565
  east: 106.84745
  name: "Thu Duc / Quận 9 Area"

extraction:
  max_segments: 1000      # Max segments to extract (for PoC)
  min_length: 50           # Min segment length (meters)
  max_length: 500          # Max segment length (meters)
  priority_levels: [1, 2]  # 1=highest priority roads
```

## 📄 Output Files

### `segments_in_bbox.json` (Main Output)

JSON file containing all segments within your bounding box:

```json
{
  "bounding_box": {...},
  "segments": [
    {
      "segment_id": 26,
      "s_lat": 10.7589,
      "s_lng": 106.6669,
      "e_lat": 10.7689,
      "e_lng": 106.7769,
      ...
    },
    ...
  ],
  "statistics": {...}
}
```

### `traffic_scraper_config.yaml`

Configuration file for traffic_scraper (auto-generated):

```yaml
segments:
  - segment_id: 26
    s_node_id: 366428456
    e_node_id: 366416066
    s_lat: 10.7589
    s_lng: 106.6669
    e_lat: 10.7689
    e_lng: 106.7769
    length_meters: 116
    street_level: 2
    max_velocity_kmh: 40.0
```

### `statistics.txt`

Human-readable statistics:

```
============================================================
SEGMENT EXTRACTION STATISTICS
============================================================

Bounding Box: Thu Duc / Quận 9 Area
North: 10.89880
South: 10.83390
West: 106.74565
East: 106.84745

Extraction Date: 2026-04-13T18:00:00+07:00

Total Segments in Dataset: 10,027
Segments Extracted: 523
Extraction Percentage: 5.2%

Segment Details:
  Min Length: 45m
  Max Length: 498m
  Avg Length: 156.3m
```

## 🔧 How It Works

**OPTIMIZED VERSION (No API needed!)**

1. **Load Research Data**: Reads `train.csv` (33,441 records, 10,027 segments)
2. **Use Existing Coordinates**: Dataset already has `long_snode, lat_snode, long_enode, lat_enode`
3. **Filter by BBox**: Finds segments within your bounding box
4. **Apply Filters**: Limits by segment length, street level, max count
5. **Export JSON**: Saves filtered segments with full metadata
6. **Generate Config**: Creates traffic_scraper configuration

## ⏱️ Expected Runtime

- **NO Overpass API needed!**: Dataset has coordinates built-in
- **Total time**: <5 seconds (vs 18+ hours with API approach)

## 📊 Expected Output

Based on your bounding box (~81 km² in eastern HCMC):

- **Estimated segments**: 500-1,000
- **Coverage**: ~5-10% of total dataset
- **For PoC**: 100-500 segments (configurable via `max_segments`)

## 🎯 Next Steps After Extraction

1. **Review output**: Check `segments_in_bbox.json`
2. **Copy to traffic_scraper**: Use `traffic_scraper_config.yaml`
3. **Update traffic_scraper**: Modify to poll these segments
4. **Test dual-mode**: 30min normal + 5min priority
5. **Fine-tune model**: Train XGBoost on fresh data

## 🐛 Troubleshooting

### Issue: "train.csv not found"

**Solution**: Download dataset from VeronLabs (see Quick Start)

### Issue: "No segments extracted"

**Solution**:
- Check bounding box coordinates
- Verify train.csv path
- Check coordinate columns exist: `long_snode, lat_snode, long_enode, lat_enode`
- Try expanding bounding box or adjusting filters

### Issue: "Unicode encoding error on Windows"

**Solution**: The script includes Windows console encoding fix. If you still see errors:
```bash
chcp 65001  # Set console to UTF-8
python main.py
```

## 📝 Notes

- **Caching**: Node coordinates are cached in `output/node_coordinates.json` to avoid re-resolving
- **Rate Limiting**: Overpass API has rate limits - script includes delays
- **Memory**: Large dataset may require significant RAM (~1GB for 33k records)
- **Config**: Adjust `max_segments` for faster PoC testing

## 📄 File Descriptions

| File | Description |
|------|-------------|
| `main.py` | Main extraction pipeline (load, resolve, filter, export) |
| `config/bbox_config.yaml` | Bounding box and extraction settings |
| `requirements.txt` | Python package dependencies |
| `setup.sh` / `setup.bat` | Automated setup script |
| `README.md` | This file |
| `output/segments_in_bbox.json` | Main output: extracted segments with coordinates |
| `output/traffic_scraper_config.yaml` | Auto-generated config for traffic_scraper |
| `output/statistics.txt` | Human-readable statistics |
| `output/example_output.json` | Example showing output format |
