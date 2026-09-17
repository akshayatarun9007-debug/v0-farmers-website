import json
import os
from pathlib import Path
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.models.database import Scheme
from backend.app.models.schemas import SchemeResponse

BASE_DIR = Path(__file__).resolve().parent.parent.parent
SCHEMES_FILE = BASE_DIR / "data" / "raw" / "schemes.json"


def seed_schemes_if_empty(db: Session):
    count = db.query(Scheme).count()
    if count == 0 and SCHEMES_FILE.exists():
        with open(SCHEMES_FILE, "r", encoding="utf-8") as f:
            schemes_data = json.load(f)
        for s in schemes_data:
            scheme = Scheme(
                name=s["name"],
                description=s["description"],
                eligibility=s["eligibility"],
                benefits=s["benefits"],
                level=s["level"],
                category=s["category"],
                official_source=s["official_source"],
                application_url=s.get("application_url"),
                last_verified=s["last_verified"],
                is_active=True,
            )
            db.add(scheme)
        db.commit()


async def get_schemes_list(
    state: Optional[str],
    category: Optional[str],
    search: Optional[str],
    db: Session,
) -> List[SchemeResponse]:
    seed_schemes_if_empty(db)

    query = db.query(Scheme).filter(Scheme.is_active == True)

    if state:
        # Include central schemes and schemes matching the requested state
        query = query.filter((Scheme.level == "Central") | (Scheme.level.ilike(f"%{state}%")))

    if category and category != "All":
        query = query.filter(Scheme.category.ilike(f"%{category}%"))

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Scheme.name.ilike(search_pattern))
            | (Scheme.description.ilike(search_pattern))
            | (Scheme.eligibility.ilike(search_pattern))
        )

    results = query.all()
    return [
        SchemeResponse(
            id=s.id,
            name=s.name,
            description=s.description,
            eligibility=s.eligibility,
            benefits=s.benefits,
            level=s.level,
            category=s.category,
            official_source=s.official_source,
            application_url=s.application_url,
            last_verified=s.last_verified,
        )
        for s in results
    ]
