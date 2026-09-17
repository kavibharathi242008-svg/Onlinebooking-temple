# 🏛️ AI Temple Dharisanam & Smart Crowd Management System

An enterprise-grade, full-stack digital darshan booking and AI-driven crowd control platform designed for heritage temples across Tamil Nadu.

The system harmonizes online devotee bookings, walk-in offline physical counter allocations, and real-time vision-based crowd telemetry to balance devotee density, prevent stampedes, and minimize darshan waiting times.

---

## 🌟 Key Features

1. **🏛️ Heritage Temple Directory & Live Status**
   - 12 verified Tamil Nadu temples (Palani, Madurai Meenakshi, Rameswaram, Srirangam, Thanjavur Big Temple, Tiruchendur, Samayapuram, Kapaleeshwarar, Thiruvannamalai, Kanchi Kamakshi, Ekambareswarar, Chidambaram).
   - Real-time crowd badges (`Low`, `Medium`, `High`) and live devotee capacity bars.
   - Authentic architectural gopuram imagery and verified rules/attire guidelines.

2. **🎟️ Real-Time Darshan Booking Engine (Free & Special Paid)**
   - Atomic transactions (`runInTransaction`) with zero double-booking or overbooking vulnerabilities.
   - Real-time synchronised quota shared seamlessly across Online Devotees and Physical Offline Counters.
   - Instant dynamic QR E-Pass generation with unique `TD...` reference IDs.

3. **🎥 AI Computer Vision & Crowd Telemetry Simulator**
   - Simulated CCTV vision nodes tracking devotee density, in-flow, out-flow, and queue velocity.
   - Automated queue wait-time estimation using Little's Law (\(W = L / \lambda\)).
   - AI slot optimization model generating dynamic capacity recommendations based on weather and festival days.

4. **🛂 Physical Counter & Gate Attendance Scanner**
   - Walk-in physical counter portal for rapid on-site slot allocation.
   - Guard / Gate scanning console verifying digital ticket validity and flagging duplicate entry attempts.

5. **🌐 Full Bilingual Experience (English & தமிழ்)**
   - Instant language switcher preserving context across the entire application.
   - Bilingual AI Help Chatbot with canned contextual responses for timings, prasadams, and dress codes.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React Icons & Canvas QR Code
- **Backend**:
  - Node.js + Express + TypeScript
  - SQLite with `sql.js` (In-memory engine with safe periodic disk persistence)
  - Full REST API with CORS support
- **AI & Algorithms**:
  - Vision crowd density modeling & queue velocity calculations
  - Slot optimization recommendations engine

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/kavibharathi242008-svg/Onlinebooking-temple.git
cd Onlinebooking-temple
```

### 2. Setup and Start Backend
```bash
cd backend
npm install
npm run build
npm start
# Backend runs on http://localhost:5000
```

### 3. Setup and Start Frontend
```bash
cd ../frontend
npm install
npm run dev
# Frontend runs on http://127.0.0.1:5173
```

---

## 📁 Repository Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # SQLite database schema & transaction helpers
│   │   ├── services/       # Booking, Slot, Crowd, and Chatbot services
│   │   ├── scripts/        # End-to-end integration & migration tests
│   │   └── server.ts       # Express REST API routes
│   ├── public/             # Static authentic temple images
│   ├── database.sqlite     # Pre-seeded database
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # UI widgets, Navbar, Ticket, CCTV simulator
│   │   ├── pages/          # Home, Temples, Booking wizard, Admin, Help
│   │   ├── utils/          # API client & language translations
│   │   └── App.tsx         # Main application routes & view states
│   ├── public/             # Static web assets and images
│   └── package.json
└── README.md
```

---

## 🔒 Security & Concurrency

- **Atomic Reservations:** Slot allocations are wrapped in transactional locks, guaranteeing that concurrent reservation attempts never exceed maximum safe hall capacity.
- **Gate Pass Anti-Reuse:** Scanned tickets are immediately updated to `ATTENDED` status with timestamp verification, preventing gate pass cloning or fraudulent entry.
