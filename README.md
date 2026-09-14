# Autonomous AI Purchasing Agent — Rappi Assignment

A full-stack AI Purchasing Agent system built for quick-commerce and retail supply chain operations. The agent autonomously investigates inventory state, forecast shifts, supplier capacity, storage volume, and financial constraints to make, execute, and validate purchasing decisions.

---

## 🎥 Working Demo Recording

A full video walkthrough demonstrating the application in action:

https://github.com/user-attachments/assets/demo_recording.mp4

* **[Direct Video Link / Watch Raw MP4](https://github.com/hansikadev/Rappi_assign/raw/main/demo_recording.mp4)**

<video width="100%" controls>
  <source src="demo_recording.mp4" type="video/mp4">
</video>

---

## 🌟 Key System Highlights & Architecture

```
                                  ┌────────────────────────┐
                                  │   React + Vite UI      │
                                  │   (Command Center)     │
                                  └───────────┬────────────┘
                                              │ REST API / CORS
                                  ┌───────────▼────────────┐
                                  │  FastAPI Agent Server  │
                                  └─────┬──────────────┬───┘
                                        │              │
                    ┌───────────────────▼──┐        ┌──▼───────────────────┐
                    │  AIAgentEngine       │        │ FeedbackValidator    │
                    │  - Tool Calling      │        │ - Storage Vol Check  │
                    │  - Step Reasoning    │        │ - Budget Check       │
                    │  - PO Mutation       │        │ - MOQ Verification   │
                    └───────────┬──────────┘        └──┬───────────────────┘
                                │                      │
                                ┌──────────────────────┐
                                │   Mock ERP Engine    │
                                │ (Stateful DB Mock)   │
                                └──────────────────────┘
```

- **Segregated Architecture**:
  - `backend/`: **FastAPI** server with Pydantic models, Tool Execution framework, Mock ERP state manager, Feedback Loop Validator, and Evaluation Suite.
  - `frontend/`: Modern **React + Vite + Tailwind** dashboard with dark-mode glassmorphism styling, real-time agent reasoning trace, decision review, feedback loop evidence, and evaluation runner.

- **Zero Friction Setup**: Works out of the box with built-in heuristic reasoning fallback. Supports live LLM providers (OpenAI / Gemini API keys) configurable via the UI or `.env`.

---

## 📦 Segregated Directory Structure

```
rappi_assign/
├── demo_recording.mp4                 # Working video demo recording
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI application entry point
│   │   ├── api/
│   │   │   └── routes.py             # Agent execution, ERP state & Evaluation endpoints
│   │   ├── models/
│   │   │   └── schemas.py            # Dataclass schemas (PO, Product, Constraints, Decision, Evaluation)
│   │   └── services/
│   │       ├── agent_engine.py       # Agent tool calling & reasoning engine
│   │       ├── erp_mock.py           # Stateful Mock ERP (Inventory, Suppliers, POs, Warehouses)
│   │       ├── feedback_validator.py # Post-action verification & outcome correction loop
│   │       └── evaluator.py          # Benchmark test suite runner
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx            # Top navigation & LLM API key modal
│   │   │   ├── ScenarioSelector.jsx  # Dynamic purchasing simulator & presets
│   │   │   ├── AgentChatBox.jsx      # Interactive buyer copilot chat input
│   │   │   ├── DecisionView.jsx      # Decision rationale, quantity delta & created POs
│   │   │   ├── FeedbackLoopView.jsx  # Outcome verification matrix & auto-correction alerts
│   │   │   ├── InventoryDashboard.jsx# Real-time ERP state & warehouse capacity gauges
│   │   │   └── EvaluationSuiteView.jsx# Automated benchmark grading suite
│   │   ├── App.jsx                   # Main layout with tab navigation
│   │   ├── index.css                 # Glassmorphism design system & animations
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md
```

---

## 🎯 Scenarios Covered (All 4 Scenarios Implemented)

### Scenario 1 — Purchase Recommendation Review
- **Problem**: Purchasing system recommends buying **800 units** of Organic Hass Avocados.
- **Agent Reasoning**: Checks stock (150 units), open POs (150 units), and warehouse storage cap (**60 cu ft**).
- **Decision**: **MODIFIES** recommendation from 800 to **500 units**. 800 units require 64 cu ft (exceeding storage).
- **Feedback Validation**: Confirms 500 units fit available volume and budget limits without stockout risk.

### Scenario 2 — Supplier Cannot Fulfil the Purchase
- **Problem**: PO created for **500 units**, but primary supplier informs only **250 units** can be supplied.
- **Agent Reasoning**: Accepts partial delivery (250 units) and searches alternate supplier directory. Finds `SUPP-AGRO-ALT` (BioOrchard Express, 1-day express delivery).
- **Decision**: **SPLIT_ORDER** — Issues supplemental PO for **250 units** to express supplier.
- **Feedback Validation**: Validates combined inventory coverage through lead time.

### Scenario 3 — Demand / Forecast Has Changed
- **Problem**: POS sales surge by **+180%** (from 35 to 98 units/day), reducing Days-of-Inventory (DOI) to a critical **3.0 days**.
- **Agent Reasoning**: Detects demand velocity anomaly, recalculates safety stock buffers, and computes emergency replenishment volume.
- **Decision**: **ACCEPTED** — Issues Emergency Purchase Order for **450 units**.
- **Feedback Validation**: Confirms DOI is restored to 7.6 days.

### Scenario 4 — Purchasing Constraint
- **Problem**: Buyer requests **1,000 units** of Whole Milk, but supplier max single-order capacity is **800 units**.
- **Agent Reasoning**: Detects supplier single-order capacity bottleneck.
- **Decision**: **SPLIT_ORDER** — Formulates a phased delivery strategy: Phase 1 (**700 units** immediately) and Phase 2 (**300 units** in 5 days).
- **Feedback Validation**: Verifies Phase 1 PO meets supplier MOQ and single-order limits.

---

## 🔁 Feedback & Validation Design

The agent does not blindly execute decisions. Every action undergoes post-condition validation in `FeedbackValidator`:

1. **Storage Capacity Check**: Calculates total physical volume (`cu_ft`) of order and compares against available node space.
2. **Budget Cap Check**: Verifies total order value against remaining node budget.
3. **Supplier Constraints**: Ensures order quantity meets MOQ and does not exceed max capacity per order.
4. **Stockout Risk Check**: Evaluates projected inventory cover against supplier lead time demand.
5. **Auto-Correction Loop**: If validation fails (e.g., storage overflow), the feedback loop auto-adjusts the order quantity to fit exact storage boundaries or escalates to human approval.

---

## ⚡ Quickstart & Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Run Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will run at `http://localhost:8000`.

### 2. Run Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Frontend application will open at `http://localhost:5173`.

---

## 📊 Evaluation Matrix

To run the automated benchmark evaluation:
1. Open the UI at `http://localhost:5173`.
2. Click the **"Automated Evaluation Suite"** tab.
3. Click **"Run Full Benchmark Suite"** (or query `GET /api/evaluations`).

Grades each scenario across 5 dimensions:
- Decision Correctness
- Information Gathering & Context Retrieval
- Constraint Adherence
- Action Execution & State Mutation
- Feedback Loop & Outcome Verification
