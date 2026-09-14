# Safety fix for environments with typing monkeypatch issues
try:
    import pydantic._internal._core_utils as core_utils
    core_utils.typing_objects.is_typealiastype = lambda x: False
except Exception:
    pass

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="Rappi AI Purchasing Agent API",
    description="Full-stack AI Agent system for purchasing decisions, feedback validation, and scenario evaluation.",
    version="1.0.0"
)

# Enable CORS for frontend development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Rappi AI Purchasing Agent API",
        "version": "1.0.0",
        "scenarios": ["scenario_1", "scenario_2", "scenario_3", "scenario_4"]
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
