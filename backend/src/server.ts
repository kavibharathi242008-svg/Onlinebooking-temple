import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { getDatabase, queryAll, queryOne, runSql, saveDatabase } from './config/database';
import { seedInitialData } from './services/seedData';
import { generateOrGetSlots, updateSlotCapacity } from './services/slotService';
import { createBooking, getBookingByRef, cancelBooking, verifyAndAttendBooking } from './services/bookingService';
import { getLiveCrowdTelemetry, getAllCameras } from './services/crowdAnalysisService';
import { generateSlotRecommendations, approveRecommendation, rejectRecommendation } from './services/recommendationService';
import { handleChatbotQuery } from './services/chatbotService';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Initialize Database and Seed Data
(async () => {
  try {
    await getDatabase();
    await seedInitialData();
    console.log('Database successfully initialized & verified.');
  } catch (err) {
    console.error('Database initialization error:', err);
  }
})();

// ============================================================================
// TEMPLE ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/temples
 * @desc    Search and list temples with optional query filters (search, district, deity)
 * @query   {string} [search] - Keyword to match in English/Tamil name, city, or district
 * @query   {string} [district] - Specific Tamil Nadu district filter
 * @query   {string} [deity] - Presiding deity filter (e.g., Murugan, Shiva, Vishnu)
 * @returns {200} Array of Temple objects with parsed facilities & rules JSON
 * @returns {500} Server error message
 */
