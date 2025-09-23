// import React, { useEffect, useMemo, useState } from "react";
// import { fetchSlotsForRange, rescheduleAppointment } from "../api/appointments";
// import { fetchSessionPlans } from "../api/plans";
// import styles from "./RescheduleModal.module.css";

// const RescheduleModal = ({ open, onClose, appointment, calendarId, specialization }) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [slotsByDate, setSlotsByDate] = useState({});
//   const [selectedDate, setSelectedDate] = useState("");
//   const [selectedTime, setSelectedTime] = useState("");
//   const [plans, setPlans] = useState([]);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [currentStep, setCurrentStep] = useState(1);

//   // const calendarId = "primary";
//   // 14-day window
//   const dates = useMemo(() => {
//     const start = new Date();
//     return Array.from({ length: 14 }).map((_, i) => {
//       const d = new Date(start);
//       d.setDate(start.getDate() + i);
//       return d.toISOString().slice(0, 10); // YYYY-MM-DD
//     });
//   }, []);

//   // Fetch available slots
//   useEffect(() => {
//     async function loadSlots() {
//       setLoading(true);
//       setError("");
//       try {
//         const data = await fetchSlotsForRange(calendarId, dates[0], 14);
//         setSlotsByDate(data || {});
//         const firstDateWithSlots =
//           dates.find((d) => (data?.[d] || []).length > 0) || dates[0];
//         setSelectedDate(firstDateWithSlots);
//       } catch (err) {
//         console.error("Error loading slots:", err);
//         setError("Failed to load available slots. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (open) loadSlots();
//   }, [calendarId, dates, open]);

//   // Fetch plans
//   useEffect(() => {
//     async function loadPlans() {
//       try {
//         const plansData = await fetchSessionPlans(specialization);
//         setPlans(plansData);
//       } catch (err) {
//         console.error("Error fetching plans:", err);
//         setError("Failed to load available plans.");
//       }
//     }
//     if (open) loadPlans();
//   }, [specialization, open]);

//   // Step progression
//   useEffect(() => {
//     if (selectedDate && selectedTime && !selectedPlan) {
//       setCurrentStep(2);
//     } else if (selectedDate && selectedTime && selectedPlan) {
//       setCurrentStep(3);
//     }
//   }, [selectedDate, selectedTime, selectedPlan]);

//   // 🔹 Final submit = update existing appointment
//   async function handleReschedule() {
//     if (!selectedDate || !selectedTime) {
//       setError("Please select date and time.");
//       return;
//     }
//     if (!selectedPlan) {
//       setError("Please select a plan.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       await rescheduleAppointment({
//         booking_id: appointment.booking_id,
//         staff_id: appointment.staff_id,
//         date: selectedDate,
//         time: selectedTime,
//         plan_id: selectedPlan.id,
//       });

//       alert("✅ Appointment rescheduled successfully!");
//       onClose(true); // notify parent to refresh
//     } catch (err) {
//       console.error("Reschedule failed", err);
//       setError("Failed to reschedule appointment.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!open) return null;

//   return (
//     <div className={styles.overlay}>
//       <div className={styles.modal}>
//         <button className={styles.close} onClick={() => onClose(false)}>✕</button>
//         <h2>Reschedule Appointment</h2>

//         {loading && <p>Loading...</p>}
//         {error && <p className={styles.error}>{error}</p>}

//         {/* Step 1: Date + Time */}
//         {currentStep >= 1 && (
//           <div>
//             <h3>Select Date</h3>
//             <div className={styles.dates}>
//               {dates.map((d) => (
//                 <button
//                   key={d}
//                   className={d === selectedDate ? styles.active : ""}
//                   onClick={() => setSelectedDate(d)}
//                 >
//                   {new Date(d).toDateString()}
//                 </button>
//               ))}
//             </div>

//             <h3>Select Time</h3>
//             <div className={styles.times}>
//               {(slotsByDate[selectedDate] || []).map((t) => (
//                 <button
//                   key={t}
//                   className={t === selectedTime ? styles.active : ""}
//                   onClick={() => setSelectedTime(t)}
//                 >
//                   {t}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 2: Plan */}
//         {currentStep >= 2 && (
//           <div>
//             <h3>Select Plan</h3>
//             <div className={styles.plans}>
//               {plans.map((p) => (
//                 <button
//                   key={p.id}
//                   className={p.id === selectedPlan?.id ? styles.active : ""}
//                   onClick={() => setSelectedPlan(p)}
//                 >
//                   {p.name} – ₹{p.price}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Step 3: Confirm */}
//         {currentStep === 3 && (
//           <button className={styles.confirm} onClick={handleReschedule}>
//             Confirm Reschedule
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RescheduleModal;

// src/components/RescheduleModal.js
import React, { useState, useEffect } from 'react';
import { getDoctorAvailableSlots, rescheduleAppointment } from '../api/appointments';
import styles from './RescheduleModal.module.css';

const RescheduleModal = ({ 
  isOpen, 
  onClose, 
  appointment, 
  doctorId, 
  onSuccess 
}) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && doctorId) {
      fetchAvailableSlots();
    }
  }, [isOpen, doctorId]);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError('');
    try {
      const slots = await getDoctorAvailableSlots(doctorId, 14); // 14 days
      setAvailableSlots(slots);
    } catch (err) {
      setError('Failed to fetch available slots. Please try again.');
      console.error('Error fetching slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedSlot || !appointment) return;

    setProcessing(true);
    setError('');
    
    try {
      await rescheduleAppointment(appointment.id, {
        date: selectedSlot.date,
        time: selectedSlot.time
      });
      
      if (onSuccess) {
        onSuccess({
          ...appointment,
          date: selectedSlot.date,
          time: selectedSlot.time
        });
      }
      
      onClose();
    } catch (err) {
      setError('Failed to reschedule appointment. Please try again.');
      console.error('Error rescheduling:', err);
    } finally {
      setProcessing(false);
    }
  };

  const formatSlotDate = (dateStr, timeStr) => {
    const date = new Date(`${dateStr}T${timeStr}`);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      fullDate: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const isSlotInPast = (dateStr, timeStr) => {
    const slotDateTime = new Date(`${dateStr}T${timeStr}`);
    return slotDateTime < new Date();
  };

  const groupSlotsByDate = (slots) => {
    const grouped = {};
    slots.forEach(slot => {
      const dateKey = slot.date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });
    return grouped;
  };

  if (!isOpen) return null;

  const groupedSlots = groupSlotsByDate(availableSlots);
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Reschedule Appointment</h3>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            disabled={processing}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          {appointment && (
            <div className={styles.currentAppointment}>
              <h4>Current Appointment</h4>
              <p>
                📅 {new Date(`${appointment.date}T${appointment.time}`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p>
                🕐 {new Date(`${appointment.date}T${appointment.time}`).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.slotsSection}>
            <h4>Select a new time slot:</h4>
            
            {loading ? (
              <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Loading available slots...</p>
              </div>
            ) : sortedDates.length > 0 ? (
              <div className={styles.slotsContainer}>
                {sortedDates.map(date => {
                  const daySlots = groupedSlots[date];
                  const formatted = formatSlotDate(date, '00:00');
                  
                  return (
                    <div key={date} className={styles.dateGroup}>
                      <h5 className={styles.dateHeader}>
                        {formatted.fullDate}
                      </h5>
                      <div className={styles.timeSlotsGrid}>
                        {daySlots.map((slot, index) => {
                          const timeFormatted = formatSlotDate(slot.date, slot.time);
                          const isPast = isSlotInPast(slot.date, slot.time);
                          const isSelected = selectedSlot && 
                            selectedSlot.date === slot.date && 
                            selectedSlot.time === slot.time;

                          return (
                            <button
                              key={`${slot.date}-${slot.time}-${index}`}
                              className={`${styles.timeSlot} ${
                                isSelected ? styles.selectedSlot : ''
                              } ${isPast ? styles.pastSlot : ''}`}
                              onClick={() => !isPast && handleSlotSelect(slot)}
                              disabled={isPast || processing}
                            >
                              {timeFormatted.time}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.noSlots}>
                <p>No available slots found for the next 2 weeks.</p>
                <button 
                  className={styles.refreshButton}
                  onClick={fetchAvailableSlots}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Slots'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button 
            className={styles.cancelButton}
            onClick={onClose}
            disabled={processing}
          >
            Cancel
          </button>
          <button 
            className={styles.confirmButton}
            onClick={handleConfirmReschedule}
            disabled={!selectedSlot || processing || loading}
          >
            {processing ? 'Rescheduling...' : 'Confirm Reschedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;