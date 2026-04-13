"""
Segment Extractor for SmartRoute (SUPER OPTIMIZED)

Extracts road segments within bounding box from HCMC traffic dataset.
NO Overpass API needed - dataset has coordinates!

Usage:
    python main.py

Author: SmartRoute Team
Date: 2026-04-13
"""

import os
import sys
import json
import yaml
import pandas as pd
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Load configuration
with open("config/bbox_config.yaml", "r") as f:
    CONFIG = yaml.safe_load(f)

# Paths
RESEARCH_DATA_PATH = Path(CONFIG["data"]["research_data_path"])
OUTPUT_DIR = Path(CONFIG["data"]["output_dir"])
OUTPUT_DIR.mkdir(exist_ok=True)

# Bounding box
BBOX = CONFIG["bounding_box"]


def validate_environment():
    """Check if required files exist."""
    if not RESEARCH_DATA_PATH.exists():
        print(f"❌ Error: Research data not found at {RESEARCH_DATA_PATH}")
        print("\nPlease download the dataset from:")
        print("https://data.veronlabs.com/d-li-u-tai-n-giao-thong-tp-hcm-nam-2025")
        print("\nAnd extract train.csv to:")
        print(f"  {RESEARCH_DATA_PATH}")
        return False
    return True


def load_research_data():
    """Load research traffic data."""
    print("\n🔍 Loading research data...")
    df = pd.read_csv(RESEARCH_DATA_PATH)
    print(f"   ✓ Loaded {len(df):,} records")
    print(f"   ✓ Unique segments: {df['segment_id'].nunique():,}")
    print(f"   ✓ Date range: {df['date'].min()} to {df['date'].max()}")

    # Check coordinate columns
    coord_cols = ['long_snode', 'lat_snode', 'long_enode', 'lat_enode']
    missing = [col for col in coord_cols if col not in df.columns]
    if missing:
        print(f"   ✗ Missing coordinate columns: {missing}")
        return None

    print(f"   ✓ Coordinate columns found")

    return df


def filter_by_bbox(df):
    """
    Filter segments within bounding box using coordinates from dataset.
    NO Overpass API needed!
    """
    print(f"\n📍 Filtering by bounding box: {BBOX['name']}")
    print(f"   North: {BBOX['north']}, South: {BBOX['south']}")
    print(f"   West: {BBOX['west']}, East: {BBOX['east']}")

    # Filter segments where EITHER start OR end node is in bbox
    df_in_bbox = df[
        ((df['lat_snode'].between(BBOX['south'], BBOX['north'])) &
         (df['long_snode'].between(BBOX['west'], BBOX['east'])))
        |
        ((df['lat_enode'].between(BBOX['south'], BBOX['north'])) &
         (df['long_enode'].between(BBOX['west'], BBOX['east'])))
    ]

    segments_in_bbox = df_in_bbox['segment_id'].unique()

    print(f"   ✓ Segments in bbox: {len(segments_in_bbox):,}")

    # Calculate statistics
    total_segments = df['segment_id'].nunique()
    percentage = (len(segments_in_bbox) / total_segments) * 100 if total_segments > 0 else 0
    print(f"   ✓ Percentage of total: {percentage:.1f}%")

    return df_in_bbox, segments_in_bbox


def apply_filters(df, segments_list):
    """Apply additional filters from config."""
    print("\n🔧 Applying additional filters...")

    # Filter by segment length
    min_length = CONFIG["extraction"].get("min_length", 0)
    max_length = CONFIG["extraction"].get("max_length", float("inf"))

    if min_length > 0 or max_length < float("inf"):
        before_count = len(segments_list)
        df = df[df['length'].between(min_length, max_length)]
        segments_list = df['segment_id'].unique()
        print(f"   ✓ Length filter ({min_length}-{max_length}m): {before_count} → {len(segments_list)} segments")

    # Filter by street level priority
    priority_levels = CONFIG["extraction"].get("priority_levels", [])
    if priority_levels:
        before_count = len(segments_list)
        df = df[df['street_level'].isin(priority_levels)]
        segments_list = df['segment_id'].unique()
        print(f"   ✓ Priority levels {priority_levels}: {before_count} → {len(segments_list)} segments")

    # Limit max segments
    max_segments = CONFIG["extraction"].get("max_segments", len(segments_list))
    if max_segments < len(segments_list):
        before_count = len(segments_list)
        # Take first N segments
        df = df.drop_duplicates(subset=['segment_id']).head(max_segments)
        segments_list = df['segment_id'].unique()
        print(f"   ✓ Limited to {max_segments} segments (PoC mode): {before_count} → {len(segments_list)}")

    print(f"   ✓ Final segment count: {len(segments_list)}")
    return df, segments_list


