import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export default function PaymentHandler({ appointment, onSuccess, onFailure }) {
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    if (!appointment || !appointment.id || !appointment.amount_due) {
      onFailure?.({ message: "Invalid appointment or amount" });
      return;
    }

    setProcessing(true);

    try {
      // 1️⃣ Create Razorpay order
      const { data } = await axios.post(
        `${API_URL}/api/payments/create-order/${appointment.id}/`,
        { amount: appointment.amount_due },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );

      // 2️⃣ Open Razorpay checkout
      const options = {
        key: data.razorpay_key,
        amount: data.amount * 100, // in paise
        currency: data.currency,
        order_id: data.order_id,
        handler: async (response) => {
          try {
            await axios.post(
              `${API_URL}/api/payments/verify-payment/`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
            );
            onSuccess?.(response);
          } catch (verifyErr) {
            console.error("Payment verification failed", verifyErr);
            onFailure?.({ message: "Payment verification failed" });
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment popup closed");
            setProcessing(false);
          },
        },
        theme: { color: "#3399cc" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed", err);
      onFailure?.({ message: "Failed to initiate payment" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button
      disabled={processing || !appointment?.amount_due}
      onClick={handlePayment}
      style={{
        padding: "8px 16px",
        background: "#3399cc",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: processing ? "not-allowed" : "pointer",
      }}
    >
      {processing ? "Processing..." : `Pay ₹${appointment?.amount_due}`}
    </button>
  );
}
