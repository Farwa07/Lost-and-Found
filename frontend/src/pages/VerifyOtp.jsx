import "./VerifyOtp.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { sendSignupOtp, verifySignupOtp } from "../api/authApi";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaRedo,
  FaShieldAlt,
} from "react-icons/fa";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [pendingSignup, setPendingSignup] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const emailFromState = location.state?.email || "";
  const userDataFromState = location.state?.userData || null;
  const enteredOtp = useMemo(() => otpValues.join(""), [otpValues]);

  const getPendingSignup = () => {
    try {
      const savedData = sessionStorage.getItem("lostFoundPendingSignup");
      const parsedData = savedData ? JSON.parse(savedData) : null;
      return parsedData ? { ...parsedData, userData: userDataFromState } : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup?.email) {
      alert("No signup request found. Please sign up first.");
      navigate("/signup");
      return;
    }

    setPendingSignup(savedPendingSignup);
    setSecondsLeft(
      Math.max(0, Math.floor((savedPendingSignup.expiresAt - Date.now()) / 1000))
    );
  }, [navigate]);

  useEffect(() => {
    if (!pendingSignup) return;

    const timer = setInterval(() => {
      const remainingSeconds = Math.max(
        0,
        Math.floor((pendingSignup.expiresAt - Date.now()) / 1000)
      );

      setSecondsLeft(remainingSeconds);

      if (remainingSeconds <= 0) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingSignup]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;
    setOtpValues(updatedOtp);
    setMessage({ type: "", text: "" });

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();

    const pastedOtp = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (pastedOtp.length !== 6) {
      setMessage({ type: "error", text: "Please paste a valid 6 digit OTP." });
      return;
    }

    setOtpValues(pastedOtp.split(""));
    inputRefs.current[5]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup?.email) {
      setMessage({ type: "error", text: "Signup request expired. Please sign up again." });
      navigate("/signup");
      return;
    }

    if (enteredOtp.length !== 6) {
      setMessage({ type: "error", text: "Please enter complete 6 digit OTP." });
      return;
    }

    setIsSubmitting(true);

    try {
      await verifySignupOtp({
        email: savedPendingSignup.email,
        otp: enteredOtp,
      });

      sessionStorage.removeItem("lostFoundPendingSignup");

      setMessage({ type: "success", text: "OTP verified successfully. Account created." });

      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Invalid or expired OTP." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup?.userData) {
      setMessage({ type: "error", text: "Please go back to Sign Up to request a fresh OTP." });
      return;
    }

    setIsResending(true);

    try {
      await sendSignupOtp(savedPendingSignup.userData);

      const updatedPendingSignup = {
        ...savedPendingSignup,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };

      sessionStorage.setItem(
        "lostFoundPendingSignup",
        JSON.stringify({
          email: updatedPendingSignup.email,
          expiresAt: updatedPendingSignup.expiresAt,
        })
      );
      setPendingSignup(updatedPendingSignup);
      setOtpValues(["", "", "", "", "", ""]);
      setSecondsLeft(5 * 60);
      setMessage({ type: "success", text: "New OTP has been sent successfully." });
      inputRefs.current[0]?.focus();
    } catch (error) {
      setMessage({ type: "error", text: error.message || "OTP could not be resent." });
    } finally {
      setIsResending(false);
    }
  };

  const shownEmail = emailFromState || pendingSignup?.email || "your email";

  return (
    <div className="verify-otp">
      <div className="verify-otp__left">
        <div className="verify-otp__overlay">
          <div className="verify-otp__content">
            <div className="verify-otp__hero-icon"><FaShieldAlt /></div>
            <h1>Verify Your Email</h1>
            <p>
              Enter the OTP sent to your email address to complete your Lost &
              Found account registration.
            </p>
          </div>
        </div>
      </div>

      <div className="verify-otp__right">
        <div className="verify-otp__card">
          <button type="button" className="verify-otp__back" onClick={() => navigate("/signup")}>
            <FaArrowLeft /> Back to Sign Up
          </button>

          <div className="verify-otp__top-icon"><FaEnvelope /></div>
          <h2>OTP Verification</h2>

          <p className="verify-otp__subtitle">
            We have sent a 6 digit verification code to<br />
            <b>{shownEmail}</b>
          </p>

          {message.text && (
            <div className={`verify-otp__message verify-otp__message--${message.type}`}>
              {message.type === "success" && <FaCheckCircle />}
              {message.text}
            </div>
          )}

          <form className="verify-otp__form" onSubmit={handleVerifyOtp}>
            <div className="verify-otp__inputs" onPaste={handlePaste}>
              {otpValues.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => (inputRefs.current[index] = element)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <div className="verify-otp__timer">
              {secondsLeft > 0 ? (
                <span>OTP expires in {formatTime(secondsLeft)}</span>
              ) : (
                <span className="verify-otp__expired">OTP expired</span>
              )}
            </div>

            <button className="verify-otp__btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="verify-otp__bottom">
            Did not receive code?
            <button type="button" onClick={handleResendOtp} disabled={secondsLeft > 0 || isResending}>
              <FaRedo /> {isResending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
