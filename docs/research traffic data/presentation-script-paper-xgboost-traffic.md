# Presentation Script for XGBoost Traffic Prediction Paper

## Purpose

This script is aligned with:

- `ref app/research-traffic-AI/Latex_Tutorial/Presentation_XGBoost_Traffic_Prediction.tex`

Presentation format:

- Presentation: 10 minutes
- Q\&A / defense: 20 minutes
- Language: English

The script below is written to match the current slide flow and keep the speaking time within about 9 to 10 minutes.

## Recommended timing

- Slide 1: 0:30
- Slide 2: 0:40
- Slide 3: 0:40
- Slide 4: 0:45
- Slide 5: 0:35
- Slide 6: 0:55
- Slide 7: 0:45
- Slide 8: 0:45
- Slide 9: 0:45
- Slide 10: 0:45
- Slide 11: 0:30
- Slide 12: 0:45
- Slide 13: 0:40
- Slide 14: 0:40
- Slide 15: 0:50
- Slide 16: 0:35
- Slide 17: 0:45
- Slide 18: 0:40
- Slide 19: 0:15

Total speaking time: about 9 minutes 50 seconds

## Slide 1. Title

"Good morning respected lecturers and fellow students. Today, our team will present our research titled `XGBoost-Based Traffic Level of Service Prediction for Urban Transportation Management`.

This work focuses on predicting urban traffic conditions in Ho Chi Minh City using machine learning, with Level of Service, or LOS, as the target variable."

## Slide 2. Outline

"Our presentation has four main parts. First, we introduce the problem and our motivation. Second, we describe the dataset and methodology. Third, we present the experimental results. Finally, we discuss the implications, limitations, and conclusion."

## Slide 3. Traffic Prediction Problem

"Ho Chi Minh City experiences serious traffic congestion because of rapid urbanization, increasing vehicle volume, and limited infrastructure capacity.

In practice, transportation agencies need not only raw speed or flow values, but also an interpretable traffic quality indicator that supports decision making.

For this reason, our study predicts Level of Service, or LOS, which ranges from A to F. LOS A means free-flow traffic, while LOS F represents severe congestion.

This makes the prediction directly useful for traffic monitoring, planning, and urban transportation management."

## Slide 4. Research Goals and Contributions

"This study has four main contributions.

First, we build an XGBoost-based classifier for LOS prediction using real traffic data from Ho Chi Minh City.

Second, we design 23 engineered features across five groups: temporal, spatial, lag, rolling, and historical features.

Third, we conduct a systematic ablation study to measure how much each feature group contributes.

Finally, our model achieves 97.78 percent accuracy and 96.62 percent macro F1-score, outperforming the evaluated baseline models."

## Slide 5. Dataset Overview

"Our dataset covers 122 observation days from July 2020 to April 2021.

It includes 10,026 unique road segments and 33,441 raw traffic observations at 30-minute intervals.

After preprocessing and removing incomplete lag-history samples, we obtained 23,414 usable records for modeling.

The target variable is LOS with six classes, from A to F, representing traffic conditions from free flow to forced flow congestion."

## Slide 6. LOS Distribution

"This figure shows the class distribution of LOS.

We can see that class A is the largest class, accounting for about 39.7 percent of the dataset, while the other classes are distributed between around 11 and 14 percent.

So the dataset is somewhat imbalanced, but not extremely imbalanced.

This also reflects a realistic traffic pattern, where normal traffic states occur more often than severe congestion."

## Slide 7. Data Preprocessing Pipeline

"This slide summarizes our preprocessing pipeline.

We first parse the time information to obtain features such as hour, minute, weekday, month, and day of month.

Then we encode LOS labels from A through F into numeric values from 0 to 5.

We also handle missing values in maximum velocity, create contextual flags such as weekend, rush hour, and night time, and finally sort the data by segment and time.

This step is important because lag and rolling features must be generated in the correct temporal order."

## Slide 8. Feature Engineering

"Feature engineering is one of the most important parts of this study.

We created 23 features in total.

Temporal features capture periodic traffic patterns, such as hour and weekday.

Spatial features describe road characteristics, such as street type, street level, segment length, and maximum velocity.

Lag features capture previous traffic states, for example 30 minutes ago, 1 hour ago, 24 hours ago, and 7 days ago.

Rolling features summarize short-term trends through rolling mean, rolling mode, and rolling standard deviation.

Finally, historical features capture repeating patterns, especially same-hour and same-weekday averages.

These features convert raw traffic records into a much richer tabular representation."

## Slide 9. Model and Evaluation Design

"We use XGBoost as a multi-class classifier for the six LOS categories.

