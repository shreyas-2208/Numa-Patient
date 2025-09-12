import React from "react";
import styles from "./SimplePage.module.css";

function Resources() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <h2 className={styles.title}>Resources</h2>
        <ul>
          <li>Article: Coping with Stress</li>
          <li>Video: Guided Meditation</li>
          <li>Guide: Nutrition Basics</li>
        </ul>
      </div>
    </div>
  );
}

export default Resources;
