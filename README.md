# 💧 AguaFlow

> Plataforma de analisis empresarial con metodologia AGUA FLOW. 11 conectores integrados.

![Stack](https://img.shields.io/badge/Node.js-22-green) ![Stack](https://img.shields.io/badge/React-19-blue) ![Stack](https://img.shields.io/badge/TypeScript-5.3-blue) ![Stack](https://img.shields.io/badge/PostgreSQL-16-blue) ![License](https://img.shields.io/badge/license-MIT-green)

---

## 📁 Estructura del Proyecto

```
aguaflow/
├── backend/                    # API REST - Node.js + TypeScript + Prisma
│   ├── src/
│   │   ├── index.ts            # Entry point
│   │   ├── routes/             # API routes
│   │   ├── controllers/        # Logica empresarial
│   │   ├── connectors/         # 11 integraciones externas
│   │   │   ├── github.connector.ts
│   │   │   ├── notion.connector.ts
│   │   │   ├── linear.connector.ts
│   │   │   ├── slack.connector.ts
│   │   │   ├── jira.connector.ts
│   │   │   ├── gmail.connector.ts
│   │   │   ├── drive.connector.ts
│   │   │   ├── asana.connector.ts
│   │   │   ├── trello.connector.ts
│   │   │   ├── figma.connector.ts
│   │   │   └── zapier.connector.ts
│   │   ├── services/           # Analisis AGUA FLOW
│   │   ├── models/             # Empresas, metricas, benchmarks
│   │   └── webhooks/           # Sincronizacion en tiempo real
│   ├── prisma/
│   │   └── schema.prisma       # BD empresarial
│   └── .env.example
├── frontend-web/              # React + TailwindCSS + Dashboards
│   └── src/
│       ├── pages/             # Empresas, Metricas, Conectores, Roadmap
│       ├── components/        # Charts, KPI cards, matriz AGUA FLOW
│       └── stores/            # Estado global
├── docker-compose.yml
└── README.md
```

---

## 🌊 Metodologia AGUA FLOW

| Letra | Dimension | Descripcion |
|-------|-----------|-------------|
| A | Agilidad | Velocidad de adaptacion al cambio |
| G | Gestion | Calidad de procesos internos |
| U | Usuarios | Experiencia y satisfaccion del cliente |
| A | Arquitectura | Solidez tecnologica y escalabilidad |
| F | Flujo | Eficiencia del flujo de trabajo |
| L | Liderazgo | Capacidad de direccion y decision |
| O | Optimizacion | Mejora continua de recursos |
| W | Wins | Resultados y logros obtenidos |

---

## 🔗 Conectores Integrados (11)

| # | Conector | Tipo | Datos que extrae |
|---|----------|------|------------------|
| 1 | GitHub | Dev | Repos, commits, PRs, issues |
| 2 | Notion | PM | Docs, bases de datos, pages |
| 3 | Linear | PM | Issues, sprints, ciclos |
| 4 | Slack | Comunicacion | Mensajes, canales, usuarios |
| 5 | Jira | PM | Tickets, sprints, velocity |
| 6 | Gmail | Email | Threads, labels, respondidos |
| 7 | Drive | Storage | Docs, permisos, actividad |
| 8 | Asana | PM | Tareas, proyectos, timeline |
| 9 | Trello | PM | Boards, cards, listas |
| 10 | Figma | Diseno | Proyectos, componentes, versiones |
| 11 | Zapier | Automatizacion | Workflows, triggers, acciones |

---

## 🚀 Setup Rapido

### 1. Clonar
```bash
git clone https://github.com/DEVBU93/aguaflow.git
cd aguaflow
```

### 2. Base de Datos
```bash
docker-compose up -d
```

### 3. Backend
```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev  # API en http://localhost:3001
```

### 4. Frontend
```bash
cd frontend-web
npm install
npm run dev  # App en http://localhost:5174
```

---

## 🐺 La Manada - DEVBU93

Parte del ecosistema MOS (Manada OS). Integrado con DevBuPlaytime y MOS Hub.
