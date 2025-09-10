import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./PaymentReturn.module.css";

function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    // In many payment providers, you'll get params like status and reference ids.
    // Backend webhook finalizes the appointment and sends notifications.
    const s = searchParams.get("status");
    if (s === "success") {
      setStatus("success");
      setMessage("Payment successful! Your appointment is confirmed.");
      setTimeout(() => navigate("/dashboard"), 1500);
    } else if (s === "failed") {
      setStatus("failed");
      setMessage("Payment failed or cancelled. You can try again.");
      setTimeout(() => navigate("/appointments"), 2000);
    } else {
      setStatus("unknown");
      setMessage("Returning from checkout. If your payment succeeded, it will reflect shortly.");
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  }, [navigate, searchParams]);

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Payment</h2>
      <p className={styles.msg}>{message}</p>
    </div>
  );
}

export default PaymentReturn;


