# Data Models - Research Traffic AI

## Overview

This document describes the data schema, feature engineering pipeline, and model outputs for the Traffic Prediction AI system.

---

## Input Data Schema

### Raw Traffic Data (`train.csv`)

| Column | Type | Nulls | Description | Example |
|--------|------|-------|-------------|---------|
| `_id` | int64 | 0 | Unique record identifier | 0, 1, 2, ... |
| `segment_id` | int64 | 0 | Road segment identifier | 26, 33, 67, ... |
| `date` | string | 0 | Observation date (YYYY-MM-DD) | "2021-04-16" |
| `weekday` | int64 | 0 | Day of week (0=Monday, 6=Sunday) | 4 |
| `period` | string | 0 | Time slot identifier | "period_9_30" |
| `LOS` | string | 0 | Level of Service (A-F) | "A", "B", ..., "F" |
| `length` | int64 | 0 | Segment length (meters) | 116 |
| `max_velocity` | float64 | 85.2% | Speed limit (km/h) | 40.0 |
| `street_level` | int64 | 0 | Road hierarchy level (1-4) | 2 |
| `street_id` | int64 | 0 | Street identifier | 32575820 |
| `street_name` | string | 0.003% | Street name | "Huỳnh Văn Nghệ" |
| `s_node_id` | int64 | 0 | Start node ID | 366428456 |
| `e_node_id` | int64 | 0 | End node ID | 366416066 |

**Dataset Statistics:**
- Total Records: 33,441
- Unique Segments: 10,027
- Date Range: 2020-07-03 to 2021-04-22
- Unique Dates: 122 days
- Time Resolution: 30-minute intervals

---

## Target Variable: Level of Service (LOS)

### LOS Classification

| LOS | Description | Traffic Condition | Speed Ratio |
|-----|-------------|-------------------|-------------|
| **A** | Free flow | Excellent - No delays | >85% |
| **B** | Reasonable free flow | Good - Minimal delays | 67-85% |
| **C** | Stable flow | Fair - Noticeable delays | 50-67% |
| **D** | Approach to unstable | Poor - Frequent stops | 40-50% |
| **E** | Unstable flow | Very poor - Severe delays | 33-40% |
| **F** | Forced flow | Extreme congestion - Gridlock | <33% |

### LOS Encoding

```python
LOS_ENCODING = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4,
    'F': 5
}

LOS_DECODING = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E',
    5: 'F'
}
```

### LOS Distribution

| LOS | Count | Percentage |
|-----|-------|------------|
| A | 13,278 | 39.7% |
| B | 4,700 | 14.1% |
| C | 3,839 | 11.5% |
| D | 3,707 | 11.1% |
| E | 3,828 | 11.4% |
| F | 4,089 | 12.2% |

---

## Feature Engineering Pipeline

### Temporal Features (8 features)

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| `hour` | int | 0-23 | Hour of day |
| `minute` | int | 0, 30 | Minute of hour |
| `weekday` | int | 0-6 | Day of week (0=Monday) |
| `month` | int | 1-12 | Month of year |
| `day_of_month` | int | 1-31 | Day of month |
| `is_weekend` | bool | 0/1 | Weekend flag |
| `is_rush_hour` | bool | 0/1 | Rush hour flag (7-9, 17-19) |
| `is_night` | bool | 0/1 | Night flag (22-6) |

**Rush Hours:** [7, 8, 9, 17, 18, 19]
**Night Hours:** [22, 23, 0, 1, 2, 3, 4, 5, 6]
**Weekend Days:** [0 (Sunday), 6 (Saturday)]

---

### Spatial Features (4 features)

| Feature | Type | Range | Description |
|---------|------|-------|-------------|
| `street_type_encoded` | int | 0-N | Encoded street type |
| `street_level` | int | 1-4 | Road hierarchy level |
| `length` | int | 0-1011 | Segment length (meters) |
| `max_velocity_imputed` | float | 10-120 | Speed limit (km/h), imputed |

**Imputation Strategy:**
- Missing `max_velocity` values (85.2% missing)
- Imputed with median by `street_level`
- Most common value: 60 km/h

---

### Lag Features (6 features)

