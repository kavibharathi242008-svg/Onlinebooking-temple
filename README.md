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

6. **🛡️ Resilient React 19 Error Boundary Isolation**
   - Granular two-tier error boundaries shielding the application from runtime exceptions without crashing the full view.
   - Dedicated fallback UI with automatic recovery actions and developer diagnostic stack tracing.

---

## 🛠️ Technology Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite v8
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - Lucide React Icons & Canvas QR Code
  - React 19 Class Component Error Boundaries
- **Backend**:
  - Node.js + Express + TypeScript
  - SQLite with `sql.js` (In-memory engine with safe periodic disk persistence)
  - Full REST API with CORS support
  - ACID Concurrency Locks (`runInTransaction`)
- **Testing & Verification**:
  - Custom Granular TypeScript Unit Testing Suite (`ts-node src/scripts/unitTests.ts`)
  - End-to-End System Integration Suite (`ts-node src/scripts/verifySystem.ts`)

---

## 📖 API Endpoints Catalog

The backend exposes a comprehensive RESTful API under the `/api` prefix:

### 1. Temples (`/api/temples`)
| Method | Endpoint | Query / Path Params | Description | Success Response (Code) |
|---|---|---|---|---|
| `GET` | `/api/temples` | `search`, `district`, `deity` | Search & list all active temples with parsed facilities & rules | `200 OK` (Array of Temple objects) |
| `GET` | `/api/temples/:id` | `id` (e.g. `temple-palani`) | Fetch temple profile, timings, and real-time CCTV crowd telemetry | `200 OK` (Temple profile + timings + live_crowd) |
| `POST` | `/api/temples` | Request body | Create new temple record with default capacities and session timings (Admin) | `201 Created` (`{ id, message }`) |
| `PUT` | `/api/temples/:id` | `id`, Request body | Update existing temple metadata, capacities, facilities, and attire rules (Admin) | `200 OK` (`{ message }`) |
| `DELETE` | `/api/temples/:id` | `id` | Delete temple and cascade remove associated slots, timings, and bookings (Admin) | `200 OK` (`{ message }`) |

### 2. Slot Management (`/api/slots`)
| Method | Endpoint | Query / Path Params | Description | Success Response (Code) |
|---|---|---|---|---|
| `GET` | `/api/slots` | `templeId`, `date` (YYYY-MM-DD) | Fetch existing slots or auto-generate 1-hour darshan slots from temple schedule | `200 OK` (Array of Slot objects) |
| `PUT` | `/api/slots/:id/capacity` | `id`, `free_capacity`, `paid_capacity` | Override available capacity for a specific slot (Admin) | `200 OK` (`{ message }`) |

### 3. Bookings (`/api/bookings`)
| Method | Endpoint | Query / Path Params | Description | Success Response (Code) |
|---|---|---|---|---|
| `POST` | `/api/bookings` | Booking payload | Concurrency-safe atomic booking creation across Online & Counter channels | `201 Created` (Booking record + QR payload) |
| `GET` | `/api/bookings/:ref` | `ref` (e.g. `TD2026...`) | Lookup booking details, visitor roster, and timing details | `200 OK` (Booking object with visitors) |
| `POST` | `/api/bookings/:ref/cancel` | `ref` | Cancel booking and atomically roll back reserved capacity to the slot pool | `200 OK` (`{ message, booking }`) |
| `POST` | `/api/bookings/:ref/verify` | `ref` | Gate entrance scan: verifies validity and updates status to `ATTENDED` | `200 OK` (`{ verified, message, booking }`) |

### 4. AI Crowd Telemetry & Recommendations
| Method | Endpoint | Query / Path Params | Description | Success Response (Code) |
|---|---|---|---|---|
| `GET` | `/api/crowd/live` | `templeId`, `cameraId` | Retrieve real-time computer vision telemetry, density %, and Little's Law wait time | `200 OK` (Crowd telemetry object) |
| `GET` | `/api/crowd/cameras` | None | Get surveillance camera roster across Gopuram, Prakaram, and Mandapam zones | `200 OK` (Array of Camera objects) |
| `GET` | `/api/ai/recommendations` | `templeId`, `date` | Generate dynamic capacity recommendations based on crowd flow & special days | `200 OK` (Array of Recommendations) |
| `POST` | `/api/ai/recommendations/:id/approve` | `id`, `custom_capacity` | Approve AI recommendation and dynamically update slot capacity | `200 OK` (`{ message }`) |
| `POST` | `/api/ai/recommendations/:id/reject` | `id` | Dismiss AI recommendation without modifying slot capacity | `200 OK` (`{ message }`) |

