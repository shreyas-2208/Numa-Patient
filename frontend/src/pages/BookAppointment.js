import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchTwoWeekSlots, createAppointment } from "../api/appointments";
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
      return d.toISOString().slice(0, 10);
    });
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchTwoWeekSlots(calendarId);
        setSlotsByDate(data || {});
        const firstDateWithSlots = dates.find((d) => (data?.[d] || []).length > 0) || dates[0];
        setSelectedDate(firstDateWithSlots);
      } catch (e) {
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
      const { payment_url } = await createAppointment({ specialization, date: selectedDate, time: selectedTime });
      if (payment_url) {
        window.location.href = payment_url; // redirect to external checkout
      } else {
        setError("Could not initiate checkout. Please try again.");
      }
    } catch (e) {
      setError("Could not create appointment. Please try again.");
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


