<p align="center">
  <img src="ShareNet/public/favicon.svg" alt="ShareNet" width="80" />
</p>

<h1 align="center">ShareNet</h1>

<p align="center">
  <strong>ML-Powered Campus Sharing Economy Platform</strong><br/>
  A production-grade, real-time marketplace where verified college students rent, sell, give, recover lost items, and fulfill community requests — powered by intelligent recommendations and event-driven architecture.
</p>

<p align="center">
  <a href="https://sharenet-web-1.onrender.com"><img src="https://img.shields.io/badge/🚀_LIVE_DEMO-sharenet--web--1.onrender.com-7c3aed?style=for-the-badge" alt="Live Demo" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-Real--time-010101?logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
</p>

---

## 🔗 Live Demo & Access

> **Live App:** [https://sharenet-web-1.onrender.com](https://sharenet-web-1.onrender.com)

> **Note for Judges & Evaluators:** Gmail (`@gmail.com`) sign-up is temporarily enabled for evaluation and testing purposes. This allows judges to register and explore the full platform without needing a `.edu` or `.ac.in` email. This access will be disabled after the evaluation period. In production, only verified college email domains are permitted.

---

## The Problem We Solve

Every semester across Indian and global campuses:

- Students **spend thousands** on items they only need for weeks (projectors, books, lab equipment)
- **Lost belongings go unclaimed** because there's no centralized, trusted recovery system
- There is **no verified, college-scoped** platform — generic marketplaces (OLX, Facebook groups) have zero identity verification, no trust systems, and no campus boundaries
- Students who **need specific items** have no way to broadcast that demand to peers who might have them

**Result:** Wasted money, wasted resources, broken trust, and a fragmented campus experience.

## Our Solution

**ShareNet** transforms every campus into a self-sustaining circular economy. It combines a **three-mode marketplace**, a **verified lost & found system**, a **community wanted board**, and **ML-powered recommendations** — all scoped by college domain and backed by a behavioral trust engine.

Unlike generic platforms, ShareNet enforces trust at the **infrastructure level**: OTP-verified campus emails, domain-scoped item visibility, behavioral trust scores, and structured transaction lifecycles with dispute resolution.

---

## One Platform, Every Campus — Fully Isolated

ShareNet is not a single shared marketplace. It is a **multi-tenant platform where every college operates as an independent, isolated ecosystem** — all from a single deployment.

```
┌─────────────────────────────────────────────────────────────────┐
│                     ShareNet (Single Deployment)                │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  IIIT       │  │  IIT        │  │  NIT        │   ...100+    │
│  │  Lucknow    │  │  Bombay     │  │  Trichy     │   colleges   │
│  │             │  │             │  │             │              │
│  │ Items       │  │ Items       │  │ Items       │              │
│  │ Users       │  │ Users       │  │ Users       │              │
│  │ Lost&Found  │  │ Lost&Found  │  │ Lost&Found  │              │
│  │ Wanted      │  │ Wanted      │  │ Wanted      │              │
│  │ Trust Scores│  │ Trust Scores│  │ Trust Scores│              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│       ↕ Zero data leakage between campuses ↕                    │
└─────────────────────────────────────────────────────────────────┘
```

**How it works:**

| Aspect | Implementation |
|--------|---------------|
| **Identity Scoping** | User's `collegeDomain` is extracted from their verified email at registration (e.g., `iiitl.ac.in`, `iitb.ac.in`) |
| **Data Isolation** | All item queries, recommendations, and feeds are filtered by `collegeDomain` — a student at IIIT Lucknow never sees items listed at IIT Bombay |
| **Automatic Onboarding** | New colleges are onboarded the moment a student signs up with a valid `.edu` / `.ac.in` / `.edu.in` domain — no manual setup required |
| **Independent Ecosystems** | Each campus has its own marketplace, lost & found board, wanted board, trust scores, and transaction history |
| **Scalability** | Adding a new campus costs zero infrastructure — the platform scales horizontally by college domain without any code or configuration changes |

**Why this matters:** A student at IIIT Lucknow sees only items, lost posts, and wanted requests from IIIT Lucknow. This keeps the experience hyperlocal, relevant, and trustworthy — exactly how a campus community should work. And yet, the entire system runs on a single deployment, making it operationally simple and cost-effective to scale to hundreds of colleges.

> **100+ Indian college domains supported out of the box** — IIITs, IITs, NITs, and more. New domains are auto-detected or can be added via [GitHub Issues](https://github.com/Pranilash/ShareNet-Web/issues).

---

## Platform Highlights at a Glance

| Capability | What It Does | Why It Matters |
|:-----------|:-------------|:---------------|
| **ML-Powered Recommendations** | Scores items using user behavior, category affinity, recency, and trust signals | Personalized discovery — users find what they need faster |
| **Three-Mode Marketplace** | Rent / Sell / Give in a single listing flow | Covers every sharing use case on campus |
| **Instant Claim Queues** | Fair, first-come queue system for free items | Eliminates race conditions and favoritism |
| **Lost & Found + Verification** | Multi-step claim flow with owner-set security questions | Prevents false claims; only verified owners recover items |
| **Wanted Board + Offers** | Students post needs; peers make competing offers | Demand-driven supply — solves the "I can't find it" problem |
| **Real-Time Rich Chat** | Text, images, GPS location, meetup proposals — per transaction | No need for external messaging; everything stays in context |
| **Behavioral Trust Scores** | 0–100 score updated from real transaction outcomes | Self-regulating community; trust is earned, not claimed |
| **Full Transaction Lifecycle** | Request → Agreement → Active → Return → Complete (with disputes) | Structured accountability from start to finish |
| **OTP-Verified College Scoping** | 6-digit OTP via Resend; items scoped to `.edu` / `.ac.in` domains | Only real students; only your campus |
| **Automated Reminders & Alerts** | Cron-based daily checks for upcoming returns and overdue items | Reduces late returns; protects both parties |

---

## Feature Deep Dive

### 1. ML-Powered Recommendation Engine

ShareNet's recommendation system goes beyond simple filtering. It implements a **multi-signal scoring model** that learns from user behavior:

```
Score = CategoryAffinity(3) + TrustSignal(1) + ModeRelevance(1) + RecencyBoost(2)
```

| Signal | Weight | How It Works |
|--------|--------|-------------|
| **Category Affinity** | +3 | Analyzes user's past requests and listings to build a category preference vector |
| **Owner Trust Signal** | +1 | Prioritizes items from high-trust owners (score > 70) |
| **Mode Relevance** | +1 | Boosts rent/sell items (higher engagement intent) |
| **Recency Boost** | +2 | Surfaces items listed within the last 7 days |

Items are scored, ranked, and the top 6 are surfaced as **"Picked for You"** on the browse page — each with a visual "Recommended" badge. Recommended items are deduplicated from the main feed to prevent redundancy.

**Why this matters:** Users see relevant items immediately instead of scrolling through hundreds of listings. This drives engagement and faster transactions.

---

### 2. Three-Mode Marketplace with Instant Claims

Every item listing supports one of three modes:

| Mode | Use Case | Example |
|------|----------|---------|
| **Rent** | Temporary use with return date | "Borrow my DSLR for the weekend — ₹200/day" |
| **Sell** | Permanent transfer | "Selling my Data Structures textbook — ₹150" |
| **Give** | Free distribution | "Giving away my old hoodie — free to claim" |

**Instant Claim** (for Give mode): Owners can enable a queue-based system where users join a claim queue instantly without owner approval. The system enforces `maxClaimers` limits — once the queue is full, the item shows "Fully Claimed." This eliminates manual review overhead for high-demand free items.

**Counter-Offer System:** Owners can respond to requests with modified terms. Full negotiation history is preserved, creating a transparent bargaining trail.

---

### 3. Lost & Found with Multi-Step Verification

This isn't a simple "post and hope" system. ShareNet implements a **structured verification pipeline**:

```
Report → Claim Submitted → Verification Questions Sent → Answers Reviewed
  → Claim Verified → Chat Opens → Meetup Coordinated → Resolved
```

- **Verification Questions:** When posting a lost item, the owner sets custom security questions (e.g., "What sticker is on the back?"). Only the real owner would know the answers.
- **Claim Review:** The poster reviews answers before approving. False claims are rejected.
- **Dedicated Chat:** Once verified, a rich chat channel opens with image sharing, GPS location, and meetup proposals.
- **Resolution Tracking:** Posts are marked as resolved, providing campus-wide recovery statistics.

**Why this matters:** On most campuses, lost items are posted in WhatsApp groups with zero verification. Anyone can claim anything. ShareNet adds accountability.

---

### 4. Community Wanted Board

A reverse-marketplace where **demand creates supply**:

1. Student posts what they need (title, description, budget, urgency level)
2. Other students browse wanted posts and **make offers** (with price, description, photos)
3. The requester reviews competing offers and accepts the best one
4. A private chat channel opens for coordination

**Urgency Levels:** Low → Medium → High → Urgent — visually color-coded so the community can prioritize.

**Why this matters:** Traditional marketplaces only work when supply is already listed. The wanted board captures latent demand and activates supply that wouldn't otherwise be listed.

---

### 5. Event-Driven Real-Time Architecture

ShareNet uses **Socket.IO** for a fully event-driven real-time layer:

| Feature | Implementation |
|---------|---------------|
| **Private Chat Rooms** | Isolated rooms per transaction, claim, and offer |
| **Typing Indicators** | Real-time `typing` / `stop-typing` events with 1s debounce |
| **Image Uploads** | `FormData` → Backend → Cloudinary → URL returned via socket |
| **GPS Location Sharing** | Browser Geolocation API → coordinates sent → rendered as Google Maps link |
| **Meetup Proposals** | Structured proposals (date/time/location/notes) with Accept/Decline actions |
| **Push Notifications** | Server emits `notification` events for all lifecycle transitions |

All messages are **persisted in MongoDB** — users see full history when they reopen a chat.

---

### 6. Behavioral Trust Score Engine

Trust isn't a static rating — it's a **dynamic, behavior-driven metric** that reflects real transaction outcomes:

| Behavior | Impact |
|----------|--------|
| On-time return | **+5** |
| Successful transaction completion | **+3** |
| Dispute resolved in your favor | **+5** |
| Late return (1–3 days) | **-5** |
| Late return (3+ days) | **-10** |
| Dispute raised against you | **-15** |

- Every user starts at **50 / 100**
- Trust scores are displayed on profiles, item cards, and within the ML recommendation engine (high-trust owners get priority)
- The system creates a **self-regulating community** — bad actors are deprioritized organically

---

### 7. Full Transaction Lifecycle with Dispute Resolution

Every transaction follows a structured, auditable state machine:

```
REQUESTED → ACCEPTED → AGREEMENT_PROPOSED → ACTIVE → RETURN_PENDING → COMPLETED
                                                          ↘ DISPUTED
```

| Stage | What Happens |
|-------|-------------|
| **Agreement Proposal** | Owner sets final price, duration, terms, start date |
| **Dual Confirmation** | Both parties must confirm before transaction goes active |
| **Automated Reminders** | Cron job sends reminders 3 days, 1 day, and day-of return date |
| **Overdue Alerts** | Automatic notifications if return date passes |
| **Dispute Flow** | Either party can raise a dispute with explanation |

**Why this matters:** Unstructured sharing (WhatsApp, word of mouth) has no accountability. ShareNet's lifecycle creates a paper trail that protects both parties.

---

### 8. College-Scoped OTP Verification

```
Enter Email → Detect College Domain → Send 6-Digit OTP (Resend API) → Verify → Register
```

- Supports **100+ Indian college domains** (IIITs, IITs, NITs, and more)
- Dynamically detects valid `.edu` / `.ac.in` / `.edu.in` patterns
- Items are automatically scoped to the user's `collegeDomain` — students only see items from their own campus
- New colleges can be added via [GitHub Issues](https://github.com/Pranilash/ShareNet-Web/issues)

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React 19 · Vite · Tailwind CSS · Zustand · React Router 7      │
│  Socket.IO Client · Axios · Lucide Icons · date-fns             │
└───────────────────────┬──────────────────────────────────────────┘
                        │  REST API (Axios) + WebSocket (Socket.IO)
┌───────────────────────▼──────────────────────────────────────────┐
│                         BACKEND                                  │
│  Express.js · JWT + Refresh Token Auth · Multer (file uploads)   │
│  Socket.IO Server · node-cron (reminders) · Resend (OTP email)   │
│  ML Recommendation Engine · Trust Score Engine                   │
└───────────┬───────────────────────┬──────────────────────────────┘
            │                       │
   ┌────────▼────────┐    ┌────────▼────────┐
   │   MongoDB       │    │   Cloudinary    │
   │   Atlas         │    │   (Media CDN)   │
   └─────────────────┘    └─────────────────┘
```

---

## Project Structure

```
ShareNet-Web/
├── ShareNet/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                    # Design system: Button, Card, Modal, Badge, Avatar, TrustScore, Loader
│   │   │   ├── layout/               # Navbar, Layout wrapper
│   │   │   ├── items/                 # ItemCard, ItemFilters, ItemForm, ClaimQueue, CounterOfferModal
│   │   │   ├── transactions/          # TransactionCard, AgreementForm, NegotiationHistory
│   │   │   ├── chat/                  # ChatBox (transaction-scoped real-time chat)
│   │   │   └── wanted/               # OfferChatBox, OfferCard
│   │   ├── pages/                     # 18+ route-level page components
│   │   ├── stores/                    # Zustand state management (auth, items, transactions, notifications, etc.)
│   │   ├── hooks/                     # Custom hooks (useClaimChat, useOfferChat — Socket.IO integration)
│   │   └── lib/                       # Axios instance (interceptors, refresh logic), Socket.IO client
│   └── public/                        # Static assets, SPA redirect rules
│
└── professional-backend-structure/    # Backend (Express + MongoDB)
    └── src/
        ├── controllers/               # 10 controller files — all business logic
        ├── models/                    # 12 Mongoose schemas with indexes and virtuals
        ├── routes/                    # 10 Express routers — RESTful API design
        ├── middlewares/               # JWT verification, Multer file upload
        ├── services/                  # Reminder cron service (daily automated checks)
        ├── utils/                     # ApiError, ApiResponse, Cloudinary upload, OTP email, college registry
        ├── socket.js                  # Socket.IO event handlers (chat, typing, notifications)
        ├── app.js                     # Express app with CORS, security middleware
        └── index.js                   # Server entry point
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, Vite, React Router 7 | SPA with file-based-like routing |
| **State Management** | Zustand | Lightweight, scalable store architecture |
| **Styling** | Tailwind CSS, Lucide React | Utility-first CSS + consistent icon system |
| **Real-Time** | Socket.IO (Client + Server) | WebSocket-based chat, typing, notifications |
| **Backend** | Express.js, Node.js | RESTful API with middleware pipeline |
| **Auth** | JWT + Refresh Tokens, bcrypt | Stateless auth with automatic token rotation |
| **Database** | MongoDB Atlas + Mongoose | Document store with schema validation and indexes |
| **Media** | Cloudinary + Multer | CDN-backed image upload pipeline |
| **Email** | Resend API | Transactional OTP emails |
| **Scheduling** | node-cron | Daily reminder and overdue alert checks |

---

## API Surface (30+ Endpoints)

| Module | Key Endpoints | Auth |
|--------|--------------|------|
| **Users** | `register, login, logout, send-otp, verify-otp, current-user, update-account, avatar, profile/:userId` | Mixed |
| **Items** | `CRUD, my-items, recommendations, availability toggle` | Protected |
| **Requests** | `create, accept, reject, instant-claim, claim-queue, counter-offer, pickup-details` | Protected |
| **Transactions** | `list, detail, propose-agreement, confirm-agreement, mark-returned, confirm-return, dispute` | Protected |
| **Messages** | `GET / POST per transaction` | Protected |
| **Lost & Found** | `CRUD, claims, post-claims, my-claims, received-claims, verify, reject, resolve` | Protected |
| **Wanted Items** | `CRUD, detail, offers, accept-offer, reject-offer` | Protected |
| **Claim Chat** | `messages, send-message, send-image, send-location, propose-meetup, respond-meetup` | Protected |
| **Offer Chat** | `messages, send-message, send-image, send-location, propose-meetup, respond-meetup` | Protected |
| **Notifications** | `list, unread-count, mark-read, mark-all-read` | Protected |

---

## Deployment

| Service | Platform | Configuration |
|---------|----------|---------------|
| Frontend | Render (Static Site) | Build: `npm run build` · Publish: `dist` · Rewrite: `/* → /index.html` |
| Backend | Render (Web Service) | Build: `npm install` · Start: `npm start` |
| Database | MongoDB Atlas | Free M0 cluster |
| Media CDN | Cloudinary | Free tier (25 GB storage, 25 GB bandwidth) |

---

## What Sets ShareNet Apart

| Dimension | ShareNet | Generic Marketplaces |
|-----------|----------|---------------------|
| **Identity** | OTP-verified college email; campus-scoped | Open registration; no verification |
| **Discovery** | ML-powered personalized recommendations | Basic keyword search |
| **Modes** | Rent + Sell + Give + Lost & Found + Wanted | Usually sell-only |
| **Trust** | Behavioral trust score from real transactions | Star ratings (easily gamed) |
| **Communication** | In-context rich chat with location, meetups, images | "Contact via WhatsApp" |
| **Accountability** | Structured lifecycle with agreements, reminders, disputes | No structure |
| **Lost & Found** | Built-in with verification questions | Non-existent |
| **Demand Capture** | Wanted board turns needs into offers | Users can only browse existing supply |
| **Fair Distribution** | Instant Claim queues for free items | First-come chaos |

---

## Local Development

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| MongoDB | Local or [Atlas](https://www.mongodb.com/atlas) |
| Cloudinary | [cloudinary.com](https://cloudinary.com) (free) |
| Resend | [resend.com](https://resend.com) (free) |

### Backend

```bash
cd professional-backend-structure
npm install
cp .env.example .env    # Fill in MongoDB URI, JWT secrets, Cloudinary, Resend keys
mkdir -p public/temp
npm run dev              # Runs on http://localhost:8000
```

### Frontend

```bash
cd ShareNet
npm install
cp .env.example .env    # Set VITE_API_URL=http://localhost:8000/api/v1
npm run dev              # Runs on http://localhost:5173
```

---

## Contributing

ShareNet is open source. We welcome contributions from the community.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m 'Add your feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Have a college that's not supported? [Open an issue](https://github.com/Pranilash/ShareNet-Web/issues) and we'll add the domain.

---

## License

MIT

---

<p align="center">
  <strong>Built for students. Powered by ML. Driven by trust.</strong><br/>
  Share more. Spend less. Build community.
</p>
