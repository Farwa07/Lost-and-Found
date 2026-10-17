import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";
import { TOAST_EVENT } from "../utils/notify";
import "./Toaster.css";

const DURATION = 4500;

const ICONS = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  info: FaInfoCircle,
};

export default function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const timers = new Set();

    const handleToast = (event) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev.slice(-3), { id, ...event.detail }]);

      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
        timers.delete(timer);
      }, DURATION);
      timers.add(timer);
    };

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => {
      window.removeEventListener(TOAST_EVENT, handleToast);
      timers.forEach(clearTimeout);
    };
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((item) => item.id !== id));

  return (
    <div className="toaster" aria-live="polite" aria-atomic="false">
      {toasts.map(({ id, text, type }) => {
        const Icon = ICONS[type] || FaInfoCircle;
        return (
          <div key={id} className={`toast toast--${type}`} role={type === "error" ? "alert" : "status"}>
            <Icon className="toast__icon" aria-hidden="true" />
            <p>{text}</p>
            <button type="button" onClick={() => dismiss(id)} aria-label="Dismiss notification">
              <FaTimes />
            </button>
          </div>
        );
      })}
    </div>
  );
}
