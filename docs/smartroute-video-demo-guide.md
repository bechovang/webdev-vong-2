# SmartRoute - Kịch bản Video Demo

## Tổng quan
- **Thời lượng dự kiến**: 6-8 phút
- **Định dạng**: MP4, 1080p (hoặc cao hơn)
- **Yêu cầu**: Thể hiện rõ screen, demo đầy đủ flow từng chức năng

---

## Cấu trúc Video

### Phần 1: Intro (10-15 giây)
- **Screen**: Title page với logo SmartRoute
- **Content**:
  - Tên dự án: SmartRoute
  - Slogan: Nền tảng web hỗ trợ dự đoán tình trạng giao thông và gợi ý lộ trình tối ưu
  - Đội ngũ: Underrated - WebDev Adventure 2026

---

## Phần 2: Demo các chức năng chính (5-7 phút)

### Chức năng 1: Hiển thị bản đồ nền (20-30 giây)
**Kịch bản:**
1. Mở trang chủ http://localhost:3000
2. Show full screen map TP.HCM
3. Demo các thao tác:
   - Zoom in/zoom out
   - Pan (kéo) bản đồ sang các khu vực khác
   - Hiển thị controls trên bản đồ

**Ghi âm**: "Chức năng đầu tiên là hiển thị bản đồ nền. Bản đồ tự động fit về khu vực TP. Hồ Chí Minh khi tải trang. Người dùng có thể zoom, pan để xem các khu vực khác nhau."

---

### Chức năng 2: Viewport-based segment loading (20-30 giây)
**Kịch bản:**
1. Zoom out để thấy toàn thành phố
2. Zoom in vào một khu vực cụ thể (Quận 1, Bình Thạnh, etc.)
3. Show traffic segments chỉ xuất hiện trong viewport đang xem
4. Pan sang khu vực khác → segments mới load vào
5. Show loading spinner khi đang refresh viewport

**Ghi âm**: "SmartRoute sử dụng viewport-based loading để tối ưu hiệu năng. Chỉ các road segments trong vùng đang xem mới được tải, giúp giảm tải lượng dữ liệu cần xử lý."

---

### Chức năng 3: Traffic overlay với LOS (30-40 giây)
**Kịch bản:**
1. Zoom vào mức độ đủ cao để thấy rõ các segment màu sắc
2. Show legend LOS A-F bên phải:
   - LOS A: Xanh lá (thông thoáng)
   - LOS B: Xanh nhạt
   - LOS C: Vàng
   - LOS D: Cam
   - LOS E: Đỏ cam
   - LOS F: Đỏ đậm (kẹt cứng)
3. Demo các màu khác nhau trên bản đồ

**Ghi âm**: "Mỗi đoạn đường được tô màu theo mức độ ùn tắc LOS A-F, từ thông thoáng (A) đến kẹt cứng (F)."

---

### Chức năng 4: Popup chi tiết segment (20-30 giây)
**Kịch bản:**
1. Hover vào một segment để xem popup chi tiết
2. Show thông tin trong popup:
   - Tên đường
   - Mức LOS
   - Confidence (độ tin cậy)
   - Street level
   - Max velocity
   - Length

**Ghi âm**: "Hover vào bất kỳ segment nào để xem chi tiết: tên đường, mức độ ùn tắc, độ tin cậy của dự báo, cấp đường, tốc độ tối đa và chiều dài."

---

### Chức năng 5: Traffic stats panel (20-30 giây)
**Kịch bản:**
1. Show panel bên trái với thống kê:
   - Time label (hiện tại / +X phút)
   - Visible segments count
   - Congested count (LOS E+F)
   - Congested ratio %
   - Biểu đồ phân bổ LOS A-F theo %

**Ghi âm**: "Panel thống kê hiển thị số lượng segments đang visible, tỷ lệ kẹt xe và biểu đồ phân bổ các mức LOS trong viewport."

---

### Chức năng 6: Search địa điểm (30-40 giây)
**Kịch bản:**
1. Click vào search box trên top
2. Gõ "Landmark 81" hoặc "Ben Thanh Market"
3. Show autocomplete suggestions từ Photon API
4. Click vào một kết quả
5. Map tự động fly đến vị trí đó

**Ghi âm**: "Tìm kiếm địa điểm sử dụng Photon API với hỗ trợ tiếng Việt. Người dùng có thể nhập tên địa chỉ, địa danh, hoặc nhập tọa độ trực tiếp."

---

### Chức năng 7: Marker phân tích khu vực (30-40 giây)
**Kịch bản:**
1. Sau khi search địa điểm, show marker
2. Click vào marker để xem popup phân tích:
   - Tên địa điểm
   - Phân tích traffic xung quanh
   - Số segments congested nearby
   - LOS trung bình khu vực
