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

// ==========================
// TEMPLE ENDPOINTS
// ==========================

// Search & list temples
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

// Single temple details with timings
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

// Create temple (Admin)
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

// Update temple (Admin)
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

// Delete temple (Admin)
app.delete('/api/temples/:id', (req: Request, res: Response) => {
  try {
    runSql('DELETE FROM temples WHERE id = ?', [req.params.id]);
    saveDatabase();
    res.json({ message: 'Temple deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// SLOT ENDPOINTS
// ==========================

// Get or auto-generate slots for a temple and date
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

// Admin update slot capacity
app.put('/api/slots/:id/capacity', (req: Request, res: Response) => {
  try {
    const { free_capacity, paid_capacity } = req.body;
    updateSlotCapacity(req.params.id, Number(free_capacity), Number(paid_capacity));
    res.json({ message: 'Slot capacity updated successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// BOOKING ENDPOINTS
// ==========================

// Atomic Concurrency-safe Booking Creation (Online & Offline Counter)
app.post('/api/bookings', (req: Request, res: Response) => {
  try {
    const bookingResult = createBooking(req.body);
    res.status(201).json(bookingResult);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Retrieve booking details
app.get('/api/bookings/:ref', (req: Request, res: Response) => {
  try {
    const booking = getBookingByRef(req.params.ref);
    if (!booking) return res.status(404).json({ error: 'Booking reference not found' });
    res.json(booking);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel booking
app.post('/api/bookings/:ref/cancel', (req: Request, res: Response) => {
  try {
    const result = cancelBooking(req.params.ref);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Verify & Attend booking (Gate Staff QR scanner / Lookup)
app.post('/api/bookings/:ref/verify', (req: Request, res: Response) => {
  try {
    const result = verifyAndAttendBooking(req.params.ref);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================
// AI CROWD & CCTV ENDPOINTS
// ==========================

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

app.get('/api/crowd/cameras', (req: Request, res: Response) => {
  res.json(getAllCameras());
});

// ==========================
// AI RECOMMENDATION ENDPOINTS
// ==========================

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

app.post('/api/ai/recommendations/:id/approve', (req: Request, res: Response) => {
  try {
    const { custom_capacity } = req.body;
    const result = approveRecommendation(req.params.id, custom_capacity);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/ai/recommendations/:id/reject', (req: Request, res: Response) => {
  try {
    const result = rejectRecommendation(req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================
// ADMIN DASHBOARD ENDPOINTS
// ==========================

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

// List all bookings (Admin)
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

// ==========================
// HELP & CHATBOT ENDPOINTS
// ==========================

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

// Special days list
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

// Health check
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

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Background crowd telemetry worker active (30s interval).`);
});
