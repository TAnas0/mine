---
title: "Part 2: The Structure - From JSONL to DuckDB"
date: "2025-05-31"
tags: ["data-engineering", "duckdb", "jsonl", "schema"]
excerpt: "Data modeling choices: JSONL system-of-record and DuckDB for analytics."
---

## Data Format: JSON Lines (JSONL)

- **JSON Lines (JSONL)**
  - One JSON object per line
  - Line-by-line processing
  - **Why?**
    - Fault tolerant: malformed records do not break the entire dataset
    - Well-suited to scraper output with independent case entries
    - Optimized for **incremental processing**

> JSONL stores one JSON object per line, which makes it easier to process incrementally, handle large files, and skip over bad records without breaking the whole dataset.

## Storage & Query Layer

- **Raw storage**
  - JSONL files preserved as system-of-record
- **Analytical storage**
  - **DuckDB** for:
    - Fast local querying
    - Columnar access
    - SQL + Python interoperability
- **UI / inspection**
  - DuckDB UI (or equivalent) for rapid schema inspection
- **Rationale**:
  - Query-first workflows reduce reliance on repeated Pandas loads
  - Pandas is used for *analysis*, not *storage*

## Data Constraints & Anonymization

### Constraints
- Limited to **one week of hearings**
- Structured missingness in several fields (documented, not imputed)
- No persistent, cross-case defendant identifiers

### Anonymization and Ethics
- **Strict Rule**:
  - Although the source data is public, personally identifying information is removed or hashed.
- **Steps**:
  - Names and free-text identifiers removed
  - IDs replaced with non-reversible hashes
- **Rationale**:
  - Public availability does not eliminate ethical handling obligations
  - Especially relevant for sensitive attributes (e.g., race)

## TODO
- [ ] Add court data schema details (types, responsibilities)
- [ ] Add Case Hearings data structure example
