import React, { useEffect, useState } from "react";
import { ensureConsultationLink, fetchMyAppointments } from "../api/appointments";

const Dashboard = () => {
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const list = await fetchMyAppointments();
        const now = new Date();
        const items = (list || []).map((a) => ({
          ...a,
          dt: new Date(`${a.date}T${a.time}`),
        }));
        const upcomingSorted = items
          .filter((a) => a.dt >= now && a.status !== "cancelled")
          .sort((a, b) => a.dt - b.dt);
        setUpcoming(upcomingSorted[0] || null);
      } catch (e) {
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleJoin() {
    if (!upcoming) return;
    try {
      const { meeting_link } = await ensureConsultationLink(upcoming.id);
      if (meeting_link) {
        window.open(meeting_link, "_blank");
      }
    } catch (e) {
      setError("Could not retrieve meeting link");
    }
  }
  return (
    <div>
      <h1>Welcome to Your Dashboard</h1>
      <p>This is the main hub of your application where you can see key metrics and navigate to other sections.</p>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={{ flex: 1, padding: "20px", background: "#f5f5f5", borderRadius: "8px" }}>
          <h3>Appointments</h3>
          {loading && <p>Loading...</p>}
          {error && <p style={{ color: "#b00020" }}>{error}</p>}
          {!loading && !upcoming && <p>No upcoming appointment.</p>}
          {!loading && upcoming && (
            <div>
              <p>
                Upcoming: {new Date(upcoming.date).toLocaleDateString()} at {upcoming.time}
              </p>
              <button onClick={handleJoin} style={{ padding: 8, cursor: "pointer" }}>Join</button>
            </div>
          )}
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
