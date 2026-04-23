# Instalação Local - Greg

Agregador web para consultar 41 APIs públicas brasileiras.

---

## Requisitos

- Python 3.11+
- Node.js 18+

---

## Passo 1: MCP Server (Terminal 1)

```bash
cd ~/GitHub/projetos/greg

# Criar ambiente virtual
python3 -m venv venv-mcp

# Ativar
source venv-mcp/bin/activate

# Instalar
pip install --upgrade pip
pip install mcp-brasil

# Iniciar
python -m mcp_brasil.server --transport http --port 8001
```

---

## Passo 2: Backend (Terminal 2)

```bash
cd ~/GitHub/projetos/greg/backend

# Criar ambiente virtual
python3 -m venv venv

# Ativar
source venv/bin/activate

# Instalar
pip install --upgrade pip
pip install -r requirements.txt

# Iniciar
uvicorn main:app --reload
```

---

## Passo 3: Frontend (Terminal 3)

```bash
cd ~/GitHub/projetos/greg/frontend
npm install
npm run dev
```

---

## Acessar

- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **MCP:** http://localhost:8001

---

## Exemplos de perguntas

| Área | Pergunta |
|------|----------|
| Economia | "Qual a taxa Selic atual?" |
| Legislativo | "Projetos de lei sobre IA em 2024" |
| Saúde | "Hospitais em São Paulo" |

---

## Variáveis de Ambiente (Opcional)

Crie `backend/.env`:
```bash
TRANSPARENCIA_API_KEY=sua-chave
DATAJUD_API_KEY=sua-chave
```

38 APIs funcionam sem chaves.

---

## Comandos Rápidos

```bash
# Terminal 1 - MCP Server
cd ~/GitHub/projetos/greg
source venv-mcp/bin/activate
python -m mcp_brasil.server --transport http --port 8001

# Terminal 2 - Backend
cd ~/GitHub/projetos/greg/backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3 - Frontend
cd ~/GitHub/projetos/greg/frontend
npm run dev
```
