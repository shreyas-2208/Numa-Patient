import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAppointments } from "../contexts/AppointmentsContext"
import styles from "./Appointments.module.css";

function Appointments() {
  const navigate = useNavigate();
  const { appointments, loading, error } = useAppointments();

  const getStatusClassName = (status) => {
    const statusLower = status?.toLowerCase() || "";
    if (["confirmed", "scheduled"].includes(statusLower)) return "confirmed";
    if (["pending", "waiting"].includes(statusLower)) return "pending";
    if (["cancelled", "canceled"].includes(statusLower)) return "cancelled";
    if (["completed", "finished"].includes(statusLower)) return "completed";
    return "pending";
  };

  const formatDateTime = (dateStr, timeStr) => {
    if (!dateStr) return { formattedDate: "", formattedTime: "" };
    const dateTimeStr = timeStr ? `${dateStr}T${timeStr}` : dateStr;
    const date = new Date(dateTimeStr);
    return {
      formattedDate: date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      formattedTime: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const formatCreatedAt = (createdAt) => {
    if (!createdAt) return "";
    const isoString = createdAt.replace(" ", "T").split(".")[0] + "Z";
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  // const navigate = useNavigate();
  // const [appointments, setAppointments] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  // useEffect(() => {
  //   async function loadAppointments() {
  //     setLoading(true);
  //     setError("");
  //     try {
  //       const { data } = await api.get("/api/appointments/my/");

  
      
  //       setAppointments(data);
  //     } catch (err) {
  //       setError("Failed to load appointments.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   loadAppointments();
  // }, []);

  // const getStatusClassName = (status) => {
  //   const statusLower = status?.toLowerCase() || "";
  //   if (["confirmed", "scheduled"].includes(statusLower)) return "confirmed";
  //   if (["pending", "waiting"].includes(statusLower)) return "pending";
  //   if (["cancelled", "canceled"].includes(statusLower)) return "cancelled";
  //   if (["completed", "finished"].includes(statusLower)) return "completed";
  //   return "pending";
  // };

  // const formatDateTime = (dateStr, timeStr) => {
  //   if (!dateStr) return { formattedDate: "", formattedTime: "" };

  //   const dateTimeStr = timeStr ? `${dateStr}T${timeStr}` : dateStr;
  //   const date = new Date(dateTimeStr);

  //   const formattedDate = date.toLocaleDateString("en-US", {
  //     weekday: "short",
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });

  //   const formattedTime = date.toLocaleTimeString("en-US", {
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });

  //   return { formattedDate, formattedTime };
  // };

  // const formatCreatedAt = (createdAt) => {
  //   if (!createdAt) return "";
  //   // handle "2025-09-23 17:40:33.519741+00"
  //   const isoString = createdAt.replace(" ", "T").split(".")[0] + "Z";
  //   const date = new Date(isoString);

  //   return date.toLocaleString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>My Appointments</h2>
      <div className={styles.card}>
        <div className={styles.ctaContainer}>
          <button
            className={styles.cta}
            onClick={() => navigate("/appointments/book")}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Schedule New Appointment
          </button>
        </div>
        <hr className={styles.separator} /> 
        {loading && (
          <div className={styles.loadingState}>
            Loading your previous appointments...
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
            {appointments.map((appointment) => {
              const { formattedDate, formattedTime } = formatDateTime(
                appointment.date,
                appointment.time
              );
              const formattedCreatedAt = formatCreatedAt(
                appointment.created_at
              );

              return (
                <li key={appointment.id} className={styles.appointmentItem}>
                  <div className={styles.appointmentHeader}>
                    <h3 className={styles.sessionName}>
                      {appointment.session_plan?.name || "Session"}
                    </h3>
                    <span
                      className={`${styles.statusBadge} ${
                        styles[getStatusClassName(appointment.status)]
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <div className={styles.dateTime}>
                      <svg
                        className={styles.dateIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formattedDate}</span>
                    </div>
                    <div className={styles.dateTime}>
                      <svg
                        className={styles.timeIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formattedTime}</span>
                    </div>
                    <div className={styles.createdAtContainer}>
                      <svg
                        className={styles.createdAtIcon}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 3a2 2 0 00-2 2v1h14V5a2 2 0 00-2-2H5zm12 5H3v7a2 2 0 002 2h10a2 2 0 002-2V8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Booked on: {formattedCreatedAt}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Appointments;
