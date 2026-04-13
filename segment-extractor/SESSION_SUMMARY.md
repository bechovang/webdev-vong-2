# Segment Extractor - Session Summary

**Date:** 2026-04-13
**Project:** SmartRoute PoC
**Goal:** Extract road segments within bounding box for traffic prediction

---

## 🎯 Objectives Achieved

### 1. Created standalone segment-extractor project
- **Location:** `segment-extractor/`
- **Purpose:** Extract segments from research dataset within bounding box
- **Key insight:** Dataset already has coordinates - no Overpass API needed!

### 2. Extracted segments for multiple bounding boxes
- Thu Đức / Quận 9 (large): 157 segments
- Thu Đức Center (medium): 68 segments
- **Center Area (40 segments):** Selected for PoC

### 3. Optimized from 18+ hours to <5 seconds
- **Initial approach:** Resolve node_id via Overpass API → 18-20 hours
- **Final approach:** Use existing coordinates in dataset → <5 seconds

---

## 📁 Project Structure

```
segment-extractor/
├── main.py                      # Main extraction script (optimized)
├── config/
│   └── bbox_config.yaml         # Bounding box configuration
├── output/
│   ├── segments_in_bbox.json     # Extracted segments (main output)
│   ├── traffic_scraper_config.yaml  # Config for traffic_scraper
│   ├── statistics.txt            # Human-readable statistics
│   ├── api_analysis.txt          # API quota analysis
│   └── bbox_nodes_*.json         # Cached bbox nodes (not used)
├── setup.bat / setup.sh         # Setup scripts
├── requirements.txt
├── .gitignore
├── README.md
├── PROJECT.md
└── SESSION_SUMMARY.md           # This file
```

---

## 🔑 Key Discoveries

### Dataset Already Has Coordinates!

**Original Problem:**
```python
# Thought we needed to resolve node_id → lat/lng
s_node_id: 366428456 → ??? → 10.8415062, 106.7687324
```

**Solution:**
```csv
# Dataset has: long_snode, lat_snode, long_enode, lat_enode
long_snode,lat_snode,long_enode,lat_enode
106.7687324,10.8415062,106.769254,10.8424219
```

This eliminated the need for:
- ❌ Overpass API calls
- ❌ 18-20 hour wait time
- ❌ Rate limiting issues

### Overpass API Rate Limiting

**Attempts:**
1. Single bbox query → 504 Timeout
2. 3x3 tiles → 2/9 succeeded, 22,923 nodes
3. 4x4 tiles → 5/16 succeeded, 57,589 nodes
4. **Abandoned** - discovered existing coordinates

---

## 📊 Bounding Boxes Tested

| BBox Name | North | South | West | East | Area | Segments | API Calls/Day |
|-----------|-------|-------|------|------|------|----------|---------------|
| Thủ Đức Large | 10.89880 | 10.83390 | 106.74565 | 106.84745 | 81.4 km² | 157 | 10,676 |
| Thủ Đức Center | 10.86310 | 10.83065 | 106.76050 | 106.81140 | 18.4 km² | 68 | 4,624 |
| **Center Area (PoC)** | **10.86887** | **10.82887** | **106.75425** | **106.79425** | **17.6 km²** | **40** | **2,720** |

### Selected: Center Area (40 segments)

**Why this bbox?**
- Center point: 10.848872, 106.774250
- Low API quota: 2,720 calls/day (dual mode)
- Focus on Xa Lộ Hà Nội (main road)
- Suitable for PoC

---

## 🛣️ Final Output: 40 Segments

### Street Distribution:
| Street | Segments |
|--------|----------|
| Xa Lộ Hà Nội | 30 |
| Xa lộ Hà Nội | 4 |
| Quốc lộ 1 | 4 |
| Cầu vượt Ngã tư Thủ Đức | 2 |

### Segment Details:
- Min length: 52m
- Max length: 431m
- Avg length: 126.0m
- Level 1 (highest): 36 segments
- Level 2: 4 segments

### Unique Points:
- Start points: 40
- End points: 40
- Total unique: 62

---

## 📡 API Quota Analysis

### TomTom API Calls (Dual Mode):

| Mode | Interval | Hours | Calls/Hour | Total Calls |
|------|----------|-------|------------|-------------|
| Normal | 30min | 22h | 80 | 1,760 |
| Priority | 5min | 2h | 480 | 960 |
| **Total** | - | **24h** | - | **2,720** |

### Comparison with TomTom Free Tier:
- **Free tier:** 2,500 calls/day
- **Our usage:** 2,720 calls/day
- **Overage:** 220 calls/day (8.8%)

**Options:**
1. Upgrade to paid tier
2. Reduce segments (40 → 35)
3. Increase intervals (30min → 35min)

---

## 🔄 Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│  segments_in_bbox.json (40 segments)                        │
│  - segment_id, s_lat, s_lng, e_lat, e_lng                   │
│  - length, street_level, max_velocity, street_name          │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌─────────────────┐                   ┌─────────────────┐
│ traffic_scraper │                   │  XGBoost Model  │
│ TomTom API      │                   │  (LOS prediction)│
│ current_speed   │                   │  research project│
│ 40 segments     │                   │  23 features     │
└─────────────────┘                   └─────────────────┘
        └───────────────────┬───────────────────┘
                            ↓
                  ┌─────────────────┐
                  │  osmapp Heatmap │
                  │  62 points      │
                  │  Color by LOS   │
                  └─────────────────┘
```

---

## 🚀 Next Steps

### Immediate (PoC):
1. ✅ Extract 40 segments
2. ⏳ Copy `traffic_scraper_config.yaml` to traffic_scraper
3. ⏳ Implement dual-mode polling (30min + 5min)
4. ⏳ Test TomTom API calls
5. ⏳ Train XGBoost with fresh data
6. ⏳ Display on osmapp heatmap

### Future:
1. Expand to more segments (157 or full bbox)
2. Add GNN model for priority areas
3. Real-time prediction updates
4. User-customizable time windows

---

## 📝 Key Files

### Output Files (ready to use):
- `output/segments_in_bbox.json` - 40 segments with coordinates
- `output/traffic_scraper_config.yaml` - Ready for traffic_scraper
- `output/statistics.txt` - Human-readable stats
- `output/api_analysis.txt` - API quota analysis

### Configuration:
- `config/bbox_config.yaml` - Bounding box settings
  - Center: 10.848872, 106.774250
  - BBox: 10.82887, 106.75425 → 10.86887, 106.79425
  - max_segments: 40
  - min_length: 50m
  - max_length: 500m
  - priority_levels: [1, 2]

---

## 🎓 Lessons Learned

1. **Always check dataset first** - Coordinates were already there!
2. **Start small for PoC** - 40 segments > 157 segments for testing
3. **API quota matters** - Calculate before implementing
4. **Center point expansion** - Better than arbitrary bbox
5. **Cache aggressively** - bbox_nodes cached (even if not used)

---

## 🔧 Technical Details

### Dataset Schema:
```csv
_id, segment_id, date, weekday, period, LOS,
s_node_id, e_node_id, length, street_id, max_velocity,
street_level, street_name, street_type,
long_snode, lat_snode, long_enode, lat_enode
```

### Key Columns Used:
- `segment_id` - Unique segment identifier
- `long_snode, lat_snode` - Start node coordinates
- `long_enode, lat_enode` - End node coordinates
- `length` - Segment length (meters)
- `street_level` - 1=highest, 4=lowest
- `street_name` - Street name

### Filtering Logic:
```python
# 1. Filter by bbox (start OR end in bbox)
in_bbox = (
    (lat_snode.between(south, north)) &
    (long_snode.between(west, east))
) | (
    (lat_enode.between(south, north)) &
    (long_enode.between(west, east))
)

# 2. Filter by length (50-500m)
length.between(50, 500)

# 3. Filter by street level (1, 2)
street_level.isin([1, 2])

# 4. Limit to 40 segments
head(40)
```

---

## 📞 Contact

**Project:** SmartRoute - Predictive Traffic Heatmap
**Date:** 2026-04-13
**Status:** Ready for integration with traffic_scraper and XGBoost model
