import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyAppointments, getAppointmentPaymentDetails } from "../api/appointments";
import { getDoctor } from "../api/doctors";
import RescheduleModal from "../components/RescheduleModal";
import PaymentHandler from "../components/PaymentHandler";
import styles from "./Dashboard.module.css";
import api from "../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [hasBookedFirstSession, setHasBookedFirstSession] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [assignedDoctor, setAssignedDoctor] = useState(null);

  // States for reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const statusFilter = ["scheduled", "rescheduled"];
        const list = await fetchMyAppointments(statusFilter);

        const items = (list || []).map((a) => ({
          ...a,
          dt: new Date(`${a.date}T${a.time}`),
        }));

        setHasBookedFirstSession(items.length > 0);

        const now = new Date();
        const upcomingSorted = items
          .filter((a) => a.dt >= now && statusFilter.includes(a.status.toLowerCase()))
          .sort((a, b) => a.dt - b.dt);

        const nextAppointment = upcomingSorted[0] || null;
        setUpcoming(nextAppointment);

        if (nextAppointment) {
          try {
            const paymentInfo = await getAppointmentPaymentDetails(nextAppointment.id);
            setPaymentDetails(paymentInfo);
          } catch (err) {
            console.error("Failed to fetch payment details:", err);
          }
        }

        const { data } = await api.get("api/users/onboarding/");
        setIsOnboarded(data.is_onboarded ?? false);
        const assignedDoctorId = data.assigned_doctor;

        if (data.is_onboarded && assignedDoctorId) {
          try {
            const doc = await getDoctor(assignedDoctorId);
            setAssignedDoctor({
              id: doc.id,
              name: doc.name,
              specialization: doc.specialization,
              age: doc.age,
              gender: doc.gender,
              email: doc.email,
              phone_number: doc.phone_number,
              experience: doc.years_of_experience || "N/A",
              rating: doc.rating || "N/A",
              image: doc.image || "/api/placeholder/100/100",
            });
          } catch (err) {
            console.error("Failed to fetch assigned doctor:", err);
          }
        }
      } catch (e) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleBookFirstSession = () => {
    navigate("/appointments/book");
  };

  const handleJoinSession = () => {
    if (!upcoming || !upcoming.zoho_meeting_link) {
      setError("Meeting link not available");
      return;
    }
    window.open(upcoming.zoho_meeting_link, "_blank");
  };

  const handleReschedule = () => {
    if (!upcoming || !assignedDoctor) {
      setError("Cannot reschedule appointment at this time");
      return;
    }
    setShowRescheduleModal(true);
  };

  const handleRescheduleSuccess = (updatedAppointment) => {
    setUpcoming(updatedAppointment);
    setShowRescheduleModal(false);
    setSuccess("Appointment successfully rescheduled!");
  };

  const handlePayLater = async () => {
    if (!upcoming || !paymentDetails) {
      setError("Payment information not available");
      return;
    }

    setProcessing(true);

    const plan = {
      id: paymentDetails.plan_id || upcoming.plan_id || "default_plan",
      name: paymentDetails.plan_name || upcoming.plan_name || "Consultation Fee",
      price:
        paymentDetails.amount_due ||
        upcoming.amount ||
        paymentDetails.plan_price ||
        "500",
    };

    try {
      await PaymentHandler({
        appointmentId: upcoming.id,
        plan: plan,
        onSuccess: (response) => {
          console.log("Payment successful:", response);
          setProcessing(false);
          setSuccess("Payment completed successfully!");
          setTimeout(() => window.location.reload(), 2000);
        },
        onFailure: (error) => {
          console.error("Payment failed:", error);
          setError(`Payment failed: ${error.message || "Please try again."}`);
          setProcessing(false);
        },
        onCancel: () => {
          console.log("Payment cancelled by user");
          setProcessing(false);
        },
      });
    } catch (error) {
      setError("Failed to initiate payment. Please try again.");
      setProcessing(false);
    }
  };

  const isZohoBooking = upcoming?.booking_source === "zoho" || upcoming?.zoho_booking_id;
  const hasPaymentPending =
    paymentDetails?.payment_status === "pending" || paymentDetails?.amount_due > 0;
  const showPayLaterButton = isZohoBooking && hasPaymentPending;

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
      {success && <div className={styles.success}>{success}</div>}

      {!isOnboarded && (
        <section className={styles.firstSessionSection}>
          <div className={styles.welcomeCard}>
            <div className={styles.welcomeIcon}>📝</div>
            <h2>Complete Your Onboarding</h2>
            <p>
              Before booking your first session, please complete the onboarding
              process to personalize your mental health journey.
            </p>
            <button
              className={styles.primaryButton}
              onClick={() => navigate("/onboarding")}
            >
              Go to Onboarding
            </button>
          </div>
        </section>
      )}

      {isOnboarded && (
        <>
          {assignedDoctor && (
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

          {!hasBookedFirstSession && (
            <section className={styles.firstSessionSection}>
              <div className={styles.welcomeCard}>
                <div className={styles.welcomeIcon}>🌟</div>
                <h2>Start Your Journey</h2>
                <p>
                  Book your first consultation session to begin your personalized
                  mental health journey with our expert therapists.
                </p>
                <button
                  className={styles.primaryButton}
                  onClick={handleBookFirstSession}
                >
                  Book First Session
                </button>
              </div>
            </section>
          )}

          {hasBookedFirstSession && (
            <section className={styles.appointmentsSection}>
              <h2>Upcoming Sessions</h2>
              {upcoming ? (
                <div className={styles.appointmentCard}>
                  <div className={styles.appointmentInfo}>
                    <div className={styles.appointmentDate}>
                      <span className={styles.day}>
                        {new Date(`${upcoming.date}T${upcoming.time}`).getDate()}
                      </span>
                      <span className={styles.month}>
                        {new Date(`${upcoming.date}T${upcoming.time}`).toLocaleDateString(
                          undefined,
                          { month: "short" }
                        )}
                      </span>
                    </div>
                    <div className={styles.appointmentDetails}>
                      <h3>Upcoming Consultation Session</h3>
                      <p>
                        👩‍⚕️{" "}
                        {upcoming?.doctor?.name ||
                          assignedDoctor?.name ||
                          "Your consultant"}
                      </p>
                      <p>📅 {upcoming.date}</p>
                      <p>🕐 {upcoming.time}</p>
                      {paymentDetails?.payment_status === "pending" && (
                        <p className={styles.paymentPending}>
                          💳 Payment Pending: ₹{paymentDetails.amount_due}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={styles.appointmentActions}>
                    <button
                      className={styles.joinButton}
                      onClick={handleJoinSession}
                    >
                      Join Session
                    </button>
                    <button
                      className={styles.rescheduleButton}
                      onClick={handleReschedule}
                      disabled={processing}
                    >
                      Reschedule
                    </button>
                    {showPayLaterButton && (
                      <button
                        className={styles.payLaterButton}
                        onClick={handlePayLater}
                        disabled={processing}
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.noAppointments}>
                  <div className={styles.emptyIcon}>📅</div>
                  <p>No upcoming sessions scheduled</p>
                  <button
                    className={styles.primaryButton}
                    onClick={() => navigate("/appointments/book")}
                  >
                    Book New Session
                  </button>
                </div>
              )}
            </section>
          )}

          <section className={styles.quickActions}>
            <h2>Quick Actions</h2>
            <div className={styles.actionGrid}>
              <button
                className={styles.actionCard}
                onClick={() => navigate("/appointments/book")}
              >
                <span className={styles.actionIcon}>📅</span>
                <span>Book Session</span>
              </button>
              <button
                className={styles.actionCard}
                onClick={() => navigate("/appointments")}
              >
                <span className={styles.actionIcon}>📋</span>
                <span>View History</span>
              </button>
              <button
                className={styles.actionCard}
                onClick={() => navigate("/contact-us")}
              >
                <span className={styles.actionIcon}>💬</span>
                <span>Contact Us</span>
              </button>
              <button
                className={styles.actionCard}
                onClick={() => navigate("/profile")}
              >
                <span className={styles.actionIcon}>📊</span>
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
