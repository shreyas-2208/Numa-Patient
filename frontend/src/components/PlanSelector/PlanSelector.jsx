// components/PlanSelector.jsx
import React from "react";
import styles from "./PlanSelector.module.css";

function PlanSelector({ plans, selectedPlan, onSelectPlan }) {
  if (!plans || plans.length === 0) return null;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Select a Plan</h4>
      <div className={styles.grid}>
        {plans.map((plan) => (
          <button
            key={plan.id}
            className={`${styles.planButton} ${selectedPlan?.id === plan.id ? styles.planButtonActive : ""}`}
            onClick={() => onSelectPlan(plan)}
          >
            <div className={styles.planTitle}>{plan.title}</div>
            <div className={styles.planDuration}>{plan.duration_minutes} min</div>
            <div className={styles.planPrice}>₹{plan.price.toLocaleString()}</div>
            {plan.description && <div className={styles.planDescription}>{plan.description}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

export default PlanSelector;
