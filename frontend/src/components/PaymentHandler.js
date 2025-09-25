// src/components/PaymentHandler.js
import axios from "axios";

const API_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";


const PaymentHandler = async ({
  appointmentId,
  plan,
  onSuccess,
  onFailure,
  onCancel,
}) => {
  try {
    const amount = parseFloat(plan.price);
    if (isNaN(amount)) {
      throw new Error("Invalid plan price");
    }

    // 1. Create Razorpay order
    const requestData = { plan_id: plan.id, amount };
    const { data } = await axios.post(
      `${API_URL}/api/payments/create-order/${appointmentId}/`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );

    // 2. Razorpay Checkout
    const options = {
      key: data.razorpay_key,
      amount: data.amount * 100,
      currency: data.currency,
      order_id: data.order_id,
      handler: async function (response) {
        try {
          await axios.post(
            `${API_URL}/api/payments/verify-payment/`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              },
            }
          );

          if (onSuccess) onSuccess(response);
        } catch (verifyErr) {
          console.error("Verification failed", verifyErr);
          if (onFailure) onFailure(verifyErr);
        }
      },
      modal: {
        ondismiss: async function () {
          try {
            await axios.post(
              `${API_URL}/api/payments/cancel-payment/`,
              { appointment_id: appointmentId },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
              }
            );
            if (onCancel) onCancel();
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
    if (onFailure) onFailure(err);
  }
};

export default PaymentHandler;
