# Architecture - Research Traffic AI

## Executive Summary

Research Traffic AI implements a **batch ML pipeline** for traffic Level of Service (LOS) prediction using XGBoost. The architecture follows a data science best practices approach with proper segment-based validation, comprehensive feature engineering, and rigorous model evaluation.

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Programming language |
| **XGBoost** | 2.0.0 | Primary classifier |
| **pandas** | 2.0.3 | Data manipulation |
| **scikit-learn** | 1.3.0 | ML utilities |

### Supporting Libraries
- **numpy** 1.24.3 - Numerical computing
- **scipy** 1.11.1 - Scientific functions
- **TensorFlow** 2.13.0 - LSTM comparison model
- **matplotlib** 3.7.2 - Visualization
- **FastAPI** 0.104.1 - REST API (optional)

---

## Architecture Pattern

**Batch Processing Pipeline with Feature Engineering**

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion                           │
│  Raw CSV (33,441 records) → pandas DataFrame               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Preprocessing Module                        │
│  (src/preprocessing.py)                                     │
│  - Data cleaning                                            │
│  - LOS encoding (A=0, B=1, ..., F=5)                        │
│  - Missing value imputation                                 │
│  - Temporal feature extraction                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Feature Engineering Module                      │
│  (src/feature_engineering.py)                               │
│  - Lag features (6)                                         │
│  - Rolling features (3)                                     │
│  - Historical aggregation (2)                              │
│  Total: 23 engineered features                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Splitting                            │
│  Segment-based time series split:                           │
│  - Train: 70% (2020-07-03 to 2021-03-31)                   │
│  - Val: 15% (2021-04-01 to 2021-04-14)                      │
│  - Test: 15% (2021-04-15 to 2021-04-22)                     │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Model Module                            │
│  (src/model.py)                                              │
│  - XGBTrafficClassifier class                               │
│  - Early stopping                                           │
│  - Class weighting                                         │
│  - Feature importance tracking                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Proper Validation Module                        │
│  (src/proper_validation.py)                                 │
│  - Segment-based K-fold CV                                  │
│  - Time series aware splitting                              │
│  - Leakage prevention                                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Evaluation Module                           │
│  (src/evaluate.py)                                           │
│  - Accuracy, F1-score                                       │
│  - Confusion matrix                                         │
│  - Per-class metrics                                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Ablation Study Module                         │
│  (src/ablation_study.py)                                    │
│  - Feature contribution analysis                            │
│  - Incremental feature addition                            │
│  - Model comparison (XGBoost vs LSTM)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Data Models

**Input Schema (Raw CSV):**
| Column | Type | Description |
|--------|------|-------------|
| `_id` | int | Record ID |
| `segment_id` | int | Road segment identifier |
| `date` | string | Observation date |
| `weekday` | int | Day of week (0-6) |
| `period` | string | Time slot (period_HH_MM) |
| `LOS` | string | Level of Service (A-F) |
| `length` | int | Segment length (meters) |
| `max_velocity` | float | Speed limit (km/h) |
| `street_level` | int | Road hierarchy |
| `s_node_id`, `e_node_id` | int | Start/end node IDs |

**Feature Schema (After Engineering):**
| Feature Group | Count | Features |
|---------------|-------|----------|
| Temporal | 8 | hour, minute, weekday, month, day_of_month, is_weekend, is_rush_hour, is_night |
| Spatial | 4 | street_type_encoded, street_level, length, max_velocity_imputed |
| Lag | 6 | LOS_encoded_lag_1,2,3,48,96,336 |
| Rolling | 3 | LOS_encoded_rolling_mean_3, mode_6, std_6 |
| Historical | 2 | LOS_encoded_same_hour_mean, same_weekday_mean |

**Target:**
- `LOS_encoded`: Integer (0-5) for LOS classes A-F

---

## Module Architecture

### Config Module (`src/config.py`)

**Purpose:** Centralized configuration management

**Classes:**
- `Paths`: All file path definitions
- `DataConfig`: Data processing parameters
- `FeatureConfig`: Feature engineering settings
- `ModelConfig`: XGBoost hyperparameters
- `TuningConfig`: Hyperparameter tuning settings
- `EvalConfig`: Evaluation metrics configuration