### 5. Admin, Chatbot & Support
| Method | Endpoint | Query / Path Params | Description | Success Response (Code) |
|---|---|---|---|---|
| `GET` | `/api/admin/dashboard` | None | Operational KPIs, revenue, channel distribution, and hourly devotee flow curves | `200 OK` (KPIs + hourly curve + distribution) |
| `GET` | `/api/admin/bookings` | `templeId`, `channel`, `darshanType` | Filter and paginate recent bookings across channels | `200 OK` (Array of Bookings) |
| `POST` | `/api/chat` | `message`, `templeId`, `bookingRef` | Bilingual NLP query resolution (tickets, timings, attire, rules) in English/Tamil | `200 OK` (`{ reply, reply_tamil, actions }`) |
| `GET` | `/api/support` | None | Retrieve global support phone, email, and frequently asked questions | `200 OK` (Support info object) |
| `PUT` | `/api/support` | Support payload | Update contact helplines and operating hours (Admin) | `200 OK` (`{ message }`) |
| `GET` | `/api/special-days` | None | List upcoming festival dates and algorithmic capacity multipliers | `200 OK` (Array of SpecialDay objects) |
| `POST` | `/api/special-days` | Special day payload | Register new festival date with crowd modifier (Admin) | `201 Created` (`{ message }`) |
| `GET` | `/api/health` | None | Operational health and liveness probe | `200 OK` (`{ status: "HEALTHY" }`) |

---

## 🗄️ Database Schema & Data Dictionary

The persistence layer uses SQLite (`sql.js`) with ACID transactions. Below is the structural schema definition:

### 1. `temples`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique temple slug (e.g. `temple-palani`) |
| `name` | `TEXT` | `NOT NULL` | Temple official English name |
| `name_tamil` | `TEXT` | `NOT NULL` | Temple official Tamil name |
| `district` | `TEXT` | `NOT NULL` | Tamil Nadu district |
| `city` | `TEXT` | `NOT NULL` | City / Municipality |
| `deity` | `TEXT` | `NOT NULL` | Presiding deity in English |
| `deity_tamil` | `TEXT` | `NOT NULL` | Presiding deity in Tamil |
| `image_url` | `TEXT` | `NOT NULL` | High-resolution authentic gopuram image URL |
| `description` | `TEXT` | `NOT NULL` | Heritage and architectural background |
| `description_tamil` | `TEXT` | `NOT NULL` | Tamil description |
| `location` | `TEXT` | `NOT NULL` | Address and navigation landmarks |
| `is_verified` | `INTEGER` | `DEFAULT 1` | Verification flag (1 = Active) |
| `default_free_capacity` | `INTEGER` | `DEFAULT 500` | Default devotee capacity per free slot |
| `default_paid_capacity` | `INTEGER` | `DEFAULT 100` | Default devotee capacity per paid slot |
| `default_paid_price` | `INTEGER` | `DEFAULT 100` | Special paid darshan ticket fee (INR) |
| `advance_booking_hours` | `INTEGER` | `DEFAULT 24` | Booking window cutoff |
| `facilities` | `TEXT` | JSON Array | Array of facilities (Locker, Wheelchair, Prasadam, etc.) |
| `rules` | `TEXT` | JSON Array | Array of regulations (Dress code, Photography rules) |
| `created_at` | `TEXT` | `DEFAULT CURRENT_TIMESTAMP` | Record timestamp |

