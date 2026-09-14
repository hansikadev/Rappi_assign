from dataclasses import dataclass, field, asdict
from typing import List, Optional, Dict, Any

@dataclass
class Product:
    id: str
    name: str
    category: str
    unit_cost: float
    unit_volume_cu_ft: float
    current_stock: int
    reorder_point: int
    safety_stock: int
    avg_daily_demand: float
    forecast_30d: float

    def dict(self):
        return asdict(self)

@dataclass
class Supplier:
    id: str
    name: str
    product_id: str
    unit_cost: float
    lead_time_days: int
    moq: int
    max_capacity_per_order: int
    reliability_score: float

    def dict(self):
        return asdict(self)

@dataclass
class PurchaseOrder:
    id: str
    product_id: str
    supplier_id: str
    fulfillment_node: str
    quantity: int
    unit_price: float
    total_cost: float
    status: str
    created_at: str
    expected_delivery: str
    notes: Optional[str] = ""

    def dict(self):
        return asdict(self)

@dataclass
class FulfillmentNode:
    id: str
    name: str
    max_storage_cu_ft: float
    used_storage_cu_ft: float
    available_storage_cu_ft: float
    available_budget: float

    def dict(self):
        return asdict(self)

@dataclass
class AgentToolCall:
    tool_name: str
    arguments: dict
    result: object
    timestamp: str

    def dict(self):
        return asdict(self)

@dataclass
class AgentThinkingStep:
    step_number: int
    thought: str
    action_type: str  # TOOL_CALL, ANALYSIS, DECISION, VALIDATION
    tool_call: Optional[AgentToolCall] = None

    def dict(self):
        return asdict(self)

@dataclass
class ValidationCheckItem:
    check_name: str
    passed: bool
    details: str
    impact_metrics: dict = field(default_factory=dict)

    def dict(self):
        return asdict(self)

@dataclass
class ValidationOutcome:
    is_valid: bool
    summary: str
    checks: List[ValidationCheckItem] = field(default_factory=list)
    corrective_action_taken: Optional[str] = None

    def dict(self):
        return asdict(self)

@dataclass
class AgentDecision:
    scenario_id: str
    decision_type: str  # ACCEPTED, MODIFIED, REJECTED, SPLIT_ORDER, ESCALATED
    recommended_qty: int
    final_qty: int
    rationale: str
    actions_taken: List[dict] = field(default_factory=list)
    thinking_steps: List[AgentThinkingStep] = field(default_factory=list)
    validation: Optional[ValidationOutcome] = None
    created_po_ids: List[str] = field(default_factory=list)

    def dict(self):
        return asdict(self)

@dataclass
class ScenarioRunRequest:
    scenario_id: str
    custom_params: Optional[dict] = None
    api_key: Optional[str] = None
    provider: Optional[str] = "mock"

    def dict(self):
        return asdict(self)

@dataclass
class EvaluationMetric:
    name: str
    score: float
    status: str
    notes: str

    def dict(self):
        return asdict(self)

@dataclass
class EvaluationResult:
    scenario_id: str
    scenario_title: str
    decision_correct: bool
    information_gathered: bool
    constraints_respected: bool
    action_appropriate: bool
    validation_passed: bool
    metrics: List[EvaluationMetric] = field(default_factory=list)
    overall_score: float = 0.0
    summary: str = ""

    def dict(self):
        return asdict(self)
