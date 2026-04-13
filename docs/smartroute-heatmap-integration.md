# SmartRoute Heatmap Integration - osmapp

## 🎯 Tổng quan

Đã tích hợp thành công **Traffic Heatmap Component** vào osmapp, sử dụng:
- **40 segments** từ segment-extractor (Thủ Đức center)
- **Simulated LOS predictions** dựa trên heuristic (PoC)
- **MapLibre GL** để hiển thị colored road segments

---

## 📁 Files đã tạo

### Component: `src/components/TrafficHeatmap/`

```
src/components/TrafficHeatmap/
├── TrafficHeatmap.tsx    # Main component (heatmap layer + interactions)
├── index.ts               # Exports
└── (future files for XGBoost integration)
```

### Page: `src/pages/traffic-heatmap.tsx`

Demo page hiển thị heatmap với:
- Time slider control
- LOS legend
- Info panel
- Hover & click interactions

### Data: `public/traffic-segments.json`

40 segments từ segment-extractor:
- Xa Lộ Hà Nội (30 segments)
- Quốc lộ 1 (4 segments)
- Cầu vượt Ngã tư Thủ Đức (2 segments)
- ...

---

## 🚀 Cách sử dụng

### 1. Chạy dev server

```bash
cd "ref app/osmapp"
yarn install  # nếu chưa install
yarn dev
```

### 2. Mở browser

```
http://localhost:3000/traffic-heatmap
```

### 3. Tính năng

| Tính năng | Mô tả |
|----------|-------|
| **Heatmap layer** | Các đoạn đường được tô màu theo LOS |
| **Time slider** | Chuyển giữa Hiện tại / +15 / +30 / +60 phút |
| **Hover** | Hiển thị tooltip thông tin đoạn đường |
| **Click** | Phóng to và hiển thị chi tiết |
| **Legend** | Giải thích màu sắc LOS |

---

## 🎨 Màu sắc LOS

| LOS | Màu | Ý nghĩa |
|-----|-----|---------|
| A | 🟢 Xanh lá | Thông thoáng - Không tắc |
| B | 🟢 Xanh nhạt | Khá tốt - Ùn  nhẹ |
| C | 🟡 Vàng | Ổn định - Ùn vừa phải |
| D | 🟠 Cam | Bắt đầu kẹt - ùn nhiều |
| E | 🔴 Đỏ | Kẹt xe - ùn nặng |
| F | 🔴 Đỏ đậm | Kẹt cứng - Gridlock |

---

## 🔧 Hiện tại (PoC)

### Simulated Predictions

```typescript
function simulateLOS(segment, horizon) {
  // Dựa trên giờ trong ngày
  const hour = targetTime.getHours();
  const weekday = targetTime.getDay();
  
  // Rush hour (7-9, 17-19) → LOS tệ hơn
  // Weekend → LOS tốt hơn
  // Night → LOS tốt nhất
  
  return { los: 'A' | 'B' | 'C' | 'D' | 'E' | 'F', confidence };
}
```

### Features hiện có:
- ✅ Load 40 segments từ JSON
- ✅ Hiển thị heatmap với màu LOS
- ✅ Time slider (now, +15, +30, +60)
- ✅ Hover tooltip
- ✅ Click để zoom
- ✅ LOS legend
- ✅ Responsive design

---

## 🚀 Tương lai (Integration với XGBoost)

### Phase 1: Static Predictions

```
osmapp → API FastAPI → XGBoost Model → Predictions
```

1. Tạo API endpoint trong osmapp:
   ```typescript
   // pages/api/predict-traffic.ts
   export default async function handler(req, res) {
     const predictions = await predictLOS(segments, time);
     res.json(predictions);
   }
   ```

2. Gọi API từ component:
   ```typescript
   const response = await fetch('/api/predict-traffic', {
     method: 'POST',
     body: JSON.stringify({ segments, timeHorizon }),
   });
   const predictions = await response.json();
   ```

### Phase 2: Real-time Predictions

```
osmapp → traffic_scraper → TomTom API → Current Traffic
                                    ↓
                          XGBoost Model → Future Predictions
                                    ↓
                                osmapp Heatmap
```

### Phase 3: Full Integration

```
┌─────────────────────────────────────────────────────────────┐
│  osmapp Frontend                                            │
│  - TrafficHeatmap component                                 │
│  - TimeSlider: now, +15, +30, +60                          │
│  - Route planning (future)                                  │
└─────────────────────────────────────────────────────────────┘
                    ↓ API
┌─────────────────────────────────────────────────────────────┐
│  SmartRoute API (FastAPI)                                   │
│  - POST /api/heatmap/predict                                │
│  - POST /api/route/optimize                                │
│  - GET /api/segments/:id/predict                            │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Prediction Service                                         │
│  - Load XGBoost model                                       │
│  - Prepare features (23 features)                          │
│  - Run inference                                           │
└─────────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  Data Sources                                               │
│  - traffic_scraper: Real-time TomTom data                  │
│  - Historical: research dataset                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Dữ liệu

### Segments (40)

| Đường | Segments | Coverage |
|-------|----------|----------|
| Xa Lộ Hà Nội | 30 | Chính |
| Xa lộ Hà Nội | 4 | Phụ |
| Quốc lộ 1 | 4 | Chính |
| Cầu vượt Ngã tư Thủ Đức | 2 | Nút giao |

### Coordinates

- **BBox:** 10.82887, 106.75425 → 10.86887, 106.79425
- **Center:** 10.848872, 106.774250
- **Area:** ~17.6 km²

---

## 🛠️ Development

### Commands

```bash
# Dev
yarn dev

# Build
yarn build

# Lint
yarn lint
```

### File structure

```
osmapp/
├── public/
│   └── traffic-segments.json      # 40 segments data
├── src/
│   ├── components/
│   │   └── TrafficHeatmap/
│   │       ├── TrafficHeatmap.tsx
│   │       └── index.ts
│   └── pages/
│       └── traffic-heatmap.tsx    # Demo page
```

---

## 📝 Notes

### PoC Limitations

1. **Simulated predictions** - Chưa dùng XGBoost model thật
2. **Static segments** - Chỉ 40 segments, không update
3. **No real-time data** - Không có TomTom API
4. **No routing** - Chưa có gợi ý lộ trình

### Next Steps

1. ✅ Heatmap component
2. ✅ Time slider
3. ✅ Simulated predictions
4. ⏳ XGBoost model integration
5. ⏳ Real-time TomTom data
6. ⏳ Route optimization
7. ⏳ Personalized alerts

---

## 🎓 Technical Decisions

### Why MapLibre GL?

- Open-source fork of Mapbox GL
- Already in osmapp stack
- Good vector tile support
- Custom layer styling

### Why Simulated First?

- Fast PoC (< 1 day)
- No API dependency
- Test UX/UI before backend
- Easy to swap with real predictions later

### Architecture Pattern

- **Component-based** - Reusable across pages
- **Service-ready** - Easy to add API calls
- **Type-safe** - Full TypeScript support

---

## 🔗 Related Files

- `segment-extractor/output/segments_in_bbox.json` - Source data
- `segment-extractor/SESSION_SUMMARY.md` - Session notes
- `y tuong.md` - Full product vision
- `docs/osmapp/` - osmapp documentation
- `docs/research traffic data/` - Research AI documentation

---

**Status:** ✅ PoC Complete - Ready for XGBoost integration

**Date:** 2026-04-13

**Next:** Integrate XGBoost model API for real predictions
