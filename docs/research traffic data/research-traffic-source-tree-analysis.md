# Source Tree Analysis - Research Traffic AI

## Project Root Structure

```
research-traffic-AI/
├── src/                          # Main source code
├── notebooks/                    # Jupyter notebooks
├── data/                         # Data directory
├── data traffic hcm/             # Additional data
├── outputs/                      # Results and artifacts
├── docs/                         # Documentation
├── Latex_Tutorial/               # IEEE paper
├── traffic_prediction/           # (duplicate/copy)
├── requirements.txt              # Dependencies
├── LICENSE                       # MIT License
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

---

## Critical Directories Explained

### `/src/` - Main Source Code

**Purpose:** Core ML pipeline modules

**Files:**
| File | Purpose | Lines |
|------|---------|-------|
| `config.py` | Configuration management | 370 |
| `preprocessing.py` | Data cleaning & preparation | 400 |
| `feature_engineering.py` | Create 23 engineered features | 600 |
| `model.py` | XGBoost classifier implementation | 622 |
| `lstm_model.py` | LSTM model (for comparison) | 500 |
| `proper_validation.py` | Segment-based validation | 480 |
| `evaluate.py` | Metrics & visualization | 450 |
| `ablation_study.py` | Feature contribution analysis | 400 |
| `generate_paper_figures.py` | Generate figures for paper | 500 |

---

### `/notebooks/` - Jupyter Notebooks

**Purpose:** Exploratory data analysis and experiments

**Files:**
- `00_data_exploration.ipynb` - Initial data exploration

**Usage:**
```bash
jupyter notebook
# Open in browser
```

---

### `/data/` - Data Directory

**Purpose:** Store raw and processed data

**Files:**
| File | Description |
|------|-------------|
| `train.csv` | Raw HCMC traffic data (33,441 records) |
| `df_clean.parquet` | Cleaned data |
| `df_features.parquet` | Data with 23 engineered features |
| `train.parquet` | Training split (70%) |
| `val.parquet` | Validation split (15%) |
| `test.parquet` | Test split (15%) |

---

### `/outputs/` - Results Directory

**Purpose:** Store trained models, figures, and experiment results

**Subdirectories:**
| Directory | Contents |
|-----------|----------|
| `models/` | Trained XGBoost models (.model, .json) |
| `figures/` | Visualization plots (PNG, PDF) |
| `experiments/` | Experiment results and logs |
| `logs/` | Training logs |

---

### `/docs/` - Documentation

**Purpose:** Project documentation

**Files:**
| File | Description |
|------|-------------|
| `DATA_SCHEMA.md` | Complete data schema documentation |
| `sprint-plan.md` | Development roadmap |
| `sprint-tracker.md` | Progress tracking |

---

### `/Latex_Tutorial/` - IEEE Paper

**Purpose:** Research paper for FPTU HCM SRC 2025

**Files:**
| File | Description |
|------|-------------|
| `2025_FU_HCM_SRC_XGBoost_Traffic_Prediction.tex` | LaTeX source |
| `2025_FU_HCM_SRC_XGBoost_Traffic_Prediction.pdf` | Compiled paper |
| `Figures/` | Paper figures |
| `references.bib` | Bibliography |

---

### `/data traffic hcm/` - Additional Data

**Purpose:** Additional HCMC traffic data

**Contents:**
- `data1/` - Additional data files
- `data2/` - Additional data files
- `readme.md` - Documentation

---

## Data Flow Architecture

```
Raw Data (data/train.csv)
    ↓
Preprocessing (src/preprocessing.py)
    - Clean data
    - Encode LOS
    - Handle missing values
    ↓
Feature Engineering (src/feature_engineering.py)
    - Create lag features (6)
    - Create rolling features (3)
    - Create historical features (2)
    ↓
Split Data
    - Train: data/train.parquet
    - Val: data/val.parquet
    - Test: data/test.parquet
    ↓
Model Training (src/model.py)
    - XGBoost classifier
    - Early stopping
    ↓
Save Model (outputs/models/)
    - model_v2_final.model
    - model_v2_final.json (metadata)
    ↓
Evaluation (src/evaluate.py)
    - Metrics, plots
    ↓
Save Figures (outputs/figures/)
```

---

## Entry Points

### Main Pipeline Entry

**File:** Various modules in `src/`

**Execution:**
```bash
python -m src.preprocessing      # Step 1
python -m src.feature_engineering  # Step 2
python -m src.model               # Step 3
python -m src.proper_validation   # Step 4
python -m src.ablation_study      # Step 5
```

### Configuration Entry

**File:** `src/config.py`

**Usage:**
```python
from src.config import get_config
config = get_config()
```

### Model Entry Point

**File:** `src/model.py`

**Main Function:** `main()`

**Usage:**
```bash
python -m src.model
```

---

## Development Workflow

**File Watching:** Not applicable (batch processing)

**Testing:**
```bash
pytest
```

**Linting:**
```bash
black src/
flake8 src/
mypy src/
```

---

## Static Export Support

**Not applicable** - This is a batch ML pipeline, not a web application.

---

## Integration Points

### Data Integration
- **Source:** HCMC Transportation Department
- **Format:** CSV files
- **Loading:** pandas `read_csv()`

### Model Integration
- **Primary:** XGBoost (gradient boosting)
- **Comparison:** TensorFlow (LSTM)
- **Serialization:** Pickle + JSON

### Output Integration
- **Models:** Saved to `outputs/models/`
- **Figures:** Saved to `outputs/figures/`
- **Paper:** Compiled in `Latex_Tutorial/`

---

## Critical Files for Development

| File | Purpose | Edit Frequency |
|------|---------|----------------|
| `src/config.py` | Configuration | Low |
| `src/feature_engineering.py` | Feature creation | Medium |
| `src/model.py` | Model training | Low |
| `src/ablation_study.py` | Experiments | Medium |
| `requirements.txt` | Dependencies | Low |

---

## File Naming Conventions

- **Modules:** `snake_case.py` (e.g., `feature_engineering.py`)
- **Classes:** `PascalCase` (e.g., `XGBTrafficClassifier`)
- **Functions:** `snake_case` (e.g., `create_lag_features`)
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `LOS_CLASSES`)

---

## Code Organization Principles

1. **Module-based:** Each major step has its own module
2. **Configuration centralization:** All settings in `config.py`
3. **Data paths:** Centralized in `Paths` class
4. **Co-location:** Tests alongside source (planned)
5. **Clear entry points:** Each module can be run independently

---

## Duplicate Directory

**`traffic_prediction/`** appears to be a duplicate or copy of the main project. This directory contains:
- Same structure as root
- Same `src/` files
- Same `docs/` files

**Recommendation:** Remove or consolidate to avoid confusion.
