import { getDatabase, runInTransaction, queryOne, queryAll, runSql } from '../config/database';
import { generateOrGetSlots, TempleSlot } from '../services/slotService';
import { createBooking, cancelBooking, verifyAndAttendBooking } from '../services/bookingService';
import { getLiveCrowdTelemetry, getAllCameras } from '../services/crowdAnalysisService';
import { handleChatbotQuery } from '../services/chatbotService';

/**
 * ============================================================================
 * UNIT TEST SUITE: AI TEMPLE DHARISANAM & SMART CROWD MANAGEMENT SYSTEM
 * ============================================================================
 * 
 * SCOPE & METHODOLOGY:
 * This suite executes granular unit tests on the core business logic, algorithms,
 * mathematical models, and transactional constraints without requiring a network port.
 * 
 * TEST MODULES:
 * 1. Slot Generation & Scheduling Matrix (Interval boundaries, Session alignment, Multipliers)
 * 2. Atomic Reservation & Concurrency Guard (ACID transactions, Capacity locks, TD references)
 * 3. AI Computer Vision & Little's Law Mathematical Model (Queue wait-time, Density thresholds)
 * 4. Cancellation & Gate Attendance State Machines (Double check-in guards, Capacity rollback)
 * 5. Bilingual NLP Contextual Intent Matcher (English / Tamil keyword classifiers)
 */

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    throw new Error(`Unit test assertion failed: ${testName}`);
  }
}

