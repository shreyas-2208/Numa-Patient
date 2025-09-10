import React from "react";

const Dashboard = () => {
  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>This is the main hub of your application where you can see key metrics and navigate to other sections.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>Appointments</h3>
          <p>View upcoming and past appointments.</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>Therapy Sessions</h3>
          <p>Track your therapy sessions and progress.</p>
        </div>
        <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>Resources</h3>
          <p>Access guides, articles, and other helpful resources.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