**Usage:**
```python
from src.config import get_config
config = get_config()
print(config.paths.RAW_DATA)
print(config.model.BASELINE_PARAMS)
```

### Preprocessing Module (`src/preprocessing.py`)

**Purpose:** Data cleaning and preparation

**Functions:**
- `load_raw_data()`: Load CSV data
- `clean_data()`: Remove duplicates, handle outliers
- `encode_los()`: Convert LOS to numeric (A=0, ..., F=5)
- `create_temporal_features()`: Extract time-based features
- `impute_missing_values()`: Handle missing max_velocity
- `split_data()`: Segment-based train/val/test split

### Feature Engineering Module (`src/feature_engineering.py`)

**Purpose:** Create 23 engineered features

**Functions:**
- `create_lag_features()`: Create 6 lag features
- `create_rolling_features()`: Create 3 rolling window features
- `create_historical_features()`: Create 2 historical aggregation features
- `build_full_feature_pipeline()`: Complete feature pipeline

### Model Module (`src/model.py`)

**Purpose:** XGBoost classifier implementation

**Class:** `XGBTrafficClassifier`

**Methods:**
- `__init__()`: Initialize model with parameters
- `get_feature_groups()`: Select feature subsets
- `fit()`: Train with early stopping
- `predict()`: Make predictions
- `predict_proba()`: Get class probabilities
- `evaluate()`: Calculate metrics
- `get_feature_importance()`: Extract feature importance
- `save_model()`: Save model + metadata
- `load_model()`: Load saved model

### Validation Module (`src/proper_validation.py`)

**Purpose:** Segment-based validation to prevent leakage

**Key Concept:** Split by segment_id, not by time
- Prevents data leakage from same road segment
- Maintains temporal ordering within segments

**Functions:**
- `segment_based_split()`: Split data by segment
- `time_series_cv()`: Time series cross-validation
- `evaluate_leakage()`: Check for data leakage

### Evaluation Module (`src/evaluate.py`)

**Purpose:** Metrics calculation and visualization

**Functions:**
- `calculate_metrics()`: Accuracy, F1, precision, recall
- `plot_confusion_matrix()`: Visualize confusion matrix
- `plot_feature_importance()`: Feature importance chart
- `plot_per_class_f1()`: Per-class F1 scores
- `generate_classification_report()`: Full report

### Ablation Study Module (`src/ablation_study.py`)

**Purpose:** Feature contribution analysis

**Experiments:**
- E1: Baseline (temporal + spatial) = 8 features
- E2: +Spatial features
- E3: +Lag features
- E4: +Rolling features (+52.4% gain)
- E5: +Historical features (final: 23 features)

---

## Source Tree Structure

```
research-traffic-AI/
├── src/                          # Source code
│   ├── __init__.py
│   ├── config.py                 # Configuration
│   ├── preprocessing.py          # Data cleaning
│   ├── feature_engineering.py    # Feature creation
│   ├── model.py                  # XGBoost classifier
│   ├── lstm_model.py             # LSTM (comparison)
│   ├── proper_validation.py      # Segment-based validation
│   ├── evaluate.py               # Metrics & visualization
│   ├── ablation_study.py         # Feature contribution
│   └── generate_paper_figures.py # Paper figures
├── notebooks/                    # Jupyter notebooks
│   └── 00_data_exploration.ipynb
├── data/                         # Data directory
│   ├── train.csv                 # Raw data
│   ├── df_clean.parquet          # Cleaned data
│   ├── df_features.parquet       # Features
│   ├── train.parquet             # Train split
│   ├── val.parquet               # Val split
│   └── test.parquet              # Test split
├── outputs/                      # Results
│   ├── models/                   # Saved models
│   ├── figures/                  # Visualizations
│   ├── experiments/              # Experiment results
│   └── logs/                    # Training logs
├── docs/                         # Documentation
│   ├── DATA_SCHEMA.md
│   ├── sprint-plan.md
│   └── sprint-tracker.md
├── Latex_Tutorial/               # IEEE paper
│   ├── 2025_FU_HCM_SRC_XGBoost_Traffic_Prediction.tex
│   ├── 2025_FU_HCM_SRC_XGBoost_Traffic_Prediction.pdf
│   └── Figures/
├── requirements.txt              # Dependencies
├── LICENSE                       # MIT License
└── README.md                     # Project documentation
```

