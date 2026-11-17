import json
import os
import docx

DOCX_PATH = r"G:\My Drive\Government School Work\Govt 2026 - 2027\TimeTable_Mon_Fri_2026.docx"
OUT_JSON = r"C:\projects\master_sahib\src\data\ggss-tt-afternoon.json"

doc = docx.Document(DOCX_PATH)
tables = [[[c.text.strip() for c in r.cells] for r in t.rows] for t in doc.tables]

if len(tables) < 8:
    raise RuntimeError(f"Expected 8 tables in {DOCX_PATH}, found {len(tables)}")

payload = {
    "title": "GGSS Nishtar Road — Afternoon Shift Timetable (Mon–Fri)",
    "subtitle": "Mon–Thu: 1:00 PM – 5:00 PM (4 Units) | Friday: 10:30 AM – 1:00 PM (3 Units)",
    "updatedAt": os.path.getmtime(DOCX_PATH),
    "categories": [
        {
            "id": "master",
            "label": "Master (Mon–Fri)",
            "description": "Unified Monday to Friday schedule for Classes VI–VII (Combined), VIII, IX & X",
            "rows": tables[0],
        },
        {
            "id": "teachers",
            "label": "Teacher-Wise",
            "description": "Individual Monday to Friday schedule for all 8 teachers (max 2 units/day)",
            "rows": tables[2],
        },
        {
            "id": "class-1-5",
            "label": "Class I–V (Combined)",
            "description": "Primary combined schedule (Mon–Thu & Friday)",
            "rows": tables[3],
        },
        {
            "id": "class-6-7",
            "label": "Class VI & VII",
            "description": "Combined timetable for Class VI & VII (Monday to Friday)",
            "rows": tables[4],
        },
        {
            "id": "class-8",
            "label": "Class VIII",
            "description": "Class VIII timetable (Monday to Friday)",
            "rows": tables[5],
        },
        {
            "id": "class-9",
            "label": "Class IX",
            "description": "Class IX timetable (Monday to Friday — Science Lab on Tuesday)",
            "rows": tables[6],
        },
        {
            "id": "class-10",
            "label": "Class X",
            "description": "Class X timetable (Monday to Friday — Science Lab on Thursday)",
            "rows": tables[7],
        },
    ],
}

os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)
with open(OUT_JSON, "w", encoding="utf-8") as f:
    json.dump(payload, f, indent=2, ensure_ascii=False)

print(f"Synced {len(payload['categories'])} categories to {OUT_JSON}")
