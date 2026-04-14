# SmartRoute - Traffic Prediction Map (PoC)

Một phiên bản đơn giản và đẹp của bản đồ dự báo giao thông cho TP.HCM, tập trung vào tính năng dự đoán với các thời điểm: hiện tại, +15, +30, +60 phút.

## 🎯 Tính năng

- **Bản đồ đơn giản**: Sử dụng MapLibre GL với OpenStreetMap tiles
- **Dự báo giao thông**: Hiển thị dự đoán với 4 mốc thời gian
  - Hiện tại (now)
  - +15 phút
  - +30 phút
  - +60 phút
- **Mức độ LOS (Level of Service)**: A-F với màu sắc trực quan
- **Thống kê thời gian thực**: Số lượng segments, tỷ lệ kẹt xe
- **Tương tác**: Hover để xem chi tiết, zoom để xem rõ hơn

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

Visit http://localhost:3000

## 📁 Cấu trúc dự án

```
traffic-map-poc/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── page.tsx      # Main page
│   │   ├── layout.tsx    # Root layout
│   │   └── globals.css   # Global styles
│   └── components/       # React components
│       ├── Map/          # Map component
│       └── TrafficOverlay/  # Traffic overlay & UI
├── public/               # Static assets
└── package.json
```

## 🎨 Tùy chỉnh

### Thay đổi số lượng segments

Sửa file `src/app/page.tsx`:

```typescript
const sampleSegments = generateSampleSegments(500); // Thay đổi số lượng
```

### Thay đổi màu LOS

Sửa file `src/components/TrafficOverlay/TrafficOverlay.tsx`:

```typescript
const LOS_COLORS = {
  A: '#22c55e', // green
  B: '#84cc16', // lime
  // ... thay đổi màu theo ý muốn
};
```

## 🔜 Kế hoạch phát triển (PoC V2)

- [ ] Kết nối với API dự báo thật (XGBoost model)
- [ ] Thêm search location
- [ ] Thêm routing cơ bản
- [ ] Tăng coverage lên toàn HCMC (9,841 segments)
- [ ] Dark mode

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Map**: MapLibre GL 5
- **Language**: TypeScript
- **Styling**: CSS

## 📝 License

MIT

---

**Được xây dựng dựa trên osmapp.org** - Một bản đơn giản hóa tập trung vào dự báo giao thông.
