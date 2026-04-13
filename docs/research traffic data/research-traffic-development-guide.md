# Development Guide - Research Traffic AI

## Prerequisites

### Required Software

| Tool | Version | Purpose |
|------|---------|---------|
| **Python** | 3.11 | Programming language |
| **pip** | Latest | Package manager |
| **Git** | Latest | Version control |

### Optional Tools

| Tool | Purpose |
|------|---------|
| Jupyter Notebook | Exploratory analysis |
| VS Code / PyCharm | IDE |
| pytest | Testing |

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/bechovang/research-traffic-AI.git
cd research-traffic-AI
```

### 2. Create Virtual Environment

```bash
# Create venv
python -m venv venv

# Activate (Linux/Mac)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- pandas, numpy, scipy (data processing)
- xgboost, scikit-learn (ML)
- matplotlib, seaborn (visualization)
- tensorflow (LSTM comparison)
- jupyter (notebooks)
- fastapi, uvicorn (API)
- pytest, black, flake8 (development)

---

## Project Structure

### Key Directories

```
research-traffic-AI/
├── src/                      # Source code
│   ├── config.py             # Configuration
│   ├── preprocessing.py      # Data cleaning
│   ├── feature_engineering.py # Feature creation
│   ├── model.py              # XGBoost classifier
│   ├── proper_validation.py  # Validation
│   ├── evaluate.py           # Metrics
│   └── ablation_study.py     # Feature analysis
├── data/                     # Data files
├── outputs/                  # Results
│   ├── models/               # Trained models
│   ├── figures/              # Plots
│   └── experiments/          # Experiment logs
├── notebooks/                # Jupyter notebooks
├── docs/                     # Documentation
└── requirements.txt          # Dependencies
```

---

## Development Commands

### Run Complete Pipeline

```bash
# Step 1: Preprocess data
python -m src.preprocessing

# Step 2: Feature engineering
python -m src.feature_engineering

# Step 3: Train model
python -m src.model

# Step 4: Validate
python -m src.proper_validation

# Step 5: Ablation study
python -m src.ablation_study
```

### Run Tests

```bash
pytest
pytest --cov=src tests/
```

### Format Code

```bash
# Format with Black
black src/

# Check linting
flake8 src/

# Type checking
mypy src/
```

---

## Configuration

### Edit Configuration

Edit `src/config.py` to modify:

**Data paths:**
```python
class Paths:
    DATA_DIR: Path = ...
    RAW_DATA: Path = ...
    MODELS_DIR: Path = ...
```

**Model parameters:**
```python
class ModelConfig:
    BASELINE_PARAMS: Dict[str, Any] = {
        'n_estimators': 500,
        'max_depth': 6,
        'learning_rate': 0.05,
        ...
    }
```

**Feature settings:**
```python
class FeatureConfig:
    LAG_PERIODS: List[int] = [1, 2, 3, 48, 96, 336]
    ROLLING_WINDOWS: Dict[str, int] = {...}
```

---

## Development Workflow

### 1. Explore Data

```bash
jupyter notebook
# Open notebooks/00_data_exploration.ipynb
```

### 2. Make Changes

Edit modules in `src/`:
- `config.py` - Settings
- `feature_engineering.py` - Features
- `model.py` - Model training

### 3. Test Changes

```bash
python -m src.model
```

### 4. Format & Lint

```bash
black src/
flake8 src/
```

### 5. Commit Changes

```bash
git add .
git commit -m "Description of changes"
```

---

## Common Development Tasks

### Add New Feature

1. Edit `src/feature_engineering.py`
2. Add feature function
3. Update `config.py` feature list
4. Re-run pipeline

**Example:**
```python
def create_custom_feature(df):
    """Create custom feature"""
    df['custom_feature'] = df['col1'] * df['col2']
    return df
```

### Modify Model Parameters

1. Edit `src/config.py`
2. Update `ModelConfig.BASELINE_PARAMS` or `FULL_PARAMS`
3. Re-run `python -m src.model`

### Add Evaluation Metric

