# Potential Defense Questions and Suggested Answers

## How to use this file

- These are likely questions lecturers may ask during the 20-minute defense.
- The answers are intentionally short and direct.
- You should adapt the wording naturally when speaking.

## 1. Problem Motivation

### Q1. Why did you choose Level of Service instead of predicting speed or flow directly?

Suggested answer:

"We chose LOS because it is more interpretable for transportation management. Decision makers can understand LOS categories more easily than raw speed or flow values, so the prediction is more directly useful in practice."

### Q2. Why is this problem important for Ho Chi Minh City?

Suggested answer:

"Ho Chi Minh City has high congestion pressure due to rapid urbanization and dense traffic. A reliable prediction model can help traffic management agencies respond earlier and allocate resources more effectively."

## 2. Data and Preprocessing

### Q3. What is the source of your dataset?

Suggested answer:

"The dataset contains real traffic observations from Ho Chi Minh City, covering 122 observation days between July 2020 and April 2021, with 30-minute resolution over more than ten thousand road segments."

### Q4. Why did your usable dataset decrease from 33,441 to 23,414 records?

Suggested answer:

"Because lag and historical features require previous observations. Records without sufficient prior history could not support those features, so we removed them to keep feature generation valid."

### Q5. Did you have missing values, and how did you handle them?

Suggested answer:

"Yes. The main missing field was maximum velocity. We imputed it using a grouped statistical strategy so the feature could still be used consistently during training."

### Q6. Is the dataset imbalanced?

Suggested answer:

"Yes, but only moderately. Class A is the largest class at around 39.7 percent, while the other classes are around 11 to 14 percent. The model still achieved strong per-class F1-scores across all classes."

## 3. Feature Engineering

### Q7. Why did you spend so much effort on feature engineering?

Suggested answer:

"Because this is tabular traffic data, and the predictive signal depends heavily on temporal context and traffic history. Our experiments showed that feature engineering was the main driver of performance improvement."

### Q8. Why were rolling features so important?

Suggested answer:

"Rolling features summarize short-term trends more robustly than a single lag value. Traffic state is highly dependent on the recent pattern, so rolling mean, mode, and standard deviation gave the model much stronger context."

### Q9. Which feature was the most important?

Suggested answer:

"The most important feature was `same_weekday_mean`, which suggests that traffic in Ho Chi Minh City follows repeating weekly patterns."

### Q10. Why did you include both lag and rolling features?

Suggested answer:

"Lag features capture specific previous states, while rolling features summarize the recent pattern over a window. They are complementary rather than redundant."

## 4. Model Choice

### Q11. Why did you choose XGBoost?

Suggested answer:

"XGBoost is strong on structured tabular data, efficient to train, and interpretable enough for feature-level analysis. It was a practical choice for this problem."

### Q12. Why not use LSTM or another deep learning model?

Suggested answer:

"Deep learning is powerful, but for this study we worked with engineered tabular features. In this setting, tree-based boosting was more suitable and more efficient, and our results confirmed that choice."

### Q13. Why not use more advanced models like Transformers or Graph Neural Networks?

Suggested answer:

"Those models may be useful, especially if we explicitly model spatial road-network relationships. However, our goal here was to establish a strong, interpretable, and efficient baseline using available tabular features."

## 5. Evaluation and Validity

### Q14. Why did you use segment-based split instead of random split?

Suggested answer:

"Because random splitting could put the same road segment into both training and testing, which would cause leakage. Segment-based split gives a more realistic estimate of generalization to unseen segments."

### Q15. What do you mean by data leakage in this context?

Suggested answer:

"It means the model could indirectly see information from the test environment during training. In our case, if the same road segment appears in both sets, the model may memorize segment-specific patterns rather than generalize."

### Q16. Why is your test set much smaller than the training set?

Suggested answer:

"Because the split was designed around available segment histories and valid lag-feature construction. The training set must remain large enough to learn stable temporal and historical patterns."

