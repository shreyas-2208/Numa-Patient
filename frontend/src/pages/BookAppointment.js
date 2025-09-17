import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSlotsForRange, createAppointment } from "../api/appointments";
import styles from "./BookAppointment.module.css";

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarId = searchParams.get("calendarId") || "primary"; // fallback
  const specialization = searchParams.get("specialization") || "General";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const dates = useMemo(() => {
  const start = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
}, []);

useEffect(() => {
  async function load() {
    setLoading(true);
    setError("");
    try {
      // Fetch slots for the full range in one call
      const data = await fetchSlotsForRange(calendarId, dates[0], 14);

      setSlotsByDate(data || {});

      // pick the first date with available slots, else fallback to first date
      const firstDateWithSlots =
        dates.find((d) => (data?.[d] || []).length > 0) || dates[0];
      setSelectedDate(firstDateWithSlots);
    } catch (e) {
      console.error("Error loading slots:", e);
      setError("Failed to load available slots. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  load();
}, [calendarId, dates]);



async function handleContinueToPayment() {
  if (!selectedDate || !selectedTime) {
    setError("Please select a date and time.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    // 1. Create appointment first
    const appointmentRes = await createAppointment({
      specialization,
      date: selectedDate,
      time: selectedTime,
    });

    const appointmentId = appointmentRes.appointment.id; // backend should return appointment id

    // 2. Create Razorpay order for this appointment
    const { data } = await axios.post(
      `http://localhost:8000/api/payments/create-order/${appointmentId}/`,
      {},
      { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
    );

    // 3. Configure Razorpay Checkout
    const options = {
      key: data.razorpay_key,
      amount: data.amount * 100,
      currency: data.currency,
      order_id: data.order_id,
      handler: async function (response) {
        try {
          await axios.post(
            "http://localhost:8000/api/payments/verify-payment/",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
          );
          alert("✅ Payment successful & appointment confirmed!");
          navigate("/appointments"); // redirect to confirmation page
        } catch (verifyErr) {
          console.error("Verification failed", verifyErr);
          alert("⚠️ Payment verification failed. Please contact support.");
        }
      },
      theme: { color: "#3399cc" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error("Payment initiation failed", err);
    setError("Something went wrong while starting payment.");
  } finally {
    setLoading(false);
  }
}


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Book Appointment</h2>
      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.muted}>Loading...</div>}

      <div className={styles.grid}>
        <div className={styles.panel}>
          <h4 className={styles.sectionTitle}>Select Date</h4>
          <div className={styles.dates}>
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDate(d);
                  setSelectedTime("");
                }}
                className={`${styles.dateButton} ${d === selectedDate ? styles.dateButtonActive : ""}`}
              >
                {formatDateLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h4 className={styles.sectionTitle}>Available Slots</h4>
          <div className={styles.slotsWrap}>
            {(slotsByDate[selectedDate] || []).length === 0 && (
              <div className={styles.muted}>No slots available for this date.</div>
            )}
            {(slotsByDate[selectedDate] || []).map((slot) => {
              const label = typeof slot === "string" ? slot : `${slot.start}-${slot.end}`;
              const value = typeof slot === "string" ? slot : slot.start;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedTime(value)}
                  className={`${styles.slotButton} ${value === selectedTime ? styles.slotButtonActive : ""}`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className={styles.actions}>
            <button
              onClick={handleContinueToPayment}
              disabled={loading || !selectedDate || !selectedTime}
              className={styles.primaryBtn}
            >
              Continue to Payment
            </button>
            <button
              onClick={() => navigate(-1)}
              className={styles.secondaryBtn}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAppointment;