We chose XGBoost because it is highly effective on tabular data, computationally efficient, and easier to interpret than many deep learning alternatives.

Our main hyperparameters include max depth equal to 8, learning rate equal to 0.05, 200 estimators, and early stopping with 20 rounds.

We evaluate performance using accuracy, macro F1-score, and per-class F1-score."

## Slide 10. Why Segment-Based Split Matters

"A key methodological point in our study is how we split the data.

Instead of random splitting by records, we split by road segments. This means that segments in the training set do not appear in the test set.

This is important because random splitting could cause data leakage. If the same segment appears in both training and testing, the model may look unrealistically strong.

By using segment-based splitting, we evaluate generalization on unseen segments, which is closer to real deployment conditions."

## Slide 11. Ablation Study Results

"This figure presents our ablation study.

We gradually add feature groups to understand their contribution to model performance.

Starting from the baseline setting, performance is still low. But when more informative feature groups are added, especially rolling and historical features, the model improves significantly.

This experiment helps us understand not only that the model works, but also why it works."

## Slide 12. Key Findings from Ablation Study

"Here are the main findings from the ablation study.

With temporal-only features, the model achieves only 24.6 percent accuracy.

Adding spatial and lag features improves the result gradually.

However, the largest improvement comes from rolling features, which increase accuracy by 52.4 percentage points.

After that, historical features provide the final improvement from 95.8 percent to 97.8 percent.

So the main message is clear: for this task, feature engineering is more important than simply choosing a stronger model."

## Slide 13. Model Comparison

"Next, we compare XGBoost with two evaluated baselines: Decision Tree and Random Forest.

Decision Tree reaches 0.968 accuracy and 0.950 macro F1.

Random Forest reaches 0.960 accuracy and 0.942 macro F1.

Our XGBoost model achieves the best result, with 0.978 accuracy and 0.966 macro F1.

Although XGBoost requires slightly more training time, 0.62 seconds is still very small in practice, so the model remains efficient and deployable."

## Slide 14. Feature Importance

"This feature importance chart provides another useful insight.

The most important features are historical and recent-state features, especially same-weekday mean, same-hour mean, and short-term lag features.

This suggests that traffic in Ho Chi Minh City follows recurring temporal patterns, and that the recent traffic state strongly affects the next state.

So the model is not only accurate, but also interpretable at the feature level."

## Slide 15. Per-Class Performance and Errors

"This slide shows the per-class F1-scores.

The model performs strongly across all six LOS categories.

Even the lowest F1-score, which is for class D, remains above 0.91.

This means the model does not only perform well on dominant classes, but also remains reliable across the full LOS spectrum.

Most mistakes happen between neighboring classes, which is understandable because adjacent LOS categories often represent similar traffic conditions."

## Slide 16. Confusion Matrix

"The confusion matrix confirms the same pattern.

Most errors occur between adjacent classes such as C and D, or D and E, while non-adjacent errors are rare.

This is practically acceptable, because confusing nearby traffic states is much less severe than confusing free flow with extreme congestion."

## Slide 17. Practical Implications and Limitations

"From a practical perspective, this model can support intelligent transportation systems, proactive congestion management, and decision support for urban planners.

The LOS output is also easy for decision makers to interpret.

However, the study still has some limitations.

First, it is based on one city only.

Second, the data does not cover a full year.

Third, we do not include external factors such as weather, public events, accidents, or roadworks.

These limitations define the next direction for future research."

## Slide 18. Conclusion

"In conclusion, we proposed an XGBoost-based model for traffic Level of Service prediction in Ho Chi Minh City.

Using 23 engineered features and a leakage-aware evaluation design, our model achieved 97.78 percent accuracy and 96.62 percent macro F1-score.

Our ablation study shows that rolling features are the most influential group, while historical features provide the final performance gain.

Overall, this work shows that for traffic tabular data, strong feature engineering can outperform more complex alternatives and still remain practical for deployment."

## Slide 19. Thank You

"Thank you very much for your attention. We welcome your questions and comments."

## Short opening if the team introduces members

"Before we begin, we are Team [Your Team Name], and today we are presenting our study on traffic LOS prediction using XGBoost."

## Short closing for transition to Q\&A

"That concludes our presentation. We are ready for your questions."

## Delivery notes

- Speak clearly and do not read the slide text word for word.
- Emphasize these numbers:
  - `97.78% accuracy`
  - `96.62% macro F1`
  - `+52.4 percentage points from rolling features`
- If time becomes short, shorten Slides 6, 14, and 16 first.
- If a lecturer interrupts with a question, answer briefly and then return to the current slide.
