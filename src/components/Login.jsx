"use client";
import React, { useState } from "react";

const styles = `
  .login-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .login-left-panel {
    flex: 1;
    background-color: #e9e7fb;
    padding: 60px 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 50px;
  }

  .login-logo-icon {
    background-color: #2563eb;
    color: #fff;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .login-logo-text {
    font-size: 20px;
    font-weight: 700;
    color: #1e293b;
  }

  .login-left-heading {
    font-size: 42px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 20px;
  }

  .login-left-description {
    font-size: 16px;
    color: #4338ca;
    line-height: 1.6;
    max-width: 420px;
    margin-bottom: 40px;
  }

  .login-illustration-card {
    border-radius: 16px;
    width: 100%;
    max-width: 480px;
    overflow: hidden;
  }

  .login-right-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ffffff;
    padding: 40px;
  }

  .login-form-wrapper {
    width: 100%;
    max-width: 420px;
  }

  .login-title {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;
  }

  .login-subtitle {
    font-size: 15px;
    color: #64748b;
    margin-bottom: 30px;
  }

  .login-form {
    display: flex;
    flex-direction: column;
  }

  .login-field-group {
    margin-bottom: 20px;
  }

  .login-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
  }

  .login-input {
    width: 100%;
    padding: 12px 14px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    background-color: #f8fafc;
    box-sizing: border-box;
  }

  .login-input:focus {
    border-color: #2563eb;
    background-color: #fff;
  }

  .login-input-error {
    border-color: #ef4444;
  }

  .login-error-text {
    display: block;
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
  }

  .login-password-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .login-password-wrapper .login-input {
    padding-right: 60px;
  }

  .login-toggle-password-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    color: #2563eb;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .login-options-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    font-size: 13px;
  }

  .login-remember-me {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #334155;
    cursor: pointer;
  }

  .login-forgot-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
  }

  .login-forgot-link:hover {
    text-decoration: underline;
  }

  .login-submit-btn {
    background-color: #2563eb;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 13px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 24px;
    transition: background-color 0.2s ease;
  }

  .login-submit-btn:hover {
    background-color: #1d4ed8;
  }

  .login-divider {
    display: flex;
    align-items: center;
    text-align: center;
    margin-bottom: 24px;
  }

  .login-divider::before,
  .login-divider::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #e2e8f0;
  }

  .login-divider-text {
    padding: 0 12px;
    font-size: 12px;
    color: #94a3b8;
    white-space: nowrap;
  }

  .login-google-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 12px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background-color: #fff;
    font-size: 14px;
    font-weight: 600;
    color: #334155;
    cursor: pointer;
    margin-bottom: 20px;
  }

  .login-google-btn:hover {
    background-color: #f8fafc;
  }

  .login-google-icon {
    font-weight: 700;
    color: #ea4335;
  }

  .login-signup-text {
    text-align: center;
    font-size: 14px;
    color: #64748b;
  }

  .login-signup-link {
    color: #2563eb;
    font-weight: 600;
    text-decoration: none;
  }

  .login-signup-link:hover {
    text-decoration: underline;
  }

  @media (max-width: 900px) {
    .login-container {
      flex-direction: column;
    }
    .login-left-panel {
      padding: 40px;
    }
    .login-left-heading {
      font-size: 28px;
    }
  }
`;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    console.log("Login submitted:", formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-container">
        <div className="login-left-panel">
          <div className="login-logo">
            <span className="login-logo-icon">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 16V12" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <path d="M12 16V8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <path d="M17 16V10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <path d="M4 19H20" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                <circle cx="7" cy="9" r="1.4" fill="#ffffff" />
                <circle cx="12" cy="5" r="1.4" fill="#ffffff" />
                <circle cx="17" cy="7" r="1.4" fill="#ffffff" />
                <path d="M7 9L12 5L17 7" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="login-logo-text">InterviewPro</span>
          </div>

          <h1 className="login-left-heading">Master your next career move.</h1>

          <p className="login-left-description">
            Join thousands of professionals using InterviewPro to simulate
            real-world interviews, receive AI-driven feedback, and land their
            dream roles.
          </p>

          <div className="login-illustration-card">
            <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="100%">
              <rect x="0" y="0" width="400" height="300" rx="16" fill="#0f172a" />
              <polygon points="60,210 200,260 340,210 200,160" fill="#14b8a6" opacity="0.25" />
              <g transform="translate(110,90)">
                <rect x="0" y="60" width="160" height="90" rx="6" fill="#1e293b" stroke="#334155" />
                <rect x="10" y="70" width="140" height="70" rx="3" fill="#0f172a" />
                <rect x="25" y="105" width="14" height="25" fill="#14b8a6" />
                <rect x="45" y="95" width="14" height="35" fill="#2dd4bf" />
                <rect x="65" y="115" width="14" height="15" fill="#14b8a6" />
                <rect x="85" y="85" width="14" height="45" fill="#2dd4bf" />
                <rect x="105" y="100" width="14" height="30" fill="#14b8a6" />
                <path d="M25 120 L45 105 L65 122 L85 90 L105 112" stroke="#5eead4" fill="none" strokeWidth="2" />
              </g>
              <g transform="translate(245,70)">
                <rect x="0" y="20" width="30" height="26" rx="4" fill="#2dd4bf" />
                <rect x="6" y="10" width="18" height="14" rx="3" fill="#5eead4" />
                <ellipse cx="15" cy="10" rx="9" ry="4" fill="#99f6e4" />
              </g>
            </svg>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="login-form-wrapper">
            <h2 className="login-title">Welcome Back</h2>
            <p className="login-subtitle">
              Log in to continue your interview preparation journey.
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-field-group">
                <label className="login-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`login-input ${
                    errors.email ? "login-input-error" : ""
                  }`}
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <span className="login-error-text">{errors.email}</span>
                )}
              </div>

              <div className="login-field-group">
                <label className="login-label" htmlFor="password">
                  Password
                </label>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`login-input ${
                      errors.password ? "login-input-error" : ""
                    }`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="login-toggle-password-btn"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && (
                  <span className="login-error-text">{errors.password}</span>
                )}
              </div>

              <div className="login-options-row">
                <label className="login-remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>Remember Me</span>
                </label>

                <a href="/forgot-password" className="login-forgot-link">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="login-submit-btn">
                Login
              </button>

              <div className="login-divider">
                <span className="login-divider-text">OR CONTINUE WITH</span>
              </div>

              <button type="button" className="login-google-btn">
                <span className="login-google-icon">G</span>
                Continue with Google
              </button>

              <p className="login-signup-text">
                Don't have an account?{" "}
                <a href="/sign-up" className="login-signup-link">
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
