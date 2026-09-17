const API_BASE_URL = '/api';

export interface Temple {
  id: string;
  name: string;
  name_tamil: string;
  district: string;
  city: string;
  deity: string;
  deity_tamil: string;
  image_url: string;
  description: string;
  description_tamil: string;
  location: string;
  is_verified: number;
  default_free_capacity: number;
  default_paid_capacity: number;
  default_paid_price: number;
  advance_booking_hours: number;
  facilities: string[];
  rules: string[];
  timings?: Array<{
    id: string;
    session_name: string;
    session_name_tamil: string;
    start_time: string;
    end_time: string;
    slot_duration_minutes: number;
  }>;
  live_crowd?: any;
}

export interface Slot {
  id: string;
  temple_id: string;
  date: string;
  start_time: string;
  end_time: string;
  free_capacity: number;
  paid_capacity: number;
  free_booked: number;
  paid_booked: number;
  free_available: number;
  paid_available: number;
  status: 'AVAILABLE' | 'LIMITED' | 'FULL';
  ai_recommended_capacity?: number;
}

export interface BookingResponse {
  id: string;
  booking_ref: string;
  temple_id: string;
  temple_name: string;
  temple_name_tamil: string;
  temple_location: string;
  temple_image: string;
  slot_id: string;
  slot_date: string;
  slot_time: string;
  darshan_type: 'FREE' | 'PAID';
  channel: 'ONLINE' | 'OFFLINE_COUNTER';
  primary_visitor_name: string;
  visitor_phone: string;
  total_visitors: number;
  amount_paid: number;
  booking_status: string;
  qr_code_payload: string;
  counter_number?: string;
  created_at: string;
  visitors: Array<{
    name: string;
    age: number;
    gender: string;
  }>;
  remaining_in_slot: number;
}

export const api = {
  // Temples
  getTemples: async (params?: { search?: string; district?: string; deity?: string }): Promise<Temple[]> => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.district) query.append('district', params.district);
    if (params?.deity) query.append('deity', params.deity);
    const res = await fetch(`${API_BASE_URL}/temples?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch temples');
    return res.json();
  },

  getTempleById: async (id: string): Promise<Temple> => {
    const res = await fetch(`${API_BASE_URL}/temples/${id}`);
    if (!res.ok) throw new Error('Failed to fetch temple details');
    return res.json();
  },

  // Slots
  getSlots: async (templeId: string, date: string): Promise<Slot[]> => {
    const res = await fetch(`${API_BASE_URL}/slots?templeId=${encodeURIComponent(templeId)}&date=${encodeURIComponent(date)}`);
    if (!res.ok) throw new Error('Failed to fetch slots');
    return res.json();
  },

  updateSlotCapacity: async (slotId: string, freeCap: number, paidCap: number) => {
    const res = await fetch(`${API_BASE_URL}/slots/${slotId}/capacity`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ free_capacity: freeCap, paid_capacity: paidCap })
    });
    if (!res.ok) throw new Error('Failed to update slot capacity');
    return res.json();
  },

  // Bookings
  createBooking: async (bookingData: any): Promise<BookingResponse> => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create booking');
    }
    return data;
  },

  getBookingByRef: async (ref: string): Promise<BookingResponse> => {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(ref)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Booking reference not found');
    return data;
  },

  cancelBooking: async (ref: string) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(ref)}/cancel`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel booking');
    return data;
  },

  verifyBooking: async (ref: string) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(ref)}/verify`, {
      method: 'POST'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to verify booking');
    return data;
  },

  // AI Crowd & CCTV
  getLiveCrowd: async (templeId?: string, cameraId?: string) => {
    const query = new URLSearchParams();
    if (templeId) query.append('templeId', templeId);
    if (cameraId) query.append('cameraId', cameraId);
    const res = await fetch(`${API_BASE_URL}/crowd/live?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch crowd telemetry');
    return res.json();
  },

  getCameras: async () => {
    const res = await fetch(`${API_BASE_URL}/crowd/cameras`);
    if (!res.ok) throw new Error('Failed to fetch cameras');
    return res.json();
  },

  // AI Recommendations
  getAIRecommendations: async (templeId?: string, date?: string) => {
    const query = new URLSearchParams();
    if (templeId) query.append('templeId', templeId);
    if (date) query.append('date', date);
    const res = await fetch(`${API_BASE_URL}/ai/recommendations?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  approveRecommendation: async (id: string, customCapacity?: number) => {
    const res = await fetch(`${API_BASE_URL}/ai/recommendations/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ custom_capacity: customCapacity })
    });
    if (!res.ok) throw new Error('Failed to approve recommendation');
    return res.json();
  },

  rejectRecommendation: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/ai/recommendations/${id}/reject`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to reject recommendation');
    return res.json();
  },

  // Admin Dashboard
  getAdminDashboard: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch admin metrics');
    return res.json();
  },

  getAllBookings: async (params?: { templeId?: string; channel?: string; darshanType?: string }) => {
    const query = new URLSearchParams();
    if (params?.templeId) query.append('templeId', params.templeId);
    if (params?.channel) query.append('channel', params.channel);
    if (params?.darshanType) query.append('darshanType', params.darshanType);
    const res = await fetch(`${API_BASE_URL}/admin/bookings?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch bookings list');
    return res.json();
  },

  // Support & Chat
  getSupportInfo: async () => {
    const res = await fetch(`${API_BASE_URL}/support`);
    if (!res.ok) throw new Error('Failed to fetch support info');
    return res.json();
  },

  sendChatMessage: async (message: string, templeId?: string, bookingRef?: string) => {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, templeId, bookingRef })
    });
    if (!res.ok) throw new Error('Failed to send chat message');
    return res.json();
  },

  getSpecialDays: async () => {
    const res = await fetch(`${API_BASE_URL}/special-days`);
    if (!res.ok) throw new Error('Failed to fetch special festival days');
    return res.json();
  }
};
