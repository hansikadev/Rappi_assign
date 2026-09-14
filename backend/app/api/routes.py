from fastapi import APIRouter, HTTPException, Body
from typing import List, Dict, Any, Optional
from app.models.schemas import ScenarioRunRequest, AgentDecision, EvaluationResult
from app.services.agent_engine import agent_engine
from app.services.evaluator import EvaluatorSuite
from app.services.erp_mock import db

router = APIRouter(prefix="/api")

@router.post("/agent/run")
def run_agent_scenario(payload: dict = Body(...)):
    """Trigger AI purchasing agent execution for a selected scenario."""
    try:
        scenario_id = payload.get("scenario_id", "scenario_1")
        custom_params = payload.get("custom_params")
        api_key = payload.get("api_key")
        provider = payload.get("provider", "mock")

        decision = agent_engine.execute_scenario(
            scenario_id=scenario_id,
            custom_params=custom_params,
            api_key=api_key,
            provider=provider
        )
        return decision.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/evaluations")
def run_evaluation_matrix():
    """Run full benchmark evaluation suite across all 4 scenarios."""
    results = EvaluatorSuite.run_all_evaluations()
    return [r.dict() for r in results]

@router.get("/erp/state")
def get_erp_state():
    """Get real-time snapshot of Mock ERP state."""
    return {
        "products": [p.dict() for p in db.products.values()],
        "suppliers": [s.dict() for s in db.suppliers.values()],
        "fulfillment_nodes": [n.dict() for n in db.fulfillment_nodes.values()],
        "purchase_orders": [po.dict() for po in db.purchase_orders.values()]
    }

@router.post("/erp/reset")
def reset_erp_state():
    """Reset Mock ERP database state."""
    db.reset_data()
    return {"status": "success", "message": "ERP Mock state reset successfully."}
