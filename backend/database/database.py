import json
from pathlib import Path


# -------------------------------------------------------------------
# PATHS
# -------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = BASE_DIR / "output"


# -------------------------------------------------------------------
# LOADERS
# -------------------------------------------------------------------
def _load_json(filename: str):
    file_path = OUTPUT_DIR / filename
    try:
        with file_path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"Error loading {filename}: {exc}")
        return []


# -------------------------------------------------------------------
# DATASETS
# -------------------------------------------------------------------
EVENTS = _load_json("events.json")
MATCHES = _load_json("matches.json")
SUMMARY = _load_json("summary.json")


# -------------------------------------------------------------------
# READINESS
# -------------------------------------------------------------------
def is_dataset_ready() -> bool:
    return bool(EVENTS) and bool(MATCHES) and bool(SUMMARY)
