import csv
import logging
from datetime import datetime
from collections import Counter
from pathlib import Path

import db

METRICS_FILE = Path("metrics.csv")

def log_event(event: str, file_path: Path = METRICS_FILE) -> None:
    if db.enabled:
        try:
            db.log_metric(event)
            return
        except Exception as e:
            logging.error("Failed to log metric to DB: %s", e)
            return
    new_file = not file_path.exists()
    with file_path.open("a", newline="") as f:
        writer = csv.writer(f)
        if new_file:
            writer.writerow(["timestamp", "event"])
        writer.writerow([datetime.utcnow().isoformat(), event])

def get_counts(file_path: Path = METRICS_FILE) -> dict[str, int]:
    if db.enabled:
        try:
            return db.metric_counts()
        except Exception as e:
            logging.error("Failed to read metrics from DB: %s", e)
            return {}
    if not file_path.exists():
        return {}
    with file_path.open(newline="") as f:
        reader = csv.DictReader(f)
        counter = Counter(row["event"] for row in reader)
    return dict(counter)