---

## Training Workflow

### Standard Pipeline

```bash
# Step 1: Preprocessing
python -m src.preprocessing
# Output: df_clean.parquet

# Step 2: Feature Engineering
python -m src.feature_engineering
# Output: df_features.parquet, train/val/test splits

# Step 3: Train Model
python -m src.model
# Output: trained model, metrics

# Step 4: Evaluate
python -m src.proper_validation
# Output: validation results

# Step 5: Ablation Study
python -m src.ablation_study
# Output: feature contribution analysis
```

---

## Model Performance

### XGBoost vs Alternatives

| Model | Accuracy | Macro F1 | Train Time | Inference |
|-------|----------|----------|------------|-----------|
| **XGBoost** | **97.78%** | **96.62%** | 0.62s | <2ms |
| Random Forest | 95.97% | 94.20% | 0.18s | <5ms |
| Decision Tree | 96.77% | 94.97% | 0.03s | <1ms |
| LSTM | 60.19% | 12.52% | 60s | <5ms |

### Ablation Study Results

| Experiment | Features | Test Acc | Test F1 | Gain |
|------------|----------|----------|---------|------|
| E1: Baseline | 8 | 24.6% | 10.3% | -- |
| E2: +Spatial | 12 | 33.7% | 14.2% | +9.1% |
| E3: +Lag | 18 | 43.4% | 21.3% | +9.7% |
| E4: +Rolling | 21 | 95.8% | 94.9% | **+52.4%** |
| E5: +Historical | 23 | **97.8%** | **96.6%** | +2.0% |

---

## Feature Importance

### Top 10 Features

| Rank | Feature | Importance | Type |
|------|---------|-------------|------|
| 1 | `LOS_encoded_same_weekday_mean` | 0.234 | Historical |
| 2 | `LOS_encoded_same_hour_mean` | 0.187 | Historical |
| 3 | `LOS_encoded_lag_1` | 0.156 | Lag |
| 4 | `hour` | 0.098 | Temporal |
| 5 | `LOS_encoded_rolling_mode_6` | 0.087 | Rolling |
| 6 | `LOS_encoded_lag_48` | 0.065 | Lag |
| 7 | `weekday` | 0.054 | Temporal |
| 8 | `LOS_encoded_rolling_std_6` | 0.043 | Rolling |
| 9 | `is_rush_hour` | 0.038 | Temporal |
| 10 | `length` | 0.032 | Spatial |

---

## Deployment Architecture

### Optional API Deployment

**Framework:** FastAPI + Uvicorn

**Endpoints:**
- `POST /predict` - Single prediction
- `POST /predict_batch` - Batch prediction
- `GET /model_info` - Model metadata
- `GET /health` - Health check

**Configuration:**
```python
HOST: "0.0.0.0"
PORT: 8000
WORKERS: 4
MAX_BATCH_SIZE: 1000
```

---

## Technical Debt & Known Issues

### Current Limitations
- No GPU acceleration (not needed for XGBoost)
- LSTM model underperforms (needs architecture tuning)
- Limited to HCMC data (not generalizable yet)

### Future Improvements
- Migrate to PyTorch for better LSTM support
- Add spatial features ( neighboring segments)
- Implement online learning for model updates
- Add model monitoring in production

---

## Research Contributions

1. **Feature Engineering > Model Choice**
   - Engineered features contribute +73% accuracy gain
   - Proves feature importance over algorithm selection

2. **Rolling Features Critical**
   - +52.4% accuracy contribution (largest single gain)
   - Shows short-term patterns are most predictive

3. **Historical Patterns Dominate**
   - `same_weekday_mean` is #1 feature
   - Traffic follows strong weekly patterns

4. **Proper Validation**
   - Segment-based splitting prevents data leakage
   - Critical for time series spatial data

5. **XGBoost > Deep Learning**
   - Outperforms LSTM by +38% accuracy
   - Tabular data favors tree-based methods
