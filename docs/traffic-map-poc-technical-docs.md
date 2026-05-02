# SmartRoute Traffic Map PoC - Technical Documentation

## 1. Mục tiêu tài liệu

Tài liệu này mô tả **đúng theo code hiện có** của project [`traffic-map-poc`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/README.md>). Mục tiêu là giải thích:

- project hiện đang làm được gì;
- kiến trúc đang chạy như thế nào;
- dữ liệu đi qua các lớp ra sao;
- phần nào là logic thật đang được implement;
- phần nào mới là hook mở rộng hoặc heuristic thay vì AI model production.

Tài liệu này **không mô tả theo định hướng mong muốn của SmartRoute ở quy mô lớn**, mà bám sát phiên bản PoC đang có trong repository.

---

## 2. Tổng quan hệ thống

`traffic-map-poc` là một ứng dụng web `Next.js` dùng để hiển thị bản đồ TP.HCM, tải các road segment nằm trong viewport hiện tại, gán cho chúng trạng thái giao thông dự đoán theo thang `LOS A-F`, và hỗ trợ người dùng:

- xem lớp phủ giao thông theo khu vực đang nhìn trên bản đồ;
- tìm kiếm địa điểm bằng geocoding;
- chọn điểm đi và điểm đến;
- gọi dịch vụ routing để lấy tuyến đường;
- phân tích mức độ rủi ro ùn tắc dọc tuyến;
- đề xuất thời điểm xuất phát tốt hơn giữa các mốc `now`, `+15`, `+30`, `+60`.

Điểm quan trọng cần nói rõ:

- **routing là thật**, đang gọi `GraphHopper API`;
- **dữ liệu segment là thật**, đang đọc từ `public/data/segments.csv` và `public/data/nodes.csv`;
- **traffic prediction hiện tại chưa phải model AI inference thật**;
- phần dự đoán LOS và phân tích ùn tắc hiện đang dùng **heuristic deterministic simulation** dựa trên giờ, ngày, loại đường và nhiễu có kiểm soát.

Nói ngắn gọn: đây là một PoC mạnh về `map UX + segment loading + route analysis flow`, nhưng lớp “AI traffic prediction” hiện vẫn là mô phỏng hợp lý chứ chưa phải serving model production.

---

## 3. Phạm vi chức năng đang có

### 3.1. Chức năng đã được implement

Project hiện tại đã có các capability sau:

1. Hiển thị bản đồ nền bằng `MapLibre GL`.
2. Fit bản đồ vào vùng TP.HCM khi tải trang.
3. Theo dõi `viewport` và chỉ tải segment đang nằm trong vùng nhìn thấy.
4. Giảm tải dữ liệu theo `zoom`, ví dụ zoom thấp chỉ lấy đường cấp lớn hơn.
5. Tô màu segment theo mức `LOS A-F`.
6. Hiển thị legend và thống kê nhanh của lớp traffic.
7. Hover để xem chi tiết segment ở mức zoom đủ lớn.
8. Tìm kiếm địa điểm bằng `Photon API`.
9. Nhập tọa độ trực tiếp dưới dạng `lat, lon`.
10. Đặt origin và destination từ giao diện tìm kiếm.
11. Gọi API routing để lấy tuyến đường.
12. Vẽ tuyến đường lên bản đồ.
13. Hiển thị tóm tắt route: quãng đường, ETA, turn-by-turn steps.
14. Phân tích tắc đường dọc route bằng cách đối chiếu route với traffic segments gần tuyến.
15. Highlight các đoạn tắc trên tuyến.
16. Sinh gợi ý thời điểm xuất phát tốt nhất trong tập ứng viên `0/15/30/60 phút`.

### 3.2. Những gì project chưa có

Để tránh hiểu nhầm, các phần sau **chưa được implement thành hệ thống production trong repo này**:

1. Không có model `XGBoost` hay model ML thật đang được load để infer online.
2. Không có backend Python serving model prediction.
3. Không có pipeline retraining tự động.
4. Không có dữ liệu traffic real-time từ camera, GPS fleet, hoặc API giao thông đô thị.
5. Không có chatbot hay LLM orchestration trong project này.
6. Không có route re-optimization theo traffic prediction nhiều vòng.
7. Không có map-matching nâng cao giữa polyline route và graph segment ID thực sự.

Vì vậy khi trình bày, nên mô tả đây là:

> một PoC web map đã triển khai đầy đủ luồng hiển thị, tìm kiếm, routing và phân tích tắc đường dựa trên dữ liệu segment thật, nhưng lớp dự báo giao thông hiện vẫn là heuristic simulation.

