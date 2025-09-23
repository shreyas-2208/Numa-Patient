// contexts/AppointmentsContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/appointments/my/");
    //   const sortedAppointments = [...data].sort((a, b) => {
      //   const dateA = new Date(a.created_at.replace(" ", "T"));
      //   const dateB = new Date(b.created_at.replace(" ", "T"));
      //   return dateB - dateA; // descending order
      // });
      //   setAppointments(sortedAppointments);
      setAppointments(data);
    } catch (err) {
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <AppointmentsContext.Provider
      value={{
        appointments,
        loading,
        error,
        reloadAppointments: loadAppointments, // expose reload function
      }}
    >
      {children}
    </AppointmentsContext.Provider>
  );
};

export const useAppointments = () => useContext(AppointmentsContext);
