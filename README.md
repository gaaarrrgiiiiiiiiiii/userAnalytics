<div align="center">

# 📊 UserAnalytics

**A full-stack, self-hosted behavioral analytics platform** — track every click, scroll, and session across a live e-commerce demo site, then visualize it in a real-time dashboard.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

</div>

---

## ✨ What This Project Does

UserAnalytics is a **product analytics system built from scratch**, inspired by tools like Mixpanel and Amplitude. It consists of four services that work together:

| Service | Technology | Role |
|---|---|---|
| **Demo Site** (tracker) | Vanilla HTML/CSS/JS | A real e-commerce storefront that embeds the tracker |
| **Analytics Script** | Vanilla JS | Captures clicks, page views, cart events, and sessions |
| **Backend API** | Python / Flask | Receives events, stores them in MongoDB, exposes analytics data |
| **Dashboard** | Next.js / TypeScript | Real-time KPIs, heatmaps, session replays, and event funnels |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         UserAnalytics                                │
│                                                                      │
│   ┌───────────────┐   JS Events   ┌──────────────────┐              │
│   │   Demo Site   │ ───────────►  │   Flask API       │              │
│   │  (Port 8080)  │               │   (Port 5000)     │              │
│   └───────────────┘               └────────┬─────────┘              │
│                                            │ Store                  │
│   ┌───────────────┐   REST API    ┌────────▼─────────┐              │
│   │   Dashboard   │ ◄──────────── │    MongoDB        │              │
│   │  (Port 3000)  │               │   (Port 27017)    │              │
│   └───────────────┘               └──────────────────┘              │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker Compose)
- Git

### 1 · Clone the repository

```bash
git clone https://github.com/your-username/userAnalytics.git
cd userAnalytics
```

### 2 · Configure environment variables

```bash
cp backend/.env.example backend/.env
```

The defaults work out of the box for local development. Edit `backend/.env` only if you want to point to a remote MongoDB instance.

### 3 · Start all services

```bash
docker compose up --build
```

Docker will spin up all four services. On first run it will pull images and install dependencies — this takes ~2 minutes.

### 4 · Open in your browser

| URL | Service |
|---|---|
| `http://localhost:8080` | 🛒 Demo E-Commerce Site |
| `http://localhost:3000` | 📊 Analytics Dashboard |
| `http://localhost:5000` | 🔌 Backend API (JSON) |

---

## 📁 Project Structure

```
userAnalytics/
├── tracker/                  # Demo e-commerce site
│   ├── index.html            # Home page
│   ├── products.html         # Product listing
│   ├── cart.html             # Shopping cart
│   ├── about.html            # About page
│   ├── contact.html          # Contact page
│   ├── styles.css            # Shared design system
│   └── cf-analytics.js       # 📌 The tracking script
│
├── backend/                  # Flask REST API
│   ├── app.py                # Application entry point
│   ├── db.py                 # MongoDB connection & indexes
│   ├── routes/
│   │   └── events.py         # Event ingestion & analytics endpoints
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── dashboard/                # Next.js analytics dashboard
│   ├── app/                  # App Router pages & layouts
│   ├── components/           # Reusable React components
│   ├── lib/                  # API client utilities
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Orchestrates all four services
└── project_architecture.md  # Detailed technical architecture doc
```

---

## 🔬 How the Tracker Works

The tracking script (`cf-analytics.js`) is a **~6KB lightweight snippet** that auto-initialises on page load. It:

1. **Generates a persistent session ID** stored in `sessionStorage`
2. **Fires a `page_view` event** on every navigation
3. **Listens for `data-track` attributes** on any HTML element and fires a named event on click
4. **Captures cart events** (`add_to_cart`, `buy_now`) with product metadata
5. **Batches and POSTs** events to `/api/events` with retry logic

To track any element, simply add the attribute:

```html
<button data-track="hero_cta_clicked">Get Started</button>
```

---

## 📈 Dashboard Features

| Feature | Description |
|---|---|
| **KPI Cards** | Total sessions, page views, events, and unique users |
| **Live Event Stream** | Real-time feed of incoming events |
| **Event Breakdown** | Donut chart of event type distribution |
| **Session Table** | Per-session breakdown with timestamps and event counts |
| **Click Heatmap** | Visual overlay of where users click most on each page |
| **Conversion Funnel** | Visualise drop-off from `page_view` → `add_to_cart` → `buy_now` |

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/api/events` | Ingest a new event |
| `GET` | `/api/analytics/kpis` | Aggregate KPI metrics |
| `GET` | `/api/analytics/sessions` | Paginated session list |
| `GET` | `/api/analytics/events` | Filtered event list |
| `GET` | `/api/analytics/heatmap` | Click coordinates by page |

---

## 🛠️ Tech Stack

**Frontend (Demo Site)**
- Vanilla HTML5 / CSS3 / JavaScript
- Custom design system with CSS variables
- Lucide icons, Inter font via Google Fonts

**Backend**
- Python 3.11 + Flask 3
- Flask-CORS, PyMongo
- MongoDB 7 with indexed collections

**Dashboard**
- Next.js 15 (App Router) + TypeScript
- Recharts for data visualisation
- Real-time polling via SWR

**Infrastructure**
- Docker + Docker Compose
- Nginx (serves the static demo site)

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
Built with ♥ · Powered by Docker, Flask & Next.js
</div>
