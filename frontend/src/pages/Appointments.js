import React from "react";
import { useNavigate } from "react-router-dom";

function Appointments() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: "20px" }}>
      <h2>Appointments</h2>
      <ul>
        <li>Therapy Session – Sept 5, 2025</li>
        <li>Nutrition Check-in – Sept 12, 2025</li>
      </ul>
      <button onClick={() => navigate("/appointments/book")} style={{ marginTop: "20px", padding: "10px 15px", cursor: "pointer" }}>
        Schedule New Appointment
      </button>
    </div>
  );
}

export default Appointments;
