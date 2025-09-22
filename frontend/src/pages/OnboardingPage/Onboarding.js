import React, { useState, useEffect } from "react";
import indiaCities from "./cities-in-india.json";
import { useNavigate } from "react-router-dom";
import "./Onboarding.css";
import api from "../../api/axios";

const INDIA_CITIES = [...indiaCities, "Others/Outside India"];

const ISSUES = [
  "Feeling sad",
  "Low mood",
  "Anxiety",
  "Stress",
  "Insomnia",
  "Panic attacks",
  "OCD",
  "Depression",
  "Relationship issues",
  "Work stress",
  "Burnout",
  "Grief",
  "Trauma",
  "ADHD",
  "Addiction",
  "Anger",
];

const LANGUAGES = [
  "English",
  "Hindi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Punjabi",
  "Urdu",
  "Odia",
  "Assamese",
  "Konkani",
  "Other",
];

const DOCTORS = [
  {
    id: "doc1",
    name: "Dr. A",
    role: "Psychiatrist",
    bio: "Adult mood and anxiety specialist.",
    weekday: true,
    weekend: true,
    morning: true,
    evening: false,
    acceptsChild: false,
  },
  {
    id: "doc2",
    name: "Dr. B",
    role: "Psychiatrist",
    bio: "Child & adolescent care; ADHD and anxiety.",
    weekday: true,
    weekend: false,
    morning: false,
    evening: true,
    acceptsChild: true,
  },
  {
    id: "doc3",
    name: "Dr. C",
    role: "Psychologist",
    bio: "CBT for stress, work burnout, and relationships.",
    weekday: true,
    weekend: true,
    morning: true,
    evening: true,
    acceptsChild: false,
  },
];

// Input validation functions
const validateName = (name) => {
  if (!name) return false; // handle null or empty
  const nameRegex = /^[a-zA-Z\s'-]{2,50}$/;
  return nameRegex.test(name.trim());
};


const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;; // Indian mobile numbers start with 6-9
  return phoneRegex.test(phone);
};

const validateAge = (dob) => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear(); // Changed from const to let
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--; // This line was causing the error - trying to modify const
  }

  return age >= 5 && age <= 120;
};

function inferAgeGroup(dobISO) {
  if (!dobISO) return null;
  const dob = new Date(dobISO);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age < 18 ? "child" : "adult";
}

function assignDoctor({
  preferred_session_timings,
  preferred_time_of_day,
  ageGroup,
}) {
  const preferWeekends = preferred_session_timings === "Weekends";
  const preferWeekdays = preferred_session_timings === "Weekdays";
  const preferMorning = preferred_time_of_day === "Morning";
  const preferEvening = preferred_time_of_day === "Evening";

  const pool = DOCTORS.filter((d) => {
    const dayOk = preferWeekends
      ? d.weekend
      : preferWeekdays
        ? d.weekday
        : true;
    const timeOk = preferMorning ? d.morning : preferEvening ? d.evening : true;
    const ageOk = ageGroup === "child" ? d.acceptsChild : true;
    return dayOk && timeOk && ageOk;
  });

  return pool.length > 0 ? pool : DOCTORS;
}

const saveOnboarding = async (form) => {
  try {
    const { data } = await api.put("api/users/onboarding/", form);
    console.log("Saved onboarding:", data);
    return data;
  } catch (err) {
    const message = err.response?.data?.detail || "Failed to save onboarding";
    console.error("Error saving onboarding:", message);
    throw new Error(message);
  }
};


export default function Onboarding() {
  const navigate = useNavigate();

  // Animation state for smooth transitions
  const [fadeDir, setFadeDir] = useState('in');
  const [viewStep, setViewStep] = useState(null);
  const [step, setStep] = useState(null);
  const [form, setForm] = useState({
    name: "",
    dob: null,
    ageGroup: null,
    gender: "",
    phone_number: null,
    city: "",
    preferred_languages: "English",
    reason_for_visit: [],
    preferred_session_timings: "Flexible",
    preferred_time_of_day: "Flexible",
    doctor: null,
    package: "",
    slotId: "",
    bookingTempId: "",
    paymentStatus: "init",
    meetingLink: "",
    is_onboarded: false
  });

  const [fieldErrors, setFieldErrors] = useState({});

  // Smooth step transitions with fade animation
  useEffect(() => {
    setFadeDir('out');
    const timeout = setTimeout(() => {
      setViewStep(step);
      setFadeDir('in');
    }, 180);
    return () => clearTimeout(timeout);
  }, [step]);

  const loadOnboarding = async () => {
  try {
    const { data } = await api.get("api/users/onboarding/"); // your endpoint
    if (data) {
      setForm((prev) => ({
        ...prev,
        ...data,
      }));

      if (data.is_onboarded) {
        // If fully onboarded, go straight to dashboard
        navigate("/dashboard");
      } else if (data.onboarded_step != null) {
        // Resume at saved step
        setStep(data.onboarded_step);
        setViewStep(data.onboarded_step);
      } else {
        setStep(0);
        setViewStep(0);
      }
    }
  } catch (err) {
    console.error("Error loading onboarding:", err);
  }
};

  useEffect(() => {
    loadOnboarding();
  }, []);

  const saveDraft = (async () => {
    try {
      await saveOnboarding(form);
      console.log("Draft saved!");
    } catch (err) {
      console.error("Error saving draft:", err);
    }
  });

  const totalSteps = 10;
  const progressPct = step!=null? (step / (totalSteps - 1)) * 100 : 0;

  const setField = (k, v) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    // Clear field error when user starts typing
    if (fieldErrors[k]) {
      setFieldErrors(prev => ({ ...prev, [k]: null }));
    }
  };

  const goNext = async () => {
    const nextStep = Math.min(step + 1, totalSteps - 1);
    setStep(nextStep);
    setViewStep(nextStep);
    form.onboarded_step = nextStep;
    await saveDraft();
  };
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDOB = (v) => {
    const group = inferAgeGroup(v);
    setForm((prev) => ({ ...prev, dob: v, ageGroup: group }));
    // Clear DOB error when user selects a date
    if (fieldErrors.dob) {
      setFieldErrors(prev => ({ ...prev, dob: null }));
    }
  };

  // Enhanced name input handler with validation
  const handleNameChange = (e) => {
    const value = e.target.value;
    // Allow only letters, spaces, hyphens, and apostrophes
    const filteredValue = value.replace(/[^a-zA-Z\s'-]/g, '');
    setField("name", filteredValue);

    if (filteredValue && !validateName(filteredValue)) {
      setFieldErrors(prev => ({
        ...prev,
        name: "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
      }));
    }
  };

  // Enhanced phone input handler with validation
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setField("phone_number", value);

      if (value && !validatePhone(value)) {
        setFieldErrors(prev => ({
          ...prev,
          phone_number: "Enter a valid 10-digit Indian mobile number starting with 6-9"
        }));
      }
    }
  };

  const toggleIssue = (issue) => {
    setForm((prev) => {
      const exists = prev.reason_for_visit.includes(issue);
      const newReasons = exists
        ? prev.reason_for_visit.filter((i) => i !== issue)
        : [...prev.reason_for_visit, issue];

      // Limit to maximum 5 selections
      if (newReasons.length > 5) {
        setFieldErrors(prev => ({
          ...prev,
          reason_for_visit: "Please select maximum 5 concerns"
        }));
        return prev;
      }

      // Clear error when user makes valid selection
      if (fieldErrors.reason_for_visit) {
        setFieldErrors(prev => ({ ...prev, reason_for_visit: null }));
      }

      return {
        ...prev,
        reason_for_visit: newReasons,
      };
    });
  };

  const handleAssignDoctor = async () => {
    const chosenArr = assignDoctor({
      preferred_session_timings: form.preferred_session_timings,
      preferred_time_of_day: form.preferred_time_of_day,
      ageGroup: form.ageGroup,
    });

    const assignedDoctor = chosenArr[0];
    setField("doctor", assignedDoctor);

    // Save the final draft with doctor assignment
    const updatedForm = { ...form, doctor: assignedDoctor, onboarded_step: step };
    try {
      await saveOnboarding(updatedForm);
      console.log("Final onboarding saved with doctor assignment");

      // Redirect to dashboard immediately after doctor assignment
      navigate("/dashboard");
    } catch (err) {
      console.error("Payment failed:", err);
      setField("paymentStatus", "failed");
    }
  };


  const canNext = () => {
  
    switch (step) {
      case 0:
        return true;
      case 1:
        return validateName(form.name) && !fieldErrors.name;
      case 2:
        return validatePhone(form.phone_number) && !fieldErrors.phone_number;
      case 3:
        return !!form.dob && validateAge(form.dob) && !!form.ageGroup && !fieldErrors.dob;
      case 4:
        return !!form.gender;
      case 5:
        return !!form.city;
      case 6:
        return !!form.preferred_languages;
      case 7:
        return form.reason_for_visit.length > 0 && form.reason_for_visit.length <= 5;
      case 8:
        return !!form.preferred_session_timings;
      case 9:
        return !!form.preferred_time_of_day;
      case 10:
        return !!form.package;
      case 11:
        return !!form.slotId;
      default:
        return true;
    }
  };

  // Get today's date for date input constraints
  const today = new Date().toISOString().split('T')[0];
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="onboarding-container">
      {/* Minimal progress bar */}
      <div className="progress">
        <div style={{ width: `${progressPct}%` }} />
      </div>

      {/* Step content with fade animation - no card wrapper */}
      <div className={`fade-step ${fadeDir === 'in' ? 'fade-in' : 'fade-out'}`}>
        {viewStep === 0 && (
          <>
            <div className="header">
              <h2>Welcome to NUMA</h2>
            </div>
            <p className="hint">
              NUMA provides accessible, expert-led mental health care tailored to personal needs, from first consults to ongoing support, privately and securely.
            </p>
            <p className="hint">
              Let's personalize your care journey, one quick step at a time.
            </p>
            <div className="nav">
              <button className="btn" onClick={goNext}>
                Get started
              </button>
            </div>
          </>
        )}

        {viewStep === 1 && (
          <>
            <h2>What's your name?</h2>
            <p className="hint">This helps personalize communication.</p>

            <div className="input-box">
              <label>Full name *</label>
              <input
                type="text"
                value={form.name || ""}
                onChange={handleNameChange}
                placeholder="Enter your full name"
                maxLength={50}
                minLength={2}
                pattern="[a-zA-Z\s'-]{2,50}"
                title="Name should contain only letters, spaces, hyphens, and apostrophes"
                required
                autoComplete="name"
                spellCheck={false}
              />
              {fieldErrors.name && (
                <p className="error-text">{fieldErrors.name}</p>
              )}
            </div>

            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}


        {viewStep === 2 && (
          <>
            <h2>Enter your phone number</h2>
            <p className="hint">
              Used for appointment updates and reminders.
            </p>
            <div className="input-box">
              <label>Phone Number *</label>
              <div className="phone-input-group">
                <span className="country-code">+91</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  minLength={10}
                  pattern="[6-9]\d{9}"
                  placeholder="9876543210"
                  value={form.phone_number || ""}
                  onChange={handlePhoneChange}
                  title="Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  required
                  autoComplete="tel"
                />
              </div>
              {fieldErrors.phone_number && (
                <p className="error-text">{fieldErrors.phone_number}</p>
              )}
              <p className="small">Enter a 10-digit mobile number starting with 6-9</p>
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 3 && (
          <>
            <h2>Date of birth</h2>
            <p className="hint">Age group will be inferred automatically.</p>
            <div className="input-box">
              <label>Date of Birth *</label>
              <input
                type="date"
                value={form.dob || ""}
                onChange={(e) => handleDOB(e.target.value)}
                min={minDateStr}
                max={today}
                required
                title="Please select your date of birth"
              />
              {fieldErrors.dob && (
                <p className="error-text">{fieldErrors.dob}</p>
              )}
              {form.ageGroup && (
                <p className="small">
                  Detected age group: <strong>{form.ageGroup}</strong>
                </p>
              )}
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 4 && (
          <>
            <h2>Gender</h2>
            <p className="hint">Optional, used to improve care matching.</p>
            <div className="input-box">
              <label>Gender *</label>
              <select
                value={form.gender || ''}
                onChange={(e) => setField("gender", e.target.value)}
                required
              >
                <option value="" disabled>Select gender</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 5 && (
          <>
            <h2>City / Location</h2>
            <p className="hint">Choose an Indian city or Outside India.</p>
            <div className="input-box">
              <label>City *</label>
              <select
                value={form.city || ''}
                onChange={(e) => setField("city", e.target.value)}
                required
              >
                <option value="" disabled>Select city</option>
                {INDIA_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 6 && (
          <>
            <h2>Preferred language</h2>
            <p className="hint">
              Pick the language most comfortable for sessions.
            </p>
            <div className="input-box">
              <label>Language *</label>
              <select
                value={form.preferred_languages || ''}
                onChange={(e) =>
                  setField("preferred_languages", e.target.value)
                }
                required
              >
                <option value="" disabled>Select language</option>
                {LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 7 && (
          <>
            <h2>What brings you here?</h2>
            <p className="hint">
              Select 1-5 concerns that best describe your situation.
            </p>
            <div className="pills">
              {ISSUES.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={`pill ${form.reason_for_visit.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleIssue(tag)}
                  disabled={form.reason_for_visit.length >= 5 && !form.reason_for_visit.includes(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
            {fieldErrors.reason_for_visit && (
              <p className="error-text">{fieldErrors.reason_for_visit}</p>
            )}
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 8 && (
          <>
            <h2>Preferred days</h2>
            <p className="hint">When are sessions preferred?</p>
            <div className="pills">
              {["Weekdays", "Weekends", "Flexible"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`pill ${form.preferred_session_timings === v ? "active" : ""}`}
                  onClick={() => setField("preferred_session_timings", v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button className="btn" onClick={goNext} disabled={!canNext()}>
                Next
              </button>
            </div>
          </>
        )}

        {viewStep === 9 && (
          <>
            <h2>Preferred time</h2>
            <p className="hint">Choose a preferred time window.</p>
            <div className="pills">
              {["Morning", "Evening", "Flexible"].map((v) => (
                <button
                  key={v}
                  type="button"
                  className={`pill ${form.preferred_time_of_day === v ? "active" : ""}`}
                  onClick={() => setField("preferred_time_of_day", v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="nav">
              <button className="btn secondary" onClick={goBack}>
                Back
              </button>
              <button
                className="btn"
                onClick={handleAssignDoctor}
                disabled={!canNext()}
              >
                Complete onboarding
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