app.get('/api/temples', (req: Request, res: Response) => {
  try {
    const { search, district, deity } = req.query;
    let sql = 'SELECT * FROM temples WHERE 1=1';
    const params: any[] = [];

    if (search) {
      sql += ' AND (name LIKE ? OR name_tamil LIKE ? OR city LIKE ? OR district LIKE ? OR deity LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }
    if (district) {
      sql += ' AND district = ?';
      params.push(district);
    }
    if (deity) {
      sql += ' AND deity LIKE ?';
      params.push(`%${deity}%`);
    }

    sql += ' ORDER BY name ASC';
    const temples = queryAll(sql, params).map(t => ({
      ...t,
      facilities: t.facilities ? JSON.parse(t.facilities) : [],
      rules: t.rules ? JSON.parse(t.rules) : []
    }));

    res.json(temples);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/temples/:id
 * @desc    Retrieve detailed temple profile by unique ID, including sessions & real-time CCTV crowd telemetry
 * @params  {string} id - Unique temple identifier (e.g. temple-palani)
 * @returns {200} Full Temple profile with timings array and live_crowd metrics
 * @returns {404} Temple not found error
 * @returns {500} Server error message
 */
app.get('/api/temples/:id', (req: Request, res: Response) => {
  try {
    const temple = queryOne('SELECT * FROM temples WHERE id = ?', [req.params.id]);
    if (!temple) return res.status(404).json({ error: 'Temple not found' });

    const timings = queryAll('SELECT * FROM temple_timings WHERE temple_id = ? AND is_active = 1 ORDER BY start_time ASC', [temple.id]);
    const liveCrowd = getLiveCrowdTelemetry(temple.id);

    res.json({
      ...temple,
      facilities: temple.facilities ? JSON.parse(temple.facilities) : [],
      rules: temple.rules ? JSON.parse(temple.rules) : [],
      timings,
      live_crowd: liveCrowd
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/temples
 * @desc    Create a new temple and initialize its default session timings (Admin)
 * @body    {string} name - Official temple English name
 * @body    {string} [name_tamil] - Official temple Tamil name
 * @body    {string} district - District location
 * @body    {string} city - City / Town location
 * @body    {string} deity - Presiding deity
 * @body    {number} [default_free_capacity=500] - Default general slot capacity
 * @body    {number} [default_paid_capacity=100] - Default special line slot capacity
 * @body    {number} [default_paid_price=100] - Paid darshan ticket price in INR
 * @returns {201} Created temple ID and success confirmation
 * @returns {500} Server error message
 */
app.post('/api/temples', (req: Request, res: Response) => {
  try {
    const {
      name, name_tamil, district, city, deity, deity_tamil, image_url,
      description, description_tamil, location, default_free_capacity,
      default_paid_capacity, default_paid_price, advance_booking_hours,
      facilities, rules, timings
    } = req.body;

    const id = `temple-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;

    runSql(`
      INSERT INTO temples (
        id, name, name_tamil, district, city, deity, deity_tamil, image_url,
        description, description_tamil, location, is_verified, default_free_capacity,
        default_paid_capacity, default_paid_price, advance_booking_hours, facilities, rules
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
    `, [
      id, name, name_tamil || name, district, city, deity, deity_tamil || deity,
      image_url || 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80',
      description, description_tamil || description, location,
      default_free_capacity || 500, default_paid_capacity || 100,
      default_paid_price || 100, advance_booking_hours || 24,
      JSON.stringify(facilities || []), JSON.stringify(rules || [])
    ]);

    if (timings && Array.isArray(timings)) {
      for (const t of timings) {
        runSql(`
          INSERT INTO temple_timings (
            id, temple_id, session_name, session_name_tamil, start_time, end_time, slot_duration_minutes, is_active
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        `, [
          uuidv4(), id, t.session_name, t.session_name_tamil || t.session_name,
          t.start_time, t.end_time, t.duration || 60
        ]);
      }
    }

    saveDatabase();
    res.status(201).json({ id, message: 'Temple created successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/temples/:id
 * @desc    Update existing temple metadata, capacity defaults, facilities, and rules (Admin)
 * @params  {string} id - Unique temple identifier
 * @body    {object} Updated temple parameters (name, image_url, capacities, etc.)
 * @returns {200} Confirmation message
 * @returns {500} Server error message
 */
app.put('/api/temples/:id', (req: Request, res: Response) => {
  try {
    const {
      name, name_tamil, district, city, deity, deity_tamil, image_url,
      description, description_tamil, location, default_free_capacity,
      default_paid_capacity, default_paid_price, advance_booking_hours,
      facilities, rules
    } = req.body;

    runSql(`
      UPDATE temples SET
        name = ?, name_tamil = ?, district = ?, city = ?, deity = ?, deity_tamil = ?,
        image_url = ?, description = ?, description_tamil = ?, location = ?,
        default_free_capacity = ?, default_paid_capacity = ?, default_paid_price = ?,
        advance_booking_hours = ?, facilities = ?, rules = ?
      WHERE id = ?
    `, [
      name, name_tamil, district, city, deity, deity_tamil, image_url,
      description, description_tamil, location, default_free_capacity,
      default_paid_capacity, default_paid_price, advance_booking_hours,
      JSON.stringify(facilities || []), JSON.stringify(rules || []),
      req.params.id
    ]);

    saveDatabase();
    res.json({ message: 'Temple updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/temples/:id
 * @desc    Delete a temple and cascade remove associated slots, timings, and bookings (Admin)
 * @params  {string} id - Unique temple identifier
 * @returns {200} Confirmation message
 * @returns {500} Server error message
 */
app.delete('/api/temples/:id', (req: Request, res: Response) => {
  try {
    runSql('DELETE FROM temples WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Temple deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SLOT MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/slots
 * @desc    Fetch existing slots or lazily auto-generate darshan time slots for a specific temple and date
 * @query   {string} templeId - Target temple identifier
 * @query   {string} date - Slot date in YYYY-MM-DD format
 * @returns {200} Array of Slot records with booked vs remaining capacities and availability status
 * @returns {400} Missing required parameters
 * @returns {500} Server error message
 */
app.get('/api/slots', (req: Request, res: Response) => {
  try {
    const { templeId, date } = req.query;
    if (!templeId || !date) {
      return res.status(400).json({ error: 'templeId and date query parameters are required' });
    }

    const slots = generateOrGetSlots(String(templeId), String(date));
    res.json(slots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/slots/:id/capacity
 * @desc    Dynamically override free and paid capacities for a specific time slot (Admin)
 * @params  {string} id - Slot ID
 * @body    {number} free_capacity - New max free capacity
 * @body    {number} paid_capacity - New max paid capacity
 * @returns {200} Capacity update confirmation
 * @returns {500} Server error message
 */
app.put('/api/slots/:id/capacity', (req: Request, res: Response) => {
  try {
    const { free_capacity, paid_capacity } = req.body;
    updateSlotCapacity(req.params.id, Number(free_capacity), Number(paid_capacity));
    res.json({ message: 'Slot capacity updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// BOOKING ENDPOINTS (CONCURRENCY-SAFE TRANSACTIONS)
// ============================================================================

/**
 * @route   POST /api/bookings
 * @desc    Atomically reserve darshan tickets for online or physical offline counter visitors.
 *          Locks the slot within runInTransaction to ensure no overbooking occurs.
 * @body    {string} temple_id - Unique temple identifier
 * @body    {string} slot_id - Time slot identifier
 * @body    {string} darshan_type - 'FREE' or 'PAID'
 * @body    {string} channel - 'ONLINE' or 'OFFLINE_COUNTER'
 * @body    {string} primary_visitor_name - Contact devotee name
 * @body    {string} visitor_phone - Contact telephone number
 * @body    {string} [visitor_email] - Devotee email address
 * @body    {Array} visitors - Array of visitor objects [{ name, age, gender, id_proof_type, id_proof_number }]
 * @body    {string} [counter_staff_id] - Staff ID if booked via physical counter
 * @body    {string} [counter_number] - Counter station number
 * @returns {201} Confirmed booking with booking_ref and QR payload
 * @returns {400} Capacity exhausted or validation error
 */
app.post('/api/bookings', (req: Request, res: Response) => {
  try {
    const bookingResult = createBooking(req.body);
    res.status(201).json(bookingResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   GET /api/bookings/:ref
 * @desc    Lookup booking details, visitor list, and slot metadata by booking reference code
 * @params  {string} ref - Booking reference (e.g., TD202603204928)
 * @returns {200} Booking record with associated visitors and slot info
 * @returns {404} Booking reference not found
 * @returns {500} Server error message
 */
app.get('/api/bookings/:ref', (req: Request, res: Response) => {
  try {
    const booking = getBookingByRef(req.params.ref);
    if (!booking) return res.status(404).json({ error: 'Booking reference not found' });
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/bookings/:ref/cancel
 * @desc    Cancel an active booking and atomically roll back reserved capacity to the available slot pool
 * @params  {string} ref - Booking reference
 * @returns {200} Success response confirming cancellation and rollback
 * @returns {400} Invalid state error (e.g. already cancelled or attended)
 */
app.post('/api/bookings/:ref/cancel', (req: Request, res: Response) => {
  try {
    const result = cancelBooking(req.params.ref);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   POST /api/bookings/:ref/verify
 * @desc    Verify QR ticket at gate entrance and transition status to ATTENDED.
 *          Flags duplicate check-in attempts to prevent reuse.
 * @params  {string} ref - Booking reference
 * @returns {200} Verification result with devotee details and attended status
 * @returns {400} Invalid booking or ticket already scanned
 */
app.post('/api/bookings/:ref/verify', (req: Request, res: Response) => {
  try {
    const result = verifyAndAttendBooking(req.params.ref);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// AI CROWD TELEMETRY & CCTV VISION ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/crowd/live
 * @desc    Simulate real-time CCTV computer-vision telemetry, queue density, and waiting times via Little's Law
 * @query   {string} [templeId=temple-palani] - Target temple ID
 * @query   {string} [cameraId=cam-prakaram] - Target camera node
 * @returns {200} Live telemetry with bounding boxes, occupancy %, and estimated wait minutes
 * @returns {500} Server error message
 */
app.get('/api/crowd/live', (req: Request, res: Response) => {
  try {
    const { templeId, cameraId } = req.query;
    const targetTemple = templeId ? String(templeId) : 'temple-palani';
    const targetCam = cameraId ? String(cameraId) : 'cam-prakaram';
    const telemetry = getLiveCrowdTelemetry(targetTemple, targetCam);
    res.json(telemetry);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/crowd/cameras
 * @desc    Retrieve all registered surveillance camera feeds across temple zones (Gopuram, Prakaram, Mandapam)
 * @returns {200} Array of camera metadata with positions and zone descriptions
 */
app.get('/api/crowd/cameras', (req: Request, res: Response) => {
  res.json(getAllCameras());
});

// ============================================================================
// AI RECOMMENDATIONS & CAPACITY OPTIMIZATION ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/ai/recommendations
 * @desc    Fetch AI-generated dynamic capacity recommendations based on crowd trends and festival forecasts
 * @query   {string} [templeId=temple-palani] - Target temple ID
 * @query   {string} [date] - Target slot date
 * @returns {200} Array of AI recommendations with predicted vs recommended capacity and reasoning
 * @returns {500} Server error message
 */
app.get('/api/ai/recommendations', (req: Request, res: Response) => {
  try {
    const { templeId, date } = req.query;
    const targetTemple = templeId ? String(templeId) : 'temple-palani';
    const targetDate = date ? String(date) : new Date().toISOString().split('T')[0];
    const recs = generateSlotRecommendations(targetTemple, targetDate);
    res.json(recs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/ai/recommendations/:id/approve
 * @desc    Approve an AI recommendation, updating the corresponding slot's capacity dynamically
 * @params  {string} id - Recommendation ID
 * @body    {number} [custom_capacity] - Optional manual override capacity
 * @returns {200} Approval result confirmation
 * @returns {400} Recommendation not found or update error
 */
app.post('/api/ai/recommendations/:id/approve', (req: Request, res: Response) => {
  try {
    const { custom_capacity } = req.body;
    const result = approveRecommendation(req.params.id, custom_capacity);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @route   POST /api/ai/recommendations/:id/reject
 * @desc    Reject an AI recommendation and leave current slot allocations unchanged
 * @params  {string} id - Recommendation ID
 * @returns {200} Rejection confirmation
 * @returns {400} Recommendation not found error
 */
app.post('/api/ai/recommendations/:id/reject', (req: Request, res: Response) => {
  try {
    const result = rejectRecommendation(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ============================================================================
// ADMIN DASHBOARD & ANALYTICS ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Fetch high-level operational KPIs, revenue, channel distribution, and hourly devotee flow curves
 * @returns {200} JSON payload containing KPIs, hourly visitor distribution, and temple breakdowns
 * @returns {500} Server error message
 */
app.get('/api/admin/dashboard', (req: Request, res: Response) => {
  try {
    const totalTemples = queryOne<any>('SELECT COUNT(*) as c FROM temples')?.c || 0;
    const totalBookings = queryOne<any>('SELECT COUNT(*) as c FROM bookings WHERE booking_status = "CONFIRMED"')?.c || 0;
    const freeBookings = queryOne<any>('SELECT COUNT(*) as c FROM bookings WHERE darshan_type = "FREE" AND booking_status = "CONFIRMED"')?.c || 0;
    const paidBookings = queryOne<any>('SELECT COUNT(*) as c FROM bookings WHERE darshan_type = "PAID" AND booking_status = "CONFIRMED"')?.c || 0;
    const offlineBookings = queryOne<any>('SELECT COUNT(*) as c FROM bookings WHERE channel = "OFFLINE_COUNTER" AND booking_status = "CONFIRMED"')?.c || 0;
    const onlineBookings = queryOne<any>('SELECT COUNT(*) as c FROM bookings WHERE channel = "ONLINE" AND booking_status = "CONFIRMED"')?.c || 0;
    const totalVisitors = queryOne<any>('SELECT SUM(total_visitors) as s FROM bookings WHERE booking_status = "CONFIRMED"')?.s || 0;
    const totalRevenue = queryOne<any>('SELECT SUM(amount_paid) as s FROM bookings WHERE booking_status = "CONFIRMED"')?.s || 0;

    // Slot analytics
    const totalSlots = queryOne<any>('SELECT COUNT(*) as c FROM slots')?.c || 0;
    const fullSlots = queryOne<any>('SELECT COUNT(*) as c FROM slots WHERE status = "FULL"')?.c || 0;
    const limitedSlots = queryOne<any>('SELECT COUNT(*) as c FROM slots WHERE status = "LIMITED"')?.c || 0;
    const availableSlots = totalSlots - fullSlots - limitedSlots;

    // Hourly visitors distribution (realistic distribution curve)
    const hourlyData = [
      { hour: '06:00 AM', visitors: 280, capacity: 500, waitMinutes: 15 },
      { hour: '07:00 AM', visitors: 480, capacity: 500, waitMinutes: 45 },
      { hour: '08:00 AM', visitors: 500, capacity: 500, waitMinutes: 50 },
      { hour: '09:00 AM', visitors: 430, capacity: 500, waitMinutes: 35 },
      { hour: '10:00 AM', visitors: 340, capacity: 500, waitMinutes: 20 },
      { hour: '02:00 PM', visitors: 220, capacity: 500, waitMinutes: 10 },
      { hour: '03:00 PM', visitors: 290, capacity: 500, waitMinutes: 15 },
      { hour: '04:00 PM', visitors: 380, capacity: 500, waitMinutes: 25 },
      { hour: '05:00 PM', visitors: 490, capacity: 500, waitMinutes: 45 },
      { hour: '06:00 PM', visitors: 500, capacity: 500, waitMinutes: 50 },
      { hour: '07:00 PM', visitors: 440, capacity: 500, waitMinutes: 35 },
      { hour: '08:00 PM', visitors: 310, capacity: 500, waitMinutes: 20 }
    ];

    // Bookings grouped by temple
    const templeBookings = queryAll(`
      SELECT t.name, COUNT(b.id) as bookings, SUM(b.total_visitors) as visitors
      FROM temples t
      LEFT JOIN bookings b ON t.id = b.temple_id AND b.booking_status = 'CONFIRMED'
      GROUP BY t.id
      ORDER BY visitors DESC
      LIMIT 6
    `);

    res.json({
      kpis: {
        total_temples: totalTemples,
        total_bookings: totalBookings,
        free_bookings: freeBookings,
        paid_bookings: paidBookings,
        offline_bookings: offlineBookings,
        online_bookings: onlineBookings,
        total_visitors: totalVisitors,
        total_revenue: totalRevenue,
        slots_summary: {
          total: totalSlots,
          available: availableSlots,
          limited: limitedSlots,
          full: fullSlots
        },
        avg_wait_minutes: 28
      },
      hourly_visitors: hourlyData,
      temple_distribution: templeBookings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/admin/bookings
 * @desc    Filter and paginate all bookings across temples, channels, and darshan types (Admin)
 * @query   {string} [templeId] - Filter by specific temple
 * @query   {string} [channel] - Filter by booking channel (ONLINE, OFFLINE_COUNTER)
 * @query   {string} [darshanType] - Filter by darshan type (FREE, PAID)
 * @returns {200} Array of Booking records with joined temple name and slot timing details
 * @returns {500} Server error message
 */
app.get('/api/admin/bookings', (req: Request, res: Response) => {
  try {
    const { templeId, channel, darshanType } = req.query;
    let sql = `
      SELECT b.*, t.name as temple_name, s.date as slot_date, s.start_time, s.end_time
      FROM bookings b
      JOIN temples t ON b.temple_id = t.id
      JOIN slots s ON b.slot_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (templeId) {
      sql += ' AND b.temple_id = ?';
      params.push(templeId);
    }
    if (channel) {
      sql += ' AND b.channel = ?';
      params.push(channel);
    }
    if (darshanType) {
      sql += ' AND b.darshan_type = ?';
      params.push(darshanType);
    }
    sql += ' ORDER BY b.created_at DESC LIMIT 100';

    const bookings = queryAll(sql, params);
    res.json(bookings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// HELP & BILINGUAL CHATBOT ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/chat
 * @desc    Process natural language queries in English or தமிழ் regarding tickets, prices, attire, or crowd
 * @body    {string} message - User query text
 * @body    {string} [templeId] - Optional selected temple context
 * @body    {string} [bookingRef] - Optional booking reference code for status lookup
 * @returns {200} Bilingual response object with reply, reply_tamil, and suggestedActions
 * @returns {400} Missing message parameter
 * @returns {500} Server error message
 */
app.post('/api/chat', (req: Request, res: Response) => {
  try {
    const { message, templeId, bookingRef } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const response = handleChatbotQuery(message, templeId, bookingRef);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/support
 * @desc    Retrieve 24/7 temple support phone numbers, helpline emails, and frequently asked questions (FAQs)
 * @returns {200} Global support contact information with parsed FAQs
 * @returns {404} Support info not found
 * @returns {500} Server error message
 */
app.get('/api/support', (req: Request, res: Response) => {
  try {
    const support = queryOne('SELECT * FROM support_information WHERE id = "global-support"');
    if (!support) return res.status(404).json({ error: 'Support info not found' });
    res.json({
      ...support,
      faqs: support.faqs ? JSON.parse(support.faqs) : []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/support
 * @desc    Update support contacts and operational hours (Admin)
 * @body    {string} helpline_phone - Primary telephone helpline
 * @body    {string} toll_free - Toll-free number
 * @body    {string} email - Support email address
 * @body    {string} support_hours - Support operating hours
 * @body    {string} emergency_phone - Emergency incident desk contact
 * @returns {200} Update confirmation
 * @returns {500} Server error message
 */
app.put('/api/support', (req: Request, res: Response) => {
  try {
    const { helpline_phone, toll_free, email, support_hours, emergency_phone } = req.body;
    runSql(`
      UPDATE support_information SET
        helpline_phone = ?, toll_free = ?, email = ?, support_hours = ?, emergency_phone = ?
      WHERE id = 'global-support'
    `, [helpline_phone, toll_free, email, support_hours, emergency_phone]);
    saveDatabase();
    res.json({ message: 'Support information updated' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// FESTIVAL & SPECIAL DAYS MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/special-days
 * @desc    Retrieve all declared festival dates, expected crowd tiers, and slot capacity multipliers
 * @returns {200} Array of SpecialDay records with associated temple names
 * @returns {500} Server error message
 */
app.get('/api/special-days', (req: Request, res: Response) => {
  try {
    const days = queryAll(`
      SELECT sd.*, t.name as temple_name, t.name_tamil as temple_name_tamil
      FROM special_days sd
      JOIN temples t ON sd.temple_id = t.id
      ORDER BY sd.date ASC
    `);
    res.json(days);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/special-days
 * @desc    Register a special festival event and define an algorithmic slot capacity multiplier (Admin)
 * @body    {string} temple_id - Temple ID
 * @body    {string} date - Event date (YYYY-MM-DD)
 * @body    {string} event_name - Festival event name in English
 * @body    {string} [event_name_tamil] - Festival event name in Tamil
 * @body    {string} [special_timings] - Extended darshan operating hours
 * @body    {string} [expected_crowd_level='HIGH'] - Expected density tier
 * @body    {number} [slot_capacity_modifier=1.2] - Capacity expansion/reduction multiplier
 * @body    {string} [booking_notes] - Instructions for devotees
 * @returns {201} Creation confirmation
 * @returns {500} Server error message
 */
app.post('/api/special-days', (req: Request, res: Response) => {
  try {
    const { temple_id, date, event_name, event_name_tamil, special_timings, expected_crowd_level, slot_capacity_modifier, booking_notes } = req.body;
    runSql(`
      INSERT INTO special_days (
        id, temple_id, date, event_name, event_name_tamil, special_timings,
        expected_crowd_level, slot_capacity_modifier, booking_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      uuidv4(), temple_id, date, event_name, event_name_tamil || event_name,
      special_timings, expected_crowd_level || 'HIGH', slot_capacity_modifier || 1.2, booking_notes || ''
    ]);
    saveDatabase();
    res.status(201).json({ message: 'Special festival day added' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/health
 * @desc    Liveness and operational health probe for load balancers and system monitoring
 * @returns {200} Server health status, application metadata, and server timestamp
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'HEALTHY', app: 'AI Temple Dharisanam & Crowd Management System', timestamp: new Date().toISOString() });
});

// Background Tasks: Periodic Crowd Telemetry & Demand Monitoring
const BACKGROUND_TEMPLES = ['temple-palani', 'temple-madurai', 'temple-rameswaram', 'temple-srirangam'];
const backgroundCrowdWorker = setInterval(() => {
  try {
    const randomTemple = BACKGROUND_TEMPLES[Math.floor(Math.random() * BACKGROUND_TEMPLES.length)];
    getLiveCrowdTelemetry(randomTemple);
  } catch (e) {
    // Non-blocking background worker
  }
}, 30000);

// Graceful cleanup
process.on('SIGTERM', () => {
  clearInterval(backgroundCrowdWorker);
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`Background crowd telemetry worker active (30s interval).`);
});