3. Show button "Tìm đường đến đây"

**Ghi âm**: "Khi chọn một địa điểm, hệ thống phân tích tình trạng giao thông xung quanh khu vực đó, giúp người dùng có cái nhìn tổng quan trước khi bắt đầu hành trình."

---

### Chức năng 8: Routing giữa 2 điểm (40-60 giây)
**Kịch bản:**
1. Click vào "Tìm đường" trên search box
2. Nhập origin: "Landmark 81"
3. Nhập destination: "Ben Thanh Market"
4. Click "Tìm đường"
5. Show route được vẽ lên bản đồ (màu xanh)
6. Show route info panel xuất hiện bên trái

**Ghi âm**: "Chức năng routing sử dụng GraphHopper API. Người dùng chọn điểm đi và điểm đến, hệ thống sẽ tính toán và hiển thị tuyến đường tối ưu."

---

### Chức năng 9: Route summary panel (30-40 giây)
**Kịch bản:**
1. Show RouteSummaryPanel với:
   - Distance (ví dụ: 5.2 km)
   - ETA (ví dụ: 18 phút)
   - Steps: "Đi thẳng 200m", "Rẽ phải vào Đường X", etc.
   - Mở rộng xem chi tiết các steps

**Ghi âm**: "Panel thông tin lộ trình hiển thị đầy đủ các chỉ số: quãng đường, thời gian dự kiến, và các bước chỉ đường chi tiết turn-by-turn."

---

### Chức năng 10: Route traffic analysis (40-60 giây)
**Kịch bản:**
1. Show phần "Traffic Analysis" trong RouteSummaryPanel
2. Demo các chỉ số:
   - Delay (giây)
   - Congestion score
   - Risk level (Low/Medium/High)
   - Congested segments count
   - Coverage ratio
3. Show các đoạn đỏ (congested) trên route được highlight

**Ghi âm**: "SmartRoute không chỉ tính route mà còn phân tích mức độ ùn tắc dọc theo tuyến đường. Hệ thống hiển thị congestion score, risk level và đánh giá độ tin cậy của phân tích."

---

### Chức năng 11: Highlight đoạn kẹt xe (20-30 giây)
**Kịch bản:**
1. Zoom vào route để thấy rõ các segment màu
2. Show các đoạn LOS E-F được tô màu đậm hơn/trùng với màu route
3. Hover vào các đoạn congested để xem chi tiết

**Ghi âm**: "Các đoạn đường có mức độ kẹt xe nặng (LOS E-F) được highlight đặc biệt dọc theo tuyến, giúp người dùng nhận diện ngay các điểm rủi ro cao."

---

### Chức năng 12: Chọn thời điểm dự báo (40-60 giây)
**Kịch bản:**
1. Show TimePicker ở bottom center
2. Demo các preset: Hiện tại, +15, +30, +60
3. Chọn "+15 phút" → header chuyển sang màu tím (Prediction mode)
4. Chọn "+30 phút" → traffic overlay thay đổi màu
5. Click "⚙ Chọn giờ" → show custom time picker
6. Chọn giờ cụ thể (ví dụ 8:30)

**Ghi âm**: "Time picker cho phép chọn thời điểm dự báo: hiện tại hoặc 15/30/60 phút tới. Khi chọn thời điểm tương lai, hệ thống chuyển sang prediction mode và phân tích traffic cho thời điểm đó."

---

### Chức năng 13: Chọn ngày trong tuần (30-40 giây)
**Kịch bản:**
1. Trong TimePicker, show phần "Chọn thứ trong tuần"
2. Click "T2" (Thứ Hai)
3. Show label "Hôm nay, 8:30 (T2)"
4. Chọn "CN" (Chủ Nhật) → traffic overlay thay đổi (ít kẹt hơn)
5. Demo lại với "T6" (Thứ Sáu) → nhiều kẹt hơn

**Ghi âm**: "Một tính năng độc đáo là chọn ngày trong tuần để phân tích traffic. Người dùng có thể xem dự báo cho bất kỳ ngày nào trong tuần, giúp lập kế hoạch đi đúng ngày ít kẹt xe."

---

### Chức năng 14: Departure recommendation (40-60 giây)
**Kịch bản:**
1. Có sẵn route từ Landmark 81 → Ben Thanh
2. Show phần "Departure Recommendation" trong RouteSummaryPanel
3. Click vào để xem chi tiết:
   - So sánh now/+15/+30/+60
   - Recommendation: "Đi ngay" hoặc "Đợi 15 phút"
   - Trade-off explanation
4. Demo chọn thời điểm khác và xem kết quả thay đổi