1. Edit `src/evaluate.py`
2. Add metric function
3. Update `calculate_metrics()`

---

## Debugging

### Client-Side Debugging

- Use `print()` statements for logging
- Check outputs in `outputs/logs/`
- Use Jupyter notebooks for interactive debugging

### Common Issues

**Port already in use:**
```bash
# Kill process on port 8000
npx kill-port 8000
```

**Module not found:**
```bash
pip install -r requirements.txt
```

**Data file missing:**
```bash
# Ensure data/ directory exists
# Check data/train.csv exists
```

---

## Performance Optimization

### Training Performance

| Metric | Value |
|--------|-------|
| Training Time | 0.62 seconds |
| Inference Time | <2ms per prediction |
| Memory Usage | ~500MB |

### Optimization Tips

- Use Parquet format (faster I/O)
- Limit data size during development
- Use smaller `n_estimators` for testing
- Enable early stopping

---

## Testing Strategy

### Unit Tests

```python
# tests/test_feature_engineering.py
def test_create_lag_features():
    df = pd.DataFrame({...})
    result = create_lag_features(df)
    assert 'LOS_lag_1' in result.columns
```

### Model Validation

- Segment-based splitting prevents leakage
- Time series aware cross-validation
- Per-class F1 score evaluation

---

## CI/CD

### GitHub Actions (if configured)

- Runs tests on push
- Lints code with flake8
- Checks formatting with black

---

## Data Management

### Data Files

| File | Description |
|------|-------------|
| `data/train.csv` | Raw data (33,441 records) |
| `data/df_clean.parquet` | Cleaned data |
| `data/df_features.parquet` | Features |
| `data/train.parquet` | Train split |
| `data/val.parquet` | Val split |
| `data/test.parquet` | Test split |

### Regenerate Data

```bash
python -m src.preprocessing      # Clean data
python -m src.feature_engineering  # Create features + split
```

---

## Model Management

### Save Model

```python
from src.model import XGBTrafficClassifier

model = XGBTrafficClassifier()
model.fit(train_df, val_df, feature_cols)
model.save_model()  # Saves to outputs/models/
```

### Load Model

```python
model = XGBTrafficClassifier()
model.load_model('outputs/models/model_v2_final.json')
predictions = model.predict(X_test)
```

---

## Experiment Tracking

### Log Experiments

Results saved to `outputs/experiments/`

Format: `experiment_YYYYMMDD_HHMMSS.json`

### Compare Experiments

```bash
ls outputs/experiments/
# View experiment logs
```

---

## Visualization

### Generate Figures

```bash
python -m src.generate_paper_figures
```

Figures saved to `outputs/figures/`:
- Confusion matrices
- Feature importance plots
- Per-class F1 scores
- Ablation study results

---

## Deployment (Optional)

### FastAPI Server

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

**Endpoints:**
- `POST /predict` - Make prediction
- `GET /model_info` - Model metadata
- `GET /health` - Health check

### Docker Deployment

```dockerfile
FROM python:3.11
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Troubleshooting

### Import Errors

```bash
# Ensure you're in project root
cd research-traffic-AI

# Activate venv
source venv/bin/activate  # or venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Data Loading Errors

```python
# Check file exists
from pathlib import Path
assert Path('data/train.csv').exists()

# Check format
import pandas as pd
df = pd.read_csv('data/train.csv')
print(df.head())
```

### Model Training Errors

- Check data split exists
- Verify feature columns match
- Check for NaN values in features
- Ensure LOS_encoded column exists

---

## Best Practices

1. **Always use segment-based splitting** - Prevents data leakage
2. **Validate with proper CV** - Time series aware
3. **Track experiments** - Save model metadata
4. **Version control** - Commit model + config
5. **Document features** - Update DATA_SCHEMA.md

---

## Additional Resources

### Documentation
- [Data Schema](./DATA_SCHEMA.md)
- [Sprint Plan](./sprint-plan.md)
- [Sprint Tracker](./sprint-tracker.md)

### External Resources
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [Pandas Documentation](https://pandas.pydata.org/)
