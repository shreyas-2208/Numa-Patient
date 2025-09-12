import React from "react";
import styles from "./SimplePage.module.css";

function Therapy() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Therapy & Care Plan</h2>
        <p className={styles.desc}>Track your progress across different areas:</p>
        <ul>
          <li>Exercise: 4/5 completed</li>
          <li>Diet: 3/5 meals logged</li>
          <li>Meditation: 2/3 sessions done</li>
        </ul>
      </div>
    </div>
  );
}

export default Therapy;
