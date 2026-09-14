import copy
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from app.models.schemas import Product, Supplier, PurchaseOrder, FulfillmentNode

class MockERPDatabase:
    def __init__(self):
        self.reset_data()

    def reset_data(self):
        """Reset mock database to initial state for testing scenarios."""
        self.products: Dict[str, Product] = {
            "PROD-AVO-01": Product(
                id="PROD-AVO-01",
                name="Organic Hass Avocados (Pack of 4)",
                category="Fresh Produce",
                unit_cost=3.50,
                unit_volume_cu_ft=0.08,
                current_stock=150,
                reorder_point=400,
                safety_stock=200,
                avg_daily_demand=35.0,
                forecast_30d=1050.0
            ),
            "PROD-MILK-02": Product(
                id="PROD-MILK-02",
                name="Whole Milk 1 Gallon",
                category="Dairy",
                unit_cost=4.20,
                unit_volume_cu_ft=0.15,
                current_stock=80,
                reorder_point=300,
                safety_stock=100,
                avg_daily_demand=50.0,
                forecast_30d=1500.0
            ),
            "PROD-NRG-03": Product(
                id="PROD-NRG-03",
                name="Vibe Energy Drink 12-Pack",
                category="Beverages",
                unit_cost=14.00,
                unit_volume_cu_ft=0.25,
                current_stock=40,
                reorder_point=150,
                safety_stock=50,
                avg_daily_demand=20.0,
                forecast_30d=600.0
            )
        }

        self.suppliers: Dict[str, Supplier] = {
            "SUPP-AGRO-PRIMARY": Supplier(
                id="SUPP-AGRO-PRIMARY",
                name="AgroFresh Primary Logistics",
                product_id="PROD-AVO-01",
                unit_cost=3.50,
                lead_time_days=3,
                moq=200,
                max_capacity_per_order=1000,
                reliability_score=0.95
            ),
            "SUPP-AGRO-ALT": Supplier(
                id="SUPP-AGRO-ALT",
                name="BioOrchard Express Supplier",
                product_id="PROD-AVO-01",
                unit_cost=3.85,
                lead_time_days=1,
                moq=100,
                max_capacity_per_order=500,
                reliability_score=0.98
            ),
            "SUPP-DAIRY-MAIN": Supplier(
                id="SUPP-DAIRY-MAIN",
                name="Valley Fresh Dairy",
                product_id="PROD-MILK-02",
                unit_cost=4.20,
                lead_time_days=2,
                moq=150,
                max_capacity_per_order=800,
                reliability_score=0.92
            ),
            "SUPP-BEV-DIRECT": Supplier(
                id="SUPP-BEV-DIRECT",
                name="Vibe Beverage Co Direct",
                product_id="PROD-NRG-03",
                unit_cost=14.00,
                lead_time_days=4,
                moq=50,
                max_capacity_per_order=400,
                reliability_score=0.96
            )
        }

        self.fulfillment_nodes: Dict[str, FulfillmentNode] = {
            "NODE-BOGOTA-CENTRAL": FulfillmentNode(
                id="NODE-BOGOTA-CENTRAL",
                name="Bogota Central Dark Store",
                max_storage_cu_ft=500.0,
                used_storage_cu_ft=440.0,  # 60 cu ft available (~750 avocados or less!)
                available_storage_cu_ft=60.0,
                available_budget=12500.00
            ),
            "NODE-MEDELLIN-NORTH": FulfillmentNode(
                id="NODE-MEDELLIN-NORTH",
                name="Medellin North Micro-Hub",
                max_storage_cu_ft=300.0,
                used_storage_cu_ft=100.0,
                available_storage_cu_ft=200.0,
                available_budget=4500.00  # Tight budget for Scenario 4
            )
        }

        self.purchase_orders: Dict[str, PurchaseOrder] = {
            "PO-EXISTING-101": PurchaseOrder(
                id="PO-EXISTING-101",
                product_id="PROD-AVO-01",
                supplier_id="SUPP-AGRO-PRIMARY",
                fulfillment_node="NODE-BOGOTA-CENTRAL",
                quantity=150,
                unit_price=3.50,
                total_cost=525.00,
                status="CREATED",
                created_at=(datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
                expected_delivery=(datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                notes="In-transit open order"
            ),
            "PO-PARTIAL-202": PurchaseOrder(
                id="PO-PARTIAL-202",
                product_id="PROD-AVO-01",
                supplier_id="SUPP-AGRO-PRIMARY",
                fulfillment_node="NODE-BOGOTA-CENTRAL",
                quantity=500,
                unit_price=3.50,
                total_cost=1750.00,
                status="PARTIALLY_FULFILLED",
                created_at=(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
                expected_delivery=datetime.now().strftime("%Y-%m-%d"),
                notes="Supplier notified short delivery: only 250 units ready for pickup"
            )
        }

    # Query helper tools
    def get_product(self, product_id: str) -> Optional[Product]:
        return self.products.get(product_id)

    def list_suppliers_for_product(self, product_id: str) -> List[Supplier]:
        return [s for s in self.suppliers.values() if s.product_id == product_id]

    def get_node(self, node_id: str) -> Optional[FulfillmentNode]:
        return self.fulfillment_nodes.get(node_id)

    def list_open_pos(self, product_id: str, node_id: str) -> List[PurchaseOrder]:
        return [
            po for po in self.purchase_orders.values()
            if po.product_id == product_id and po.fulfillment_node == node_id and po.status in ["CREATED", "PARTIALLY_FULFILLED"]
        ]

    def create_po(self, product_id: str, supplier_id: str, node_id: str, quantity: int, notes: str = "") -> PurchaseOrder:
        product = self.get_product(product_id)
        supplier = self.suppliers.get(supplier_id)
        node = self.get_node(node_id)

        if not product or not supplier or not node:
            raise ValueError("Invalid Product, Supplier, or Node ID")

        po_id = f"PO-GEN-{len(self.purchase_orders) + 101}"
        total_cost = round(quantity * supplier.unit_cost, 2)
        delivery_date = (datetime.now() + timedelta(days=supplier.lead_time_days)).strftime("%Y-%m-%d")

        new_po = PurchaseOrder(
            id=po_id,
            product_id=product_id,
            supplier_id=supplier_id,
            fulfillment_node=node_id,
            quantity=quantity,
            unit_price=supplier.unit_cost,
            total_cost=total_cost,
            status="CREATED",
            created_at=datetime.now().strftime("%Y-%m-%d"),
            expected_delivery=delivery_date,
            notes=notes
        )

        self.purchase_orders[po_id] = new_po
        # Update node storage/budget reservation
        volume_needed = quantity * product.unit_volume_cu_ft
        node.used_storage_cu_ft += volume_needed
        node.available_storage_cu_ft = max(0.0, node.max_storage_cu_ft - node.used_storage_cu_ft)
        node.available_budget = max(0.0, node.available_budget - total_cost)

        return new_po

    def update_po_status(self, po_id: str, status: str, notes: str = "") -> Optional[PurchaseOrder]:
        if po_id in self.purchase_orders:
            po = self.purchase_orders[po_id]
            po.status = status
            if notes:
                po.notes += f" | {notes}"
            return po
        return None

# Singleton instance
db = MockERPDatabase()
