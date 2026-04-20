import asyncio
import os
import subprocess
from contextlib import asynccontextmanager
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, Text, Float, JSON
import httpx

DATABASE_URL = "sqlite+aiosqlite:///./brasil_data_hub.db"

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)
    content = Column(Text)
    sources = Column(JSON, default=list)
    created_at = Column(Float, default=lambda: datetime.now().timestamp())


class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True)
    title = Column(String)
    created_at = Column(Float, default=lambda: datetime.now().timestamp())
    updated_at = Column(Float, default=lambda: datetime.now().timestamp())


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@asynccontextmanager
async def get_db():
    async with async_session() as session:
        yield session


app = FastAPI(title="Brasil Data Hub API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    session_id: str
    sources: List[dict]


class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: float


class SessionsResponse(BaseModel):
    sessions: List[SessionResponse]


MCP_SERVER_URL = os.environ.get("MCP_SERVER_URL", "http://localhost:8001")


async def call_mcp_tools(user_message: str) -> tuple[str, List[dict]]:
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{MCP_SERVER_URL}/v1/mcp/tools/call",
                json={
                    "name": "planejar_consulta",
                    "arguments": {"consulta": user_message}
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", [{}])[0].get("text", "")
                
                tools_response = await client.post(
                    f"{MCP_SERVER_URL}/v1/mcp/tools-call",
                    json={
                        "name": "executar_lote",
                        "arguments": {"consulta": user_message}
                    }
                )
                
                if tools_response.status_code == 200:
                    exec_data = tools_response.json()
                    exec_content = exec_data.get("content", [{}])[0].get("text", "")
                    if exec_content:
                        content = exec_content
                
                sources = [{"tool": "mcp-brasil", "has_data": True}]
                return content, sources
            else:
                return f"Erro ao conectar com MCP server: {response.status_code}", []
                
    except httpx.ConnectError:
        return "MCP server não está rodando. Inicie com: fastmcp run mcp_brasil.server:mcp --transport http --port 8001", []
    except Exception as e:
        return f"Erro na consulta: {str(e)}", []


@app.on_event("startup")
async def startup():
    await init_db()


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or f"session_{datetime.now().timestamp()}"

    async with get_db() as db:
        session = await db.get(Session, session_id)
        if not session:
            session = Session(id=session_id, title=request.message[:50])
            db.add(session)
            await db.commit()

        user_msg = Message(
            session_id=session_id,
            role="user",
            content=request.message
        )
        db.add(user_msg)
        await db.commit()

        response_text, sources = await call_mcp_tools(request.message)

        assistant_msg = Message(
            session_id=session_id,
            role="assistant",
            content=response_text,
            sources=sources
        )
        db.add(assistant_msg)

        session.updated_at = datetime.now().timestamp()
        await db.commit()

    return ChatResponse(message=response_text, session_id=session_id, sources=sources)


@app.get("/sessions", response_model=SessionsResponse)
async def get_sessions():
    async with get_db() as db:
        result = await db.execute(
            Session.__table__.select().order_by(Session.updated_at.desc()).limit(50)
        )
        rows = result.fetchall()
        sessions = [
            SessionResponse(id=row[0], title=row[1], created_at=row[2])
            for row in rows
        ]
    return SessionsResponse(sessions=sessions)


@app.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str):
    async with get_db() as db:
        result = await db.execute(
            Message.__table__.select()
            .where(Message.session_id == session_id)
            .order_by(Message.created_at)
        )
        rows = result.fetchall()
        messages = [
            {
                "id": row[0],
                "role": row[2],
                "content": row[3],
                "sources": row[4],
                "created_at": row[5]
            }
            for row in rows
        ]
    return messages


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)