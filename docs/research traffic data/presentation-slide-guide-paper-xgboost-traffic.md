# Hướng dẫn làm slide chi tiết cho paper XGBoost Traffic Prediction

## 1. Mục tiêu bộ slide

Bộ slide này dùng để thuyết trình paper:

`XGBoost-Based Traffic Level of Service Prediction for Urban Transportation Management`

Nguồn chính:
- `ref app/research-traffic-AI/Latex_Tutorial/2025_FU_HCM_SRC_XGBoost_Traffic_Prediction.tex`
- `ref app/research-traffic-AI/Latex_Tutorial/PAPER_SUMMARY.md`
- `docs/research traffic data/*.md`

Mục tiêu thuyết trình:
- Giải thích bài toán nghiên cứu rõ ràng
- Nêu được khoảng trống nghiên cứu và đóng góp của paper
- Trình bày dễ hiểu pipeline dữ liệu, feature engineering và mô hình
- Nhấn mạnh kết quả thực nghiệm và ý nghĩa ứng dụng thực tế

Khuyến nghị số lượng slide:
- 11 đến 13 slide nội dung
- 1 slide cảm ơn / Q&A
- Thời lượng phù hợp: 10 đến 15 phút

## 2. Cấu trúc slide đề xuất

## Slide 1. Title slide

Mục tiêu:
- Giới thiệu tên đề tài, tác giả, đơn vị, bối cảnh nghiên cứu

Nội dung nên có:
- Tên paper
- Tên nhóm / tác giả
- FPT University, Ho Chi Minh Campus
- Tên môn / hội nghị / seminar nếu cần

Lời nhấn:
- Đây là nghiên cứu dự đoán mức độ phục vụ giao thông (LOS) tại TP.HCM bằng XGBoost

Thiết kế:
- Nền đơn giản, chuyên nghiệp
- Có thể chèn logo trường ở góc nhỏ

## Slide 2. Bối cảnh và vấn đề

Mục tiêu:
- Làm rõ tại sao bài toán này quan trọng

Nội dung chính:
- TP.HCM có ùn tắc giao thông nghiêm trọng do đô thị hóa nhanh
- Cơ quan quản lý cần dự báo tình trạng giao thông để điều phối chủ động
- LOS là thước đo trực quan, dễ dùng cho quản lý giao thông

Nên trình bày dưới dạng:
- 3 bullet ngắn
- 1 câu chốt: cần một mô hình dự đoán LOS chính xác và đủ nhanh để triển khai thực tế

Điểm cần nói:
- Nhiều nghiên cứu dự báo speed hoặc flow, nhưng LOS classification trực tiếp hữu ích hơn cho quản lý

## Slide 3. Bài toán nghiên cứu và mục tiêu

Mục tiêu:
- Nêu câu hỏi nghiên cứu rõ ràng

Nội dung:
- Input: dữ liệu giao thông thực từ TP.HCM
- Output: dự đoán LOS từ A đến F cho từng road segment
- Câu hỏi nghiên cứu:
  - XGBoost có dự đoán LOS hiệu quả không?
  - Nhóm feature nào đóng góp nhiều nhất?

Nên thêm:
- 4 đóng góp chính của paper:
  - xây dựng mô hình XGBoost cho LOS prediction
  - thực hiện ablation study có hệ thống
  - chỉ ra rolling features đóng góp mạnh nhất
  - đạt hiệu năng cao hơn baseline

## Slide 4. Dataset và bài toán phân lớp LOS

Mục tiêu:
- Cho hội đồng thấy dữ liệu đủ thực tế và bài toán được định nghĩa rõ

Nội dung nên có:
- 122 ngày quan sát, từ 07/2020 đến 04/2021
- 10,026 road segments
- 33,441 quan sát thô
- 23,414 quan sát sau khi loại các bản ghi thiếu lag features
- Độ phân giải thời gian: 30 phút

