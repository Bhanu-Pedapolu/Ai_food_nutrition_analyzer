"""
Dataset Download & Dynamic Inspection Script for NutriVision
Dataset: pes12017000148/food-ingredients-and-recipe-dataset-with-images

Uses KaggleHub to download/locate the dataset, with robust Windows long-path handling,
discovers files and columns dynamically, and creates a dataset manifest.
"""

import os
import sys
import json
import zipfile
from pathlib import Path
import pandas as pd

DATASET_ID = "pes12017000148/food-ingredients-and-recipe-dataset-with-images"
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND_DATA_DIR = PROJECT_ROOT / "backend" / "data"
LOCAL_DATASET_DIR = BACKEND_DATA_DIR / "kaggle_dataset"

def download_and_inspect():
    print(f"=== NutriVision Kaggle Dataset Setup ===")
    print(f"Target Dataset: {DATASET_ID}")

    dataset_dir = None

    # Check if local extracted dataset already exists
    if LOCAL_DATASET_DIR.exists() and any(LOCAL_DATASET_DIR.glob("*.csv")):
        print(f"Using local extracted dataset at: {LOCAL_DATASET_DIR}")
        dataset_dir = LOCAL_DATASET_DIR
    else:
        try:
            import kagglehub
            print("Attempting dataset download / location via kagglehub...")
            try:
                path = kagglehub.dataset_download(DATASET_ID)
                dataset_dir = Path(path)
                print("kagglehub resolved path:", dataset_dir)
            except Exception as dl_err:
                print(f"kagglehub standard download raised: {dl_err}")
                print("Checking for cached archive...")
                user_home = Path.home()
                cache_archive = user_home / ".cache" / "kagglehub" / "datasets" / "pes12017000148" / "food-ingredients-and-recipe-dataset-with-images" / "1.archive"
                if cache_archive.exists():
                    print(f"Found cached archive at {cache_archive}. Extracting to {LOCAL_DATASET_DIR}...")
                    LOCAL_DATASET_DIR.mkdir(parents=True, exist_ok=True)
                    dest_str = f"\\\\?\\{LOCAL_DATASET_DIR.resolve()}"
                    with zipfile.ZipFile(cache_archive, 'r') as z:
                        for member in z.infolist():
                            target = os.path.join(dest_str, member.filename.replace('/', os.sep))
                            if member.is_dir():
                                os.makedirs(target, exist_ok=True)
                            else:
                                os.makedirs(os.path.dirname(target), exist_ok=True)
                                with z.open(member) as src, open(target, 'wb') as dst:
                                    dst.write(src.read())
                    dataset_dir = LOCAL_DATASET_DIR
                else:
                    raise dl_err
        except Exception as e:
            print(f"Error during dataset acquisition: {e}")
            sys.exit(1)

    # 1. Discover all files and CSVs
    print("\n--- Inspecting Directory Structure ---")
    all_files = list(dataset_dir.rglob("*"))
    print(f"Total files/directories discovered: {len(all_files)}")

    csv_files = [f for f in all_files if f.is_file() and f.suffix.lower() == ".csv"]
    print(f"Discovered CSV files ({len(csv_files)}):")
    for csv_file in csv_files:
        size_mb = csv_file.stat().st_size / (1024 * 1024)
        print(f" - {csv_file.name} ({size_mb:.2f} MB)")

    # Discover images
    image_extensions = {".jpg", ".jpeg", ".png", ".webp"}
    image_files = [f for f in all_files if f.is_file() and f.suffix.lower() in image_extensions]
    print(f"Discovered {len(image_files)} image files.")

    # Find the images folder
    images_dir = None
    for item in dataset_dir.rglob("*"):
        if item.is_dir() and item.name.lower() in ["food images", "images"] and any(item.glob("*.jpg")):
            images_dir = item
            break
    if not images_dir and image_files:
        images_dir = image_files[0].parent

    print(f"Primary Images Directory: {images_dir}")

    # 2. Inspect CSV columns and sample data
    primary_csv = max(csv_files, key=lambda f: f.stat().st_size) if csv_files else None
    if not primary_csv:
        print("ERROR: No CSV file found in dataset!")
        sys.exit(1)

    print(f"\n--- Inspecting Primary CSV: {primary_csv.name} ---")
    df_sample = pd.read_csv(primary_csv, nrows=10)
    print(f"Columns ({len(df_sample.columns)}):", list(df_sample.columns))
    print(f"Sample Record 0:")
    for col in df_sample.columns:
        val = str(df_sample.iloc[0][col])
        truncated = val if len(val) < 100 else val[:97] + "..."
        print(f"  {col}: {truncated}")

    df_count = pd.read_csv(primary_csv, usecols=[df_sample.columns[0]])
    total_rows = len(df_count)
    print(f"Total Rows in Dataset: {total_rows}")

    # 3. Write manifest
    BACKEND_DATA_DIR.mkdir(parents=True, exist_ok=True)
    manifest_path = BACKEND_DATA_DIR / "dataset_manifest.json"
    manifest = {
        "dataset_id": DATASET_ID,
        "dataset_path": str(dataset_dir),
        "csv_path": str(primary_csv),
        "csv_name": primary_csv.name,
        "images_dir": str(images_dir),
        "total_images": len(image_files),
        "total_rows": total_rows,
        "columns": list(df_sample.columns)
    }

    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)

    print(f"\nDataset manifest successfully saved to: {manifest_path}")
    print("=== Dataset Setup & Inspection Complete ===")
    return manifest

if __name__ == "__main__":
    download_and_inspect()
