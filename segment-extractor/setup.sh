#!/bin/bash

# Setup script for Segment Extractor

echo "=================================="
echo "Segment Extractor - Setup"
echo "=================================="
echo ""

# Create virtual environment
echo "📦 Creating virtual environment..."
python -m venv venv
echo "✓ Virtual environment created"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Create output directory
echo "📁 Creating output directory..."
mkdir -p output
echo "✓ Output directory created"
echo ""

# Create config directory if not exists
mkdir -p config

echo "=================================="
echo "✅ Setup complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Download dataset from:"
echo "   https://data.veronlabs.com/d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025"
echo ""
echo "2. Extract train.csv and place it in:"
echo "   ../research-traffic-AI/data/train.csv"
echo ""
echo "3. Review config/config.yaml:"
echo "   - Adjust bounding box coordinates if needed"
echo "   - Set max_segments for PoC (recommend 100-500)"
echo ""
echo "4. Run extraction:"
echo "   python main.py"
echo ""
echo "5. Check results in output/ directory"
