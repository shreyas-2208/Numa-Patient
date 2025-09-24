import React, { useEffect, useState } from "react";
import SlotSelection from "@/components/SlotSelection"; // adjust path
import { fetchAvailableSlots, rescheduleAppointment } from "@/api/appointments";
import dayjs from "dayjs";

export default function ReschedulePage({ appointmentId }) {
  const [dates, setDates] = useState([]);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1️⃣ Fetch available slots for this appointment
  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      try {
        const data = await fetchAvailableSlots(appointmentId); 
        // data example:
        // { "2025-09-24": ["09:00", "10:30"], "2025-09-25": [{start: "11:00", end:"11:30"}] }

        setSlotsByDate(data);
        setDates(Object.keys(data)); // all available dates
      } catch (err) {
        setError("Failed to fetch available slots.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, [appointmentId]);

  // 2️⃣ Format date label for SlotSelection
  const formatDateLabel = (dateString) => {
    const d = dayjs(dateString);
    return {
      weekday: d.format("ddd"),
      day: d.format("D"),
      month: d.format("MMM"),
    };
  };

  // 3️⃣ Handle confirm reschedule
  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select a date and time first.");
      return;
    }
    try {
      setLoading(true);
      await rescheduleAppointment(appointmentId, {
        date: selectedDate,
        time: selectedTime,
      });
      alert("Appointment successfully rescheduled!");
    } catch (err) {
      setError("Failed to reschedule appointment.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reschedule Appointment</h1>

      {loading && <p>Loading available slots...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && dates.length > 0 && (
        <SlotSelection
          dates={dates}
          slotsByDate={slotsByDate}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={(d) => setSelectedDate(d)}
          onSelectTime={(t) => setSelectedTime(t)}
          formatDateLabel={formatDateLabel}
        />
      )}

      {selectedDate && selectedTime && (
        <button
          onClick={handleConfirm}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Confirm Reschedule
        </button>
      )}
    </div>
  );
}
