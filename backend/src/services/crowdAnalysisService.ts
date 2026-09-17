import { queryOne, runSql, saveDatabase } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export interface BoundingBox {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  confidence: number;
  label: string;
}

export interface CCTVFeedStatus {
  camera_id: string;
  camera_name: string;
  location_area: string;
  current_count: number;
  max_safe_capacity: number;
  occupancy_percent: number;
  crowd_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH';
  estimated_waiting_time_mins: number;
  recommended_action: string;
  simulated_detections: BoundingBox[];
  last_updated: string;
}

// Preset cameras per temple
const CAMERAS = [
  { id: 'cam-rajagopuram', name: 'Camera 01: Main Rajagopuram Entrance', area: 'Outer Entrance & Footwear Bay', baseCapacity: 500 },
  { id: 'cam-prakaram', name: 'Camera 02: Mandapam Holding Queue', area: 'Maha Mandapam Queue Complex', baseCapacity: 450 },
  { id: 'cam-express', name: 'Camera 03: Paid Darshan Express Corridor', area: 'Special Entry Corridor', baseCapacity: 200 },
  { id: 'cam-sanctorum', name: 'Camera 04: Inner Sanctum Exit Precinct', area: 'Garba Griha Exit Path', baseCapacity: 300 }
];

export function getLiveCrowdTelemetry(templeId: string, cameraId: string = 'cam-prakaram'): CCTVFeedStatus {
  const temple = queryOne<any>('SELECT * FROM temples WHERE id = ?', [templeId]);
  const cam = CAMERAS.find(c => c.id === cameraId) || CAMERAS[1];

  // Derive realistic dynamic crowd based on time of day and slot capacity
  const now = new Date();
  const currentHour = now.getHours();

  // Peak temple hours typically 7-10am and 5-8pm
  let peakFactor = 0.55;
  if ((currentHour >= 7 && currentHour <= 10) || (currentHour >= 17 && currentHour <= 20)) {
    peakFactor = 0.85; // High demand
  } else if (currentHour >= 11 && currentHour <= 16) {
    peakFactor = 0.65;
  }

  // Add subtle sinusoidal jitter to emulate live fluctuating crowd
  const jitter = Math.sin(Date.now() / 15000) * 0.08;
  const effectiveOccupancy = Math.min(0.96, Math.max(0.35, peakFactor + jitter));

  const maxCapacity = cam.baseCapacity;
  const currentCount = Math.round(maxCapacity * effectiveOccupancy);
  const occupancyPercent = parseFloat(((currentCount / maxCapacity) * 100).toFixed(1));

  let crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY HIGH' = 'LOW';
  let waitMins = 15;
  let recommendedAction = 'Normal entry. Direct pilgrims to open queues.';

  if (occupancyPercent >= 85) {
    crowdLevel = 'VERY HIGH';
    waitMins = Math.round(currentCount / 9.5); // ~45-50 mins
    recommendedAction = 'High congestion. Throttle walk-in counter tickets and redirect online bookings to next slot.';
  } else if (occupancyPercent >= 70) {
    crowdLevel = 'HIGH';
    waitMins = Math.round(currentCount / 10.5); // ~30-40 mins
    recommendedAction = 'Recommend directing new bookings toward upcoming lower-occupancy slots.';
  } else if (occupancyPercent >= 45) {
    crowdLevel = 'MEDIUM';
    waitMins = Math.round(currentCount / 12); // ~15-25 mins
    recommendedAction = 'Crowd is manageable. Maintain steady sanctum queue clearance.';
  } else {
    crowdLevel = 'LOW';
    waitMins = Math.round(Math.max(5, currentCount / 14));
    recommendedAction = 'Optimal darshan conditions. Low waiting period.';
  }

  // Generate simulated YOLO person detections for visual rendering
  const sampleDetectionsCount = Math.min(24, Math.max(8, Math.round(currentCount / 20)));
  const simulatedDetections: BoundingBox[] = [];

  for (let i = 0; i < sampleDetectionsCount; i++) {
    // Generate pseudo-random coordinates that cluster towards center/queue lines
    const seed = (i * 137 + Math.floor(Date.now() / 2000)) % 1000;
    const norm = seed / 1000;
    simulatedDetections.push({
      id: i + 1,
      x: Math.round(50 + (i % 6) * 120 + (norm * 30)),
      y: Math.round(80 + Math.floor(i / 6) * 90 + ((1 - norm) * 20)),
      w: Math.round(45 + (norm * 15)),
      h: Math.round(90 + (norm * 25)),
      confidence: parseFloat((0.85 + (norm * 0.13)).toFixed(2)),
      label: 'person'
    });
  }

  // Record in crowd_data table periodically
  runSql(`
    INSERT INTO crowd_data (
      id, temple_id, timestamp, camera_id, camera_name, detected_count,
      max_safe_capacity, occupancy_percent, crowd_level, estimated_wait_minutes, recommended_action
    ) VALUES (?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    uuidv4(), templeId, cam.id, cam.name, currentCount, maxCapacity,
    occupancyPercent, crowdLevel, waitMins, recommendedAction
  ]);
  saveDatabase();

  return {
    camera_id: cam.id,
    camera_name: cam.name,
    location_area: cam.area,
    current_count: currentCount,
    max_safe_capacity: maxCapacity,
    occupancy_percent: occupancyPercent,
    crowd_level: crowdLevel,
    estimated_waiting_time_mins: waitMins,
    recommended_action: recommendedAction,
    simulated_detections: simulatedDetections,
    last_updated: new Date().toLocaleTimeString()
  };
}

export function getAllCameras() {
  return CAMERAS;
}
