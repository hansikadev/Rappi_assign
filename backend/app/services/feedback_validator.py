from typing import List, Dict, Any
from app.models.schemas import ValidationOutcome, ValidationCheckItem, AgentDecision
from app.services.erp_mock import db

class FeedbackValidator:
    @staticmethod
    def validate_agent_decision(decision_type: str, product_id: str, node_id: str, supplier_id: str, recommended_qty: int, final_qty: int, po_ids: List[str]) -> ValidationOutcome:
        checks: List[ValidationCheckItem] = []
        product = db.get_product(product_id)
        node = db.get_node(node_id)
        supplier = db.suppliers.get(supplier_id) or (db.list_suppliers_for_product(product_id)[0] if db.list_suppliers_for_product(product_id) else None)

        if not product or not node:
            return ValidationOutcome(
                is_valid=False,
                summary="Validation failed due to missing product or node context.",
                checks=[ValidationCheckItem(check_name="Context Verification", passed=False, details="Node or Product missing in ERP")],
                corrective_action_taken="Escalated to human supervisor."
            )

        # 1. Storage Capacity Check
        added_volume = final_qty * product.unit_volume_cu_ft
        storage_passed = added_volume <= node.available_storage_cu_ft + (added_volume if len(po_ids) > 0 else 0.0) # node storage already reduced if PO created
        checks.append(ValidationCheckItem(
            check_name="Physical Storage Capacity Check",
            passed=storage_passed,
            details=f"Required space: {added_volume:.2f} cu ft | Node available space: {node.available_storage_cu_ft + added_volume:.2f} cu ft",
            impact_metrics={
                "required_cu_ft": round(added_volume, 2),
                "available_cu_ft": round(node.available_storage_cu_ft + added_volume, 2),
                "utilization_pct": round(((node.used_storage_cu_ft) / node.max_storage_cu_ft) * 100, 1)
            }
        ))

        # 2. Budget Limit Check
        unit_cost = supplier.unit_cost if supplier else product.unit_cost
        total_cost = final_qty * unit_cost
        budget_passed = total_cost <= node.available_budget + (total_cost if len(po_ids) > 0 else 0.0)
        checks.append(ValidationCheckItem(
            check_name="Node Budget Constraint Check",
            passed=budget_passed,
            details=f"Order Total: ${total_cost:,.2f} | Node Budget Available: ${node.available_budget + total_cost:,.2f}",
            impact_metrics={
                "order_cost": round(total_cost, 2),
                "available_budget": round(node.available_budget + total_cost, 2)
            }
        ))

        # 3. Supplier MOQ Check (if buying > 0)
        moq_passed = True
        if final_qty > 0 and supplier:
            moq_passed = final_qty >= supplier.moq
            checks.append(ValidationCheckItem(
                check_name="Supplier MOQ (Minimum Order Quantity) Check",
                passed=moq_passed,
                details=f"Ordered: {final_qty} units | Supplier MOQ: {supplier.moq} units",
                impact_metrics={"moq": supplier.moq, "ordered_qty": final_qty}
            ))

        # 4. Stockout Risk Protection Check
        # Projected inventory after lead time should cover expected demand
        lead_time = supplier.lead_time_days if supplier else 3
        demand_during_lead_time = product.avg_daily_demand * lead_time
        projected_stock = product.current_stock + final_qty
        stockout_passed = projected_stock >= demand_during_lead_time
        checks.append(ValidationCheckItem(
            check_name="Stockout Risk & Coverage Buffer Check",
            passed=stockout_passed,
            details=f"Projected total stock ({projected_stock}) vs Lead Time Demand ({demand_during_lead_time:.0f} units over {lead_time} days)",
            impact_metrics={
                "days_of_inventory": round(projected_stock / product.avg_daily_demand, 1) if product.avg_daily_demand > 0 else 99,
                "lead_time_days": lead_time
            }
        ))

        all_passed = all(c.passed for c in checks)
        corrective_action = None

        if not all_passed:
            if not storage_passed:
                # Corrective action: calculate maximum quantity that fits storage
                max_fits = int(node.available_storage_cu_ft / product.unit_volume_cu_ft) if product.unit_volume_cu_ft > 0 else 0
                corrective_action = f"Feedback loop auto-adjusted quantity from {final_qty} to {max_fits} units to match exact storage availability."
            elif not budget_passed:
                max_affordable = int(node.available_budget / unit_cost) if unit_cost > 0 else 0
                corrective_action = f"Feedback loop auto-capped order to {max_affordable} units to stay within remaining budget."
            elif not moq_passed:
                corrective_action = f"Order below MOQ ({supplier.moq}). Escalated or batched with secondary node."

        summary_msg = "Agent decision passed all operational, storage, budget, and supplier validation checks." if all_passed else "Agent decision triggered feedback validation warnings or auto-adjustments."

        return ValidationOutcome(
            is_valid=all_passed,
            summary=summary_msg,
            checks=checks,
            corrective_action_taken=corrective_action
        )
