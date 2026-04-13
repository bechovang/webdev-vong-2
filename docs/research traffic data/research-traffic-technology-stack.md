# Technology Stack - Research Traffic AI

## Overview

Research Traffic AI uses a **Python-based machine learning stack** optimized for tabular data classification with XGBoost as the primary algorithm.

## Core Technologies

### Python Environment
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Programming language |
| **pip** | Latest | Package management |

### Data Processing
| Technology | Version | Purpose |
|------------|---------|---------|
| **pandas** | 2.0.3 | Data manipulation & analysis |
| **numpy** | 1.24.3 | Numerical computing |
| **scipy** | 1.11.1 | Scientific computing |
| **pyarrow** | 12.0.1 | Parquet file support |

### Machine Learning
| Technology | Version | Purpose |
|------------|---------|---------|
| **XGBoost** | 2.0.0 | Primary classifier (gradient boosting) |
| **scikit-learn** | 1.3.0 | ML utilities, metrics, preprocessing |
| **TensorFlow** | 2.13.0 | LSTM model (for comparison) |

### Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| **matplotlib** | 3.7.2 | Plotting & figures |
| **seaborn** | 0.12.2 | Statistical visualization |
| **plotly** | 5.17.0 | Interactive plots |
| **folium** | 0.14.0 | Map visualization |

### Model Interpretation
| Technology | Version | Purpose |
|------------|---------|---------|
| **SHAP** | 0.42.1 | Feature importance & explainability |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| **Jupyter** | 1.0.0 | Notebook environment |
| **ipykernel** | 6.25.0 | Jupyter kernel |
| **pytest** | 7.4.2 | Testing framework |
| **pytest-cov** | 4.1.0 | Coverage reporting |

### Code Quality
| Technology | Version | Purpose |
|------------|---------|---------|
| **black** | 23.9.1 | Code formatting |
| **flake8** | 6.1.0 | Linting |
| **mypy** | 1.5.1 | Type checking |

### API & Deployment
| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | REST API framework |
| **uvicorn** | 0.24.0 | ASGI server |
| **pydantic** | 2.5.0 | Data validation |
| **pydantic-settings** | 2.1.0 | Settings management |

### Experiment Tracking
| Technology | Version | Purpose |
|------------|---------|---------|
| **Optuna** | 3.4.0 | Hyperparameter tuning |

### Monitoring
| Technology | Version | Purpose |
|------------|---------|---------|
| **prometheus-client** | 0.19.0 | Metrics export |

---

## Architecture Pattern

**Batch Processing Pipeline** with Feature Engineering

```
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion                           │
│  Raw CSV → pandas DataFrame → Data Cleaning                 │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Feature Engineering                         │
│  Temporal (8) → Spatial (4) → Lag (6) → Rolling (3)        │
│  → Historical (2) = 23 Total Features                       │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Splitting                            │
│  Segment-based: Train (70%) / Val (15%) / Test (15%)        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     Model Training                          │
│  XGBoost Classifier with Early Stopping                     │
│  - 500 estimators, max_depth=6, lr=0.05                    │
│  - Early stopping: 50 rounds                               │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Evaluation & Analysis                      │
│  Accuracy, F1-score, Confusion Matrix, Feature Importance   │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Dependencies

### XGBoost Configuration

**Baseline Parameters:**
```python
{
    'n_estimators': 500,
    'max_depth': 6,
    'learning_rate': 0.05,
    'subsample': 0.8,
    'colsample_bytree': 0.8,
    'min_child_weight': 1,
    'gamma': 0,
    'reg_alpha': 0,
    'reg_lambda': 1,
    'random_state': 42,
    'eval_metric': 'mlogloss'
}
```

### Training Parameters
- **Early Stopping Rounds:** 50
- **Verbose:** 100
- **Class Weighting:** Auto-calculated
- **Cross-Validation:** Time series split (5 folds)

---

## File Formats

| Format | Usage | Library |
|--------|-------|---------|
| **CSV** | Raw data input | pandas |
| **Parquet** | Processed data storage | pyarrow |
| **Pickle** | Model serialization | pickle |
| **JSON** | Model metadata | json |

---

## Development Requirements

### Python Version
- **Required:** Python 3.11
- **Recommended:** Python 3.11+

### Platform Support
- **Linux:** Full support (recommended for production)
- **Windows:** Full support
- **macOS:** Full support

### Hardware Requirements
- **RAM:** 4GB+ minimum (8GB+ recommended for full dataset)
- **CPU:** Any modern multi-core processor
- **GPU:** Not required (XGBoost is CPU-optimized)
- **Storage:** 500MB+ for project files

---

## Build Configuration

### No Build Step Required

This is a pure Python project with no compilation step. Dependencies are installed via pip.

### Package Management

**Primary:** pip (via requirements.txt)
**Virtual Environment:** venv (recommended)

---

## Data Pipeline Architecture

### Data Flow

```
Raw Data (CSV)
    ↓
Preprocessing (src/preprocessing.py)
    - Clean data
    - Encode LOS
    - Handle missing values
    ↓
Feature Engineering (src/feature_engineering.py)
    - Create lag features
    - Create rolling features
    - Create historical features
    ↓
Split Data (segment-based)
    - Train: 2020-07-03 to 2021-03-31
    - Val: 2021-04-01 to 2021-04-14
    - Test: 2021-04-15 to 2021-04-22
    ↓
Model Training (src/model.py)
    - XGBoost classifier
    - Early stopping
    - Class weighting
    ↓
Evaluation (src/evaluate.py)
    - Metrics calculation
    - Confusion matrix
    - Feature importance
    ↓
Ablation Study (src/ablation_study.py)
    - Feature contribution analysis
    - Model comparison
```

---

## Performance Considerations

### Training Performance
| Metric | Value |
|--------|-------|
| Training Time | 0.62 seconds |
| Inference Time | <2ms per prediction |
| Memory Usage | ~500MB (training) |
| Model Size | ~2MB (saved model) |

### Optimization Techniques
- Early stopping to prevent overfitting
- Segment-based splitting for proper validation
- Feature selection based on importance
- Class weight balancing

---

## Testing Strategy

### Unit Tests
- pytest framework
- Test coverage reporting with pytest-cov
- Tests in `__tests__/` directories

### Model Validation
- Segment-based time series split
- Proper train/val/test separation
- Per-class F1 score evaluation
- Ablation study for feature importance

---

## API Configuration

### FastAPI Settings
```python
HOST: "0.0.0.0"
PORT: 8000
WORKERS: 4
MAX_BATCH_SIZE: 1000
RATE_LIMIT: 100 requests/minute
```

### Model Paths
- **Model:** `outputs/models/model_v2_final.json`
- **Preprocessor:** `outputs/models/preprocessor.pkl`

---

## Environment Variables

Create `.env` file in project root:

```bash
# Model Configuration
MODEL_PATH=outputs/models/model_v2_final.json
PREPROCESSOR_PATH=outputs/models/preprocessor.pkl

# API Configuration
HOST=0.0.0.0
PORT=8000
WORKERS=4

# Logging
LOG_LEVEL=INFO
LOG_FILE=training.log
```

---

## Package Scripts

No package.json equivalent. Run modules directly:

```bash
python -m src.preprocessing
python -m src.feature_engineering
python -m src.model
python -m src.proper_validation
python -m src.ablation_study
```
