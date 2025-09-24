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
export const  fetchTwoWeekSlots = async (calendarId, startDate) => {
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

export const fetchSlotsForRange = async (calendarId, startDate) => {
  const response = await axios.get(`/api/zoho/calendars/${calendarId}/free-slots/`, {
    params: { start_date: startDate },
  });

  return response.data.slots || {};
};

export const fetchSlotsForDoctor = async (doctorId) => {
  const response = await axios.get(`/api/doctors/${doctorId}/calendar-slots/`);
  return response.data.slots || {}; 
};

// Create appointment and receive payment link
export const createAppointment = async ({ specialization, date, time, plan_id }) => {
  const response = await axios.post(`/api/appointments/create/`, {
    specialization,
    date,
    time,
    plan_id,
  });
  return response.data; // { appointment, payment_url }
};

// Get user's appointments
export const fetchMyAppointments = async (statuses = []) => {
  // Ensure statuses is always an array
  const params = new URLSearchParams();
  statuses.forEach((s) => params.append("status", s));

  const response = await axios.get(`/api/appointments/my/`, { params });
  return response.data; // list of appointments
};

export const fetchUpcomingAppointments = async () => {
  const response = await axios.post(`/api/bookings/fetch-followups/`);
  return response.data; // list of appointments
};

// Create or fetch consultation meeting link
export const ensureConsultationLink = async (appointmentId) => {
  const response = await axios.post(`/api/consultations/create/${appointmentId}/`);
  return response.data; // { meeting_link }
};

export const fetchFollowUpAppointments = async () => {
  const response = await axios.get(`/api/appointments/follow-ups/`);
  return response.data; // list
}

export const rescheduleAppointment = async ({ appointment_id, date, time }) => {
  const response = await axios.post("/bookings/reschedule/", {
    appointment_id,
    date,
    time,
  });
  return response.data;
};

export const getDoctorAvailableSlots = async (doctorId, daysAhead = 14) => {
  const response = await axios.get(`/api/doctors/${doctorId}/available-slots/`, {
    params: { days: daysAhead },
  });
  return response.data; // Expected format: [{date: "2024-01-15", time: "10:00"}, ...]
};

// Alternative: Fetch doctor's calendar slots using Zoho integration
export const fetchDoctorSlotsForRange = async (doctorId, startDate) => {
  const response = await axios.get(`/api/doctors/${doctorId}/calendar-slots/`, {
    params: { start_date: startDate },
  });
  return response.data.slots || {}; // Expected format: {"2024-01-15": ["10:00", "11:00"], ...}
};

// Fetch doctor's free slots for a specific date
export const fetchDoctorFreeSlotsForDate = async (doctorId, date) => {
  const response = await axios.get(`/api/doctors/${doctorId}/free-slots/`, {
    params: { date },
  });
  return response.data; // Expected format: {date: "2024-01-15", slots: ["10:00", "11:00"]}
};

// Fetch two weeks of slots for a doctor (similar to your existing pattern)
export const fetchDoctorTwoWeekSlots = async (doctorId, startDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const requests = [];
  
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    requests.push(fetchDoctorFreeSlotsForDate(doctorId, iso));
  }
  
  const results = await Promise.all(requests);
  
  // Normalize to { [date]: slots[] }
  const map = {};
  results.forEach((res) => {
    if (res && res.date && Array.isArray(res.slots)) {
      map[res.date] = res.slots;
    } else {
      // Handle different response formats
      Object.keys(res || {}).forEach((k) => {
        if (Array.isArray(res[k])) {
          map[k] = res[k];
        }
      });
    }
  });
  
  return map;
};

// Enhanced reschedule appointment function
export const rescheduleAppointmentEnhanced = async (appointmentId, newSlot) => {
  const response = await axios.patch(`/api/appointments/${appointmentId}/reschedule/`, {
    date: newSlot.date,
    time: newSlot.time
  });
  return response.data; // Updated appointment object
};

// Alternative reschedule using your existing pattern
export const rescheduleAppointmentV2 = async ({ appointment_id, date, time }) => {
  const response = await axios.post("/api/appointments/reschedule/", {
    appointment_id,
    date,
    time,
  });
  return response.data;
};

// PAYMENT APIs

// Create Razorpay order for appointment payment
export const createPaymentOrder = async (appointmentId, planData) => {
  const response = await axios.post(`/api/payments/create-order/${appointmentId}/`, {
    plan_id: planData.plan_id || planData.id,
    amount: parseFloat(planData.price || planData.amount)
  });
  return response.data; // { order_id, razorpay_key, amount, currency, ... }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentData) => {
  const response = await axios.post('/api/payments/verify-payment/', {
    razorpay_order_id: paymentData.razorpay_order_id,
    razorpay_payment_id: paymentData.razorpay_payment_id,
    razorpay_signature: paymentData.razorpay_signature,
  });
  return response.data;
};

// Cancel payment for appointment
export const cancelAppointmentPayment = async (appointmentId) => {
  const response = await axios.post('/api/payments/cancel-payment/', {
    appointment_id: appointmentId
  });
  return response.data;
};

// Get payment status for appointment
export const getPaymentStatus = async (appointmentId) => {
  const response = await axios.get(`/api/payments/status/${appointmentId}/`);
  return response.data; // { status: "pending" | "completed" | "failed", payment_details: ... }
};

// Initiate payment for existing appointment (pay later functionality)
export const initiatePaymentForAppointment = async (appointmentId, planData) => {
  const response = await axios.post(`/api/appointments/${appointmentId}/payment/`, {
    plan_id: planData.plan_id || planData.id,
    amount: parseFloat(planData.price || planData.amount)
  });
  return response.data; // { payment_url, order_id, ... }
};

// Get appointment payment details
export const getAppointmentPaymentDetails = async (appointmentId) => {
  const response = await axios.get(`/api/appointments/${appointmentId}/payment-details/`);
  return response.data; // { amount_due, payment_status, plan_details, ... }
};

// UTILITY APIs

// Check if appointment can be rescheduled
export const canRescheduleAppointment = async (appointmentId) => {
  const response = await axios.get(`/api/appointments/${appointmentId}/can-reschedule/`);
  return response.data; // { can_reschedule: boolean, reason: string }
};

// Get doctor's calendar ID (if needed for Zoho integration)
export const getDoctorCalendarId = async (doctorId) => {
  const response = await axios.get(`/api/doctors/${doctorId}/calendar/`);
  return response.data; // { calendar_id, calendar_name, ... }
};

// Fetch appointment details with payment and reschedule info
export const fetchAppointmentDetails = async (appointmentId) => {
  const response = await axios.get(`/api/appointments/${appointmentId}/details/`);
  return response.data; // Full appointment object with payment and reschedule history
};