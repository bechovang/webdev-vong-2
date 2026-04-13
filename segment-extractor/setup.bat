@echo off
REM Setup script for Segment Extractor (Windows)

echo ==================================
echo Segment Extractor - Setup
echo ==================================
echo.

REM Create virtual environment
echo [1/4] Creating virtual environment...
python -m venv venv
echo     Virtual environment created
echo.

REM Install dependencies
echo [2/4] Installing dependencies...
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
echo     Dependencies installed
echo.

REM Create output directory
echo [3/4] Creating output directory...
mkdir output
echo     Output directory created
echo.

REM Create config directory if not exists
if not exist config mkdir config

echo ==================================
echo Setup complete!
echo ==================================
echo.
echo Next steps:
echo 1. Download dataset from:
echo    https://data.veronlabs.com/d-li-u-tai-n-n-giao-thong-tp-hcm-nam-2025
echo.
echo 2. Extract train.csv and place it in:
echo    ..\research-traffic-AI\data\train.csv
echo.
echo 3. Review config\config.yaml:
echo    - Adjust bounding box coordinates if needed
echo    - Set max_segments for PoC (recommend 100-500)
echo.
echo 4. Run extraction:
echo    python main.py
echo.
echo 5. Check results in output\ directory
echo.

pause
