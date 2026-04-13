# Project Overview - Research Traffic AI

## Project Summary

**Research Traffic AI** is a production-ready **XGBoost-based traffic prediction system** for Ho Chi Minh City, Vietnam. The system predicts Level of Service (LOS A-F) for road segments using comprehensive feature engineering and has been validated through proper segment-based splitting.

**Live Site:** https://github.com/bechovang/research-traffic-AI
**License:** MIT
**Status:** ✅ Production Ready

---

## Executive Summary

This research project implements a machine learning system to predict traffic Level of Service (LOS) for urban transportation management. The system achieves **97.78% accuracy** with **23 engineered features** and has been validated through proper segment-based splitting to prevent data leakage.

### Key Results

| Metric | Value |
|--------|-------|
| **Accuracy** | 97.78% |
| **Macro F1-score** | 96.62% |
| **Features** | 23 engineered features |
| **Training Time** | 0.62 seconds |
| **Inference Time** | <2ms per prediction |

### Research Contributions

1. **Feature Engineering > Model Choice**: Engineered features contribute +73% accuracy gain
2. **Rolling Features Critical**: +52.4% accuracy contribution (largest single gain)
3. **Historical Patterns Dominate**: `same_weekday_mean` is the #1 feature
4. **Proper Validation**: Segment-based splitting prevents data leakage
5. **XGBoost > Deep Learning**: Outperforms LSTM by +38% accuracy

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Language** | Python 3.11 |
| **ML Framework** | XGBoost 2.0.0 |
| **Data Processing** | pandas 2.0.3, numpy 1.24.3 |
| **Scientific** | scikit-learn 1.3.0, scipy 1.11.1 |
| **Visualization** | matplotlib 3.7.2, seaborn 0.12.2 |
| **Deep Learning** | TensorFlow 2.13.0 (for comparison) |
| **Notebooks** | Jupyter 1.0.0 |
| **API** | FastAPI 0.104.1 |
| **Testing** | pytest 7.4.2 |

---

## Architecture Type

**Pattern:** Data Science Pipeline with Feature Engineering

**Characteristics:**
- Batch processing for model training
- Segment-based data splitting
- Ablation study for feature importance
- Model comparison (XGBoost vs LSTM)
- IEEE paper publication

---

## Repository Structure

**Type:** Monolith (ML research project)

```
research-traffic-AI/
├── src/                      # Source code
│   ├── config.py             # Configuration
│   ├── preprocessing.py      # Data cleaning
│   ├── feature_engineering.py # Feature creation (23 features)
│   ├── model.py              # XGBoost classifier
│   ├── proper_validation.py  # Segment-based validation
│   ├── evaluate.py           # Metrics & visualization
│   ├── ablation_study.py     # Feature contribution analysis
│   └── generate_paper_figures.py # Paper figures
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

---

## Key Features

### Feature Engineering (23 Features)

**Temporal Features (8):**
- `hour`, `minute`, `weekday`, `month`, `day_of_month`
- `is_weekend`, `is_rush_hour`, `is_night`

**Spatial Features (4):**
- `street_type_encoded`, `street_level`
- `length`, `max_velocity_imputed`

**Lag Features (6):**
- `LOS_encoded_lag_1`, `LOS_encoded_lag_2`, `LOS_encoded_lag_3`
- `LOS_encoded_lag_48`, `LOS_encoded_lag_96`, `LOS_encoded_lag_336`

**Rolling Features (3):**
- `LOS_encoded_rolling_mean_3`
- `LOS_encoded_rolling_mode_6`
- `LOS_encoded_rolling_std_6`

**Historical Features (2):**
- `LOS_encoded_same_hour_mean`
- `LOS_encoded_same_weekday_mean` ← **Most Important Feature**

### Model Performance

| Model | Accuracy | Macro F1 | Train Time |
|-------|----------|----------|------------|
| **XGBoost** | **97.78%** | **96.62%** | 0.62s |
| Random Forest | 95.97% | 94.20% | 0.18s |
| Decision Tree | 96.77% | 94.97% | 0.03s |
| LSTM | 60.19% | 12.52% | 60s |

---

## Dataset

**Source:** Ho Chi Minh City Transportation Department
**Records:** 33,441 traffic observations
**Date Range:** 2020-07-03 to 2021-04-22
**Road Segments:** 10,027 unique segments
**Time Resolution:** 30-minute intervals

**LOS Distribution:**
| LOS | Count | Percentage |
|-----|-------|------------|
| A | 13,278 | 39.7% |
| B | 4,700 | 14.1% |
| C | 3,839 | 11.5% |
| D | 3,707 | 11.1% |
| E | 3,828 | 11.4% |
| F | 4,089 | 12.2% |

---

## Documentation Index

- [Technology Stack](./research-traffic-technology-stack.md)
- [Architecture](./research-traffic-architecture.md)
- [Source Tree Analysis](./research-traffic-source-tree-analysis.md)
- [Data Models](./research-traffic-data-models.md)
- [Development Guide](./research-traffic-development-guide.md)

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

## Publications

### IEEE Conference Paper

**Title:** "XGBoost-Based Traffic Level of Service Prediction for Urban Transportation Management"

**Venue:** FPTU HCM Student Research Competition 2025

**PDF:** Available in `Latex_Tutorial/` directory

---

## Related Projects

- **Dataset:** [HCM Traffic Data 2025](https://data.veronlabs.com/dataset/d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025)
- **XGBoost Paper:** Chen & Guestrin, "XGBoost: A Scalable Tree Boosting System"

---

## Per-Class F1 Scores

| LOS | A | B | C | D | E | F |
|-----|---|---|---|---|---|---|
| F1 | 0.998 | 0.965 | 0.961 | 0.972 | 0.980 | 0.976 |

All classes achieve F1 > 0.96, including minority classes (C, D, E).