def create_output_json(df, segments_list):
    """Create output JSON with extracted segments."""
    print("\n💾 Creating output JSON...")

    # Prepare segment data - get unique segments
    df_unique = df.drop_duplicates(subset=['segment_id'])

    segments_data = []
    for _, segment_df in df_unique.iterrows():
        segments_data.append({
            "segment_id": int(segment_df["segment_id"]),
            "s_node_id": int(segment_df["s_node_id"]),
            "e_node_id": int(segment_df["e_node_id"]),
            "s_lat": float(segment_df["lat_snode"]),
            "s_lng": float(segment_df["long_snode"]),
            "e_lat": float(segment_df["lat_enode"]),
            "e_lng": float(segment_df["long_enode"]),
            "length": int(segment_df["length"]),
            "street_level": int(segment_df["street_level"]),
            "max_velocity": float(segment_df.get("max_velocity", 0)) if pd.notna(segment_df.get("max_velocity")) else 0,
            "street_name": str(segment_df.get("street_name", ""))
        })

    # Create output structure
    output = {
        "bounding_box": BBOX,
        "extraction_date": datetime.now().isoformat(),
        "segments": segments_data,
        "statistics": {
            "total_segments_in_dataset": df["segment_id"].nunique(),
            "segments_extracted": len(segments_list),
            "extraction_percentage": (len(segments_list) / df["segment_id"].nunique() * 100) if df["segment_id"].nunique() > 0 else 0
        }
    }

    # Save to JSON
    output_file = OUTPUT_DIR / "segments_in_bbox.json"
    with open(output_file, "w", encoding='utf-8') as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"   ✓ Saved to {output_file}")
    print(f"   ✓ Total segments: {len(segments_data)}")

    return output


def create_statistics_file(output):
    """Create human-readable statistics file."""
    stats_file = OUTPUT_DIR / "statistics.txt"

    with open(stats_file, "w", encoding='utf-8') as f:
        f.write("=" * 60 + "\n")
        f.write("SEGMENT EXTRACTION STATISTICS\n")
        f.write("=" * 60 + "\n\n")

        f.write(f"Bounding Box: {output['bounding_box']['name']}\n")
        f.write(f"North: {output['bounding_box']['north']}\n")
        f.write(f"South: {output['bounding_box']['south']}\n")
        f.write(f"West: {output['bounding_box']['west']}\n")
        f.write(f"East: {output['bounding_box']['east']}\n\n")

        f.write(f"Extraction Date: {output['extraction_date']}\n\n")

        stats = output['statistics']
        f.write(f"Total Segments in Dataset: {stats['total_segments_in_dataset']:,}\n")
        f.write(f"Segments Extracted: {stats['segments_extracted']:,}\n")
        f.write(f"Extraction Percentage: {stats['extraction_percentage']:.1f}%\n\n")

        if output['segments']:
            f.write("Segment Details:\n")
            f.write(f"  Min Length: {min(s['length'] for s in output['segments'])}m\n")
            f.write(f"  Max Length: {max(s['length'] for s in output['segments'])}m\n")
            f.write(f"  Avg Length: {sum(s['length'] for s in output['segments']) / len(output['segments']):.1f}m\n")

            # Count by street level
            level_counts = {}
            for s in output['segments']:
                level = s['street_level']
                level_counts[level] = level_counts.get(level, 0) + 1
            f.write(f"\nStreet Level Distribution:\n")
            for level, count in sorted(level_counts.items()):
                f.write(f"  Level {level}: {count} segments\n")

    print(f"   ✓ Statistics saved to {stats_file}")


def create_traffic_scraper_config(segments_data):
    """Generate configuration for traffic_scraper."""
    print("\n🔧 Generating traffic_scraper configuration...")

    config = {
        "segments": segments_data,
        "scraper": {
            "interval_minutes": 30,
            "collection_days": 7,
            "mode": "dual"  # normal + priority modes
        },
        "storage": {
            "reports_dir": "data/reports"
        },
        "logging": {
            "format_json": True
        }
    }

    config_file = OUTPUT_DIR / "traffic_scraper_config.yaml"
    with open(config_file, "w", encoding='utf-8') as f:
        yaml.dump(config, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

    print(f"   ✓ Config saved to {config_file}")
    print(f"   ✓ Segments: {len(segments_data)}")

    return config_file


def main():
    """Main extraction pipeline."""
    print("=" * 60)
    print("SEGMENT EXTRACTOR FOR SMARTROUTE (NO API NEEDED!)")
    print("=" * 60)
    print()

    # Step 1: Validate environment
    if not validate_environment():
        return

    # Step 2: Load research data
    df = load_research_data()
    if df is None:
        print("\n❌ Dataset missing coordinate columns!")
        return

    # Step 3: Filter by bounding box (direct from dataset!)
    df_in_bbox, segments_in_bbox = filter_by_bbox(df)

    if len(segments_in_bbox) == 0:
        print("\n⚠ No segments found in bounding box.")
        return

    # Step 4: Apply additional filters
    df_filtered, segments_final = apply_filters(df_in_bbox, segments_in_bbox)

    if len(segments_final) == 0:
        print("\n⚠ No segments after applying filters.")
        return

    # Step 5: Create output JSON
    output = create_output_json(df_filtered, segments_final)

    # Step 6: Create statistics file
    create_statistics_file(output)

    # Step 7: Generate traffic_scraper config
    if CONFIG["output"].get("generate_scraper_config", True):
        create_traffic_scraper_config(output["segments"])

    print()
    print("=" * 60)
    print("✅ EXTRACTION COMPLETE!")
    print("=" * 60)
    print()
    print(f"📁 Output directory: {OUTPUT_DIR}")
    print(f"📄 Main output: segments_in_bbox.json")
    print(f"📄 Stats: statistics.txt")
    print(f"📄 traffic_scraper_config.yaml")
    print()
    print("⏱ Total time: <5 seconds (NO Overpass API!)")
    print()
    print("Next steps:")
    print("1. Review extracted segments in segments_in_bbox.json")
    print("2. Use segment_id + coordinates to:")
    print("   - Call TomTom API for current traffic")
    print("   - Run XGBoost model for LOS prediction")
    print("   - Display on osmapp heatmap")
    print()


if __name__ == "__main__":
    main()
