import axios from "./axios";

// Fetch session plans from the backend
export const fetchSessionPlans = async (specialization = null) => {
//   const params = specialization ? { specialization } : {};
  const response = await axios.get("/api/plans/session-plans/");
  return response.data || [];
};

// Fetch all plans (if needed for other components)
export const fetchAllPlans = async () => {
  const response = await axios.get("/api/plans/");
  return response.data || [];
};

// Fetch plan by ID (if needed for other components)
export const fetchPlanById = async (planId) => {
  const response = await axios.get(`/api/plans/${planId}/`);
  return response.data;
};
