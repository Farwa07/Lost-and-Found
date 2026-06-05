import "./VerifyOtp.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

  const { register } = useAuth();

  const inputRefs = useRef([]);

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  const [pendingSignup, setPendingSignup] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const emailFromState = location.state?.email || "";

  const enteredOtp = useMemo(() => otpValues.join(""), [otpValues]);

  const getPendingSignup = () => {
    try {
      const savedData = localStorage.getItem("lostFoundPendingSignup");
      return savedData ? JSON.parse(savedData) : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup) {
      alert("No signup request found. Please sign up first.");
      navigate("/signup");
      return;
    }

    setPendingSignup(savedPendingSignup);

    const remainingSeconds = Math.max(
      0,
      Math.floor((savedPendingSignup.expiresAt - Date.now()) / 1000)
    );

    setSecondsLeft(remainingSeconds);
  }, [navigate]);

  useEffect(() => {
    if (!pendingSignup) {
      return;
    }

    const timer = setInterval(() => {
      const remainingSeconds = Math.max(
        0,
        Math.floor((pendingSignup.expiresAt - Date.now()) / 1000)
      );

      setSecondsLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingSignup]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) {
      return;
    }

    const updatedOtp = [...otpValues];
    updatedOtp[index] = value;

    setOtpValues(updatedOtp);

    setMessage({
      type: "",
      text: "",
    });

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
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
      setMessage({
        type: "error",
        text: "Please paste a valid 6 digit OTP.",
      });
      return;
    }

    setOtpValues(pastedOtp.split(""));
    inputRefs.current[5]?.focus();
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup) {
      setMessage({
        type: "error",
        text: "Signup request expired. Please sign up again.",
      });

      navigate("/signup");
      return;
    }

    if (Date.now() > savedPendingSignup.expiresAt) {
      localStorage.removeItem("lostFoundPendingSignup");

      setMessage({
        type: "error",
        text: "OTP expired. Please sign up again.",
      });

      return;
    }

    if (enteredOtp.length !== 6) {
      setMessage({
        type: "error",
        text: "Please enter complete 6 digit OTP.",
      });
      return;
    }

    if (enteredOtp !== savedPendingSignup.otp) {
      setMessage({
        type: "error",
        text: "Invalid OTP. Please enter the correct OTP.",
      });
      return;
    }

    register(savedPendingSignup.userData);

    localStorage.removeItem("lostFoundPendingSignup");

    setMessage({
      type: "success",
      text: "OTP verified successfully. Account created.",
    });

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  };

  const handleResendOtp = () => {
    const savedPendingSignup = getPendingSignup();

    if (!savedPendingSignup) {
      navigate("/signup");
      return;
    }

    const newOtp = String(Math.floor(100000 + Math.random() * 900000));

    const updatedPendingSignup = {
      ...savedPendingSignup,
      otp: newOtp,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    localStorage.setItem(
      "lostFoundPendingSignup",
      JSON.stringify(updatedPendingSignup)
    );

    setPendingSignup(updatedPendingSignup);
    setOtpValues(["", "", "", "", "", ""]);
    setSecondsLeft(5 * 60);

    alert(`Demo OTP resent: ${newOtp}`);

    setMessage({
      type: "success",
      text: "New OTP has been sent successfully.",
    });

    inputRefs.current[0]?.focus();
  };

  const shownEmail =
    emailFromState || pendingSignup?.userData?.email || "your email";

  return (
    <div className="verify-otp">
      <div className="verify-otp__left">
        <div className="verify-otp__overlay">
          <div className="verify-otp__content">
            <div className="verify-otp__hero-icon">
              <FaShieldAlt />
            </div>

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
          <button
            type="button"
            className="verify-otp__back"
            onClick={() => navigate("/signup")}
          >
            <FaArrowLeft />
            Back to Sign Up
          </button>

          <div className="verify-otp__top-icon">
            <FaEnvelope />
          </div>

          <h2>OTP Verification</h2>

          <p className="verify-otp__subtitle">
            We have sent a 6 digit verification code to
            <br />
            <b>{shownEmail}</b>
          </p>

          {message.text && (
            <div
              className={`verify-otp__message verify-otp__message--${message.type}`}
            >
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

            <button className="verify-otp__btn" type="submit">
              Verify OTP
            </button>
          </form>

          <p className="verify-otp__bottom">
            Did not receive code?
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={secondsLeft > 0}
            >
              <FaRedo />
              Resend OTP
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}