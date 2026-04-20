# SPEC.md - Agregador Web mcp-brasil

## 1. Project Overview

**Nome:** Brasil Data Hub
**Tipo:** Web Application (Full-stack)
**Descrição:** Agregador web que permite consultar dados de 41 APIs públicas brasileiras via interface de chat conversacional

## 2. Tech Stack

- **Frontend:** React + Vite + TailwindCSS
- **Backend:** FastAPI + Python
- **MCP Integration:** mcp-brasil
- **Database:** SQLite (para histórico)
- **Container:** Docker + Docker Compose

## 3. UI/UX Specification

### Cores (Dark Theme)

- **Background:** `#0d1117`
- **Surface:** `#161b22`
- **Border:** `#30363d`
- **Primary:** `#58a6ff`
- **Text:** `#e6edf3`

## 4. Funcionalidades

- Chat Interface conversacional
- Consulta múltiplas APIs em paralelo
- Histórico de conversas (SQLite)
- Seletor de áreas temáticas (11 áreas)

## 5. APIs Disponíveis

| Área | Fontes |
|------|--------|
| Economia | Bacen, BNDES |
| IBGE | Estados, municípios |
| Legislativo | Câmara, Senado |
| Transparência | Portal, TCUs |
| Judiciário | DataJud |
| Eleitoral | TSE, Meta Ads |
| Meio Ambiente | INPE, ANA |
| Saúde | CNES, ANVISA |
| Segurança | SINESP |
| Compras | PNCP |
| Utilitários | BrasilAPI |