### 2. `temple_timings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Timing block ID |
| `temple_id` | `TEXT` | `FOREIGN KEY (temple_id) REFERENCES temples(id) ON DELETE CASCADE` | Associated temple |
| `session_name` | `TEXT` | `NOT NULL` | Session title (Morning Darshan, Evening Darshan) |
| `session_name_tamil` | `TEXT` | `NOT NULL` | Tamil session title |
| `start_time` | `TEXT` | `NOT NULL` | Start time (e.g. `06:00`) |
| `end_time` | `TEXT` | `NOT NULL` | End time (e.g. `11:00`) |
| `slot_duration_minutes`| `INTEGER` | `DEFAULT 60` | Duration of each individual slot |
| `is_active` | `INTEGER` | `DEFAULT 1` | Active flag |

### 3. `slots`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Slot unique ID |
| `temple_id` | `TEXT` | `FOREIGN KEY` | Reference to temple |
| `date` | `TEXT` | `NOT NULL` | Slot date (`YYYY-MM-DD`) |
| `start_time` | `TEXT` | `NOT NULL` | Slot start time (`HH:MM`) |
| `end_time` | `TEXT` | `NOT NULL` | Slot end time (`HH:MM`) |
| `free_capacity` | `INTEGER` | `NOT NULL` | Total available quota for free darshan |
| `paid_capacity` | `INTEGER` | `NOT NULL` | Total available quota for paid darshan |
| `free_booked` | `INTEGER` | `DEFAULT 0` | Current booked count for free darshan |
| `paid_booked` | `INTEGER` | `DEFAULT 0` | Current booked count for paid darshan |
| `ai_recommended_capacity` | `INTEGER` | `NULLABLE` | Dynamically calculated optimal capacity |
| `status` | `TEXT` | `DEFAULT 'AVAILABLE'` | `AVAILABLE`, `LIMITED`, `FULL` |

*Unique Index:* `UNIQUE (temple_id, date, start_time, end_time)` prevents duplicate slot creation.

### 4. `bookings`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Booking UUID |
| `booking_ref` | `TEXT` | `UNIQUE NOT NULL` | Human-readable reference code (`TD...`) |
| `temple_id` | `TEXT` | `FOREIGN KEY` | Reference to temple |
| `slot_id` | `TEXT` | `FOREIGN KEY` | Reference to slot |
| `darshan_type` | `TEXT` | `NOT NULL` | `FREE` or `PAID` |
| `channel` | `TEXT` | `NOT NULL` | `ONLINE` or `OFFLINE_COUNTER` |
| `primary_visitor_name` | `TEXT` | `NOT NULL` | Lead devotee name |
| `visitor_phone` | `TEXT` | `NOT NULL` | Contact phone number |
| `visitor_email` | `TEXT` | `NULLABLE` | Devotee email |
| `total_visitors` | `INTEGER` | `NOT NULL` | Devotee head count |
| `amount_paid` | `INTEGER` | `DEFAULT 0` | Fee paid in INR |
| `payment_method` | `TEXT` | `NULLABLE` | Payment channel (`UPI`, `CASH`, `CARD`) |
| `payment_status` | `TEXT` | `NOT NULL` | `COMPLETED`, `FREE`, `REFUNDED` |
| `booking_status` | `TEXT` | `NOT NULL` | `CONFIRMED`, `CANCELLED`, `ATTENDED` |
| `counter_staff_id` | `TEXT` | `NULLABLE` | Staff clerk ID (if counter booking) |
| `counter_number` | `TEXT` | `NULLABLE` | Counter terminal number |
| `qr_code_payload` | `TEXT` | `NOT NULL` | Signed payload rendered into QR code |
| `created_at` | `TEXT` | `DEFAULT CURRENT_TIMESTAMP` | Reservation timestamp |

### 5. `booking_visitors`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Individual visitor UUID |
| `booking_id` | `TEXT` | `FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE` | Associated booking |
| `name` | `TEXT` | `NOT NULL` | Devotee name |
| `age` | `INTEGER` | `NOT NULL` | Age in years |
| `gender` | `TEXT` | `NOT NULL` | `MALE`, `FEMALE`, `OTHER` |
| `id_proof_type` | `TEXT` | `NULLABLE` | `AADHAAR`, `VOTER_ID`, `PASSPORT` |
| `id_proof_number` | `TEXT` | `NULLABLE` | ID proof serial number |

---

## 🛡️ React 19 Error Boundary Technical Architecture