**Ghi âm**: "Tính năng departure recommendation so sánh các thời điểm xuất phát để đề xuất lựa chọn tốt nhất, giúp người dùng tránh được các đoạn kẹt xe và tiết kiệm thời gian."

---

### Chức năng 15: Responsive UI (20-30 giây)
**Kịch bản:**
1. Thu nhỏ browser window về kích thước tablet/mobile
2. Show giao diện tự động điều chỉnh:
   - Search box thuởng
   - TimePicker thu nhỏ
   - Panels responsive

**Ghi âm**: "Giao diện SmartRoute được thiết kế responsive, hiển thị tốt trên desktop, tablet và mobile."

---

## Phần 3: Kết luận (10-15 giây)
- **Screen**: Tổng thể toàn bộ giao diện
- **Content**:
  - Tổng kết các chức năng chính
  - Link GitHub: https://github.com/phucnn-dhl/SmartRoute
  - Call to action: "Star repo on GitHub để ủng hộ dự án"

---

## Hướng dẫn quay video

### Công cụ khuyến nghị
- **OBS Studio** (miễn phí, chuyên nghiệp)
- **Loom** (dễ dùng, có cloud recording)
- **Microsoft PowerPoint** (Record Slide feature)

### Setup quay
1. **Resolution**: 1920x1080 (minimum), 2560x1440 (recommended)
2. **Frame rate**: 30 FPS
3. **Bitrate**: 4000-6000 Kbps
4. **Format**: MP4 (H.264 codec)

### Bước quay từng chức năng
1. Mở SmartRoute ở http://localhost:3000
2. Mở công cụ quay screen
3. Set region: quay toàn bộ cửa sổ browser
4. Bấm Record
5. Thực hiện flow theo kịch bản
6. Bấm Stop
7. Review footage
8. Quay lại nếu cần

### Tips quay tốt
- **Chuẩn bị trước**: Có sẵn các địa điểm mẫu để test
- **Nhịp độ vừa phải**: Không thao tác quá nhanh hoặc quá chậm
- **Mouse pointer**: Enable highlight để người xem dễ theo dõi
- **Consistent zoom**: Không zoom in/out liên tục gây chóng mặt
- **Pause giữa chức năng**: Dừng 1-2 giây giữa các functionality
- **Fullscreen mode**: Quay ở fullscreen để không bị distract

### Địa điểm mẫu khuyến nghị

**Origin:**
- Landmark 81 (Quận Bình Thạnh)
- ĐH Công Nghệ (Quận Thủ Đức)
- BX Miền Đông (Quận 12)
- Tan Son Nhat Airport

**Destination:**
- Ben Thanh Market (Quận 1)
- Dinh Độc Lập (Quận 1)
- Saigon Opera House (Quận 1)
- Bệnh viện Chợ Rẫy (Quận 5)

**Search keywords:**
- "Landmark 81"
- "Ben Thanh"
- "Tan Son Nhat"
- "Dinh Doc Lap"
- Coordinates: "10.7769, 106.7009"

---

## Timeline gợi ý

| Phần | Thời lượng | Nội dung |
|------|------------|----------|
| Intro | 10s | Title, logo, slogan |
| Func 1-5 (Map & Overlay) | 120s | Bản đồ, viewport, LOS, popup, stats panel |
| Func 6-7 (Search & Marker) | 60s | Search, marker phân tích |
| Func 8-11 (Routing) | 120s | Routing, summary, analysis, highlight |
| Func 12-14 (Time & Prediction) | 100s | Time picker, chọn ngày, departure recommendation |
| Func 15 (Responsive) | 20s | Responsive UI |
| Outro | 10s | Kết luận, GitHub link |
| **Tổng** | **~6-7 phút** | |

---

## Post-production (nếu có thể)

### Bắt buộc
- [ ] Thêm subtitle/text overlay cho tên chức năng
- [ ] Highlight mouse pointer
- [ ] Cắt các đoạn thừa, khoảng dừng

### Khuyến nghị
- [ ] Thêm background music (nhẹ, không chữ)
- [ ] Thêm voiceover/narration
- [ ] Thêm transition giữa các chức năng
- [ ] Color correction (nếu cần)

---

## Checklist trước khi nộp

- [ ] Video có độ phân giải tốt nhất (≥1080p)
- [ ] Âm thanh rõ (nếu có voiceover)
- [ ] Mọi chức năng đều được demo đầy đủ flow
- [ ] Video có thể xem được trên trình duyệt/web
- [ ] File size không quá lớn (<500MB nếu có thể)
- [ ] Định dạng tương thích (MP4)

---

## File naming convention

```
SmartRoute_Demo_[TeamName]_[Version].mp4
```

Ví dụ: `SmartRoute_Demo_Underrated_v1.mp4`