Bảng nhỏ nên có:
- LOS A đến F
- Ý nghĩa ngắn:
  - A: free flow
  - F: forced flow / severe congestion

Có thể thêm:
- Phân bố LOS:
  - A: 39.7%
  - B: 14.1%
  - C: 11.5%
  - D: 11.1%
  - E: 11.4%
  - F: 12.2%

Hình nên dùng:
- `ref app/research-traffic-AI/Latex_Tutorial/Figures/fig3_los_distribution.png`

## Slide 5. Quy trình xử lý dữ liệu

Mục tiêu:
- Trình bày pipeline tiền xử lý ngắn gọn, không sa đà

Nội dung:
- Parse datetime: hour, minute, weekday, month, day_of_month
- Encode LOS: A=0 đến F=5
- Impute `max_velocity`
- Tạo các cờ `is_weekend`, `is_rush_hour`, `is_night`
- Sắp xếp dữ liệu theo segment và thời gian

Hình nên dùng:
- `ref app/research-traffic-AI/Latex_Tutorial/Figures/fig2_data_pipeline.png`

Mẹo trình bày:
- Dùng flowchart thay vì bullet dài

## Slide 6. Feature engineering

Mục tiêu:
- Đây là slide rất quan trọng vì paper nhấn mạnh feature engineering hơn model choice

Nội dung:
- 5 nhóm features:
  - Temporal: 8
  - Spatial: 4
  - Lag: 6
  - Rolling: 3
  - Historical: 2

Ví dụ nên nêu:
- Temporal: hour, weekday, rush hour
- Lag: LOS 30 phút trước, 1 giờ trước, 24 giờ trước
- Rolling: mean/mode/std trong vài khung thời gian gần nhất
- Historical: same hour mean, same weekday mean

Câu chốt trên slide:
- Tổng cộng 23 engineered features

Thiết kế:
- Dùng sơ đồ 5 khối hoặc bảng 3 cột: nhóm feature, số lượng, ví dụ

## Slide 7. Mô hình đề xuất: XGBoost

Mục tiêu:
- Giải thích vì sao chọn XGBoost

Nội dung:
- XGBoost là ensemble tree boosting mạnh trên dữ liệu dạng bảng
- Phù hợp khi dữ liệu có nhiều feature engineered
- Nhanh, hiệu quả, dễ triển khai hơn nhiều mô hình deep learning trong bối cảnh này

Thông tin nên có:
- Objective: multi-class classification
- 6 lớp LOS
- Một số hyperparameters:
  - max_depth = 8
  - learning_rate = 0.05
  - n_estimators = 200
  - early stopping = 20

Nếu cần công thức:
- Chỉ để 1 công thức objective tổng quát, không nên đưa quá nhiều công thức

## Slide 8. Thiết kế thực nghiệm và chống data leakage

Mục tiêu:
- Thuyết phục người nghe rằng đánh giá là nghiêm túc

Nội dung:
- Dùng segment-based split thay vì random split
- Train/validation/test theo road segments chưa từng thấy
- Tránh leakage do cùng một segment xuất hiện ở cả train và test

Số liệu theo paper:
- Training: 8,021 segments, 22,544 records
- Validation: 1,003 segments, 374 records
- Test: 1,002 segments, 496 records

Baselines:
- Decision Tree
- Random Forest

Điểm cần nhấn:
- Đây là điểm mạnh phương pháp luận của paper, không chỉ là chạy model cho ra accuracy cao

## Slide 9. Kết quả ablation study

Mục tiêu:
- Đây là slide trung tâm của bài thuyết trình

Nội dung nên có bảng rút gọn:
- E1 Baseline: 0.246 acc
- E2 +Spatial: 0.337 acc
- E3 +Lag: 0.434 acc
- E4 +Rolling: 0.958 acc
- E5 +Historical: 0.978 acc

Thông điệp bắt buộc phải nói:
- Rolling features tạo mức tăng lớn nhất: +52.4%
- Historical features mang lại phần cải thiện cuối cùng: +2.0%
- Chỉ dùng temporal features là không đủ

