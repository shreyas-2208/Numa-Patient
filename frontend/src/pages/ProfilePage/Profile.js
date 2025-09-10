import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Profile.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

function Profile() {
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    age: "",
    gender: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!accessToken) return; // no token, can't fetch
      try {
        const response = await axios.get(`${API_URL}/api/users/profile/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setMessage("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [accessToken]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.put(`${API_URL}/api/users/profile/`, profile, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setProfile(response.data);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className={styles.container}>
      <h2>My Profile</h2>
      {message && <p className={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label>Full Name</label>
          <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Email</label>
          <input type="email" name="email" value={profile.email} disabled />
        </div>

        <div className={styles.field}>
          <label>Age</label>
          <input type="number" name="age" value={profile.age || ""} onChange={handleChange} />
        </div>

        <div className={styles.field}>
          <label>Gender</label>
          <select name="gender" value={profile.gender || ""} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Phone</label>
          <input type="text" name="phone" value={profile.phone || ""} onChange={handleChange} />
        </div>

        <button type="submit" className={styles.submitBtn}>
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
