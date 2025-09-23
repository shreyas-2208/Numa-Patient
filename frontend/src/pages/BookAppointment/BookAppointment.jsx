import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {  fetchSlotsForRange, createAppointment } from "../../api/appointments";
import { fetchSessionPlans } from "../../api/plans";
import PlanSelection from "./PlanSelection";
import SlotSelection from "./SlotSelection";
import PaymentHandler from "./PaymentHandler";
import styles from "./BookAppointment.module.css";
import axios from "../../api/axios";
import { assignDoctorBySpecialization } from "../../api/doctors";


function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateForComparison = d.toISOString().slice(0, 10);
  const todayForComparison = today.toISOString().slice(0, 10);
  const tomorrowForComparison = tomorrow.toISOString().slice(0, 10);

  if (dateForComparison === todayForComparison) return "Today";
  if (dateForComparison === tomorrowForComparison) return "Tomorrow";

  return {
    weekday: d.toLocaleDateString(undefined, { weekday: "short" }),
    day: d.getDate(),
    month: d.toLocaleDateString(undefined, { month: "short" }),
  };
}

export default function BookAppointment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const specialization = searchParams.get("specialization") || "General";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [doctorCalendarId, setDoctorCalendarId] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [assignDoctor, setAssignDoctor] = useState(null);

  const dates = useMemo(() => {
    const start = new Date();
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, []);

  // Load plans
  useEffect(() => {
    async function loadPlans() {
      try {
        const plansData = await fetchSessionPlans();
        setPlans(plansData);
      } catch (err) {
        console.error(err);
        setError("Failed to load plans. Please try again.");
      }
    }
    loadPlans();
  }, []);

  const handlePlanSelect = async(plan) => {
    setSelectedPlan(plan);

    // Assign doctor calendar
    let calendarId;
    if (plan.doctor_type === "psychiatrist") calendarId = "psychiatrist_calendar_id";
    else if (plan.doctor_type === "psychologist") calendarId = "psychologist_calendar_id";
    else calendarId = "primary";

    const assignedDoctor = await assignDoctorBySpecialization(plan.doctor_type);
    
    setAssignDoctor(assignedDoctor);

    setDoctorCalendarId(assignedDoctor.zoho_calendar_id);
    setSelectedDate("");
    setSelectedTime("");
    setSlotsByDate({});

    fetchDoctorSlots(calendarId);
  };

  const fetchDoctorSlots = async (calendarId) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSlotsForRange(calendarId, dates[0], 14);
      setSlotsByDate(data || {});
    } catch (err) {
      console.error(err);
      setError("Failed to load available slots. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>Back</button>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Book Appointment</h1>
          <p className={styles.subtitle}>Specialization: {specialization}</p>
        </div>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner}></div>
          <p>Processing...</p>
        </div>
      )}

      <PlanSelection
        plans={plans}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
      />

      {assignDoctor && (
        <div className={styles.doctorInfo}>
          <p>Assigned Doctor: {assignDoctor.name}</p>
          <p>Calendar ID: {assignDoctor.zoho_calendar_id}</p>
        </div>
      )}

      {selectedPlan && (
        <SlotSelection
          dates={dates}
          slotsByDate={slotsByDate}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onSelectDate={setSelectedDate}
          onSelectTime={setSelectedTime}
          formatDateLabel={formatDateLabel}
        />
      )}

      {selectedPlan && selectedDate && selectedTime && (
        <PaymentHandler
          selectedPlan={selectedPlan}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          specialization={specialization}
          setLoading={setLoading}
          setError={setError}
        />
      )}
    </div>
  );
}
