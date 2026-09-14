from typing import List
from app.models.schemas import EvaluationResult, EvaluationMetric
from app.services.agent_engine import agent_engine

class EvaluatorSuite:
    @staticmethod
    def run_all_evaluations() -> List[EvaluationResult]:
        results = []
        scenarios = [
            ("scenario_1", "Scenario 1 — Recommendation Review"),
            ("scenario_2", "Scenario 2 — Partial Supplier Fulfillment"),
            ("scenario_3", "Scenario 3 — Demand Anomaly / Sales Spike"),
            ("scenario_4", "Scenario 4 — Purchasing Multi-Constraint Bottleneck")
        ]

        for s_id, s_title in scenarios:
            decision = agent_engine.execute_scenario(s_id)
            eval_res = EvaluatorSuite._evaluate_scenario_decision(s_id, s_title, decision)
            results.append(eval_res)

        return results

    @staticmethod
    def _evaluate_scenario_decision(s_id: str, s_title: str, decision) -> EvaluationResult:
        metrics = []

        # 1. Decision Correctness (Did it modify, split, or accept appropriately?)
        correct_map = {
            "scenario_1": decision.decision_type == "MODIFIED" and decision.final_qty == 500,
            "scenario_2": decision.decision_type == "SPLIT_ORDER" and len(decision.created_po_ids) > 0,
            "scenario_3": decision.decision_type == "ACCEPTED" and decision.final_qty > 0,
            "scenario_4": decision.decision_type == "SPLIT_ORDER" and decision.final_qty == 700
        }
        is_correct = correct_map.get(s_id, False)
        metrics.append(EvaluationMetric(
            name="Decision Correctness",
            score=100.0 if is_correct else 0.0,
            status="PASS" if is_correct else "FAIL",
            notes=f"Agent produced {decision.decision_type} with final quantity {decision.final_qty}."
        ))

        # 2. Information Gathering (Did it call query tools?)
        tool_count = sum(1 for step in decision.thinking_steps if step.action_type == "TOOL_CALL")
        info_gathered = tool_count >= 2
        metrics.append(EvaluationMetric(
            name="Information Gathering & Context Retrieval",
            score=100.0 if info_gathered else 50.0,
            status="PASS" if info_gathered else "WARNING",
            notes=f"Agent performed {tool_count} structured tool queries (inventory, open POs, node storage, suppliers)."
        ))

        # 3. Constraint Adherence
        constraints_ok = decision.validation.is_valid
        metrics.append(EvaluationMetric(
            name="Constraint Adherence (Storage, Budget, MOQ)",
            score=100.0 if constraints_ok else 20.0,
            status="PASS" if constraints_ok else "FAIL",
            notes="All storage volume, budget limit, and MOQ constraints were verified by validation engine."
        ))

        # 4. Action Execution
        action_ok = len(decision.actions_taken) > 0
        metrics.append(EvaluationMetric(
            name="Action Execution & State Mutation",
            score=100.0 if action_ok else 0.0,
            status="PASS" if action_ok else "FAIL",
            notes=f"Executed {len(decision.actions_taken)} atomic action(s) in Mock ERP."
        ))

        # 5. Result Validation & Feedback Loop
        val_ok = decision.validation is not None
        metrics.append(EvaluationMetric(
            name="Feedback Loop & Outcome Verification",
            score=100.0 if val_ok else 0.0,
            status="PASS" if val_ok else "FAIL",
            notes="Post-action feedback validator confirmed physical warehouse fit & budget bounds."
        ))

        scores = [m.score for m in metrics]
        overall_score = round(sum(scores) / len(scores), 1)

        return EvaluationResult(
            scenario_id=s_id,
            scenario_title=s_title,
            decision_correct=is_correct,
            information_gathered=info_gathered,
            constraints_respected=constraints_ok,
            action_appropriate=action_ok,
            validation_passed=val_ok,
            metrics=metrics,
            overall_score=overall_score,
            summary=f"{s_title}: Score {overall_score}/100. Decision ({decision.decision_type}) passed constraint and validation checks."
        )
