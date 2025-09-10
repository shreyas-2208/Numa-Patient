import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchTwoWeekSlots, createAppointment } from "../api/appointments";

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
    <div style={{ padding: "20px" }}>
      <h2>Book Appointment</h2>
      {error && (
        <div style={{ color: "#b00020", marginBottom: 12 }}>{error}</div>
      )}
      {loading && <div>Loading...</div>}

      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ minWidth: 260 }}>
          <h4>Select Date</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {dates.map((d) => (
              <button
                key={d}
                onClick={() => {
                  setSelectedDate(d);
                  setSelectedTime("");
                }}
                style={{
                  padding: "10px 8px",
                  cursor: "pointer",
                  borderRadius: 8,
                  border: d === selectedDate ? "2px solid #3f51b5" : "1px solid #ccc",
                  background: d === selectedDate ? "#e8eaf6" : "white",
                }}
              >
                {formatDateLabel(d)}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h4>Available Slots</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(slotsByDate[selectedDate] || []).length === 0 && (
              <div>No slots available for this date.</div>
            )}
            {(slotsByDate[selectedDate] || []).map((slot) => {
              const label = typeof slot === "string" ? slot : `${slot.start}-${slot.end}`;
              const value = typeof slot === "string" ? slot : slot.start;
              return (
                <button
                  key={label}
                  onClick={() => setSelectedTime(value)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderRadius: 20,
                    border: value === selectedTime ? "2px solid #2e7d32" : "1px solid #ccc",
                    background: value === selectedTime ? "#e8f5e9" : "white",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleContinueToPayment}
              disabled={loading || !selectedDate || !selectedTime}
              style={{ padding: "10px 16px", cursor: "pointer" }}
            >
              Continue to Payment
            </button>
            <button
              onClick={() => navigate(-1)}
              style={{ padding: "10px 16px", marginLeft: 8, cursor: "pointer" }}
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


