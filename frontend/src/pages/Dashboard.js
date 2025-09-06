import React from "react";

function Dashboard() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>Patient Dashboard</h2>
      <p>Overview of your care journey.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3>Upcoming Appointments</h3>
          <p>You have 2 upcoming sessions this week.</p>
        </div>
        <div style={{ flex: 1, background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
          <h3>Progress</h3>
          <p>Your therapy progress is 60% complete.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
