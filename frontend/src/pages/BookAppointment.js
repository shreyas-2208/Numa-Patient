import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSlotsForRange, createAppointment } from "../api/appointments";
import { fetchSessionPlans } from "../api/plans";
import styles from "./BookAppointment.module.css";
import PlanSelector from "../components/PlanSelector/PlanSelector";

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarId = searchParams.get("calendarId") || "primary"; 
  const specialization = searchParams.get("specialization") || "General";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

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

useEffect(() => {
    async function loadPlans() {
      try {
        const plansData = await fetchSessionPlans(specialization);
        setPlans(plansData);
      } catch (err) {
        console.error("Error fetching plans:", err);
        setError("Failed to load available plans. Please try again.");
      }
    }
    loadPlans();
  }, [specialization]);


async function handleContinueToPayment() {
  if (!selectedDate || !selectedTime) {
    setError("Please select a date and time.");
    return;
  }

  if (!selectedPlan) {
    setError("Please select a plan before proceeding to payment.");
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
      plan_id: selectedPlan.id, // Include the selected plan ID
    });

    const appointmentId = appointmentRes.appointment.id; // backend should return appointment id

    // 2. Create Razorpay order for this appointment with plan price
    const amount = parseFloat(selectedPlan.price);
    if (isNaN(amount)) {
      setError("Invalid plan price. Please select a different plan.");
      return;
    }
    
    const requestData = {
      plan_id: selectedPlan.id,
      amount: amount, // Use the parsed plan's price
    };
    
    const { data } = await axios.post(
      `http://localhost:8000/api/payments/create-order/${appointmentId}/`,
      requestData,
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

          await axios.post(
        "http://localhost:8000/api/bookings/create/",
        { appointment_id: appointmentId }, // pass the appointment ID created earlier
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

          {selectedDate && selectedTime && (
        <PlanSelector
          plans={plans}
          selectedPlan={selectedPlan}
          onSelectPlan={setSelectedPlan}
        />
      )}

      {selectedPlan && (
        <div className={styles.selectedPlanSummary}>
          <h4>Selected Plan</h4>
          <div className={styles.planSummary}>
            <span className={styles.planName}>{selectedPlan.title}</span>
            <span className={styles.planDuration}>{selectedPlan.duration_minutes} min</span>
            <span className={styles.planPrice}>₹{selectedPlan.price.toLocaleString()}</span>
          </div>
        </div>
      )}

          <div className={styles.actions}>
            <button
              onClick={handleContinueToPayment}
              disabled={loading || !selectedDate || !selectedTime || !selectedPlan}
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


