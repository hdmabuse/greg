# Instalação Local - Greg

Agregador web para consultar 41 APIs públicas brasileiras.

---

## Requisitos

- Python 3.11+
- Node.js 18+
- Docker (opcional)

---

## Passo 1: Preparar o Diretório

```bash
cd ~/GitHub/projetos/greg
```

---

## Passo 2: Instalar o MCP Server (Terminal 1)

```bash
cd ~/GitHub/projetos/greg

# Criar ambiente virtual
python3 -m venv venv-mcp

# Ativar ambiente virtual
source venv-mcp/bin/activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install mcp-brasil

# Iniciar o servidor MCP
python -m mcp_brasil.server --transport http --port 8001
```

---

## Passo 2: Instalar o MCP Server (Terminal 1)

```bash
cd ~/GitHub/projetos/greg

# Criar ambiente virtual
cd ~/GitHub/projetos/greg
python3 -m venv venv-mcp

# Ativar
source venv-mcp/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install mcp-brasil

# Iniciar o servidor MCP
python -m mcp_brasil.server --transport http --port 8001
```

O MCP server ficará disponível em: http://localhost:8001

---

## Passo 3: Instalar o Backend (Terminal 2)

```bash
cd ~/GitHub/projetos/greg/backend

# Criar ambiente virtual (se não criou)
python3 -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Atualizar pip
pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Iniciar o servidor
uvicorn main:app --reload
```

O backend ficará disponível em: http://localhost:8000

---

## Passo 4: Instalar o Frontend (Terminal 3)

```bash
cd ~/GitHub/projetos/greg/frontend

# Instalar dependências
npm install

# Iniciar o servidor
npm run dev
```

O frontend ficará disponível em: http://localhost:5173

---

## Passo 5: Usar a Aplicação

1. Abra o navegador em http://localhost:5173
2. Digite uma pergunta em linguagem natural

### Exemplos de perguntas:

| Área | Pergunta |
|------|----------|
| Economia | "Qual a taxa Selic atual?" |
| Economia | "Qual o IPCA dos últimos 12 meses?" |
| Legislativo | "Projetos de lei sobre IA em 2024" |
| Legislativo | "Liste os deputados do PT" |
| IBGE | "População de São Paulo" |
| Transparência | "Contratos do governo federal em 2024" |
| Saúde | "Hospitais em São Paulo" |
| Meio Ambiente | "Focos de queimada no Brasil" |

---

## Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` em `backend/`:

```bash
# backend/.env
TRANSPARENCIA_API_KEY=sua-chave
DATAJUD_API_KEY=sua-chave
META_ACCESS_TOKEN=seu-token
```

38 APIs funcionam **sem** necessidade de chaves.

---

## Com Docker (Alternativo)

```bash
cd ~/GitHub/projetos/greg
docker-compose up --build
```

---

## Solução de Problemas

### "externally-managed-environment"
Sempre use ambientes virtuais (venv) conforme mostrado acima.

### "externally-managed-environment"
Crie e ative um ambiente virtual:
```bash
cd ~/GitHub/projetos/greg
python3 -m venv venv-mcp
source venv-mcp/bin/activate
pip install mcp-brasil
python -m mcp_brasil.server --transport http --port 8001
```

### Erro ao instalar dependências Python
```bash
pip3 install --upgrade pip
pip3 install -r requirements.txt
```

### Erro ao instalar dependências Node
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Estrutura dos Serviços

```
┌─────────────────────────────────────────────────┐
│              http://localhost:5173             │
│                   (Frontend React)              │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              http://localhost:8000               │
│                   (FastAPI)                      │
└─────────────────────┬───────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────┐
│              http://localhost:8001               │
│              (MCP Server - mcp-brasil)           │
│     Consulta 41 APIs públicas brasileiras        │
└─────────────────────────────────────────────────┘
```

---

## Parar os Servidores

Pressione `Ctrl+C` em cada terminal ou:

```bash
# Se usou Docker
docker-compose down
```

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
