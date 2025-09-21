import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureConsultationLink, fetchMyAppointments } from "../api/appointments";
import styles from "./Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasBookedFirstSession, setHasBookedFirstSession] = useState(false);
  const [consultant, setConsultant] = useState(null);

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

        // Check if user has booked their first session
        const hasAnyBooking = list && list.length > 0;
        setHasBookedFirstSession(hasAnyBooking);

        const upcomingSorted = items
          .filter((a) => a.dt >= now && a.status === "scheduled")
          .sort((a, b) => a.dt - b.dt);

        setUpcoming(upcomingSorted[0] || null);

        // Mock consultant data - replace with actual API call
        if (hasAnyBooking) {
          setConsultant({
            name: "Dr. Sarah Johnson",
            specialization: "Clinical Psychology",
            experience: "8 years",
            rating: 4.8,
            image: "/api/placeholder/100/100"
          });
        }
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleBookFirstSession = () => {
    navigate('/appointments/book');
  };

  const handleJoinSession = async () => {
    if (!upcoming) return;
    try {
      const { meeting_link } = await ensureConsultationLink(upcoming.id);
      if (meeting_link) {
        window.open(meeting_link, "_blank");
      }
    } catch (e) {
      setError("Could not retrieve meeting link");
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Welcome Back!</h1>
        <p>Your mental health journey continues here</p>
      </header>

      {error && <div className={styles.error}>{error}</div>}

      {/* First Session Booking Section */}
      {!hasBookedFirstSession && (
        <section className={styles.firstSessionSection}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}>🌟</div>
            <h2>Start Your Journey</h2>
            <p>Book your first consultation session to begin your personalized mental health journey with our expert therapists.</p>
            
            <button 
              className={styles.primaryButton}
              onClick={handleBookFirstSession}
            >
              Book First Session
            </button>
          </div>
        </section>
      )}

      {/* Existing User Dashboard */}
      {hasBookedFirstSession && (
        <>
          {/* Consultant Information */}
          {consultant && (
            <section className={styles.consultantSection}>
              <div className={styles.consultantCard}>
                <div className={styles.consultantInfo}>
                  <img 
                    src={consultant.image} 
                    alt={consultant.name}
                    className={styles.consultantImage}
                  />
                  <div className={styles.consultantDetails}>
                    <h3>Your Assigned Consultant</h3>
                    <h2>{consultant.name}</h2>
                    <p>{consultant.specialization}</p>
                    <div className={styles.consultantMeta}>
                      <span>⭐ {consultant.rating}</span>
                      <span>📅 {consultant.experience} experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Upcoming Appointments */}
          <section className={styles.appointmentsSection}>
            <h2>Upcoming Sessions</h2>
            {upcoming ? (
              <div className={styles.appointmentCard}>
                <div className={styles.appointmentInfo}>
                  <div className={styles.appointmentDate}>
                    <span className={styles.day}>
                      {new Date(upcoming.date).getDate()}
                    </span>
                    <span className={styles.month}>
                      {new Date(upcoming.date).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                  </div>
                  <div className={styles.appointmentDetails}>
                    <h3>Consultation Session</h3>
                    <p>📅 {new Date(upcoming.date).toLocaleDateString()}</p>
                    <p>🕐 {upcoming.time}</p>
                    <p>👩‍⚕️ {consultant?.name || 'Your consultant'}</p>
                  </div>
                </div>
                <button 
                  className={styles.joinButton}
                  onClick={handleJoinSession}
                >
                  Join Session
                </button>
              </div>
            ) : (
              <div className={styles.noAppointments}>
                <div className={styles.emptyIcon}>📅</div>
                <p>No upcoming sessions scheduled</p>
                <button 
                  className={styles.primaryButton}
                  onClick={() => navigate('/book-appointment')}
                >
                  Book New Session
                </button>
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <button 
                className={styles.actionCard}
                onClick={() => navigate('/book-appointment')}
              >
                <span className={styles.actionIcon}>📅</span>
                <span>Book Session</span>
              </button>
              <button 
                className={styles.actionCard}
                onClick={() => navigate('/appointments')}
              >
                <span className={styles.actionIcon}>📋</span>
                <span>View History</span>
              </button>
              <button className={styles.actionCard}>
                <span className={styles.actionIcon}>💬</span>
                <span>Messages</span>
              </button>
              <button className={styles.actionCard}>
                <span className={styles.actionIcon}>📊</span>
                <span>Progress</span>
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
