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

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Appointments</h2>
      <div className={styles.card}>
        {loading && <p>Loading appointments...</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && appointments.length === 0 && (
          <p>No previous appointments found.</p>
        )}
        {!loading && appointments.length > 0 && (
          <ul className={styles.list}>
            {appointments.map((a) => (
              <li key={a.id}>
                {a.session_plan?.name || "Session"} – {new Date(a.date).toLocaleDateString()} – {new Date(a.date).toLocaleTimeString()} – {a.status}
              </li>
            ))}
          </ul>
        )}
        <button
          className={styles.cta}
          onClick={() => navigate("/appointments/book")}
        >
          Schedule New Appointment
        </button>
      </div>
    </div>
  );
}

export default Appointments;
