import axios from "./axios";

// Fetch free slots for a specific date from Zoho-backed endpoint
export const fetchFreeSlotsForDate = async (calendarId, date) => {
  const response = await axios.get(`/api/zoho/calendars/${calendarId}/free-slots/`, {
    params: { date },
  });
  // For zoho service, response format: { date, slots: [{start, end}] } or array of times
  return response.data;
};

// Fetch free slots for a range of days ahead (iterate dates on client)
export const fetchTwoWeekSlots = async (calendarId, startDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const requests = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    requests.push(fetchFreeSlotsForDate(calendarId, iso));
  }
  const results = await Promise.all(requests);
  // Normalize to { [date]: slots[] }
  const map = {};
  results.forEach((res) => {
    // res could be {date, slots} or {"2025-09-10": ["09:00"]}
    if (res && res.date && Array.isArray(res.slots)) {
      map[res.date] = res.slots;
    } else {
      // assume single key map
      Object.keys(res || {}).forEach((k) => {
        map[k] = res[k];
      });
    }
  });
  return map;
};

// Create appointment and receive payment link
export const createAppointment = async ({ specialization, date, time }) => {
  const response = await axios.post(`/api/appointments/create/`, {
    specialization,
    date,
    time,
  });
  return response.data; // { appointment, payment_url }
};

// Get user's appointments
export const fetchMyAppointments = async () => {
  const response = await axios.get(`/api/appointments/my/`);
  return response.data; // list
};

// Create or fetch consultation meeting link
export const ensureConsultationLink = async (appointmentId) => {
  const response = await axios.post(`/api/consultations/create/${appointmentId}/`);
  return response.data; // { meeting_link }
};