In modern React 19 architectures, uncaught JavaScript errors inside component lifecycles or rendering trees can unmount the entire root component, leaving devotees with blank screens. To provide rock-solid fault isolation, we implement an enterprise two-tier Error Boundary hierarchy using `frontend/src/components/ErrorBoundary.tsx`.

### Error Boundary Hierarchy:
```
                            [index.html]
                                 │
                            [main.tsx]
                                 │
             ┌───────────────────┴───────────────────┐
             │       Root Level <ErrorBoundary>       │
             │   (Protects entire app & global nav)  │
             └───────────────────┬───────────────────┘
                                 │
                             [App.tsx]
                                 │
             ┌───────────────────┴───────────────────┐
             │     Page Level <ErrorBoundary key={tab}>│
             │  (Isolates active tab: Booking, CCTV)  │
             └───────────────────┬───────────────────┘
                                 │
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     [BookingWizard]        [CCTVStudio]        [AdminPortal]
   (If Booking fails,     (Isolated crash,     (Remains fully
   CCTV still works)     Recovery button)       interactive)
```

### Key Technical Mechanisms:
1. **Lifecycle Containment (`getDerivedStateFromError` & `componentDidCatch`):**
   - Captures runtime errors thrown in child components, preventing the browser window from unmounting.
   - Automatically stores error message, stack trace, and component stack in component state.
2. **Two-Tier Isolation:**
   - **Root Boundary (`main.tsx`):** Catch-all protective shell ensuring navigation and core branding remain intact even in catastrophic failures.
   - **Page-Level Boundary (`App.tsx`):** Employs a dynamic `key={currentTab}` prop so navigating to another tab automatically resets error state and recovers normal rendering without needing a full browser reload.
3. **Bilingual Fallback UI:**
   - Displays friendly guidance in both English and தமிழ் with a one-click *"Try Again"* recovery action and collapsible developer debug inspector.

---

## 🧪 Granular Unit Testing Architecture

The backend includes a dedicated unit testing framework located at `backend/src/scripts/unitTests.ts` covering 5 critical core engineering suites (38 assertions):

| Suite | Focus Area | Key Invariants Verified |
|---|---|---|
| **Suite 1: Slot Generation** | Timings & Schedule Splitting | 60-minute duration intervals, morning session boundaries, idempotency |
| **Suite 2: Atomic Capacity Lock** | Concurrency & Capacity Guards | Overbooking rejections, strict capacity enforcement, valid `TD` reference generation |
| **Suite 3: State Transitions** | Gate Check-in & Cancellation | First-time check-in, duplicate scan detection, cancellation capacity rollback |
| **Suite 4: Vision & Queues** | Computer Vision & Little's Law | Telemetry bounds ($0 \le \text{occupancy} \le 100\%$), queue delay estimation ($W = L / \lambda$), camera registry |
| **Suite 5: NLP Chatbot** | Bilingual Intent Resolution | English booking intent, Tamil query matching, traditional dress code regulations |

### Running the Test Suites:

```bash
# Execute Granular Backend Unit Tests (In-memory, 0 external dependencies)
cd backend
npm run test:unit

# Execute End-to-End System Verification (Requires running server on port 5000)
npm run test:e2e
```

---

## 🚀 Running the Project

### 1. Start the Backend Server (Port 5000)
```bash
cd backend
npm install
npm run build
npm start
```

### 2. Start the Frontend Development Server (Port 5173)
```bash
cd frontend
npm install
npm run dev -- --host
```

Access the application in your browser:
- **Local Dev:** `http://localhost:5173`
- **Network / Mobile Access:** `http://<your-ip>:5173`
- **Backend API:** `http://localhost:5000/api/health`

---

## 🔒 Security & Concurrency

- **Atomic Reservations:** Slot allocations are wrapped in transactional locks, guaranteeing that concurrent reservation attempts never exceed maximum safe hall capacity.
- **Gate Pass Anti-Reuse:** Scanned tickets are immediately updated to `ATTENDED` status with timestamp verification, preventing gate pass cloning or fraudulent entry.

---

## 📜 License & Compliance

Developed for Hindu Religious and Charitable Endowments (HR&CE) compliance and heritage temple crowd safety optimization in Tamil Nadu.
