import { queryOne, runInTransaction, runSql, saveDatabase, queryAll } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface VisitorInput {
  name: string;
  age: number;
  gender: string;
  id_proof_type?: string;
  id_proof_number?: string;
}

export interface CreateBookingParams {
  temple_id: string;
  slot_id: string;
  darshan_type: 'FREE' | 'PAID';
  channel: 'ONLINE' | 'OFFLINE_COUNTER';
  primary_visitor_name: string;
  visitor_phone: string;
  visitor_email?: string;
  visitors: VisitorInput[];
  payment_method?: string;
  counter_staff_id?: string;
  counter_number?: string;
}

export function createBooking(params: CreateBookingParams) {
  const {
    temple_id,
    slot_id,
    darshan_type,
    channel,
    primary_visitor_name,
    visitor_phone,
    visitor_email,
    visitors,
    payment_method,
    counter_staff_id,
    counter_number
  } = params;

  if (!visitors || visitors.length === 0) {
    throw new Error('At least one visitor detail is required.');
  }

  const requestedCount = visitors.length;

  return runInTransaction(() => {
    // 1. Lock and fetch current slot
    const slot = queryOne<any>('SELECT * FROM slots WHERE id = ?', [slot_id]);
    if (!slot) {
      throw new Error('Selected time slot does not exist.');
    }

    const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [temple_id]);
    if (!temple) {
      throw new Error('Temple not found.');
    }

    const isPaid = darshan_type === 'PAID';
    const currentBooked = isPaid ? slot.paid_booked : slot.free_booked;
    const capacity = isPaid ? slot.paid_capacity : slot.free_capacity;
    const remaining = capacity - currentBooked;

    // Check capacity strictly
    if (requestedCount > remaining) {
      if (remaining <= 0) {
        throw new Error('Slot Full. Please select another slot.');
      } else {
        throw new Error(`Only ${remaining} slots are available for this time. Please select another slot.`);
      }
    }

    // 2. Compute payment amount
    const ticketPrice = isPaid ? (temple.default_paid_price || 100) : 0;
    const totalAmount = ticketPrice * requestedCount;

    // 3. Generate unique Booking Reference: TD{YYYYMMDD}{4-random-digits}
    const cleanDate = slot.date.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `TD${cleanDate}${randomSuffix}`;

    const bookingId = uuidv4();

    // 4. Update slot booked count atomically
    if (isPaid) {
      runSql('UPDATE slots SET paid_booked = paid_booked + ? WHERE id = ?', [requestedCount, slot_id]);
    } else {
      runSql('UPDATE slots SET free_booked = free_booked + ? WHERE id = ?', [requestedCount, slot_id]);
    }

    // Check updated status
    const newBooked = currentBooked + requestedCount;
    let newStatus = 'AVAILABLE';
    if (newBooked >= capacity) {
      newStatus = 'FULL';
    } else if (newBooked >= capacity * 0.8) {
      newStatus = 'LIMITED';
    }
    runSql('UPDATE slots SET status = ? WHERE id = ?', [newStatus, slot_id]);

    // 5. Generate QR code payload string
    const qrPayload = JSON.stringify({
      ref: bookingRef,
      temple: temple.name,
      date: slot.date,
      time: `${slot.start_time} - ${slot.end_time}`,
      type: darshan_type,
      visitors: requestedCount,
      lead: primary_visitor_name,
      channel: channel
    });

    // 6. Insert booking record
    runSql(`
      INSERT INTO bookings (
        id, booking_ref, temple_id, slot_id, darshan_type, channel,
        primary_visitor_name, visitor_phone, visitor_email, total_visitors,
        amount_paid, payment_method, payment_status, booking_status,
        counter_staff_id, counter_number, qr_code_payload, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, ?, ?, datetime('now'))
    `, [
      bookingId,
      bookingRef,
      temple_id,
      slot_id,
      darshan_type,
      channel,
      primary_visitor_name,
      visitor_phone,
      visitor_email || null,
      requestedCount,
      totalAmount,
      isPaid ? (payment_method || 'MOCK_UPI') : 'FREE',
      isPaid ? 'COMPLETED' : 'FREE',
      counter_staff_id || null,
      counter_number || null,
      qrPayload
    ]);

    // 7. Insert all individual visitors
    for (const v of visitors) {
      runSql(`
        INSERT INTO booking_visitors (
          id, booking_id, name, age, gender, id_proof_type, id_proof_number
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        bookingId,
        v.name,
        v.age,
        v.gender,
        v.id_proof_type || null,
        v.id_proof_number || null
      ]);
    }

    // 8. Retrieve complete ticket details
    const booking = queryOne<any>('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    const visitorList = queryAll<any>('SELECT * FROM booking_visitors WHERE booking_id = ?', [bookingId]);

    return {
      ...booking,
      temple_name: temple.name,
      temple_name_tamil: temple.name_tamil,
      temple_location: temple.location,
      temple_image: temple.image_url,
      slot_date: slot.date,
      slot_time: `${slot.start_time} - ${slot.end_time}`,
      visitors: visitorList,
      remaining_in_slot: capacity - newBooked
    };
  });
}

export function getBookingByRef(bookingRef: string) {
  const booking = queryOne<any>('SELECT * FROM bookings WHERE booking_ref = ?', [bookingRef]);
  if (!booking) return null;

  const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [booking.temple_id]);
  const slot = queryOne<any>('SELECT * FROM slots WHERE id = ?', [booking.slot_id]);
  const visitors = queryAll<any>('SELECT * FROM booking_visitors WHERE booking_id = ?', [booking.id]);

  return {
    ...booking,
    temple_name: temple?.name,
    temple_name_tamil: temple?.name_tamil,
    temple_location: temple?.location,
    temple_image: temple?.image_url,
    slot_date: slot?.date,
    slot_time: slot ? `${slot.start_time} - ${slot.end_time}` : '',
    visitors
  };
}

export function cancelBooking(bookingRef: string) {
  return runInTransaction(() => {
    const booking = queryOne<any>('SELECT * FROM bookings WHERE booking_ref = ?', [bookingRef]);
    if (!booking) throw new Error('Booking not found');
    if (booking.booking_status === 'CANCELLED') throw new Error('Booking is already cancelled');

    const isPaid = booking.darshan_type === 'PAID';
    if (isPaid) {
      runSql('UPDATE slots SET paid_booked = MAX(0, paid_booked - ?) WHERE id = ?', [booking.total_visitors, booking.slot_id]);
    } else {
      runSql('UPDATE slots SET free_booked = MAX(0, free_booked - ?) WHERE id = ?', [booking.total_visitors, booking.slot_id]);
    }

    runSql("UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_ref = ?", [bookingRef]);

    return { success: true, message: 'Booking cancelled successfully' };
  });
}

export function verifyAndAttendBooking(bookingRef: string) {
  return runInTransaction(() => {
    const booking = getBookingByRef(bookingRef);
    if (!booking) throw new Error('Booking not found');
    if (booking.booking_status === 'CANCELLED') throw new Error('Cannot verify: this booking has been CANCELLED');
    if (booking.booking_status === 'ATTENDED') {
      return {
        already_attended: true,
        message: 'Devotee has already entered (Already Marked as ATTENDED)',
        booking
      };
    }

    runSql("UPDATE bookings SET booking_status = 'ATTENDED' WHERE booking_ref = ?", [bookingRef]);

    return {
      already_attended: false,
      message: 'Gate Pass Verified & Entry Granted (Marked as ATTENDED)',
      booking: { ...booking, booking_status: 'ATTENDED' }
    };
  });
}


