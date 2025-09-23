import React, { useEffect, useMemo, useState } from "react";
import { fetchSlotsForRange, rescheduleAppointment } from "../api/appointments";
import { fetchSessionPlans } from "../api/plans";
import styles from "./RescheduleModal.module.css";

const RescheduleModal = ({ open, onClose, appointment, calendarId, specialization }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  // const calendarId = "primary";
  // 14-day window
  const dates = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10); // YYYY-MM-DD
    });
  }, []);

  // Fetch available slots
  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      setError("");
      try {
        const data = await fetchSlotsForRange(calendarId, dates[0], 14);
        setSlotsByDate(data || {});
        const firstDateWithSlots =
          dates.find((d) => (data?.[d] || []).length > 0) || dates[0];
        setSelectedDate(firstDateWithSlots);
      } catch (err) {
        console.error("Error loading slots:", err);
        setError("Failed to load available slots. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    if (open) loadSlots();
  }, [calendarId, dates, open]);

  // Fetch plans
  useEffect(() => {
    async function loadPlans() {
      try {
        const plansData = await fetchSessionPlans(specialization);
        setPlans(plansData);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load available plans.");
      }
    }
    if (open) loadPlans();
  }, [specialization, open]);

  // Step progression
  useEffect(() => {
    if (selectedDate && selectedTime && !selectedPlan) {
      setCurrentStep(2);
    } else if (selectedDate && selectedTime && selectedPlan) {
      setCurrentStep(3);
    }
  }, [selectedDate, selectedTime, selectedPlan]);

  // 🔹 Final submit = update existing appointment
  async function handleReschedule() {
    if (!selectedDate || !selectedTime) {
      setError("Please select date and time.");
      return;
    }
    if (!selectedPlan) {
      setError("Please select a plan.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await rescheduleAppointment({
        booking_id: appointment.booking_id,
        staff_id: appointment.staff_id,
        date: selectedDate,
        time: selectedTime,
        plan_id: selectedPlan.id,
      });

      alert("✅ Appointment rescheduled successfully!");
      onClose(true); // notify parent to refresh
    } catch (err) {
      console.error("Reschedule failed", err);
      setError("Failed to reschedule appointment.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={() => onClose(false)}>✕</button>
        <h2>Reschedule Appointment</h2>

        {loading && <p>Loading...</p>}
        {error && <p className={styles.error}>{error}</p>}

        {/* Step 1: Date + Time */}
        {currentStep >= 1 && (
          <div>
            <h3>Select Date</h3>
            <div className={styles.dates}>
              {dates.map((d) => (
                <button
                  key={d}
                  className={d === selectedDate ? styles.active : ""}
                  onClick={() => setSelectedDate(d)}
                >
                  {new Date(d).toDateString()}
                </button>
              ))}
            </div>

            <h3>Select Time</h3>
            <div className={styles.times}>
              {(slotsByDate[selectedDate] || []).map((t) => (
                <button
                  key={t}
                  className={t === selectedTime ? styles.active : ""}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Plan */}
        {currentStep >= 2 && (
          <div>
            <h3>Select Plan</h3>
            <div className={styles.plans}>
              {plans.map((p) => (
                <button
                  key={p.id}
                  className={p.id === selectedPlan?.id ? styles.active : ""}
                  onClick={() => setSelectedPlan(p)}
                >
                  {p.name} – ₹{p.price}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 3 && (
          <button className={styles.confirm} onClick={handleReschedule}>
            Confirm Reschedule
          </button>
        )}
      </div>
    </div>
  );
};

export default RescheduleModal;
