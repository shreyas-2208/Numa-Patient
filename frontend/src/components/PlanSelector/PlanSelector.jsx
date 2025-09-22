// components/PlanSelector.jsx
import React from "react";
import styles from "./PlanSelector.module.css";

function PlanSelector({ plans, selectedPlan, onSelectPlan }) {
  if (!plans || plans.length === 0) return null;

  // Group plans by practitioner type using exact keywords
  const psychiatristIndividualPlans = plans.filter(plan => {
    const title = plan.title?.toLowerCase() || '';
    return title === 'comprehensive' || 
           title === 'deep-dive' || 
           title === 'follow-up';
  });

  const psychiatristCouplesPlans = plans.filter(plan => {
    const title = plan.title?.toLowerCase() || '';
    return title === 'couples - psychiatrist';
  });

  const psychologistIndividualPlans = plans.filter(plan => {
    const title = plan.title?.toLowerCase() || '';
    return title === 'standard session' || 
           title === 'deep-dive therapy';
  });

  const psychologistCouplesPlans = plans.filter(plan => {
    const title = plan.title?.toLowerCase() || '';
    return title === 'couples - psychologist';
  });

  const renderPlanGroup = (groupPlans, title, isPrimary = false, isCouples = false) => {
    if (groupPlans.length === 0) return null;

    return (
      <div className={`${styles.planGroup} ${isPrimary ? styles.primaryGroup : styles.secondaryGroup} ${isCouples ? styles.couplesGroup : ''}`}>
        <h3 className={`${styles.groupTitle} ${isPrimary ? styles.primaryTitle : styles.secondaryTitle} ${isCouples ? styles.couplesTitle : ''}`}>
          {title}
        </h3>
        <div className={styles.planGrid}>
          {groupPlans.map((plan) => (
            <button
              key={plan.id}
              className={`${styles.planButton} ${selectedPlan?.id === plan.id ? styles.planButtonActive : ''} ${isPrimary ? styles.primaryPlan : styles.secondaryPlan} ${isCouples ? styles.couplesPlan : ''} ${plan.duration_minutes === 50 ? styles.highlighted : ''}`}
              onClick={() => onSelectPlan(plan)}
            >
              <div className={`${styles.planDuration} ${plan.duration_minutes === 50 ? styles.highlightedDuration : ''}`}>
                {plan.duration_minutes} minutes
                {plan.duration_minutes === 50 && <span className={styles.highlightBadge}>Popular</span>}
              </div>
              <div className={styles.planPrice}>₹{plan.price.toLocaleString()}</div>
              {plan.description && (
                <div className={styles.planDescription}>{plan.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Select a Plan</h4>
      
      {/* Individual Sessions */}
      {/* Psychiatrist plans (Core) - Primary */}
      {renderPlanGroup(psychiatristIndividualPlans, "Core", true)}
      
      {/* Psychologist plans (Balance) - Secondary */}
      {renderPlanGroup(psychologistIndividualPlans, "Balance", false)}
      
      {/* Couples Therapy Sessions */}
      {(psychiatristCouplesPlans.length > 0 || psychologistCouplesPlans.length > 0) && (
        <div className={styles.couplesSection}>
          <h2 className={styles.couplesSectionTitle}>Couples Therapy</h2>
          
          <div className={styles.couplesContainer}>
            <div className={styles.planGrid}>
              {/* Psychiatrist couples plans */}
              {psychiatristCouplesPlans.map((plan) => (
                <button
                  key={plan.id}
                  className={`${styles.planButton} ${selectedPlan?.id === plan.id ? styles.planButtonActive : ''} ${styles.primaryPlan} ${styles.couplesPlan} ${plan.duration_minutes === 50 ? styles.highlighted : ''}`}
                  onClick={() => onSelectPlan(plan)}
                >
                  <div className={styles.planType}></div>
                  <div className={`${styles.planDuration} ${plan.duration_minutes === 50 ? styles.highlightedDuration : ''}`}>
                    {plan.duration_minutes} minutes
                    {plan.duration_minutes === 50 && <span className={styles.highlightBadge}>Popular</span>}
                  </div>
                  <div className={styles.planPrice}>₹{plan.price.toLocaleString()}</div>
                  {plan.description && (
                    <div className={styles.planDescription}>{plan.description}</div>
                  )}
                </button>
              ))}
              
              {/* Psychologist couples plans */}
              {psychologistCouplesPlans.map((plan) => (
                <button
                  key={plan.id}
                  className={`${styles.planButton} ${selectedPlan?.id === plan.id ? styles.planButtonActive : ''} ${styles.secondaryPlan} ${styles.couplesPlan} ${plan.duration_minutes === 50 ? styles.highlighted : ''}`}
                  onClick={() => onSelectPlan(plan)}
                >
                  <div className={styles.planType}></div>
                  <div className={`${styles.planDuration} ${plan.duration_minutes === 50 ? styles.highlightedDuration : ''}`}>
                    {plan.duration_minutes} minutes
                    {plan.duration_minutes === 50 && <span className={styles.highlightBadge}>Popular</span>}
                  </div>
                  <div className={styles.planPrice}>₹{plan.price.toLocaleString()}</div>
                  {plan.description && (
                    <div className={styles.planDescription}>{plan.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanSelector;