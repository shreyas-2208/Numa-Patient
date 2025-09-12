import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Appointments.module.css";

function Appointments() {
  const navigate = useNavigate();
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Appointments</h2>
      <div className={styles.card}>
        <ul className={styles.list}>
          <li>Therapy Session – Sept 5, 2025</li>
          <li>Nutrition Check-in – Sept 12, 2025</li>
        </ul>
        <button className={styles.cta} onClick={() => navigate("/appointments/book")}>Schedule New Appointment</button>
      </div>
    </div>
  );
}

export default Appointments;