Hình nên dùng:
- `ref app/research-traffic-AI/Latex_Tutorial/Figures/fig4_ablation_study.png`

## Slide 10. So sánh mô hình

Mục tiêu:
- Cho thấy XGBoost không chỉ tốt tuyệt đối mà còn tốt tương đối

Nội dung:
- Decision Tree: accuracy 0.968, macro F1 0.950
- Random Forest: accuracy 0.960, macro F1 0.942
- XGBoost: accuracy 0.978, macro F1 0.966

Thông điệp:
- XGBoost đạt tốt nhất trên cả accuracy và macro F1
- Thời gian huấn luyện 0.62s vẫn đủ nhẹ cho ứng dụng thực tế

Thiết kế:
- Dùng bar chart hoặc bảng 3 dòng

## Slide 11. Phân tích sâu kết quả

Mục tiêu:
- Chứng minh mô hình không chỉ tốt ở chỉ số tổng thể

Nội dung:
- Per-class F1:
  - A: 0.989
  - B: 0.951
  - C: 0.979
  - D: 0.914
  - E: 0.968
  - F: 0.995
- Sai số chủ yếu nằm giữa các lớp lân cận như C-D, D-E, E-F
- Non-adjacent errors rất hiếm

Hình nên dùng:
- `ref app/research-traffic-AI/Latex_Tutorial/Figures/fig6_confusion_matrix.png`

Có thể thêm nếu còn chỗ:
- `ref app/research-traffic-AI/Latex_Tutorial/Figures/fig5_feature_importance.png`
- Nhấn `same_weekday_mean` là feature quan trọng nhất

## Slide 12. Ý nghĩa, hạn chế, hướng phát triển

Mục tiêu:
- Kết thúc theo phong cách học thuật, cân bằng giữa điểm mạnh và giới hạn

Nội dung nên chia 3 cột hoặc 3 khối:

Ý nghĩa:
- Có thể hỗ trợ ITS và urban traffic management
- Mô hình nhanh, khả thi để retrain định kỳ
- LOS dễ hiểu với nhà quản lý hơn dự báo speed thuần túy

Hạn chế:
- Chỉ nghiên cứu trên một thành phố
- Dữ liệu chưa bao phủ trọn năm
- Chưa đưa vào weather, events, incidents

Hướng phát triển:
- Tích hợp thời tiết và sự kiện
- Multi-city validation
- Online learning / concept drift
- Tích hợp vào hệ thống điều khiển giao thông

## Slide 13. Kết luận

Mục tiêu:
- Đóng lại bài thuyết trình bằng 3 đến 4 ý mạnh nhất

Nội dung:
- Đề xuất mô hình XGBoost dự đoán LOS cho TP.HCM
- Đạt 97.78% accuracy và 96.62% macro F1
- Rolling features là nhóm quan trọng nhất
- Feature engineering là yếu tố quyết định thành công

Câu kết nên nói:
- Với dữ liệu dạng bảng và bài toán LOS classification, một pipeline feature engineering tốt kết hợp XGBoost có thể hiệu quả hơn các lựa chọn phức tạp hơn

## Slide 14. Thank you / Q&A

Nội dung:
- Thank you
- Q&A

Có thể để thêm dòng:
- Contact email

## 3. Gợi ý thứ tự kể chuyện

Thứ tự kể chuyện nên đi như sau:

1. Thành phố có bài toán ùn tắc thật
2. LOS là biến đích có ý nghĩa quản trị
3. Chúng tôi có dữ liệu thật từ TP.HCM
4. Chúng tôi thiết kế feature engineering có hệ thống
5. Dùng XGBoost để học bài toán phân lớp 6 mức
6. Đánh giá chặt chẽ bằng segment-based split
7. Kết quả rất cao và hiểu được vì sao mô hình tốt
8. Giá trị thực tiễn rõ ràng nhưng vẫn còn giới hạn nghiên cứu

