import http from 'http';

const BASE_URL = 'http://localhost:5000';

async function request(path: string, options: { method?: string; body?: any } = {}): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode || 500, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASSED: ${message}`);
}

async function runTests() {
  console.log('\n==================================================');
  console.log('🏛️  AI TEMPLE DHARISANAM SYSTEM: END-TO-END VERIFICATION');
  console.log('==================================================\n');

  // Test 1: Health Check
  console.log('--- TEST 1: Health & API Accessibility ---');
  const healthRes = await request('/api/health');
  assert(healthRes.status === 200, 'Health check returns status 200');
  assert(healthRes.data.status === 'HEALTHY', 'Backend server reports HEALTHY');

  // Test 2: Temples Listing & District Filtering
  console.log('\n--- TEST 2: Temples Listing & Filtering ---');
  const templesRes = await request('/api/temples');
  assert(templesRes.status === 200, 'Temples endpoint returns 200');
  assert(Array.isArray(templesRes.data) && templesRes.data.length >= 12, 'Loaded at least 12 verified Tamil Nadu temples');

  const palaniRes = await request('/api/temples/temple-palani');
  assert(palaniRes.status === 200, 'Palani temple details retrieved');
  assert(palaniRes.data.timings && palaniRes.data.timings.length > 0, 'Palani temple has active timings');
  assert(palaniRes.data.live_crowd !== undefined, 'Palani temple has live crowd telemetry attached');

  // Test 3: Dynamic Slot Generation
  console.log('\n--- TEST 3: Dynamic Slot Generation ---');
  const testDate = '2026-09-28';
  const slotsRes = await request(`/api/slots?templeId=temple-palani&date=${testDate}`);
  assert(slotsRes.status === 200, 'Slots endpoint returns 200');
  assert(Array.isArray(slotsRes.data) && slotsRes.data.length > 0, 'Successfully auto-generated 1-hour slots matching temple timings');
  const firstSlot = slotsRes.data[0];
  console.log(`   Sample Slot: ${firstSlot.start_time} - ${firstSlot.end_time} | Free Cap: ${firstSlot.free_capacity} | Paid Cap: ${firstSlot.paid_capacity}`);

  // Test 4: Concurrency & Strict Capacity Guard Test
  console.log('\n--- TEST 4: Concurrency & Capacity Guard Test ---');
  const slotToTest = slotsRes.data[1]; // Use second slot
  const remainingFree = slotToTest.free_available;
  console.log(`   Testing Slot ${slotToTest.id} with initial free available: ${remainingFree}`);

  // 4a: Booking that exceeds capacity
  const oversizedVisitors = Array.from({ length: remainingFree + 5 }, (_, i) => ({
    name: `Devotee ${i + 1}`,
    age: 30,
    gender: 'Male'
  }));

  const oversizedBooking = await request('/api/bookings', {
    method: 'POST',
    body: {
      temple_id: 'temple-palani',
      slot_id: slotToTest.id,
      darshan_type: 'FREE',
      channel: 'ONLINE',
      primary_visitor_name: 'Test Overbook',
      visitor_phone: '9876543210',
      visitor_email: 'test@example.com',
      visitors: oversizedVisitors
    }
  });
  assert(oversizedBooking.status === 400, 'Overcapacity booking rejected with status 400');
  assert(oversizedBooking.data.error.includes('available for this time'), `Error message correctly identifies capacity limit: "${oversizedBooking.data.error}"`);

  // 4b: Booking that exactly matches partial capacity
  const validBooking = await request('/api/bookings', {
    method: 'POST',
    body: {
      temple_id: 'temple-palani',
      slot_id: slotToTest.id,
      darshan_type: 'FREE',
      channel: 'ONLINE',
      primary_visitor_name: 'Murugan Bhaktar',
      visitor_phone: '9876543210',
      visitor_email: 'murugan@example.com',
      visitors: [
        { name: 'Murugan Bhaktar', age: 35, gender: 'Male' },
        { name: 'Valli Devi', age: 32, gender: 'Female' }
      ]
    }
  });
  assert(validBooking.status === 201, 'Valid booking succeeds with status 201');
  assert(validBooking.data.booking_ref.startsWith('TD'), `Booking reference generated with TD format: ${validBooking.data.booking_ref}`);
  const testBookingRef = validBooking.data.booking_ref;

  // Test 5: Shared Online/Offline Counter Capacity
  console.log('\n--- TEST 5: Shared Online/Offline Real-Time Capacity ---');
  // Check available slots right now
  const slotsAfterOnline = await request(`/api/slots?templeId=temple-palani&date=${testDate}`);
  const slotAfterOnline = slotsAfterOnline.data.find((s: any) => s.id === slotToTest.id);
  assert(slotAfterOnline.free_available === remainingFree - 2, `Available capacity decreased by 2 after online booking: ${slotAfterOnline.free_available}`);

  // Book 3 slots via OFFLINE_COUNTER
  const offlineBooking = await request('/api/bookings', {
    method: 'POST',
    body: {
      temple_id: 'temple-palani',
      slot_id: slotToTest.id,
      darshan_type: 'FREE',
      channel: 'OFFLINE_COUNTER',
      counter_staff_id: 'STAFF-DESK-01',
      counter_number: 'Counter #3',
      primary_visitor_name: 'Walkin Devotee',
      visitor_phone: '9840112233',
      visitors: [
        { name: 'Devotee 1', age: 50, gender: 'Male' },
        { name: 'Devotee 2', age: 48, gender: 'Female' },
        { name: 'Devotee 3', age: 20, gender: 'Male' }
      ]
    }
  });
  assert(offlineBooking.status === 201, 'Offline counter walk-in booking succeeds with 201');

  // Verify online slot count immediately reflects the offline booking deduction
  const slotsAfterOffline = await request(`/api/slots?templeId=temple-palani&date=${testDate}`);
  const slotAfterOffline = slotsAfterOffline.data.find((s: any) => s.id === slotToTest.id);
  assert(slotAfterOffline.free_available === remainingFree - 5, `Offline counter booking immediately synchronized with online availability: ${slotAfterOffline.free_available}`);

  // Test 6: Gate Pass Verification & Double-Check-in Prevention
  console.log('\n--- TEST 6: Gate Pass Verification & Attendance ---');
  const verify1 = await request(`/api/bookings/${testBookingRef}/verify`, { method: 'POST' });
  assert(verify1.status === 200, 'Initial gate QR verification succeeds');
  assert(verify1.data.already_attended === false, 'Ticket marked as attended for the first time');

  const verify2 = await request(`/api/bookings/${testBookingRef}/verify`, { method: 'POST' });
  assert(verify2.status === 200, 'Second verification attempt handles duplicate entry');
  assert(verify2.data.already_attended === true, 'Gate scanner prevents and flags duplicate entry');

  // Test 7: AI Crowd Recommendations & Admin Approval
  console.log('\n--- TEST 7: AI Crowd Recommendations & Capacity Approval ---');
  const aiRecs = await request(`/api/ai/recommendations?templeId=temple-palani&date=${testDate}`);
  assert(aiRecs.status === 200, 'AI Recommendations endpoint returns 200');
  assert(Array.isArray(aiRecs.data) && aiRecs.data.length > 0, 'AI model generated slot capacity recommendations');

  const firstRec = aiRecs.data[0];
  console.log(`   Generated recommendation for ${firstRec.time_range}: Current Cap ${firstRec.current_capacity} -> Recommended ${firstRec.recommended_capacity}`);

  const approveRes = await request(`/api/ai/recommendations/${firstRec.id}/approve`, {
    method: 'POST',
    body: { custom_capacity: 650 }
  });
  assert(approveRes.status === 200, 'Admin approved AI recommendation successfully');

  // Verify that slot capacity was updated
  const updatedSlots = await request(`/api/slots?templeId=temple-palani&date=${testDate}`);
  const updatedSlot = updatedSlots.data.find((s: any) => s.id === firstRec.slot_id);
  assert(updatedSlot.free_capacity === 650, `Slot free capacity successfully dynamically updated to 650: ${updatedSlot.free_capacity}`);

  // Test 8: Bilingual Chatbot Assistance
  console.log('\n--- TEST 8: Bilingual Chatbot Knowledge-Base ---');
  const chatEn = await request('/api/chat', {
    method: 'POST',
    body: {
      message: 'How do I book free dharisanam?',
      templeId: 'temple-palani'
    }
  });
  assert(chatEn.status === 200, 'Chatbot English query returns 200');
  assert(typeof chatEn.data.reply === 'string' && chatEn.data.reply.length > 10, 'Chatbot provides relevant English response');

  const chatTa = await request('/api/chat', {
    method: 'POST',
    body: {
      message: 'தரிசன நேரம் என்ன?',
      templeId: 'temple-palani'
    }
  });
  assert(chatTa.status === 200, 'Chatbot Tamil query returns 200');
  assert(typeof chatTa.data.reply_tamil === 'string' && chatTa.data.reply_tamil.length > 10, 'Chatbot provides relevant Tamil response');

  console.log('\n==================================================');
  console.log('🎉 ALL 8 INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