### Q17. Why did you use macro F1 in addition to accuracy?

Suggested answer:

"Accuracy alone can be misleading when class sizes are not equal. Macro F1 evaluates performance more fairly across all LOS classes, including smaller ones."

### Q18. Your accuracy is very high. How do you justify that it is realistic?

Suggested answer:

"We tried to make the evaluation more realistic through segment-based splitting and by analyzing per-class results and the confusion matrix. Also, the ablation study shows that the high performance comes from meaningful feature groups, not just model complexity."

### Q19. Could the historical features themselves introduce leakage?

Suggested answer:

"That is a valid concern. In our implementation, historical features are based on previous observations and are designed to exclude direct use of the current target value. The goal was to preserve temporal causality as much as possible."

## 6. Results Interpretation

### Q20. What is the most important result of this paper?

Suggested answer:

"The most important result is that a carefully engineered XGBoost pipeline can achieve 97.78 percent accuracy for LOS prediction, and that rolling features alone contribute the largest performance gain."

### Q21. Why did class D have the lowest F1-score?

Suggested answer:

"Class D is a middle traffic state, so it is naturally harder to distinguish from neighboring classes such as C and E. This is also reflected in the confusion matrix."

### Q22. Are mistakes between adjacent LOS classes acceptable?

Suggested answer:

"Yes, relatively speaking. Confusing adjacent classes is much less problematic than confusing very different traffic states, such as class A and class F."

### Q23. What does the feature importance chart tell us beyond accuracy?

Suggested answer:

"It shows that the model relies strongly on meaningful temporal and historical patterns, especially same-weekday averages and short-term traffic history. That gives the model more interpretability."

## 7. Limitations and Future Work

### Q24. What is the biggest limitation of your study?

Suggested answer:

"The biggest limitation is that the study is based on one city only and does not include external factors such as weather, events, or accidents."

### Q25. How would you improve this work in the future?

Suggested answer:

"We would extend the study with external features such as weather and incidents, validate on multiple cities, and possibly incorporate graph-based spatial modeling."

### Q26. Can this model be deployed in real life?

Suggested answer:

"Yes, at least as a practical decision-support component. The training time is low, inference is fast, and the output is interpretable. However, deployment would still require continuous data integration and monitoring."

### Q27. Would your model still work if traffic patterns change over time?

Suggested answer:

"Performance may decrease if traffic behavior changes significantly, so periodic retraining or online learning would be useful to handle concept drift."

## 8. Challenging Questions

### Q28. How do you know your model is learning real traffic behavior and not just memorizing patterns?

Suggested answer:

"We reduce that risk through segment-based splitting and by testing on unseen segments. Also, the importance of temporal and historical features is consistent with known traffic behavior, which supports the model's validity."

### Q29. Why should we trust this model if the dataset does not cover a full year?

Suggested answer:

"We should trust it within the scope of the observed period, but not assume full seasonal generalization. That is why we clearly state the limited temporal coverage as a limitation."

### Q30. What if another model gets slightly better accuracy later? Does your conclusion still hold?

Suggested answer:

"Yes, because our contribution is not only the final accuracy number. It also includes the feature-engineering framework, the ablation analysis, and the leakage-aware evaluation design."

## 9. Very Short Emergency Answers

If you need to answer quickly, use these short forms:

- Why XGBoost?
  - "Because it is strong on tabular data and efficient."
- Why rolling features?
  - "Because recent traffic trends are highly predictive."
- Why segment-based split?
  - "To reduce leakage and test real generalization."
- Main contribution?
  - "A high-performing, interpretable LOS prediction pipeline with ablation analysis."
- Biggest limitation?
  - "Single-city data without external factors."

## 10. Tips during defense

- Answer directly first, then explain.
- If you do not know, say the limitation clearly instead of guessing.
- Reuse these three anchor ideas often:
  - strong feature engineering
  - leakage-aware evaluation
  - practical deployment value
