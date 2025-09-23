import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSlotsForRange, createAppointment } from "../api/appointments";
import { fetchSessionPlans } from "../api/plans";
import styles from "./BookAppointment.module.css";
import PlanSelector from "../components/PlanSelector/PlanSelector";

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // Format date for comparison (YYYY-MM-DD)
  const dateForComparison = d.toISOString().slice(0, 10);
  const todayForComparison = today.toISOString().slice(0, 10);
  const tomorrowForComparison = tomorrow.toISOString().slice(0, 10);

  if (dateForComparison === todayForComparison) return "Today";
  if (dateForComparison === tomorrowForComparison) return "Tomorrow";

  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString(undefined, { month: "short" })
  };
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
  const [currentStep, setCurrentStep] = useState(1);

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

  // Update step based on selections
  useEffect(() => {
    if (selectedDate && selectedTime && !selectedPlan) {
      setCurrentStep(2);
    } else if (selectedDate && selectedTime && selectedPlan) {
      setCurrentStep(3);
    }
  }, [selectedDate, selectedTime, selectedPlan]);

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
        modal: {
      ondismiss: async function () {
        console.warn("Payment popup closed by user");

        try {
          // call backend to mark payment & appointment as cancelled
          await axios.post(
            "http://localhost:8000/api/payments/cancel-payment/",
            { appointment_id: appointmentId },
            { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
          );

          alert("⚠️ Payment cancelled. Your appointment has been cancelled.");
          navigate("/appointments");
        } catch (err) {
          console.error("Error cancelling payment:", err);
        }
      },
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
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Book Appointment</h1>
          <p className={styles.subtitle}>Schedule your consultation in 3 simple steps</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className={styles.progressContainer}>
        <div className={styles.progressSteps}>
          <div className={`${styles.step} ${currentStep >= 1 ? styles.stepActive : ''}`}>
            <div className={styles.stepNumber}>1</div>
            <span className={styles.stepLabel}>Date & Time</span>
          </div>
          <div className={styles.progressLine}></div>
          <div className={`${styles.step} ${currentStep >= 2 ? styles.stepActive : ''}`}>
            <div className={styles.stepNumber}>2</div>
            <span className={styles.stepLabel}>Select Plan</span>
          </div>
          <div className={styles.progressLine}></div>
          <div className={`${styles.step} ${currentStep >= 3 ? styles.stepActive : ''}`}>
            <div className={styles.stepNumber}>3</div>
            <span className={styles.stepLabel}>Confirm & Pay</span>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Processing your request...</p>
        </div>
      )}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Step 1: Date and Time Selection */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.stepBadge}>1</span>
              Choose Date & Time
            </h2>
            <p className={styles.sectionSubtitle}>Select your preferred appointment slot</p>
          </div>

          <div className={styles.dateTimeContainer}>
            {/* Date Selection */}
            <div className={styles.dateSelection}>
              <h3 className={styles.selectionTitle}>Available Dates</h3>
              <div className={styles.dateGrid}>
                {dates.map((d) => {
                  const dateLabel = formatDateLabel(d);
                  const hasSlots = (slotsByDate[d] || []).length > 0;

                  return (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDate(d);
                        setSelectedTime("");
                      }}
                      disabled={!hasSlots}
                      className={`${styles.dateCard} ${
                        d === selectedDate ? styles.dateCardSelected : ""
                      } ${!hasSlots ? styles.dateCardDisabled : ""}`}
                    >
                      {typeof dateLabel === "string" ? (
                        <div className={styles.dateCardContent}>
                          <span className={styles.dateCardLabel}>{dateLabel}</span>
                          <span className={styles.dateCardDay}>
                            {new Date(d).getDate()}
                          </span>
                        </div>
                      ) : (
                        <div className={styles.dateCardContent}>
                          <span className={styles.dateCardWeekday}>{dateLabel.weekday}</span>
                          <span className={styles.dateCardDay}>{dateLabel.day}</span>
                          <span className={styles.dateCardMonth}>{dateLabel.month}</span>
                        </div>
                      )}
                      {!hasSlots && <div className={styles.noSlotsText}>No slots</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Selection */}
            {/* Time Selection */}
{selectedDate && (
  <div className={styles.timeSelection}>
    <h3 className={styles.selectionTitle}>
      Available Times
      <span className={styles.slotsCount}>
        {(slotsByDate[selectedDate] || []).length} slots available
      </span>
    </h3>

    {(slotsByDate[selectedDate] || []).length === 0 ? (
      <div className={styles.emptyState}>
        <svg
          className={styles.emptyIcon}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p>No time slots available</p>
        <span>Please select a different date</span>
      </div>
    ) : (
      <div className={styles.timeGrid}>
        {(slotsByDate[selectedDate] || []).map((slot) => {
          const rawTime = typeof slot === "string" ? slot : slot.start;

          // Convert HH:mm or HH:mm:ss to AM/PM
          const [hour, minute] = rawTime.split(":");
          const date = new Date();
          date.setHours(Number(hour), Number(minute), 0);

          const label = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          const value = rawTime;

          return (
            <button
              key={label}
              onClick={() => setSelectedTime(value)}
              className={`${styles.timeSlot} ${
                value === selectedTime ? styles.timeSlotSelected : ""
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    )}
  </div>
)}

          </div>
        </div>

        {/* Step 2: Plan Selection */}
        {selectedDate && selectedTime && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.stepBadge}>2</span>
                Choose Your Plan
              </h2>
              <p className={styles.sectionSubtitle}>Select the consultation type that suits you</p>
            </div>

            <PlanSelector
              plans={plans}
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </div>
        )}

        {/* Step 3: Booking Summary */}
        {selectedPlan && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.stepBadge}>3</span>
                Booking Summary
              </h2>
              <p className={styles.sectionSubtitle}>Review your appointment details</p>
            </div>

            <div className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <h3>Appointment Details</h3>
                <div className={styles.summaryPrice}>₹{selectedPlan.price.toLocaleString()}</div>
              </div>
              
              <div className={styles.summaryDetails}>
                <div className={styles.summaryItem}>
                  <svg className={styles.summaryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className={styles.summaryLabel}>Date & Time</span>
                    <span className={styles.summaryValue}>
                      {typeof formatDateLabel(selectedDate) === 'string' 
                        ? formatDateLabel(selectedDate) 
                        : `${formatDateLabel(selectedDate).weekday}, ${formatDateLabel(selectedDate).month} ${formatDateLabel(selectedDate).day}`
                      } at {selectedTime}
                    </span>
                  </div>
                </div>

                <div className={styles.summaryItem}>
                  <svg className={styles.summaryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                    <span className={styles.summaryLabel}>Plan</span>
                    <span className={styles.summaryValue}>{selectedPlan.title}</span>
                  </div>
                </div>

                <div className={styles.summaryItem}>
                  <svg className={styles.summaryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className={styles.summaryLabel}>Duration</span>
                    <span className={styles.summaryValue}>{selectedPlan.duration_minutes} minutes</span>
                  </div>
                </div>

                <div className={styles.summaryItem}>
                  <svg className={styles.summaryIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <span className={styles.summaryLabel}>Specialization</span>
                    <span className={styles.summaryValue}>{specialization}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleContinueToPayment}
                disabled={loading || !selectedDate || !selectedTime || !selectedPlan}
                className={styles.primaryButton}
              >
                <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Proceed to Payment
                <span className={styles.buttonPrice}>₹{selectedPlan.price.toLocaleString()}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookAppointment;