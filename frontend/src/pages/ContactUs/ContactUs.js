import React from "react";
import styles from "./ContactUs.module.css";

function ContactUs() {
  return (
    <div className={styles.contactContainer}>
      {/* Hero Section */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Get in Touch</h1>
          <p className={styles.heroSubtitle}>
            We're here to help and answer any questions you might have
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.contentWrapper}>
        {/* Contact Information */}
        <div className={styles.contactSection}>
          <div className={styles.contactCard}>
            <div className={styles.cardHeader}>
              <h2>Contact Information</h2>
              <p>Reach out to us through any of these channels</p>
            </div>
            
            <div className={styles.contactMethods}>
              <div className={styles.contactMethod}>
                <div className={styles.methodIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className={styles.methodDetails}>
                  <h3>Phone</h3>
                  <a href="tel:+15551234567" className={styles.contactLink}>+1 (555) 123-4567</a>
                  <span>Mon-Fri 9AM-6PM EST</span>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.methodIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className={styles.methodDetails}>
                  <h3>Email Support</h3>
                  <a href="mailto:support@company.com" className={styles.contactLink}>support@company.com</a>
                  <span>We respond within 24 hours</span>
                </div>
              </div>

              <div className={styles.contactMethod}>
                <div className={styles.methodIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <div className={styles.methodDetails}>
                  <h3>WhatsApp</h3>
                  <a href="https://wa.me/15559876543" className={styles.contactLink} target="_blank" rel="noopener noreferrer">+1 (555) 987-6543</a>
                  <span>Quick responses</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Us Section */}
          <div className={styles.aboutCard}>
            <h3>About Us</h3>
            <p>
              We are a leading healthcare technology company dedicated to 
              revolutionizing patient care through innovative digital solutions. 
              Our platform connects patients with healthcare providers, making 
              medical services more accessible and efficient.
            </p>
            <p>
              With a team of experienced healthcare professionals and technology 
              experts, we're committed to delivering excellence in every interaction.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