---

## 4. Công nghệ sử dụng

Theo [`package.json`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/package.json>), project đang dùng:

- `Next.js 15` cho full-stack web app;
- `React 19`;
- `TypeScript`;
- `MapLibre GL` cho bản đồ client-side;
- `react-map-gl` để tích hợp React với map stack;
- `GraphHopper Routing API` làm external routing provider;
- `Photon API` cho geocoding tìm kiếm địa điểm;
- CSV local trong `public/data/` làm nguồn dữ liệu road segment.

### 4.1. Kiểu kiến trúc

Kiến trúc thực tế của project là:

```text
Browser UI
-> Next.js client components
-> Next.js route handlers (/api/*)
-> Local CSV data + external APIs
```

Chi tiết hơn:

```text
User
-> page.tsx
-> MapView / SearchBox / TrafficOverlay / RouteLayer / RouteSummaryPanel
-> /api/segments-hcmc
-> public/data/nodes.csv + public/data/segments.csv

User route request
-> /api/route
-> GraphHopper API
-> routePredictionAnalysis.ts
-> segment matching + heuristic LOS scoring
-> UI summary

User departure suggestion
-> /api/route/recommend-departure
-> GraphHopper API
-> analyzeRoutePrediction for multiple offsets
-> ranking heuristic
-> recommendation summary
```

---

## 5. Cấu trúc thư mục chính

Các file quan trọng nhất của project:

### 5.1. App shell

- [`src/app/page.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/page.tsx>)
- [`src/app/layout.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/layout.tsx>)
- [`src/app/globals.css`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/globals.css>)
- [`src/app/map.css`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/map.css>)

### 5.2. UI components

- [`src/components/Map/MapView.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/Map/MapView.tsx>)
- [`src/components/TrafficOverlay/TrafficOverlay.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/TrafficOverlay/TrafficOverlay.tsx>)
- [`src/components/SearchBox/SearchBox.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/SearchBox.tsx>)
- [`src/components/SearchBox/SearchLocationMarker.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/SearchLocationMarker.tsx>)
- [`src/components/TimePicker/TimePicker.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/TimePicker/TimePicker.tsx>)
- [`src/components/RouteLayer/RouteLayer.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/RouteLayer/RouteLayer.tsx>)
- [`src/components/RouteSummaryPanel/RouteSummaryPanel.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/RouteSummaryPanel/RouteSummaryPanel.tsx>)

### 5.3. Hooks và shared types

- [`src/lib/routing.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/routing.ts>)
- [`src/lib/useTrafficSegments.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useTrafficSegments.ts>)
- [`src/lib/useTrafficPredictionCache.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useTrafficPredictionCache.ts>)
- [`src/lib/useRouteState.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useRouteState.ts>)
- [`src/lib/useMapPicking.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useMapPicking.ts>)

### 5.4. Server logic

- [`src/lib/server/trafficData.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/trafficData.ts>)
- [`src/lib/server/routePredictionAnalysis.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/routePredictionAnalysis.ts>)
- [`src/lib/server/departureRecommendation.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/departureRecommendation.ts>)
- [`src/lib/server/graphhopper.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/graphhopper.ts>)

### 5.5. API routes

- [`src/app/api/segments-hcmc/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/segments-hcmc/route.ts>)
- [`src/app/api/segments/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/segments/route.ts>)
- [`src/app/api/route/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/route/route.ts>)
- [`src/app/api/route/recommend-departure/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/route/recommend-departure/route.ts>)

### 5.6. Dữ liệu

- [`public/data/segments.csv`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/public/data/segments.csv>)
- [`public/data/nodes.csv`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/public/data/nodes.csv>)

---

## 6. Luồng hoạt động tổng thể

### 6.1. Khi người dùng mở trang

