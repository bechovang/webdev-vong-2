# SmartRoute - Hướng dẫn chạy local và deploy

## Kiến trúc

```
[Browser] → [Next.js / Vercel] → [FastAPI / DigitalOcean] → [SQLite + XGBoost]
```

- **traffic-map-poc/**: Frontend Next.js 15 (bản đồ giao thông) → deploy Vercel
- **traffic-api/**: Backend FastAPI (XGBoost prediction API) → deploy DigitalOcean App Platform

### Production URLs

| Service | URL |
|---------|-----|
| Frontend | https://traffic-map-poc.vercel.app |
| Backend API | https://smartroute-backend-jd88o.ondigitalocean.app |
| Health Check | https://smartroute-backend-jd88o.ondigitalocean.app/health |

---

## 1. Chạy Local

### Yêu cầu

- Python 3.11+
- Node.js 20+
- npm

### Bước 1: Clone và cài dependencies

```bash
git clone https://github.com/bechovang/webdev-vong-2.git
cd webdev-vong-2
```

### Bước 2: Setup Backend (FastAPI)

```bash
cd traffic-api

# Cài Python dependencies
pip install fastapi uvicorn numpy pandas xgboost scikit-learn scipy

# Import data vào SQLite (84K segments + research data)
python scripts/seed_db.py

# Train XGBoost model (97.58% accuracy)
python scripts/train_model.py
```

### Bước 3: Chạy Backend

```bash
cd traffic-api
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Test backend:

```bash
curl http://127.0.0.1:8000/health
```

Kết quả mong đợi:

```json
{
  "status": "ok",
  "model_loaded": true,
  "db_records": {
    "nodes": 577967,
    "segments": 84633,
    "traffic_history": 33441,
    "historical_stats": 54623
  }
}
```

### Bước 4: Chạy Frontend (terminal mới)

```bash
cd traffic-map-poc
npm install
npm run dev
```

Mở browser: **http://localhost:3000**

### Bước 5: Tắt servers

`Ctrl+C` ở mỗi terminal.

---

## 2. Deploy Production

### Backend → DigitalOcean App Platform (Docker)

Backend được deploy qua Docker image đẩy lên DO Container Registry.

#### 2.1 Build và push Docker image

```bash
cd traffic-api

# Build image
docker build -t registry.digitalocean.com/smartroute/api:latest .

# Login DO registry
doctl registry login

# Push image
docker push registry.digitalocean.com/smartroute/api:latest
```

#### 2.2 Tạo App trên DigitalOcean

```bash
# Tạo app (lần đầu)
doctl apps create --spec app.yaml

# Hoặc deploy lại (cập nhật)
doctl apps create-deployment 16582807-d49e-4e6d-a4e9-cac6b46fd077
```

File `app.yaml` (DO App Platform spec):

```yaml
name: smartroute-backend
services:
  - name: api
    image:
      registry_type: DOCR
      repository: smartroute/api
      tag: latest
    run_command: uvicorn main:app --host 0.0.0.0 --port 8000
    http_port: 8000
    instance_size_slug: basic-xxs
    routes:
      - path: /
```

#### 2.3 Kiểm tra

```bash
curl https://smartroute-backend-jd88o.ondigitalocean.app/health
```

### Frontend → Vercel

#### 2.4 Deploy Vercel

```bash
cd traffic-map-poc
vercel --prod
```

#### 2.5 Cấu hình Environment Variable

Trên Vercel dashboard hoặc CLI:

```bash
vercel env add TRAFFIC_API_URL
# Giá trị: https://smartroute-backend-jd88o.ondigitalocean.app
```

Hoặc set qua dashboard: **Settings → Environment Variables**:
- `TRAFFIC_API_URL` = `https://smartroute-backend-jd88o.ondigitalocean.app`

#### 2.6 Kiểm tra

```bash
curl https://traffic-map-poc.vercel.app
```

### Cập nhật Backend

Khi code thay đổi, rebuild và push image mới:

```bash
cd traffic-api
docker build -t registry.digitalocean.com/smartroute/api:latest .
docker push registry.digitalocean.com/smartroute/api:latest
doctl apps create-deployment 16582807-d49e-4e6d-a4e9-cac6b46fd077
```

### Cập nhật Frontend

```bash
cd traffic-map-poc
vercel --prod
```

---

## 3. Deploy trên VPS (alternative)

### VPS yêu cầu

- Ubuntu 22.04+
- RAM: 2GB+
- Python 3.11+, Node.js 20+, Nginx

### Cài đặt

```bash
git clone https://github.com/bechovang/webdev-vong-2.git /opt/smartroute
cd /opt/smartroute

# Backend
cd traffic-api
pip install fastapi uvicorn numpy pandas xgboost scikit-learn scipy
python scripts/seed_db.py
python scripts/train_model.py

# Frontend
cd /opt/smartroute/traffic-map-poc
npm install
npm run build
```

### Systemd Services

Tạo `/etc/systemd/system/smartroute-api.service`:

```ini
[Unit]
Description=SmartRoute FastAPI Backend
After=network.target

[Service]
WorkingDirectory=/opt/smartroute/traffic-api
ExecStart=/usr/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Tạo `/etc/systemd/system/smartroute-web.service`:

```ini
[Unit]
Description=SmartRoute Next.js Frontend
After=network.target smartroute-api.service

[Service]
WorkingDirectory=/opt/smartroute/traffic-map-poc
Environment=TRAFFIC_API_URL=http://127.0.0.1:8000
ExecStart=/usr/bin/npx next start -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Kích hoạt:

```bash
sudo systemctl daemon-reload
sudo systemctl enable smartroute-api smartroute-web
sudo systemctl start smartroute-api
sudo systemctl start smartroute-web
```

### Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/traffic/ {
        rewrite ^/api/traffic/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
    }
}
```

---

## 4. API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/segments` | GET | Segments theo viewport + LOS prediction |
| `/predict` | POST | Batch prediction cho segment IDs |
| `/health` | GET | Health check + DB stats |
| `/model-info` | GET | Model metadata |

### Ví dụ

```bash
# Segments trong viewport (zoom 14, Thủ Đức)
curl "https://smartroute-backend-jd88o.ondigitalocean.app/segments?minLat=10.84&minLng=106.76&maxLat=10.86&maxLng=106.78&hour=8&minute=30&weekday=1"

# Predict cho segments cụ thể
curl -X POST https://smartroute-backend-jd88o.ondigitalocean.app/predict \
  -H "Content-Type: application/json" \
  -d '{"segment_ids": [26, 33, 67], "hour": 8, "minute": 30, "weekday": 1}'
```

---

## 5. Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| Port 8000 đã được sử dụng | `taskkill /F /PID <pid>` hoặc đổi port: `--port 8001` |
| Port 3000 đã được sử dụng | `npx next dev -p 3001` |
| Model chưa load | Chạy `python scripts/train_model.py` trước |
| DB chưa có data | Chạy `python scripts/seed_db.py` trước |
| Build lỗi `.next/trace` | Xóa `.next` rồi build lại: `rm -rf .next && npm run build` |
| Thiếu Python packages | `pip install -r traffic-api/requirements.txt` |
| DO deploy chậm | Docker build + seed + train mất ~3-5 phút, chờ log |
| API trả về 0 segments | Kiểm tra bounds params (lat/lng quanh HCMC) |

---

## 6. Cấu trúc project

```
webdev-vong-2/
├── traffic-api/                 # FastAPI Backend
│   ├── main.py                  # Entry point
│   ├── Dockerfile               # Docker image (DO deployment)
│   ├── requirements.txt         # Python dependencies
│   ├── db/
│   │   └── database.py          # SQLite connection + schema
│   ├── models/
│   │   ├── xgboost_model.py     # Model wrapper (XGBoost + heuristic fallback)
│   │   └── preprocessor.py      # Feature engineering
│   ├── routers/
│   │   ├── segments.py          # GET /segments
│   │   ├── predict.py           # POST /predict
│   │   └── health.py            # GET /health
│   ├── scripts/
│   │   ├── seed_db.py           # Import data vào SQLite
│   │   └── train_model.py       # Train + save XGBoost model
│   └── artifacts/               # DB + model files (gitignored)
│
└── traffic-map-poc/             # Next.js Frontend
    ├── src/
    │   ├── app/
    │   │   ├── api/segments-hcmc/route.ts   # Proxy → FastAPI
    │   │   └── page.tsx                      # Main page
    │   ├── lib/
    │   │   ├── server/
    │   │   │   ├── apiClient.ts              # FastAPI client
    │   │   │   ├── trafficData.ts            # Segment loading
    │   │   │   └── routePredictionAnalysis.ts
    │   │   └── useTrafficSegments.ts         # Hook + time re-fetch
    │   └── components/
    │       ├── TrafficOverlay/TrafficOverlay.tsx
    │       ├── TimePicker/TimePicker.tsx
    │       └── ...
    └── package.json
```
