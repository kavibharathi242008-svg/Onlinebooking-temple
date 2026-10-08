import { queryAll, queryOne, runSql, saveDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

/**
 * Slot entity representation with capacity allocations and remaining quotas.
 */
export interface TempleSlot {
  id: string;
  temple_id: string;
  date: string;
  start_time: string;
  end_time: string;
  free_capacity: number;
  paid_capacity: number;
  free_booked: number;
  paid_booked: number;
  ai_recommended_capacity: number | null;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  free_available: number;
  paid_available: number;
}

/**
 * Retrieves existing slots or automatically slices active temple session timings
 * into granular, non-overlapping intervals (e.g. 60-minute duration slots).
 * Applies festival multipliers if the target date is registered under `special_days`.
 * 
 * @param {string} templeId - Unique temple identifier.
 * @param {string} dateStr - Target date string in YYYY-MM-DD format.
 * @returns {TempleSlot[]} Chronologically ordered list of slots with calculated availabilities.
 * @throws {Error} If temple is not found.
 */
export function generateOrGetSlots(templeId: string, dateStr: string): TempleSlot[] {
  // Check if slots already exist for this temple & date
  let slots = queryAll<any>(
    'SELECT * FROM slots WHERE temple_id = ? AND date = ? ORDER BY start_time ASC',
    [templeId, dateStr]
  );

  if (slots.length === 0) {
    // Generate slots from temple_timings
    const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [templeId]);
    if (!temple) throw new Error('Temple not found');

    const timings = queryAll<any>(
      'SELECT * FROM temple_timings WHERE temple_id = ? AND is_active = 1 ORDER BY start_time ASC',
      [templeId]
    );

    // Check if special day has a capacity multiplier
    const specialDay = queryOne<any>(
      'SELECT * FROM special_days WHERE temple_id = ? AND date = ?',
      [templeId, dateStr]
    );
    const capacityMultiplier = specialDay?.slot_capacity_modifier || 1.0;

    const freeCap = Math.round(temple.default_free_capacity * capacityMultiplier);
    const paidCap = Math.round(temple.default_paid_capacity * capacityMultiplier);

    for (const timing of timings) {
      const [startHour, startMin] = timing.start_time.split(':').map(Number);
      const [endHour, endMin] = timing.end_time.split(':').map(Number);
      const duration = timing.slot_duration_minutes || 60;

      let currentMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      while (currentMinutes + duration <= endMinutes) {
        const slotStartH = Math.floor(currentMinutes / 60);
        const slotStartM = currentMinutes % 60;
        const slotEndH = Math.floor((currentMinutes + duration) / 60);
        const slotEndM = (currentMinutes + duration) % 60;

        const slotStartTime = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
        const slotEndTime = `${String(slotEndH).padStart(2, '0')}:${String(slotEndM).padStart(2, '0')}`;

        runSql(`
          INSERT INTO slots (
            id, temple_id, date, start_time, end_time, free_capacity, paid_capacity,
            free_booked, paid_booked, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 'AVAILABLE')
        `, [
          uuidv4(), templeId, dateStr, slotStartTime, slotEndTime, freeCap, paidCap
        ]);

        currentMinutes += duration;
      }
    }

    saveDatabase();

    slots = queryAll<any>(
      'SELECT * FROM slots WHERE temple_id = ? AND date = ? ORDER BY start_time ASC',
      [templeId, dateStr]
    );
  }

  // Calculate real-time available counts and status labels
  return slots.map(s => {
    const freeAvailable = Math.max(0, s.free_capacity - s.free_booked);
    const paidAvailable = Math.max(0, s.paid_capacity - s.paid_booked);

    let status: 'AVAILABLE' | 'LIMITED' | 'FULL' = 'AVAILABLE';
    if (freeAvailable === 0) {
      status = 'FULL';
    } else if (freeAvailable <= s.free_capacity * 0.2) {
      status = 'LIMITED';
    }

    return {
      ...s,
      free_available: freeAvailable,
      paid_available: paidAvailable,
      status
    };
  });
}

export function updateSlotCapacity(slotId: string, freeCapacity: number, paidCapacity: number): void {
  runSql(
    'UPDATE slots SET free_capacity = ?, paid_capacity = ? WHERE id = ?',
    [freeCapacity, paidCapacity, slotId]
  );
  saveDatabase();
}
