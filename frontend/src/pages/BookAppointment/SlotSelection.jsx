import React from "react";
import styles from "./BookAppointment.module.css";

export default function SlotSelection({
  dates,
  slotsByDate,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  formatDateLabel,
}) {
  // helper to convert "HH:mm" to 12-hour format with AM/PM
  const formatTime12h = (timeStr) => {
    if (!timeStr) return "";
    const [hourStr, minuteStr] = timeStr.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12; // 0 -> 12, 13 -> 1
    return `${hour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Choose Date & Time</h2>
      </div>

      <div className={styles.dateTimeContainer}>
        {/* Date Selection */}
        <div className={styles.dateSelection}>
          <div className={styles.dateGrid}>
            {dates.map((d) => {
              const hasSlots = (slotsByDate[d] || []).length > 0;
              const dateLabel = formatDateLabel(d);
              return (
                <div
                  key={d}
                  className={`${styles.dateCard} ${
                    !hasSlots ? styles.dateCardDisabled : ""
                  } ${selectedDate === d ? styles.dateCardSelected : ""}`}
                  onClick={() => hasSlots && onSelectDate(d) && onSelectTime("")}
                >
                  <div className={styles.dateCardContent}>
                    <span className={styles.dateCardWeekday}>
                      {typeof dateLabel === "string" ? dateLabel : dateLabel.weekday}
                    </span>
                    <span className={styles.dateCardDay}>
                      {typeof dateLabel === "string" ? "" : dateLabel.day}
                    </span>
                    <span className={styles.dateCardMonth}>
                      {typeof dateLabel === "string" ? "" : dateLabel.month}
                    </span>
                  </div>
                  {!hasSlots && <span className={styles.noSlotsText}>No slots</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className={styles.timeSelection}>
            <div className={styles.timeGrid}>
              {(slotsByDate[selectedDate] || []).map((slot) => {
                const label =
                  typeof slot === "string"
                    ? formatTime12h(slot)
                    : `${formatTime12h(slot.start)} - ${formatTime12h(slot.end)}`;

                const value = typeof slot === "string" ? slot : slot.start;

                return (
                  <button
                    key={value}
                    className={`${styles.timeSlot} ${
                      selectedTime === value ? styles.timeSlotSelected : ""
                    }`}
                    onClick={() => onSelectTime(value)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