Luồng chính trong [`page.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/page.tsx>) là:

1. Khởi tạo bản đồ qua `MapView`.
2. Khi map load, app fit bounds về khu vực TP.HCM.
3. Hook `useTrafficSegments` được gắn với đối tượng `map`.
4. Mỗi lần `moveend` hoặc `zoomend`, app debounce 250ms rồi gọi `loadByBounds`.
5. Client gửi request tới `/api/segments-hcmc` với:
   - `bounds=minLat,minLng,maxLat,maxLng`
   - `zoom`
   - có thể có `streetLevelMax`
6. Server lọc segment trong CSV theo viewport rồi trả về cho client.
7. `TrafficOverlay` nhận danh sách segment visible và gắn cho chúng `LOS` bằng heuristic prediction.
8. Map vẽ line layer tô màu theo LOS.

### 6.2. Khi người dùng tìm kiếm địa điểm

Luồng search gồm:

1. Người dùng nhập query trong `SearchBox`.
2. Hook `useSearch` kiểm tra:
   - nếu chuỗi là tọa độ, parse trực tiếp;
   - nếu không, gọi `Photon API`.
3. Kết quả geocoding được render thành list chọn.
4. Khi chọn một kết quả, app:
   - fly map tới vị trí đó;
   - đặt marker custom qua `SearchLocationMarker`;
   - phân tích traffic các segment gần điểm đó nếu những segment này đang có trong viewport hiện tại.

### 6.3. Khi người dùng yêu cầu route

Luồng route hiện tại là:

1. Người dùng chọn điểm đi và điểm đến trong `SearchBox`.
2. `useRouteState` gọi `POST /api/route`.
3. API route:
   - validate input;
   - gọi `GraphHopper API`;
   - nhận polyline route, bbox, distance, duration, instructions;
   - nếu bật `includePredictionAnalysis`, chạy `analyzeRoutePrediction`.
4. Kết quả trả về gồm:
   - route geometry;
   - route metrics;
   - optional prediction analysis.
5. Client render `RouteLayer` và `RouteSummaryPanel`.

### 6.4. Khi người dùng yêu cầu gợi ý giờ xuất phát

Sau khi route được tạo:

1. `useRouteState` gọi tiếp `POST /api/route/recommend-departure`.
2. API này lấy cùng một route từ `GraphHopper`.
3. Sau đó chạy `analyzeRoutePrediction` cho nhiều offset:
   - `0`
   - `15`
   - `30`
   - `60`
4. `buildDepartureRecommendation` chấm điểm từng phương án.
5. Trả về:
   - recommended departure offset;
   - danh sách option;
   - summary.
6. UI hiển thị phương án tốt nhất và trade-off của từng lựa chọn.

---

## 7. Thành phần frontend chi tiết

## 7.1. `MapView`

[`MapView.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/Map/MapView.tsx>) khởi tạo đối tượng `MapLibre`.

Các đặc điểm thực tế:

- dùng raster tiles từ `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
- không dùng vector tile stack tự host;
- `minZoom = 8`, `maxZoom = 18`;
- có navigation control mặc định;
- trả instance map lên component cha qua callback `onMapLoad`.

Ý nghĩa:

- project chọn hướng triển khai nhanh và đơn giản cho PoC;
- dễ chạy local;
- ít hạ tầng phụ hơn so với tự build tile server.

## 7.2. `TrafficOverlay`

[`TrafficOverlay.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/TrafficOverlay/TrafficOverlay.tsx>) là lớp chính để hiển thị dự báo giao thông.

Nó làm ba việc:

1. nhận segment visible từ `useTrafficSegments`;
2. gắn cho segment nhãn `LOS` và `confidence`;
3. render chúng thành `GeoJSON source + line layer` trên map.

### Cách tô màu

Mỗi LOS tương ứng một màu khác nhau, ví dụ:

- `A`: rất thông thoáng
- `B`: tốt
- `C`: trung bình
- `D`: bắt đầu chậm
- `E`: ùn tắc nặng
- `F`: rất ùn tắc

### Cách prediction hoạt động ở frontend

`TrafficOverlay` không gọi model server. Thay vào đó nó dùng hàm `simulateLOSBatch` và cache qua `useTrafficPredictionCache`.

Heuristic đang dựa trên:

- `hour`
- `weekday`
- `isWeekend`
- `isRushHour`
- `isNight`
- `street_level`
- `random factor`

Điều này có nghĩa:

- prediction thay đổi theo thời gian chọn;
- có vẻ hợp lý ở mức demo;
- nhưng không phải là output của một model học máy được train.

### Hover behavior

Chi tiết segment chỉ hiện khi zoom đủ lớn, giúp:

- tránh popup quá dày ở zoom thấp;
- giảm nhiễu thị giác;
- giữ hiệu năng tốt hơn khi có nhiều line trên màn hình.

## 7.3. `SearchBox`

[`SearchBox.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/SearchBox.tsx>) có hai mode:

- `search`: tìm một địa điểm;
- `route`: tìm điểm đi và điểm đến.

Kết hợp với:

- [`useSearch.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/useSearch.ts>)
- [`photon.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/photon.ts>)
- [`types.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/types.ts>)

Các đặc điểm đáng chú ý:

- có debounce nhẹ trước khi gọi API geocoding;
- hỗ trợ abort request cũ khi nhập nhanh;
- hỗ trợ parse tọa độ thủ công;
- hiển thị label và sublabel từ address build bởi Photon properties;
- có logic nhóm địa điểm theo district.

## 7.4. `SearchLocationMarker`

[`SearchLocationMarker.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/SearchBox/SearchLocationMarker.tsx>) không chỉ đặt marker mà còn phân tích traffic xung quanh điểm đã chọn.

Nó làm:

1. tìm các segment gần điểm đó trong bán kính nội bộ;
2. tính average LOS và worst LOS;
3. liệt kê nearby congested roads;
4. cho phép người dùng chuyển nhanh sang flow route tới điểm đó.

Điều kiện quan trọng:

- phân tích này chỉ chính xác trong phạm vi các segment **đang được load trong viewport**;
- nếu khu vực chưa được tải vào client, marker panel không thể phân tích đầy đủ toàn vùng.

## 7.5. `TimePicker`

[`TimePicker.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/TimePicker/TimePicker.tsx>) cho phép chọn:

- `now`
- `+15`
- `+30`
- `+60`
- hoặc `custom time`

Nếu custom time nằm ở quá khứ trong ngày hiện tại, component đẩy sang ngày hôm sau. Đây là một chi tiết UX tốt vì tránh tạo time context vô nghĩa.

## 7.6. `RouteLayer`

[`RouteLayer.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/RouteLayer/RouteLayer.tsx>) chịu trách nhiệm hiển thị tuyến và các điểm tắc nổi bật.

Các phần được render:

- origin marker;
- destination marker;
- route polyline;
- congestion overlay cho các đoạn route bị đánh giá rủi ro;
- fit bounds khi route mới xuất hiện.

Điểm tốt trong implementation:

- route được nâng layer lên trên traffic layer;
- segment tắc dọc tuyến có geometry riêng để nhấn mạnh khu vực có vấn đề;
- giúp người dùng không chỉ thấy “có route”, mà còn thấy “đoạn nào của route có rủi ro”.

## 7.7. `RouteSummaryPanel`

[`RouteSummaryPanel.tsx`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/components/RouteSummaryPanel/RouteSummaryPanel.tsx>) là nơi tổng hợp output kỹ thuật thành UI dễ hiểu.

Panel hiện hiển thị:

- distance;
- ETA;
- risk level;
- coverage level;
- delay estimate;
- congestion score;
- summary;
- số lượng congested segments;
- danh sách bước chỉ đường;
- departure recommendation options.

Đây là một điểm mạnh của project vì phần UX này đã biến output backend thành thông tin có thể dùng ngay thay vì chỉ dump JSON.

---

## 8. Quản lý state và custom hooks

## 8.1. `useTrafficSegments`

[`useTrafficSegments.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useTrafficSegments.ts>) là hook quản lý việc tải segment theo viewport.

### Input

- `map`
- `timeSelection`
- `minZoomForDetails`

### Output

- `segments`
- `loading`
- `loadedCount`
- `currentZoom`
- `canHoverDetails`
- `loadByBounds()`

### Cách hoạt động

1. Tạo `requestKey` từ:
   - `minLng`
   - `minLat`
   - `maxLng`
   - `maxLat`
   - `zoom`
2. Nếu key trùng request trước thì bỏ qua để tránh fetch thừa.
3. Ở zoom thấp:
   - thêm `streetLevelMax=1` hoặc `2`;
4. Gọi `/api/segments-hcmc`.
5. Lưu kết quả vào state.

### Ý nghĩa kiến trúc

Hook này là trung tâm của chiến lược `viewport-based loading`. Nhờ đó:

- không cần đẩy toàn bộ segment lên client cùng lúc;
- bản đồ mượt hơn;
- có nền tảng tốt để mở rộng thành hệ thống quy mô lớn hơn.

## 8.2. `useTrafficPredictionCache`

[`useTrafficPredictionCache.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useTrafficPredictionCache.ts>) cache prediction theo `timeSelection`.

Cache key gồm:

- preset horizon hoặc
- custom timestamp.

Cache sống trong `5 phút`.

Ý nghĩa:

- tránh tính lại LOS quá nhiều lần khi user chuyển qua lại cùng một mốc thời gian;
- giảm chi phí xử lý client;
- cải thiện độ mượt cảm nhận.

## 8.3. `useRouteState`

[`useRouteState.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useRouteState.ts>) là state machine đơn giản cho flow route.

Nó quản lý:

- `origin`
- `destination`
- `route`
- `predictionAnalysis`
- `departureRecommendation`
- `pickingMode`
- loading flags
- error state

Hai API call chính:

- `POST /api/route`
- `POST /api/route/recommend-departure`

Điểm đáng chú ý:

- recommendation chỉ được gọi sau khi route thành công;
- nếu route thay đổi, recommendation cũ bị clear;
- UX state được reset hợp lý khi đổi điểm.

## 8.4. `useMapPicking`

[`useMapPicking.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/useMapPicking.ts>) hỗ trợ chế độ click-map để chọn origin/destination.

Component `RouteControls` có dùng flow này, nhưng ở trang hiện tại interaction chính đang nghiêng về `SearchBox`.

Nói cách khác:

- hook map picking đã được implement;
- nhưng luồng người dùng chính hiện tại là nhập địa điểm qua search UI.

---

## 9. Dữ liệu và lớp server-side

## 9.1. Nguồn dữ liệu segment

Project sử dụng hai file CSV local:

- [`segments.csv`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/public/data/segments.csv>)
- [`nodes.csv`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/public/data/nodes.csv>)

Header thực tế:

### `segments.csv`

```csv
_id,created_at,updated_at,s_node_id,e_node_id,length,street_id,max_velocity,street_level,street_name,street_type
```

### `nodes.csv`

```csv
_id,long,lat
```

Điều này cho thấy dữ liệu route segment đang lưu theo mô hình:

- segment lưu `start node id` và `end node id`;
- hình học segment được khôi phục bằng cách join với bảng node.

## 9.2. `trafficData.ts`

[`trafficData.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/trafficData.ts>) là lớp đọc và biến đổi dữ liệu CSV.

Nó làm:

1. đọc file CSV từ `public/data/`;
2. parse từng dòng bằng parser custom có hỗ trợ quoted CSV;
3. cache `nodes` và `segments` trong memory process;
4. lọc segment theo bounds;
5. join node geometry vào segment;
6. trả về `TrafficSegmentRecord`.

### Thiết kế đáng chú ý

- có cache process-level nên không đọc lại file mỗi request;
- xử lý bounds filter ở server, không ở client;
- geometry segment hiện được đại diện bởi 2 điểm đầu-cuối, chưa phải polyline chi tiết.

### Hệ quả

Giải pháp này đủ tốt cho PoC, nhưng nếu route analysis cần chính xác hơn thì về sau nên có:

- line geometry đầy đủ cho từng segment;
- spatial index chuyên dụng;
- storage chuyên cho geospatial thay vì CSV.

## 9.3. API `/api/segments-hcmc`

[`src/app/api/segments-hcmc/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/segments-hcmc/route.ts>) là endpoint thực tế đang được frontend dùng.

Chức năng:

- nhận `bounds`;
- optional `streetLevel`;
- optional `streetLevelMax`;
- optional `zoom`;
- trả về danh sách segment visible.

Logic chính:

1. load cache nodes và segments;
2. filter theo bounds;
3. filter tiếp theo road level nếu cần;
4. map sang object nhẹ cho frontend.

Endpoint này là nền tảng quan trọng nhất cho performance của app.

## 9.4. API `/api/segments`

[`src/app/api/segments/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/segments/route.ts>) là endpoint sinh dữ liệu sample ngẫu nhiên.

Đây là endpoint phụ, mang tính demo hoặc fallback nhiều hơn. Trang chính hiện không dựa vào endpoint này.

Khi viết technical docs hoặc demo, nên nhấn mạnh:

- endpoint production path hiện tại của app là `/api/segments-hcmc`;
- `/api/segments` chỉ là generator mô phỏng sample segments.

---

## 10. Routing subsystem

## 10.1. `graphhopper.ts`

[`graphhopper.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/graphhopper.ts>) là lớp tích hợp routing provider.

### Những gì nó làm

1. đọc `GRAPHHOPPER_API_KEY` từ environment;
2. build URL request với:
   - origin
   - destination
   - vehicle profile
   - `points_encoded=false`
   - `instructions=true/false`
3. gọi `GraphHopper API`;
4. chuẩn hóa response thành `RouteData`.

### Output chuẩn hóa

`RouteData` gồm:

- `provider`
- `profile`
- `distanceMeters`
- `durationSeconds`
- `geometry`
- `bbox`
- `steps`

### Ý nghĩa

Project không tự giải bài toán shortest path trên road graph nội bộ. Thay vào đó:

- ủy thác pathfinding cho `GraphHopper`;
- dùng app logic riêng để phân tích traffic dọc route sau khi route đã có.

Đây là một lựa chọn thực dụng và hợp lý cho PoC.

## 10.2. API `/api/route`

[`src/app/api/route/route.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/app/api/route/route.ts>) là điểm vào cho tính năng route.

