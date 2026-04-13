# Project Documentation Index - Research Traffic AI

## Project Overview

- **Type:** Monolith (Data Science / ML Research)
- **Primary Language:** Python 3.11
- **Architecture:** Batch Processing Pipeline with Feature Engineering
- **Status:** ✅ Production Ready

### Quick Reference

- **Tech Stack:** XGBoost 2.0.0 + pandas 2.0.3 + scikit-learn 1.3.0
- **Entry Point:** `src/model.py`
- **Architecture Pattern:** Feature engineering pipeline with segment-based validation
- **Package Manager:** pip (via requirements.txt)

---

## Generated Documentation

### Core Documentation
- [Project Overview](./research-traffic-project-overview.md)
- [Architecture](./research-traffic-architecture.md)
- [Technology Stack](./research-traffic-technology-stack.md)
- [Source Tree Analysis](./research-traffic-source-tree-analysis.md)

### Detailed Guides
- [Data Models](./research-traffic-data-models.md)
- [Development Guide](./research-traffic-development-guide.md)

---

## Existing Documentation

- [README](../ref app/research-traffic-AI/README.md) - Main project documentation
- [docs/DATA_SCHEMA.md](../ref app/research-traffic-AI/docs/DATA_SCHEMA.md) - Complete data schema
- [docs/sprint-plan.md](../ref app/research-traffic-AI/docs/sprint-plan.md) - Development roadmap
- [docs/sprint-tracker.md](../ref app/research-traffic-AI/docs/sprint-tracker.md) - Progress tracking
- [Latex_Tutorial/PAPER_SUMMARY.md](../ref app/research-traffic-AI/Latex_Tutorial/PAPER_SUMMARY.md) - IEEE paper guide
- [outputs/MODEL_COMPARISON.md](../ref app/research-traffic-AI/outputs/MODEL_COMPARISON.md) - XGBoost vs LSTM

---

## Getting Started

### Quick Start

```bash
# Clone repository
git clone https://github.com/bechovang/research-traffic-AI.git
cd research-traffic-AI

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run full pipeline
python -m src.preprocessing      # Data preprocessing
python -m src.feature_engineering  # Feature engineering
python -m src.model               # Train XGBoost model
python -m src.proper_validation   # Evaluate with proper validation
python -m src.ablation_study      # Feature contribution analysis
```

---

## Project Structure

```
research-traffic-AI/
├── src/                      # Source code (Python modules)
│   ├── config.py             # Configuration
│   ├── preprocessing.py      # Data cleaning
│   ├── feature_engineering.py # Feature creation (23 features)
│   ├── model.py              # XGBoost classifier
│   ├── proper_validation.py  # Segment-based validation
│   ├── evaluate.py           # Metrics & visualization
│   └── ablation_study.py     # Feature contribution analysis
├── notebooks/                # Jupyter notebooks
├── data/                     # Raw and processed data
├── outputs/                  # Results and artifacts
│   ├── models/               # Trained models
│   ├── figures/              # Visualizations
│   └── experiments/          # Experiment results
├── docs/                     # Documentation
├── Latex_Tutorial/           # IEEE paper
└── requirements.txt          # Dependencies
```

See [Source Tree Analysis](./research-traffic-source-tree-analysis.md) for complete structure.

---

## Key Technologies

### Machine Learning
- **XGBoost 2.0.0** - Primary classifier (97.78% accuracy)
- **scikit-learn 1.3.0** - ML utilities & metrics
- **TensorFlow 2.13.0** - LSTM model (for comparison)

### Data Processing
- **pandas 2.0.3** - Data manipulation
- **numpy 1.24.3** - Numerical computing
- **scipy 1.11.1** - Scientific functions

### Visualization
- **matplotlib 3.7.2** - Plotting
- **seaborn 0.12.2** - Statistical visualization

---

## Feature Engineering (23 Features)

### Temporal Features (8)
- `hour`, `minute`, `weekday`, `month`, `day_of_month`
- `is_weekend`, `is_rush_hour`, `is_night`

### Spatial Features (4)
- `street_type_encoded`, `street_level`
- `length`, `max_velocity_imputed`

### Lag Features (6)
- `LOS_encoded_lag_1`, `LOS_encoded_lag_2`, `LOS_encoded_lag_3`
- `LOS_encoded_lag_48`, `LOS_encoded_lag_96`, `LOS_encoded_lag_336`

### Rolling Features (3)
- `LOS_encoded_rolling_mean_3`
- `LOS_encoded_rolling_mode_6`
- `LOS_encoded_rolling_std_6`

### Historical Features (2)
- `LOS_encoded_same_hour_mean`
- `LOS_encoded_same_weekday_mean` ← **Most Important Feature**

---

## Model Performance

| Model | Accuracy | Macro F1 | Train Time |
|-------|----------|----------|------------|
| **XGBoost** | **97.78%** | **96.62%** | 0.62s |
| Random Forest | 95.97% | 94.20% | 0.18s |
| Decision Tree | 96.77% | 94.97% | 0.03s |
| LSTM | 60.19% | 12.52% | 60s |

---

## Ablation Study Results

| Experiment | Features | Test Acc | Gain |
|------------|----------|----------|------|
| E1: Baseline | 8 | 24.6% | -- |
| E2: +Spatial | 12 | 33.7% | +9.1% |
| E3: +Lag | 18 | 43.4% | +9.7% |
| E4: +Rolling | 21 | 95.8% | **+52.4%** |
| E5: +Historical | 23 | **97.8%** | +2.0% |

---

## Dataset

**Source:** Ho Chi Minh City Transportation Department

| Attribute | Value |
|-----------|-------|
| Total Records | 33,441 |
| Date Range | 2020-07-03 to 2021-04-22 |
| Road Segments | 10,027 unique segments |
| Time Resolution | 30-minute intervals |

**Target Variable:** Level of Service (LOS A-F)

---

## Development Workflow

1. **Preprocess data** → `python -m src.preprocessing`
2. **Feature engineering** → `python -m src.feature_engineering`
3. **Train model** → `python -m src.model`
4. **Validate** → `python -m src.proper_validation`
5. **Ablation study** → `python -m src.ablation_study`

See [Development Guide](./research-traffic-development-guide.md) for complete workflow.

---

## Key Findings

1. **Feature Engineering > Model Choice**
   - Engineered features contribute +73% accuracy gain

2. **Rolling Features Critical**
   - +52.4% accuracy contribution (largest single gain)

3. **Historical Patterns Dominate**
   - `same_weekday_mean` is the #1 feature

4. **Proper Validation**
   - Segment-based splitting prevents data leakage

5. **XGBoost > Deep Learning**
   - Outperforms LSTM by +38% accuracy

---

## Per-Class F1 Scores

| LOS | A | B | C | D | E | F |
|-----|---|---|---|---|---|---|
| F1 | 0.998 | 0.965 | 0.961 | 0.972 | 0.980 | 0.976 |

All classes achieve F1 > 0.96, including minority classes.

---

## Publications

### IEEE Conference Paper

**Title:** "XGBoost-Based Traffic Level of Service Prediction for Urban Transportation Management"

**Venue:** FPTU HCM Student Research Competition 2025

**PDF:** Available in `Latex_Tutorial/` directory

---

## Support

- **GitHub Repository:** https://github.com/bechovang/research-traffic-AI
- **Dataset:** [HCM Traffic Data 2025](https://data.veronlabs.com/dataset/d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025)
- **Email:** phuchcm2006@gmail.com

---

## License

MIT License
