import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import styles from "./Appointments.module.css";

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/api/appointments/my/");
        setAppointments(data); // assuming backend returns a list
      } catch (err) {
        setError("Failed to load appointments.");
      } finally {
        setLoading(false);
      }
    }

    loadAppointments();
  }, []);

  const getStatusClassName = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (['confirmed', 'scheduled'].includes(statusLower)) return 'confirmed';
    if (['pending', 'waiting'].includes(statusLower)) return 'pending';
    if (['cancelled', 'canceled'].includes(statusLower)) return 'cancelled';
    if (['completed', 'finished'].includes(statusLower)) return 'completed';
    return 'pending';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>My Appointments</h2>
      <div className={styles.card}>
        {loading && (
          <div className={styles.loadingState}>
            Loading your appointments...
          </div>
        )}
        
        {error && <div className={styles.error}>{error}</div>}
        
        {!loading && !error && appointments.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📅</div>
            <p className={styles.emptyStateText}>No appointments found</p>
          </div>
        )}
        
        {!loading && appointments.length > 0 && (
          <ul className={styles.list}>
            {appointments.map((appointment) => (
              <li key={appointment.id} className={styles.appointmentItem}>
                <div className={styles.appointmentHeader}>
                  <h3 className={styles.sessionName}>
                    {appointment.session_plan?.name || "Session"}
                  </h3>
                  <span className={`${styles.statusBadge} ${styles[getStatusClassName(appointment.status)]}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className={styles.appointmentDetails}>
                  <div className={styles.dateTime}>
                    <svg className={styles.dateIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>{formatDate(appointment.date)}</span>
                  </div>
                  <div className={styles.dateTime}>
                    <svg className={styles.timeIcon} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>{formatTime(appointment.date)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <div className={styles.ctaContainer}>
          <button
            className={styles.cta}
            onClick={() => navigate("/appointments/book")}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
            </svg>
            Schedule New Appointment
          </button>
        </div>
      </div>
    </div>
  );
}

export default Appointments;