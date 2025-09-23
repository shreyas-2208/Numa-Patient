import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./BookAppointment.module.css";
import { useAppointments } from "../../contexts/AppointmentsContext";

export default function PaymentHandler({
  selectedPlan,
  selectedDate,
  selectedTime,
  specialization,
  setLoading,
  setError,
}) {
  const navigate = useNavigate();
  const { reloadAppointments } = useAppointments();

  const handlePayment = async () => {
    setLoading(true);
    setError("");
    try {
      const appointmentRes = await axios.post(
        "http://localhost:8000/api/appointments/create/",
        {
          specialization,
          date: selectedDate,
          time: selectedTime,
          plan_id: selectedPlan.id,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );

      const appointmentId = appointmentRes.data.appointment.id;
      const amount = parseFloat(selectedPlan.price);
      if (isNaN(amount)) {
        setError("Invalid plan price. Please select a different plan.");
        return;
      }

      const { data } = await axios.post(
        `http://localhost:8000/api/payments/create-order/${appointmentId}/`,
        { plan_id: selectedPlan.id, amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );

      const options = {
        key: data.razorpay_key,
        amount: data.amount * 100,
        currency: data.currency,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await axios.post(
              "http://localhost:8000/api/payments/verify-payment/",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
            );

            await axios.post(
              "http://localhost:8000/api/bookings/create/",
              { appointment_id: appointmentId },
              { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
            );

            alert("✅ Payment successful & appointment confirmed!");
            reloadAppointments();
            navigate("/appointments");
          } catch (verifyErr) {
            console.error("Verification failed", verifyErr);
            alert("⚠️ Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: async function () {
            try {
              await axios.post(
                "http://localhost:8000/api/payments/cancel-payment/",
                { appointment_id: appointmentId },
                { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
              );
              alert("⚠️ Payment cancelled. Your appointment has been cancelled.");
                // const { reloadAppointments } = useAppointments();
              reloadAppointments();
              navigate("/appointments");
            } catch (err) {
              console.error("Error cancelling payment:", err);
            }
          },
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      setError("Something went wrong while starting payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <h3>Summary</h3>
          <span className={styles.summaryPrice}>₹{selectedPlan.price}</span>
        </div>
        <div className={styles.summaryDetails}>
          <div className={styles.summaryItem}>
            <div>
              <span className={styles.summaryLabel}>Plan</span>
              <span className={styles.summaryValue}>{selectedPlan.title}</span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div>
              <span className={styles.summaryLabel}>Date</span>
              <span className={styles.summaryValue}>{selectedDate}</span>
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div>
              <span className={styles.summaryLabel}>Time</span>
              <span className={styles.summaryValue}>{selectedTime}</span>
            </div>
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button className={styles.primaryButton} onClick={handlePayment}>
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
}