Request body gồm:

- `origin`
- `destination`
- `profile`
- `departureOffsetMinutes`
- `targetHour`
- `targetWeekday`
- `includeSteps`
- `includePredictionAnalysis`

Sau validate input, endpoint:

1. gọi `getGraphHopperRoute`;
2. nếu cần, gọi `analyzeRoutePrediction`;
3. trả về route và predictionAnalysis.

Điểm quan trọng:

- routing thật và prediction analysis là hai bước tách biệt;
- app chưa “reroute vì tắc đường”, mà hiện tại mới “route trước, đánh giá rủi ro sau”.

---

## 11. Phân tích traffic dọc tuyến

## 11.1. Mục tiêu của `routePredictionAnalysis.ts`

[`routePredictionAnalysis.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/routePredictionAnalysis.ts>) là file kỹ thuật cốt lõi nhất của project sau routing.

Nó trả lời câu hỏi:

> Sau khi đã có route polyline, làm sao ước lượng mức độ tắc đường trên tuyến bằng dữ liệu segment hiện có?

## 11.2. Quy trình phân tích

Quy trình thực tế như sau:

1. Tính chiều dài route.
2. Mở rộng `bbox` của route bằng padding.
3. Lấy các traffic segment nằm gần route bằng `getTrafficSegmentsWithinBounds`.
4. Sample nhiều điểm dọc theo route theo khoảng cách đều.
5. Với mỗi sample point:
   - tìm segment gần nhất bằng grid-based lookup;
   - đo khoảng cách tới line segment;
   - giữ segment tốt nhất trong ngưỡng cho phép.
6. Với mỗi segment match:
   - chạy heuristic prediction để ra `LOS`;
   - tính `travelTimeFactor`;
   - suy ra `predictedDelaySeconds`.
7. Tổng hợp toàn bộ segment để ra:
   - `coverage`
   - `delaySeconds`
   - `congestionScore`
   - `riskLevel`
   - `congestedSegments`
   - `summary`

### Đây là điểm đáng giá nhất về mặt kỹ thuật

Mặc dù prediction chưa phải AI model thật, file này đã giải quyết một bài toán không trivial:

- biến route polyline thành tập sample points;
- match sample points với network segment local;
- chấm điểm mức độ rủi ro trên route;
- đưa kết quả về dạng có thể hiển thị được cho UX.

## 11.3. Spatial matching strategy

Logic spatial matching dùng một số kỹ thuật hợp lý cho PoC:

- padding bbox theo độ dài route;
- sample route theo khoảng đều;
- grid index để tránh so sánh mọi segment với mọi point;
- lưu segment theo start, end và midpoint cell;
- dùng distance-to-segment-line thay vì chỉ dùng midpoint distance.

Ý nghĩa:

- giảm chi phí tính toán so với brute force thuần;
- tăng xác suất match đúng segment nằm gần route;
- đủ nhanh để chạy trong API request.

## 11.4. Prediction logic của route analysis

Hàm `predictSegmentTraffic` hiện dựa trên:

- `hour`
- `weekday`
- `isWeekend`
- `isRushHour`
- `isNight`
- `street_level`
- noise xác định bởi `segment_id + hour + weekday`

Đây là **deterministic heuristic**, không phải random hoàn toàn. Cùng một segment ở cùng thời điểm sẽ cho output nhất quán.

Điều này là một quyết định tốt cho demo vì:

- dễ kiểm soát;
- không gây nhảy kết quả vô lý giữa các lần refresh;
- vẫn tạo được cảm giác “time-aware prediction”.

## 11.5. Coverage metric

`PredictionCoverage` là một phần rất đáng nhấn mạnh khi trình bày kỹ thuật.

Nó gồm:

- `matchedSegmentCount`
- `sampledPointCount`
- `coverageRatio`
- `level = low | partial | good`

Tại sao quan trọng:

- cho thấy hệ thống biết tự đánh giá độ tin cậy của chính mình;
- tránh việc luôn phát biểu quá mạnh về kết quả prediction;
- phù hợp với tinh thần “không nói quá”.

## 11.6. Risk scoring

`riskLevel` được suy ra từ:

- số lượng segment `E/F`;
- số lượng segment `D`;
- `avgTravelFactor`.

`congestionScore` được normalize từ weighted severity của các segment.

Nghĩa là app không chỉ nói “có tắc hay không”, mà có nhiều lớp thông tin:

- severity tổng quát;
- delay ước lượng;
- confidence qua coverage;
- các bottleneck cụ thể.

---

## 12. Gợi ý giờ xuất phát

## 12.1. `departureRecommendation.ts`

[`departureRecommendation.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/server/departureRecommendation.ts>) xây lớp logic “best time to leave”.