| Feature | Lag | Description | Period |
|---------|-----|-------------|--------|
| `LOS_encoded_lag_1` | 1 | LOS 30 minutes ago | 30 min |
| `LOS_encoded_lag_2` | 2 | LOS 60 minutes ago | 1 hour |
| `LOS_encoded_lag_3` | 3 | LOS 90 minutes ago | 1.5 hours |
| `LOS_encoded_lag_48` | 48 | LOS 24 hours ago | 1 day |
| `LOS_encoded_lag_96` | 96 | LOS 48 hours ago | 2 days |
| `LOS_encoded_lag_336` | 336 | LOS 168 hours ago | 1 week |

**Implementation:**
```python
df[f'LOS_encoded_lag_{period}'] = (
    df.groupby('segment_id')['LOS_encoded'].shift(period)
)
```

---

### Rolling Features (3 features)

| Feature | Window | Statistic | Description |
|---------|--------|-----------|-------------|
| `LOS_encoded_rolling_mean_3` | 3 | Mean | Average LOS last 1.5 hours |
| `LOS_encoded_rolling_mode_6` | 6 | Mode | Most common LOS last 3 hours |
| `LOS_encoded_rolling_std_6` | 6 | Std Dev | LOS variability last 3 hours |

**Implementation:**
```python
# Mean rolling
df['LOS_encoded_rolling_mean_3'] = (
    df.groupby('segment_id')['LOS_encoded']
      .transform(lambda x: x.shift(1).rolling(3, min_periods=1).mean())
)

# Mode rolling (custom function)
df['LOS_encoded_rolling_mode_6'] = (
    df.groupby('segment_id')['LOS_encoded'].transform(rolling_mode)
)
```

---

### Historical Features (2 features)

| Feature | Description | Calculation |
|---------|-------------|-------------|
| `LOS_encoded_same_hour_mean` | Historical average LOS at same hour | Mean LOS for same segment, same hour (all days) |
| `LOS_encoded_same_weekday_mean` | Historical average LOS at same weekday/hour | Mean LOS for same segment, same weekday, same hour |

**Implementation:**
```python
# Same hour mean
same_hour_mean = (
    df.groupby(['segment_id', 'hour'])['LOS_encoded']
      .transform('mean')
      .shift(1)  # Exclude current observation
)

# Same weekday mean
same_weekday_mean = (
    df.groupby(['segment_id', 'weekday', 'hour'])['LOS_encoded']
      .transform('mean')
      .shift(1)  # Exclude current observation
)
```

---

## Feature Summary

### Complete Feature List (23 features)

| # | Feature | Type | Category |
|---|---------|------|----------|
| 1 | hour | Temporal | Basic |
| 2 | minute | Temporal | Basic |
| 3 | weekday | Temporal | Basic |
| 4 | month | Temporal | Basic |
| 5 | day_of_month | Temporal | Basic |
| 6 | is_weekend | Temporal | Derived |
| 7 | is_rush_hour | Temporal | Derived |
| 8 | is_night | Temporal | Derived |
| 9 | street_type_encoded | Spatial | Basic |
| 10 | street_level | Spatial | Basic |
| 11 | length | Spatial | Basic |
| 12 | max_velocity_imputed | Spatial | Imputed |
| 13 | LOS_encoded_lag_1 | Lag | Short-term |
| 14 | LOS_encoded_lag_2 | Lag | Short-term |
| 15 | LOS_encoded_lag_3 | Lag | Short-term |
| 16 | LOS_encoded_lag_48 | Lag | Long-term |
| 17 | LOS_encoded_lag_96 | Lag | Long-term |
| 18 | LOS_encoded_lag_336 | Lag | Long-term |
| 19 | LOS_encoded_rolling_mean_3 | Rolling | Short-term |
| 20 | LOS_encoded_rolling_mode_6 | Rolling | Medium-term |
| 21 | LOS_encoded_rolling_std_6 | Rolling | Medium-term |
| 22 | LOS_encoded_same_hour_mean | Historical | Long-term |
| 23 | LOS_encoded_same_weekday_mean | Historical | Long-term |

---

## Data Splitting Strategy

### Segment-Based Split

