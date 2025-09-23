import axios from "./axios";

// const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

export const assignDoctor = async (issues, language) => {
//   const token = localStorage.getItem("access_token");
  const res = await axios.post(
    "/api/doctors/assign/",
    { issues, language },
  );

  return res.data;
};

export const getAssignedDoctor = async () => {
  const res = await axios.get("/api/doctors/assign/");
  return res.data;
};

export const getDoctor = async (doctorId) => {
  const res = await axios.get(`/api/doctors/${doctorId}/`);
  return res.data;
}

export const assignDoctorBySpecialization = async (specialization) => {
  const res = await axios.post(
    "/api/doctors/assign-by-specialization/",
    { specialization },
  );

  return res.data;
}