Nó:

1. nhận một `RouteData`;
2. chạy `analyzeRoutePrediction` cho nhiều `candidateOffsets`;
3. biến mỗi analysis thành một `DepartureRecommendationOption`;
4. chấm điểm từng option;
5. chọn phương án tốt nhất;
6. sinh `tradeOff` và `summary`.

## 12.2. Hàm chấm điểm

Điểm số mỗi phương án dựa trên:

- `predictedDurationSeconds`
- `congestionScore`
- penalty theo `riskLevel`
- penalty theo `coverageLevel`

Tức là thuật toán không tối ưu duy nhất cho ETA ngắn nhất. Nó đang cố cân bằng giữa:

- thời gian đi;
- rủi ro tắc đường;
- độ tin cậy của phép phân tích.

Đây là một lựa chọn sản phẩm hợp lý.

## 12.3. API `/api/route/recommend-departure`

Endpoint này:

1. validate input;
2. lấy route từ `GraphHopper`;
3. gọi `buildDepartureRecommendation`;
4. trả recommendation cho client.

Điểm cần nói rõ:

- recommendation hiện được tính trên cùng một route base;
- app chưa tính lại route khác nhau cho từng thời điểm;
- vì vậy đây là “departure-time advisory on a fixed route”, chưa phải “multi-route time-aware optimization”.

---

## 13. Kiểu dữ liệu quan trọng

[`src/lib/routing.ts`](</Users/Admin/Desktop/GIT CLONE/webdev-vong-2/traffic-map-poc/src/lib/routing.ts>) định nghĩa contract xuyên suốt frontend và backend.

Các kiểu dữ liệu quan trọng:

### `RouteData`

Đại diện cho tuyến đường đã chuẩn hóa:

- quãng đường
- thời gian
- polyline
- bbox
- steps

### `PredictionAnalysis`

Đại diện cho phân tích ùn tắc trên tuyến:

- `delaySeconds`
- `congestionScore`
- `riskLevel`
- `congestedSegments`
- `summary`
- `coverage`

### `DepartureRecommendation`

Đại diện cho kết quả tư vấn giờ đi:

- route gốc
- options cho nhiều offset
- offset được khuyến nghị
- summary

Điểm mạnh của phần type system:

- API contract rõ ràng;
- client và server dùng chung model dữ liệu;
- dễ mở rộng nếu sau này thay heuristic bằng model prediction thật.

---

## 14. Hiệu năng và các quyết định tối ưu

Project đã có một số tối ưu đáng kể so với một demo bản đồ sơ sài.

## 14.1. Viewport-based loading

Thay vì tải toàn bộ data lên client, app chỉ tải vùng đang xem.

Lợi ích:

- giảm payload;
- map mượt hơn;
- giảm số segment phải render cùng lúc.

## 14.2. Zoom-aware filtering

Ở zoom thấp, app chỉ tải đường cấp cao hơn.

Lợi ích:

- tránh clutter;
- giảm line density;
- bớt áp lực render.

## 14.3. In-memory CSV cache ở server

`nodes.csv` và `segments.csv` không bị đọc lại mỗi request sau lần load đầu.

Lợi ích:

- đơn giản;
- hiệu quả với demo/server process đơn;
- không cần database riêng.

## 14.4. Prediction cache ở client

Prediction được cache theo time selection trong 5 phút.

Lợi ích:

- tránh tính lại heuristic nhiều lần;
- phản hồi UI nhanh hơn.

## 14.5. Grid-based matching cho route analysis

Đây là tối ưu quan trọng nhất trong server analysis.

Nếu không có lớp grid, việc match route sample với nearby segments sẽ tăng chi phí rất nhanh ở route dài.

---

## 15. Độ chính xác và tính trung thực khi mô tả project

Phần này rất quan trọng nếu tài liệu dùng để nộp hoặc thuyết trình.

## 15.1. Những gì có thể khẳng định

Bạn có thể nói chắc:

- app đã chạy được bản đồ và traffic overlay;
- app có loading segment theo viewport;
- app có geocoding tìm kiếm;
- app có route bằng `GraphHopper`;
- app có phân tích rủi ro tắc đường dọc route;
- app có đề xuất thời điểm xuất phát trong các lựa chọn rời rạc;
- dữ liệu road segment được load từ CSV thật.

## 15.2. Những gì không nên nói quá

Không nên mô tả như sau nếu bám sát repo hiện tại:

- “hệ thống đang dùng AI model production để dự đoán kẹt xe theo thời gian thực”;
- “route được tối ưu trực tiếp bởi model traffic prediction”;
- “ứng dụng có chatbot hoặc LLM agent”;
- “đã có hệ thống smart routing city-scale hoàn chỉnh”;
- “đang sử dụng vector tile backend và geospatial stack production”.

Thay vào đó nên nói:

> Project hiện là một PoC web map có routing thật và lớp phân tích traffic heuristic trên dữ liệu segment thật, được thiết kế để có thể thay thế prediction engine bằng model AI trong giai đoạn sau.

---

## 16. Giới hạn hiện tại của project

Các giới hạn sau là suy ra trực tiếp từ code hiện có:

1. Prediction LOS chưa dựa trên model ML thật.
2. Không có online inference service riêng.
3. Không có real-time ingestion.
4. Bản đồ nền đang dùng OSM raster tiles, không phải stack tile chuyên biệt tự host.
5. Segment geometry đang ở mức line đơn giản đầu-cuối, chưa có polyline chi tiết cho từng đoạn.
6. Route recommendation hiện phân tích rủi ro trên route đã có, chưa reroute nhiều phương án để chọn tuyến né tắc tốt nhất.
7. Departure recommendation so sánh một tập offset hữu hạn `0/15/30/60`, chưa tối ưu liên tục theo mọi thời điểm.
8. Search đang phụ thuộc external `Photon API`.
9. Routing đang phụ thuộc external `GraphHopper API`.

Các giới hạn này không làm project mất giá trị. Chúng chỉ xác định đúng phạm vi của bản PoC hiện tại.

---

## 17. Điểm mạnh kỹ thuật của PoC

Nếu cần đánh giá công bằng, project có một số điểm mạnh thực sự:

1. Kiến trúc khá sạch, chia rõ `UI`, `hooks`, `server logic`, `API routes`.
2. Có type contracts rõ ràng giữa client và server.
3. Viewport loading được implement đúng hướng và có giá trị thực tế.
4. Route analysis không hời hợt, có sample-based spatial matching tương đối bài bản.
5. UX có chiều sâu hơn mức demo map thông thường:
   - search
   - route
   - route summary
   - congestion explanation
   - departure recommendation
6. Hệ thống có nền tảng tốt để thay heuristic bằng prediction engine tốt hơn về sau.

---

## 18. Hướng mở rộng hợp lý từ code hiện tại

Nếu phát triển tiếp mà vẫn dựa trên kiến trúc hiện có, thứ tự mở rộng hợp lý là:

1. Thay `simulateLOSBatch` và `predictSegmentTraffic` bằng model inference service thật.
2. Gắn `segment_id` với prediction store theo thời gian.
3. Bổ sung route-to-segment matching mạnh hơn bằng graph metadata hoặc map matching.
4. Cho phép so sánh nhiều route alternatives thay vì chỉ một route.
5. Thêm reranking route dựa trên predicted congestion cost.
6. Thay CSV local bằng geospatial database hoặc tile/query service.
7. Thêm observability cho API latency, coverage quality và route analysis quality.

Điểm cần nhấn mạnh:

- đây là hướng mở rộng tương thích với kiến trúc hiện tại;
- không phải thứ đã được implement trong repo này.

---

## 19. Kết luận

`traffic-map-poc` là một PoC web map có chất lượng kỹ thuật khá tốt ở phần:

- tải dữ liệu theo viewport;
- hiển thị traffic overlay;
- tìm kiếm địa điểm;
- routing thật qua `GraphHopper`;
- phân tích rủi ro giao thông dọc tuyến;
- gợi ý thời điểm xuất phát.

Phần quan trọng nhất cần trình bày đúng là:

- project **không phải** một hệ thống AI traffic prediction production hoàn chỉnh;
- project **đã có** một khung kỹ thuật rõ ràng để trực quan hóa traffic, phân tích route và hỗ trợ quyết định;
- lớp dự báo hiện tại là **heuristic simulation có cấu trúc**, không phải model ML serving.

Nếu mô tả đúng như vậy, technical docs sẽ trung thực, chắc tay và phù hợp với trạng thái thật của codebase.