**Purpose:** Prevent data leakage from same road segment

**Method:** Split by `segment_id`, not by time

**Splits:**
| Set | Date Range | Segments | Records | Percentage |
|-----|------------|----------|---------|------------|
| Train | 2020-07-03 to 2021-03-31 | 7,019 | 23,408 | 70% |
| Val | 2021-04-01 to 2021-04-14 | 1,504 | 5,017 | 15% |
| Test | 2021-04-15 to 2021-04-22 | 1,504 | 5,016 | 15% |

**Implementation:**
```python
# Get unique segments
unique_segments = df['segment_id'].unique()

# Split segments (not records)
train_segments, temp_segments = train_test_split(
    unique_segments, test_size=0.3, random_state=42
)
val_segments, test_segments = train_test_split(
    temp_segments, test_size=0.5, random_state=42
)

# Filter data by segments
train_df = df[df['segment_id'].isin(train_segments)]
val_df = df[df['segment_id'].isin(val_segments)]
test_df = df[df['segment_id'].isin(test_segments)]
```

---

## Model Output Schema

### Prediction Output

**Format:** NumPy array or pandas Series

**Shape:** `(n_samples,)`

**Values:** Integers 0-5 (LOS encoded)

**Example:**
```python
predictions = model.predict(X_test)
# array([0, 1, 2, 0, 3, 5, ...])
```

### Prediction Probabilities

**Format:** NumPy array

**Shape:** `(n_samples, 6)`

**Values:** Float probabilities for each class

**Example:**
```python
probas = model.predict_proba(X_test)
# array([
#     [0.95, 0.03, 0.01, 0.00, 0.00, 0.01],  # Class A: 95%
#     [0.02, 0.92, 0.04, 0.01, 0.01, 0.00],  # Class B: 92%
#     ...
# ])
```

---

## Model Metadata Schema

### Saved Model Format

**Files:**
1. `model_v2_final.model` - XGBoost binary model
2. `model_v2_final.json` - Metadata file

**Metadata Structure:**
```json
{
  "model_name": "full_xgboost",
  "feature_names": [
    "hour", "minute", "weekday", ..., "LOS_encoded_same_weekday_mean"
  ],
  "params": {
    "n_estimators": 500,
    "max_depth": 6,
    "learning_rate": 0.05,
    ...
  },
  "training_history": {
    "best_iteration": 234,
    "best_score": 0.0234,
    "n_features": 23,
    "n_classes": 6,
    "training_samples": 23408,
    "validation_samples": 5017
  },
  "saved_at": "2026-04-09T15:30:00",
  "model_file": "full_xgboost_20260409_153000.model"
}
```

---

## Evaluation Output Schema

### Metrics Dictionary

```python
{
    'accuracy': 0.9778,
    'macro_f1': 0.9662,
    'per_class_f1': {
        'A': 0.998,
        'B': 0.965,
        'C': 0.961,
        'D': 0.972,
        'E': 0.980,
        'F': 0.976
    },
    'confusion_matrix': [
        [1325, 8, 2, 0, 0, 1],
        [12, 458, 15, 3, 1, 0],
        ...
    ],
    'classification_report': "...",
    'test_samples': 5016
}
```

---

## Data Quality Issues

### Missing Values

| Column | Missing | Missing % | Strategy |
|--------|---------|-----------|----------|
| `max_velocity` | 28,495 | 85.2% | Median imputation by street_level |
| `street_name` | 1 | 0.003% | Drop record |

### Duplicates
- **Found:** 0 duplicate records
- **Action:** None needed

### Outliers
- **Length values:** 0-1011 meters (valid range)
- **Max velocity:** 10-120 km/h (valid range)
- **Action:** Keep all values (domain-appropriate)

---

## Data Relationships

### Segment-Date Uniqueness
- Each `(segment_id, date, period)` combination is unique
- Enables time series analysis per segment
- Multiple segments per road/street

### Node Connectivity
- `s_node_id` and `e_node_id` define segment endpoints
- Can be used for spatial features (future work)
- Not currently used in feature engineering

### Temporal Ordering
- Data sorted by `date`, `hour`, `minute` for lag features
- Critical for proper lag/rolling feature calculation
