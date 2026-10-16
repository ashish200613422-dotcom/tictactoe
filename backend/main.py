from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from rules.routes import router as rules_router

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(rules_router)
