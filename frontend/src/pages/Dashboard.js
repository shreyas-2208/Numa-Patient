import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ensureConsultationLink, fetchMyAppointments } from "../api/appointments";
import { getAssignedDoctor, getDoctor } from "../api/doctors";
import styles from "./Dashboard.module.css";
import api from "../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasBookedFirstSession, setHasBookedFirstSession] = useState(false);
  const [consultant, setConsultant] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [assignedDoctor, setAssignedDoctor] = useState(null); // default true so old users don't break

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
         const statusFilter = ["scheduled", "rescheduled"];
      const list = await fetchMyAppointments(statusFilter);

      // Map each appointment to include a combined Date object
      const items = (list || []).map((a) => ({
        ...a,
        dt: new Date(`${a.date}T${a.time}`), // combine date + time
      }));

      // Check if user has booked any session
      const hasAnyBooking = items.length > 0;
      setHasBookedFirstSession(hasAnyBooking);

      // Filter upcoming appointments
      const now = new Date();
      const upcomingSorted = items
        .filter(
          (a) => a.dt >= now && statusFilter.includes(a.status.toLowerCase())
        )
        .sort((a, b) => a.dt - b.dt);

      // Set the next upcoming appointment (first one)
      const nextAppointment = upcomingSorted[0] || null;
      setUpcoming(nextAppointment);
      console.log("Next appointment:", nextAppointment);

        // Get onboarding status
        const { data } = await api.get("api/users/onboarding/");
        setIsOnboarded(data.is_onboarded ?? false);
        const assignedDoctorId = data.assigned_doctor;
        // Fetch consultant data if onboarded (regardless of booking status)
        if (data.is_onboarded) {
          // If there's an upcoming appointment, use that doctor info
          // if (nextAppointment && nextAppointment.doctor) {
          //   setConsultant({
          //     name: nextAppointment.doctor.name,
          //     specialization: nextAppointment.doctor.specialization,
          //     experience: nextAppointment.doctor.experience || "N/A",
          //     rating: nextAppointment.doctor.rating || 0,
          //     image: nextAppointment.doctor.image || "/api/placeholder/100/100",
          //   });
          // } else {
            try {
      const doc = await getDoctor(assignedDoctorId);
      setAssignedDoctor({
  name: doc.name,                   // backend `name`
  specialization: doc.specialization,
  age: doc.age,
  gender: doc.gender,
  email: doc.email,
  phone_number: doc.phone_number,
  experience: doc.years_of_experience || "N/A",
  image: doc.image || "/api/placeholder/100/100", // if your backend doesn't send an image
});
    } catch (err) {
      console.error("Failed to fetch assigned doctor:", err);
    }
          }
        // }

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
      if (!upcoming || !upcoming.zoho_meeting_link) {
        setError("Meeting link not available");
        return;
      }
      window.open(upcoming.zoho_meeting_link, "_blank");
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

      {/* Onboarding Section - FIRST PRIORITY */}
      {!isOnboarded && (
        <section className={styles.firstSessionSection}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}>📝</div>
            <h2>Complete Your Onboarding</h2>
            <p>Before booking your first session, please complete the onboarding process to personalize your mental health journey.</p>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/onboarding")}
            >
              Go to Onboarding
            </button>
          </div>
        </section>
      )}

      {/* Show consultant info and content for onboarded users */}
      {isOnboarded && (
        <>
          {/* Consultant Information - Show after onboarding completion */}
          {true && (
            <section className={styles.consultantSection}>
              <div className={styles.consultantCard}>
                <div className={styles.consultantInfo}>
                  <img
                    src={assignedDoctor.image}
                    alt={assignedDoctor.name}
                    className={styles.consultantImage}
                  />
                  <div className={styles.consultantDetails}>
                    <h3>Your Assigned Consultant</h3>
                    <h2>{assignedDoctor.name}</h2>
                    <p>{assignedDoctor.specialization}</p>
                    <div className={styles.consultantMeta}>
                      <span>⭐ {assignedDoctor.rating}</span>
                      <span>📅 {assignedDoctor.experience} experience</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* First Session Booking Section - Show after onboarding if no sessions booked */}
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

          {/* Upcoming Appointments - Show for users who have booked sessions */}
          {hasBookedFirstSession && (
  <section className={styles.appointmentsSection}>
    <h2>Upcoming Sessions</h2>
    {upcoming ? (
      (() => {
        // Combine date + time into a single Date object
        const upcomingDateTime = new Date(`${upcoming.date}T${upcoming.time}`);
        const day = upcomingDateTime.getDate();
        const month = upcomingDateTime.toLocaleDateString(undefined, { month: 'short' });
        const formattedDate = upcomingDateTime.toLocaleDateString();
        const formattedTime = upcomingDateTime.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

        return (
          <div className={styles.appointmentCard}>
            <div className={styles.appointmentInfo}>
              <div className={styles.appointmentDate}>
                <span className={styles.day}>{day}</span>
                <span className={styles.month}>{month}</span>
              </div>
              <div className={styles.appointmentDetails}>
                <h3>Upcoming Consultation Session</h3>
                <p>👩‍⚕️ {upcoming?.doctor.name || 'Your consultant'}</p>
                <p>📅 {formattedDate}</p>
                <p>🕐 {formattedTime}</p>
              </div>
            </div>
            <button 
              className={styles.joinButton}
              onClick={handleJoinSession}
            >
              Join Session
            </button>
          </div>
        );
      })()
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
          )}

          {/* Quick Actions */}
          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <button 
                className={styles.actionCard}
                onClick={() => navigate('/appointments/book')}
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
                <span className={styles.actionIcon}
                onClick={() => navigate('/contact-us')}>💬</span>
                <span>Contact Us</span>
    
              </button>
              <button className={styles.actionCard}>
                <span className={styles.actionIcon}
                onClick={() => navigate('/profile')}>📊</span>
                <span>Profile</span>
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