async function runUnitTests() {
  console.log('\n======================================================================');
  console.log('🧪 RUNNING GRANULAR UNIT TESTS: AI TEMPLE DHARISANAM BACKEND MODULES');
  console.log('======================================================================\n');

  // Initialize SQLite database in memory
  await getDatabase();

  const testTempleId = 'temple-palani';
  const testUnitDate = '2026-12-25'; // Fixed test date for isolation

  // Clean any previous test data on this date
  runSql('DELETE FROM bookings WHERE slot_id IN (SELECT id FROM slots WHERE date = ?)', [testUnitDate]);
  runSql('DELETE FROM slots WHERE date = ?', [testUnitDate]);

  // ==========================================================================
  // SUITE 1: SLOT GENERATION & SCHEDULING MATRIX
  // ==========================================================================
  console.log('📋 SUITE 1: Slot Generation & Scheduling Intervals');
  {
    const slots = generateOrGetSlots(testTempleId, testUnitDate);
    assert(Array.isArray(slots) && slots.length > 0, 'Generates non-empty slot array for active temple');

    // Verify 60-minute duration intervals
    for (const slot of slots) {
      const [sh, sm] = slot.start_time.split(':').map(Number);
      const [eh, em] = slot.end_time.split(':').map(Number);
      const diffMins = (eh * 60 + em) - (sh * 60 + sm);
      assert(diffMins === 60, `Slot ${slot.start_time}-${slot.end_time} must have exact 60-min duration`, `Found ${diffMins} mins`);
    }

    // Verify morning session begins at 06:00
    const morningSlot = slots.find(s => s.start_time === '06:00');
    assert(morningSlot !== undefined, 'First morning slot starts at 06:00 as configured in Palani temple timings');
    assert(morningSlot?.free_capacity === 500, 'Palani default free capacity is 500 devotees per slot');
    assert(morningSlot?.paid_capacity === 150, 'Palani default paid capacity is 150 devotees per slot');

    // Idempotency: Calling generateOrGetSlots again should return identical existing records without duplicating
    const reloadedSlots = generateOrGetSlots(testTempleId, testUnitDate);
    assert(reloadedSlots.length === slots.length, 'Slot generation is idempotent; subsequent calls return existing slots');
  }

  // ==========================================================================
  // SUITE 2: ATOMIC RESERVATION & CAPACITY BOUNDARY LOCKS
  // ==========================================================================
  console.log('\n🔒 SUITE 2: Atomic Reservation & Capacity Guard Logic');
  {
    const slots = generateOrGetSlots(testTempleId, testUnitDate);
    const targetSlot = slots[0];
    const initialFreeAvailable = targetSlot.free_available;

    // Test 2a: Overbooking boundary check
    let overbookErrorCaught = false;
    try {
      createBooking({
        temple_id: testTempleId,
        slot_id: targetSlot.id,
        darshan_type: 'FREE',
        channel: 'ONLINE',
        primary_visitor_name: 'Overbook Tester',
        visitor_phone: '9999999999',
        visitors: Array.from({ length: initialFreeAvailable + 1 }, (_, i) => ({
          name: `Overflow Devotee ${i + 1}`,
          age: 25,
          gender: 'Male'
        }))
      });
    } catch (err: any) {
      overbookErrorCaught = true;
      assert(err.message.includes('available for this time'), 'Rejection error message explicitly identifies capacity exhaustion');
    }
    assert(overbookErrorCaught, 'Strict transactional lock blocks overcapacity reservation requests');

    // Test 2b: Valid atomic reservation
    const bookingResult = createBooking({
      temple_id: testTempleId,
      slot_id: targetSlot.id,
      darshan_type: 'FREE',
      channel: 'ONLINE',
      primary_visitor_name: 'Annamalai Swamy',
      visitor_phone: '9840123456',
      visitor_email: 'annamalai@example.com',
      visitors: [
        { name: 'Annamalai Swamy', age: 40, gender: 'Male' },
        { name: 'Meenakshi Ammal', age: 38, gender: 'Female' }
      ]
    });

    assert(bookingResult.booking_ref.startsWith('TD'), 'Booking reference follows official format starting with "TD" prefix');
    assert(bookingResult.booking_status === 'CONFIRMED', 'Successful booking assigned "CONFIRMED" status');
    assert(bookingResult.total_visitors === 2, 'Total visitor count equals 2');

    // Test 2c: Verify slot inventory decremented accurately
    const updatedSlot = queryOne<any>('SELECT * FROM slots WHERE id = ?', [targetSlot.id]);
    assert(updatedSlot.free_booked === 2, 'Slot free_booked field accurately incremented by exactly 2');
  }

  // ==========================================================================
  // SUITE 3: CANCELLATION & GATE ATTENDANCE STATE TRANSITIONS
  // ==========================================================================
  console.log('\n🎟️ SUITE 3: State Transitions (Gate Check-in & Cancellation Rollback)');
  {
    const slots = generateOrGetSlots(testTempleId, testUnitDate);
    const testSlot = slots[1];

    // Create a temporary booking for gate verification
    const bookingToVerify = createBooking({
      temple_id: testTempleId,
      slot_id: testSlot.id,
      darshan_type: 'FREE',
      channel: 'ONLINE',
      primary_visitor_name: 'Gate Pass Pilgrim',
      visitor_phone: '9840998877',
      visitors: [{ name: 'Gate Pass Pilgrim', age: 30, gender: 'Male' }]
    });

    // Initial Gate Scan
    const firstCheckIn = verifyAndAttendBooking(bookingToVerify.booking_ref);
    assert(firstCheckIn.booking !== undefined && firstCheckIn.booking.booking_ref === bookingToVerify.booking_ref, 'Gate attendance scanner verifies valid confirmed pass');
    assert(firstCheckIn.already_attended === false, 'Pass marked as attended for the first time');

    // Duplicate Gate Scan Attempt
    const duplicateCheckIn = verifyAndAttendBooking(bookingToVerify.booking_ref);
    assert(duplicateCheckIn.booking !== undefined, 'Duplicate scan returned valid booking response');
    assert(duplicateCheckIn.already_attended === true, 'Anti-reuse security flags duplicate check-in attempt');

    // Create a second booking to test cancellation rollback
    const bookingToCancel = createBooking({
      temple_id: testTempleId,
      slot_id: testSlot.id,
      darshan_type: 'FREE',
      channel: 'ONLINE',
      primary_visitor_name: 'Cancelling Devotee',
      visitor_phone: '9840111222',
      visitors: [
        { name: 'Devotee A', age: 25, gender: 'Male' },
        { name: 'Devotee B', age: 27, gender: 'Female' }
      ]
    });

    const slotBeforeCancel = queryOne<any>('SELECT free_booked FROM slots WHERE id = ?', [testSlot.id]);
    const cancelRes = cancelBooking(bookingToCancel.booking_ref);
    assert(cancelRes.success === true, 'Cancellation execution reports success');

    const slotAfterCancel = queryOne<any>('SELECT free_booked FROM slots WHERE id = ?', [testSlot.id]);
    assert(slotAfterCancel.free_booked === slotBeforeCancel.free_booked - 2, 'Cancellation transaction rolls back slot free_booked by exactly 2');
  }

  // ==========================================================================
  // SUITE 4: AI COMPUTER VISION & LITTLE'S LAW WAIT-TIME MODEL
  // ==========================================================================
  console.log('\n🎥 SUITE 4: AI Computer Vision & Little\'s Law Queue Modeling');
  {
    const telemetry = getLiveCrowdTelemetry('temple-palani', 'cam-prakaram');
    assert(telemetry.camera_id === 'cam-prakaram', 'Telemetry matches requested camera node');
    assert(telemetry.occupancy_percent >= 0 && telemetry.occupancy_percent <= 100, 'Occupancy percentage bounded between 0% and 100%');
    assert(typeof telemetry.estimated_waiting_time_mins === 'number' && telemetry.estimated_waiting_time_mins >= 0, 'Estimated wait time is non-negative number');
    assert(['LOW', 'MEDIUM', 'HIGH', 'VERY HIGH'].includes(telemetry.crowd_level), `Crowd level classified into valid tier: ${telemetry.crowd_level}`);
    assert(Array.isArray(telemetry.simulated_detections) && telemetry.simulated_detections.length > 0, 'Vision simulator generates simulated bounding boxes with confidence scores');

    const cameras = getAllCameras();
    assert(Array.isArray(cameras) && cameras.length >= 4, 'Provides camera registry covering all critical temple holding zones');
  }

  // ==========================================================================
  // SUITE 5: BILINGUAL CONTEXTUAL INTENT MATCHING (NLP CHATBOT)
  // ==========================================================================
  console.log('\n🤖 SUITE 5: Bilingual Chatbot Contextual NLP Intent Matching');
  {
    // English darshan booking query
    const chatEn = handleChatbotQuery('How do I book free darshan online?', 'temple-palani');
    assert(typeof chatEn.reply === 'string' && chatEn.reply.includes('Darshan'), 'English query recognizes booking intent and replies with booking instructions');

    // Tamil timings query
    const chatTa = handleChatbotQuery('தரிசன நேரம் என்ன?', 'temple-palani');
    assert(typeof chatTa.reply_tamil === 'string' && chatTa.reply_tamil.length > 10, 'Tamil query triggers bilingual response containing Tamil text');

    // Dress code query
    const dressCodeQuery = handleChatbotQuery('What is the dress code?', 'temple-palani');
    assert(dressCodeQuery.reply.toLowerCase().includes('dhoti') || dressCodeQuery.reply.toLowerCase().includes('traditional'), 'Dress code query retrieves traditional attire rules');
  }

  // ==========================================================================
  // CLEANUP & SUMMARY
  // ==========================================================================
  runSql('DELETE FROM bookings WHERE slot_id IN (SELECT id FROM slots WHERE date = ?)', [testUnitDate]);
  runSql('DELETE FROM slots WHERE date = ?', [testUnitDate]);

  console.log('\n======================================================================');
  console.log(`📊 UNIT TEST SUMMARY: ${passedTests}/${totalTests} TESTS PASSED (${failedTests} FAILED)`);
  console.log('======================================================================\n');
}

runUnitTests().catch(err => {
  console.error('\n❌ Unit test runner failed:', err);
  process.exit(1);
});
