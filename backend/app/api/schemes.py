from fastapi import APIRouter, Query, Depends
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.app.models.database import get_db
from backend.app.models.schemas import SchemeResponse

router = APIRouter()

@router.get("/schemes", response_model=List[SchemeResponse])
async def list_schemes(
    state: Optional[str] = Query(None, description="Filter by state (or Central)"),
    category: Optional[str] = Query(None, description="Filter by scheme category"),
    search: Optional[str] = Query(None, description="Search keyword"),
    db: Session = Depends(get_db),
):
    from backend.app.services.scheme_service import get_schemes_list
    return await get_schemes_list(state, category, search, db)
