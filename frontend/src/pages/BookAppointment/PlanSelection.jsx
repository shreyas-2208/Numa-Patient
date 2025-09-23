import React from "react";
import PlanSelector from "../../components/PlanSelector/PlanSelector";
import styles from "./BookAppointment.module.css";

export default function PlanSelection({ plans, selectedPlan, onSelectPlan }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Select Your Plan</h2>
      </div>
      <PlanSelector plans={plans} selectedPlan={selectedPlan} onSelectPlan={onSelectPlan} />
    </div>
  );
}