## 4. Quy tắc trình bày để slide trông học thuật hơn

Nên làm:
- Mỗi slide chỉ giữ 1 ý chính
- Ưu tiên hình, sơ đồ, bảng ngắn thay vì nhiều chữ
- Chỉ giữ các con số thật sự đáng nhớ
- Dùng cùng một hệ màu xuyên suốt
- Bôi đậm các số chính: `97.78%`, `96.62%`, `+52.4%`

Không nên làm:
- Chép nguyên văn abstract lên slide
- Đưa bảng quá nhiều dòng chữ
- Nhồi toàn bộ công thức vào phần methods
- Đọc lại đúng từng bullet trên slide

## 5. Bộ số liệu quan trọng cần thuộc khi thuyết trình

Bạn nên nhớ chính xác các số sau:

- 122 ngày quan sát
- 10,026 road segments
- 33,441 quan sát thô
- 23,414 quan sát sau xử lý cho mô hình
- 23 engineered features
- 6 lớp LOS: A-F
- XGBoost accuracy: 97.78%
- XGBoost macro F1: 96.62%
- Rolling features improvement: +52.4%
- Historical features improvement cuối: +2.0%
- XGBoost training time: 0.62s

## 6. Câu hỏi phản biện có thể gặp

### Câu hỏi 1
Vì sao chọn XGBoost thay vì LSTM hoặc Transformer?

Ý trả lời:
- Dữ liệu của bài toán là dữ liệu bảng sau feature engineering
- XGBoost thường mạnh trên tabular data
- Kết quả thực nghiệm cho thấy XGBoost vượt baseline rõ rệt
- Đồng thời chi phí huấn luyện thấp và dễ triển khai hơn

### Câu hỏi 2
Tại sao accuracy tăng mạnh khi thêm rolling features?

Ý trả lời:
- LOS phụ thuộc mạnh vào trạng thái giao thông rất gần hiện tại
- Rolling mean/mode/std giúp mô hình thấy xu hướng ngắn hạn ổn định hơn lag đơn lẻ
- Điều này đặc biệt hữu ích với bài toán giao thông đô thị có biến động theo cụm thời gian

### Câu hỏi 3
Làm sao đảm bảo không bị data leakage?

Ý trả lời:
- Paper dùng segment-based split
- Tập test gồm các road segment chưa xuất hiện trong train
- Nhờ đó đánh giá phản ánh khả năng tổng quát hóa tốt hơn

### Câu hỏi 4
Hạn chế lớn nhất của nghiên cứu là gì?

Ý trả lời:
- Dữ liệu chỉ từ một thành phố và chưa có yếu tố ngoại sinh như thời tiết, tai nạn, sự kiện
- Vì vậy mức độ tổng quát sang bối cảnh khác còn cần kiểm chứng thêm

## 7. Nếu muốn rút xuống 8 đến 9 slide

Có thể gộp như sau:
- Gộp Slide 2 và 3
- Gộp Slide 5 và 6
- Gộp Slide 10 và 11
- Gộp Slide 12 và 13

## 8. Nếu muốn làm theo Beamer

Khuyến nghị section:
- Introduction
- Methodology
- Experiments
- Discussion
- Conclusion

Khuyến nghị figures:
- Slide dataset: `fig3_los_distribution.png`
- Slide pipeline: `fig2_data_pipeline.png`
- Slide ablation: `fig4_ablation_study.png`
- Slide analysis: `fig6_confusion_matrix.png`
- Slide optional: `fig5_feature_importance.png`

## 9. Kết luận cho người làm slide

Nếu bạn chỉ có ít thời gian, hãy ưu tiên làm thật tốt 4 slide sau:
- Bài toán và đóng góp
- Feature engineering
- Ablation study
- Kết quả chính và ý nghĩa thực tiễn

Đây là 4 điểm tạo ra giá trị học thuật rõ nhất của paper.
