import React from "react";

function Appointments() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Appointments</h2>
      <ul>
        <li>Therapy Session – Sept 5, 2025</li>
        <li>Nutrition Check-in – Sept 12, 2025</li>
      </ul>
      <button style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}>
        Schedule New Appointment
      </button>
    </div>
  );
}

export default Appointments;
