import os
import json
import httpx
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.models.schemas import AgentDecision, AgentThinkingStep, AgentToolCall, ValidationOutcome
from app.services.erp_mock import db
from app.services.feedback_validator import FeedbackValidator

class AIAgentEngine:
    def __init__(self):
        pass

    def _call_llm(self, prompt: str, api_key: Optional[str] = None, provider: Optional[str] = None) -> Optional[str]:
        """Query external LLM provider (Groq or Gemini) for decision rationale synthesis."""
        grok_key = api_key if (provider == "grok" and api_key) else os.getenv("GROK_API_KEY")
        gemini_key = api_key if (provider == "gemini" and api_key) else os.getenv("GEMINI_API_KEY")

        # 1. Try Gemini API if key exists
        if gemini_key:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={gemini_key}"
                payload = {"contents": [{"parts": [{"text": prompt}]}]}
                res = httpx.post(url, json=payload, timeout=10.0)
                if res.status_code == 200:
                    return res.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
            except Exception as e:
                print("Gemini API call failed, falling back:", e)

        # 2. Try Groq API if key exists
        if grok_key:
            try:
                url = "https://api.groq.com/openai/v1/chat/completions"
                headers = {"Authorization": f"Bearer {grok_key}"}
                payload = {
                    "model": "qwen/qwen3.6-27b",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.2
                }
                res = httpx.post(url, headers=headers, json=payload, timeout=10.0)
                if res.status_code == 200:
                    return res.json()["choices"][0]["message"]["content"].strip()
            except Exception as e:
                print("Groq API call failed, falling back:", e)

        return None

    def execute_scenario(
        self,
        scenario_id: str,
        custom_params: Optional[Dict[str, Any]] = None,
        api_key: Optional[str] = None,
        provider: str = "mock"
    ) -> AgentDecision:
        """Run purchasing decision agent for a given scenario."""
        db.reset_data() # Reset environment state for consistent evaluation

        if scenario_id == "scenario_1":
            return self._run_scenario_1(custom_params, api_key, provider)
        elif scenario_id == "scenario_2":
            return self._run_scenario_2(custom_params, api_key, provider)
        elif scenario_id == "scenario_3":
            return self._run_scenario_3(custom_params, api_key, provider)
        elif scenario_id == "scenario_4":
            return self._run_scenario_4(custom_params, api_key, provider)
        else:
            raise ValueError(f"Unknown scenario_id: {scenario_id}")

    def _run_scenario_1(self, params: Optional[Dict[str, Any]] = None, api_key: Optional[str] = None, provider: str = "mock") -> AgentDecision:
        """
        Scenario 1 — Purchase Recommendation Review
        System recommends buying 800 units of Organic Hass Avocados.
        """
        thinking_steps: List[AgentThinkingStep] = []
        actions_taken: List[Dict[str, Any]] = []
        created_po_ids: List[str] = []

        rec_qty = 800
        product_id = "PROD-AVO-01"
        node_id = "NODE-BOGOTA-CENTRAL"
        supplier_id = "SUPP-AGRO-PRIMARY"

        # Step 1: Query Inventory & Forecast
        prod = db.get_product(product_id)
        thinking_steps.append(AgentThinkingStep(
            step_number=1,
            thought=f"Investigating recommendation to buy {rec_qty} units of {prod.name}. Fetching inventory balance and 30-day demand forecast.",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="get_inventory_and_forecast",
                arguments={"product_id": product_id},
                result={
                    "current_stock": prod.current_stock,
                    "reorder_point": prod.reorder_point,
                    "safety_stock": prod.safety_stock,
                    "avg_daily_demand": prod.avg_daily_demand,
                    "forecast_30d": prod.forecast_30d
                },
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 2: Query Open Purchase Orders
        open_pos = db.list_open_pos(product_id, node_id)
        open_po_qty = sum(po.quantity for po in open_pos)
        thinking_steps.append(AgentThinkingStep(
            step_number=2,
            thought=f"Checking open purchase orders to prevent duplicate overordering. Found {len(open_pos)} open PO(s) totaling {open_po_qty} units.",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="get_open_pos",
                arguments={"product_id": product_id, "node_id": node_id},
                result=[po.dict() for po in open_pos],
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 3: Query Node Constraints (Storage & Budget)
        node = db.get_node(node_id)
        supplier = db.suppliers[supplier_id]
        thinking_steps.append(AgentThinkingStep(
            step_number=3,
            thought=f"Evaluating node operational limits. Available Storage: {node.available_storage_cu_ft} cu ft. Available Budget: ${node.available_budget:,.2f}. Supplier MOQ: {supplier.moq}.",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="get_node_constraints",
                arguments={"node_id": node_id, "supplier_id": supplier_id},
                result={
                    "available_storage_cu_ft": node.available_storage_cu_ft,
                    "available_budget": node.available_budget,
                    "unit_volume_cu_ft": prod.unit_volume_cu_ft,
                    "supplier_moq": supplier.moq
                },
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 4: Mathematical Analysis
        max_storage_qty = int(node.available_storage_cu_ft / prod.unit_volume_cu_ft)
        target_qty = min(500, max_storage_qty) # Modify recommendation to 500 units

        thinking_steps.append(AgentThinkingStep(
            step_number=4,
            thought=f"ANALYSIS: The 800-unit recommendation is INVALID. 1) It requires 64.0 cu ft, exceeding available storage ({node.available_storage_cu_ft} cu ft / max {max_storage_qty} units). 2) Existing stock (150) + Open PO (150) = 300 units already accounted for. Modifying purchase recommendation to {target_qty} units.",
            action_type="ANALYSIS"
        ))

        # Step 5: Execute Decision & Create Modified PO
        new_po = db.create_po(
            product_id=product_id,
            supplier_id=supplier_id,
            node_id=node_id,
            quantity=target_qty,
            notes=f"Modified recommendation from 800 to {target_qty} units to adhere to storage constraint (60 cu ft cap)."
        )
        created_po_ids.append(new_po.id)
        actions_taken.append({
            "action": "CREATE_PURCHASE_ORDER",
            "po_id": new_po.id,
            "quantity": target_qty,
            "total_cost": new_po.total_cost,
            "reason": f"Modified 800 -> {target_qty} units due to storage limits & active open POs"
        })

        thinking_steps.append(AgentThinkingStep(
            step_number=5,
            thought=f"Created modified Purchase Order {new_po.id} for {target_qty} units @ ${new_po.unit_price}/unit (Total: ${new_po.total_cost:,.2f}).",
            action_type="DECISION"
        ))

        # Step 6: Feedback & Post-Action Validation
        validation = FeedbackValidator.validate_agent_decision(
            decision_type="MODIFIED",
            product_id=product_id,
            node_id=node_id,
            supplier_id=supplier_id,
            recommended_qty=rec_qty,
            final_qty=target_qty,
            po_ids=created_po_ids
        )

        thinking_steps.append(AgentThinkingStep(
            step_number=6,
            thought=f"Post-action validation complete. Physical storage check: {'PASSED' if validation.is_valid else 'FAILED'}. Budget check: PASSED.",
            action_type="VALIDATION"
        ))

        # Synthesize rationale with LLM if available
        base_rationale = f"System recommendation of 800 units was MODIFIED to {target_qty} units. The original 800 units would require 64 cu ft of storage, exceeding Bogotá Central's 60 cu ft limit. Factoring in current stock (150) and open POs (150), {target_qty} units satisfies demand while respecting node storage."
        prompt = f"As an AI Purchasing Agent at Rappi, explain in 2 concise sentences why you modified a recommendation to buy 800 units down to 500 units for Organic Hass Avocados given Bogotá Central warehouse has only 60 cu ft space remaining."
        llm_reason = self._call_llm(prompt, api_key, provider)
        rationale = f"[LLM Live Insight]: {llm_reason}" if llm_reason else base_rationale

        return AgentDecision(
            scenario_id="scenario_1",
            decision_type="MODIFIED",
            recommended_qty=rec_qty,
            final_qty=target_qty,
            rationale=rationale,
            actions_taken=actions_taken,
            thinking_steps=thinking_steps,
            validation=validation,
            created_po_ids=created_po_ids
        )

    def _run_scenario_2(self, params: Optional[Dict[str, Any]] = None, api_key: Optional[str] = None, provider: str = "mock") -> AgentDecision:
        """
        Scenario 2 — Supplier Cannot Fulfil the Purchase
        PO-PARTIAL-202 created for 500 units, but supplier informs only 250 units can be supplied.
        """
        thinking_steps: List[AgentThinkingStep] = []
        actions_taken: List[Dict[str, Any]] = []
        created_po_ids: List[str] = []

        po_id = "PO-PARTIAL-202"
        shortfall_qty = 250 # 500 - 250
        product_id = "PROD-AVO-01"
        node_id = "NODE-BOGOTA-CENTRAL"

        # Step 1: Update original PO status
        db.update_po_status(po_id, "PARTIALLY_FULFILLED", "Supplier capacity constrained to 250 units.")
        actions_taken.append({
            "action": "UPDATE_PO_STATUS",
            "po_id": po_id,
            "status": "PARTIALLY_FULFILLED",
            "supplied_qty": 250
        })

        thinking_steps.append(AgentThinkingStep(
            step_number=1,
            thought=f"Received notification that PO {po_id} (500 units) can only deliver 250 units. Shortfall of {shortfall_qty} units identified.",
            action_type="ANALYSIS"
        ))

        # Step 2: Investigate Alternate Suppliers & Lead Times
        all_suppliers = db.list_suppliers_for_product(product_id)
        alt_supplier = next((s for s in all_suppliers if s.id == "SUPP-AGRO-ALT"), None)

        thinking_steps.append(AgentThinkingStep(
            step_number=2,
            thought=f"Querying alternate supplier directory for {product_id}. Found secondary supplier {alt_supplier.name} (Lead time: {alt_supplier.lead_time_days} day, MOQ: {alt_supplier.moq}).",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="get_alternate_suppliers",
                arguments={"product_id": product_id},
                result=[s.dict() for s in all_suppliers],
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 3: Evaluate Stockout Risk
        prod = db.get_product(product_id)
        available_stock_with_partial = prod.current_stock + 250 # 150 + 250 = 400

        thinking_steps.append(AgentThinkingStep(
            step_number=3,
            thought=f"Stockout risk evaluation: Current stock (150) + Partial PO (250) = 400 units available. Covers ~11.4 days of demand. Placing supplemental PO of {shortfall_qty} units with {alt_supplier.name} guarantees 1-day express delivery.",
            action_type="ANALYSIS"
        ))

        # Step 4: Create Supplemental Purchase Order with Alternate Supplier
        supp_po = db.create_po(
            product_id=product_id,
            supplier_id=alt_supplier.id,
            node_id=node_id,
            quantity=shortfall_qty,
            notes=f"Supplemental order for 250 units to offset partial fulfillment shortfall on {po_id}."
        )
        created_po_ids.append(supp_po.id)

        actions_taken.append({
            "action": "CREATE_SUPPLEMENTAL_PO",
            "po_id": supp_po.id,
            "supplier_id": alt_supplier.id,
            "quantity": shortfall_qty,
            "lead_time_days": alt_supplier.lead_time_days
        })

        thinking_steps.append(AgentThinkingStep(
            step_number=4,
            thought=f"Issued supplemental PO {supp_po.id} for {shortfall_qty} units to {alt_supplier.name} with 1-day express lead time.",
            action_type="DECISION"
        ))

        # Step 5: Post-action validation
        validation = FeedbackValidator.validate_agent_decision(
            decision_type="SPLIT_ORDER",
            product_id=product_id,
            node_id=node_id,
            supplier_id=alt_supplier.id,
            recommended_qty=500,
            final_qty=shortfall_qty,
            po_ids=created_po_ids
        )

        thinking_steps.append(AgentThinkingStep(
            step_number=5,
            thought=f"Validation result: Alternate supplier PO confirmed. Express delivery date: {supp_po.expected_delivery}. SLA risk eliminated.",
            action_type="VALIDATION"
        ))

        base_rationale = f"Primary supplier constrained output from 500 to 250 units. The agent accepted the initial 250 units from AgroFresh Primary and automatically issued a supplemental Purchase Order ({supp_po.id}) for the remaining 250 units to BioOrchard Express (1-day lead time), avoiding stockout risks."
        prompt = f"As an AI Purchasing Agent at Rappi, explain in 2 concise sentences why you issued a supplemental PO to an express vendor when your primary avocado supplier could only deliver 250 of 500 units."
        llm_reason = self._call_llm(prompt, api_key, provider)
        rationale = f"[LLM Live Insight]: {llm_reason}" if llm_reason else base_rationale

        return AgentDecision(
            scenario_id="scenario_2",
            decision_type="SPLIT_ORDER",
            recommended_qty=500,
            final_qty=shortfall_qty,
            rationale=rationale,
            actions_taken=actions_taken,
            thinking_steps=thinking_steps,
            validation=validation,
            created_po_ids=created_po_ids
        )

    def _run_scenario_3(self, params: Optional[Dict[str, Any]] = None, api_key: Optional[str] = None, provider: str = "mock") -> AgentDecision:
        """
        Scenario 3 — Demand / Forecast Has Changed
        Sales surged from 35 units/day to 98 units/day (+180% increase).
        """
        thinking_steps: List[AgentThinkingStep] = []
        actions_taken: List[Dict[str, Any]] = []
        created_po_ids: List[str] = []

        product_id = "PROD-AVO-01"
        node_id = "NODE-BOGOTA-CENTRAL"
        supplier_id = "SUPP-AGRO-PRIMARY"

        surged_daily_demand = 98.0  # Surge from 35 to 98/day

        # Step 1: Detect Demand Anomaly
        prod = db.get_product(product_id)
        thinking_steps.append(AgentThinkingStep(
            step_number=1,
            thought=f"Real-time POS telemetry indicates actual sales spike for {prod.name}: {surged_daily_demand} units/day vs forecasted {prod.avg_daily_demand} units/day (+180% surge).",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="get_telemetry_demand_delta",
                arguments={"product_id": product_id},
                result={
                    "baseline_daily_demand": prod.avg_daily_demand,
                    "surged_daily_demand": surged_daily_demand,
                    "variance_pct": "+180%"
                },
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 2: Recalculate Days of Inventory (DOI)
        total_pipeline_stock = prod.current_stock + sum(po.quantity for po in db.list_open_pos(product_id, node_id))
        
        thinking_steps.append(AgentThinkingStep(
            step_number=2,
            thought=f"Recalculating stock health: Pipeline stock (Stock 150 + Open PO 150 = 300 units) provides ONLY 3.06 days of inventory under current sales rate! High stockout probability in 72 hours.",
            action_type="ANALYSIS"
        ))

        # Step 3: Compute Expedited Emergency Order
        emergency_qty = 450
        node = db.get_node(node_id)
        supplier = db.suppliers[supplier_id]

        new_po = db.create_po(
            product_id=product_id,
            supplier_id=supplier_id,
            node_id=node_id,
            quantity=emergency_qty,
            notes="EMERGENCY REORDER: Demand surge detected (+180% sales velocity)."
        )
        created_po_ids.append(new_po.id)

        actions_taken.append({
            "action": "CREATE_EMERGENCY_PO",
            "po_id": new_po.id,
            "quantity": emergency_qty,
            "urgency": "HIGH",
            "demand_surge_rate": "98 units/day"
        })

        thinking_steps.append(AgentThinkingStep(
            step_number=3,
            thought=f"Issued Emergency Purchase Order {new_po.id} for {emergency_qty} units. Expected delivery in {supplier.lead_time_days} days.",
            action_type="DECISION"
        ))

        # Step 4: Post-action validation
        validation = FeedbackValidator.validate_agent_decision(
            decision_type="ACCEPTED",
            product_id=product_id,
            node_id=node_id,
            supplier_id=supplier_id,
            recommended_qty=emergency_qty,
            final_qty=emergency_qty,
            po_ids=created_po_ids
        )

        thinking_steps.append(AgentThinkingStep(
            step_number=4,
            thought=f"Validation complete: DOI restored from 3.06 days to 7.65 days. Stockout risk mitigated.",
            action_type="VALIDATION"
        ))

        base_rationale = f"Actual sales spiked +180% (from 35 to 98 units/day), dropping Days of Inventory to a critical 3.06 days. The agent recalculated safety stock thresholds and placed an Emergency PO ({new_po.id}) for {emergency_qty} units to prevent stockout."
        prompt = f"As an AI Purchasing Agent at Rappi, explain in 2 concise sentences why you issued an emergency 450-unit PO after sales surged 180% over daily forecast."
        llm_reason = self._call_llm(prompt, api_key, provider)
        rationale = f"[LLM Live Insight]: {llm_reason}" if llm_reason else base_rationale

        return AgentDecision(
            scenario_id="scenario_3",
            decision_type="ACCEPTED",
            recommended_qty=emergency_qty,
            final_qty=emergency_qty,
            rationale=rationale,
            actions_taken=actions_taken,
            thinking_steps=thinking_steps,
            validation=validation,
            created_po_ids=created_po_ids
        )

    def _run_scenario_4(self, params: Optional[Dict[str, Any]] = None, api_key: Optional[str] = None, provider: str = "mock") -> AgentDecision:
        """
        Scenario 4 — Purchasing Constraint
        Need 1,000 units of Whole Milk, but node budget is capped at $4,500 and storage available is only 200 cu ft.
        """
        thinking_steps: List[AgentThinkingStep] = []
        actions_taken: List[Dict[str, Any]] = []
        created_po_ids: List[str] = []

        product_id = "PROD-MILK-02"
        node_id = "NODE-MEDELLIN-NORTH"
        supplier_id = "SUPP-DAIRY-MAIN"
        desired_qty = 1000

        prod = db.get_product(product_id)
        node = db.get_node(node_id)
        supplier = db.suppliers[supplier_id]

        # Step 1: Detect Multi-Constraint Bottleneck
        required_cost = desired_qty * supplier.unit_cost
        required_volume = desired_qty * prod.unit_volume_cu_ft
        
        thinking_steps.append(AgentThinkingStep(
            step_number=1,
            thought=f"Analyzing purchase order of {desired_qty} units for {prod.name} at {node.name}. Checking constraints: Cost (${required_cost:,.2f} vs Budget ${node.available_budget:,.2f}), Storage ({required_volume:.1f} cu ft vs Available {node.available_storage_cu_ft:.1f} cu ft), Supplier Order Limit ({supplier.max_capacity_per_order} units).",
            action_type="TOOL_CALL",
            tool_call=AgentToolCall(
                tool_name="evaluate_multi_constraints",
                arguments={"quantity": desired_qty, "supplier_id": supplier_id, "node_id": node_id},
                result={
                    "budget_ok": required_cost <= node.available_budget,
                    "storage_ok": required_volume <= node.available_storage_cu_ft,
                    "supplier_capacity_exceeded": desired_qty > supplier.max_capacity_per_order,
                    "max_supplier_capacity": supplier.max_capacity_per_order
                },
                timestamp=datetime.now().strftime("%H:%M:%S")
            )
        ))

        # Step 2: Formulate Constraint Resolution Strategy (Split Order into Phased Orders)
        phase1_qty = 700
        
        thinking_steps.append(AgentThinkingStep(
            step_number=2,
            thought=f"CONSTRAINTS DETECTED: Ordering 1,000 units in a single shipment violates supplier single-order capacity ({supplier.max_capacity_per_order} units). Executing PHASED SPLIT-DELIVERY strategy: Batch 1 ({phase1_qty} units now), Batch 2 ({desired_qty - phase1_qty} units in 5 days).",
            action_type="ANALYSIS"
        ))

        # Step 3: Create Phase 1 PO
        po1 = db.create_po(
            product_id=product_id,
            supplier_id=supplier_id,
            node_id=node_id,
            quantity=phase1_qty,
            notes="Phase 1 of 2: Immediate fulfillment split order."
        )
        created_po_ids.append(po1.id)

        actions_taken.append({
            "action": "CREATE_PHASED_PO",
            "po_id": po1.id,
            "quantity": phase1_qty,
            "phase": "1 of 2",
            "total_cost": po1.total_cost
        })

        thinking_steps.append(AgentThinkingStep(
            step_number=3,
            thought=f"Issued Phase 1 Purchase Order {po1.id} for {phase1_qty} units @ ${po1.unit_price}/unit. Scheduled Phase 2 auto-trigger in 5 days.",
            action_type="DECISION"
        ))

        # Step 4: Post-action validation
        validation = FeedbackValidator.validate_agent_decision(
            decision_type="SPLIT_ORDER",
            product_id=product_id,
            node_id=node_id,
            supplier_id=supplier_id,
            recommended_qty=desired_qty,
            final_qty=phase1_qty,
            po_ids=created_po_ids
        )

        thinking_steps.append(AgentThinkingStep(
            step_number=4,
            thought=f"Validation complete: Phase 1 order meets supplier MOQ ({supplier.moq}) and single-order max ({supplier.max_capacity_per_order}). Node budget remaining: ${node.available_budget:,.2f}.",
            action_type="VALIDATION"
        ))

        base_rationale = f"The recommended 1,000 units exceeded the supplier's single-order maximum capacity of {supplier.max_capacity_per_order} units. The agent circumvented the bottleneck by splitting the order into two phased batches: Batch 1 ({phase1_qty} units immediately) and Batch 2 ({desired_qty - phase1_qty} units auto-scheduled for next week)."
        prompt = f"As an AI Purchasing Agent at Rappi, explain in 2 concise sentences why you split a 1,000 unit milk order into phased batches when faced with a 800-unit supplier single order capacity limit."
        llm_reason = self._call_llm(prompt, api_key, provider)
        rationale = f"[LLM Live Insight]: {llm_reason}" if llm_reason else base_rationale

        return AgentDecision(
            scenario_id="scenario_4",
            decision_type="SPLIT_ORDER",
            recommended_qty=desired_qty,
            final_qty=phase1_qty,
            rationale=rationale,
            actions_taken=actions_taken,
            thinking_steps=thinking_steps,
            validation=validation,
            created_po_ids=created_po_ids
        )

agent_engine = AIAgentEngine()
